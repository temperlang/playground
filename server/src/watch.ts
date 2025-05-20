import { type ChildProcessByStdio, spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Stream } from "node:stream";
import { promisify } from "node:util";
import treeKill from "tree-kill";
import stripAnsi from "strip-ansi";
import { gatherTemperOut, type Translation } from "./gather.js";
import { parseErrors } from "./errors.js";

export type BuildRequest = {
  source: string;
};

export type BuildResponse = {
  errors: any[];
  translations: Translation[];
};

// Strategy here:
// Prime temper watch in a temp dir, because the first build is usually slower.
// Usually wait for build #0 to finish, although a request can sneak in before.
// Handle requests in one-at-a-time async in-memory work queue.
// Any request kicks off a new build #1 that hopefully finishes fast.
// Return results.
// Kill temper watch to avoid memory leaks, then start again to reprime.
// If requests are occasional, users get fast second builds.
// If requests are continuous, they get to wait for slow first builds.
// TODO This can be simplified with continuous watch if we fix leaks.
// TODO We can also avoid waiting for build #0 to finish if we stabilize cancel.
// TODO Although if we have an ongoing watch, build #0 rarely happens.

export class Watch {
  buildOngoing = false;
  listener: ((message: string) => void) | undefined;
  proc: ChildProcessByStdio<null, null, Stream.Readable> | undefined;
  root: string | undefined;
  workDir: string | undefined;

  async build(request: BuildRequest) {
    // Track if we're midbuild and if so, wait for build to finish before writing.
    // That's because I've seen it hang on attempted cancel of current build.
    awaitAllClear: while (true) {
      if (!this.buildOngoing) {
        break awaitAllClear;
      }
      console.log("Awaiting all clear ...");
      await new Promise((resolve: (message: string) => void) => {
        this.listener = resolve;
      });
    }
    // Don't await write because we want to be awaiting messages before yield.
    writeFile(this.srcFile(), request.source);
    const chunks = [] as string[];
    let ourBuildStarted = false;
    watchBuildUntilDone: while (true) {
      const chunk = await new Promise((resolve: (message: string) => void) => {
        this.listener = resolve;
      });
      chunks.push(stripAnsi(chunk));
      // Watch for our build to start then also to finish.
      if (this.buildOngoing && !ourBuildStarted) {
        ourBuildStarted = true;
      }
      if (ourBuildStarted && !this.buildOngoing) {
        break watchBuildUntilDone;
      }
    }
    console.log(chunks);
    const errors = parseErrors(chunks, request.source);
    const translations = await gatherTemperOut(this.temperOut());
    // console.log(translations);
    this.listener = undefined;
    // Reset watch to avoid memory leaks.
    await this.prepare();
    return { errors, translations } as BuildResponse;
  }

  async prepare() {
    const workDir = this.workDir!;
    // Prep dirs, ensuring empty src and temper.out.
    if (this.proc) {
      try {
        await treeKillAsync(this.proc.pid!, "SIGKILL");
      } catch (error) {
        console.error(error);
      }
      this.proc = undefined;
    }
    await mkdir(workDir, { recursive: true });
    const srcDir = this.srcDir();
    try {
      await rmDeep(srcDir);
      await rmDeep(this.temperOut());
    } catch (error) {
      console.error(error);
    }
    // Make sure we have empty source.
    await mkdir(srcDir, { recursive: true });
    await writeFile(join(srcDir, "config.temper.md"), config);
    await writeFile(this.srcFile(), "");
    console.log(workDir);
    // Start watch process, so we're primed for an actual request.
    // We don't just keep watch on forever because it leaks memory.
    this.proc = spawn("temper", ["watch"], {
      cwd: workDir,
      shell: true,
      stdio: ["ignore", "inherit", "pipe"],
    });
    this.proc.stderr.on("data", (chunkBuffer) => {
      const chunk = chunkBuffer.toString("utf8");
      // TODO Risk of getting start and finished in same chunk?
      if (/^Watch starting build/m.test(chunk)) {
        this.buildOngoing = true;
      } else if (/^Finished build/m.test(chunk)) {
        this.buildOngoing = false;
      }
      console.log([chunk]);
      this.listener?.call(undefined, chunk);
    });
  }

  srcDir() {
    return join(this.workDir!, "src");
  }

  srcFile(): string {
    return join(this.srcDir(), "work.temper");
  }

  temperOut() {
    return join(this.workDir!, "temper.out");
  }

  async start() {
    this.root = await mkdtemp(join(tmpdir(), "temper-playground-"));
    this.workDir = join(this.root, "work");
    console.log(this.root);
    await this.prepare();
  }

  stop() {
    if (this.proc) {
      treeKill(this.proc.pid!, "SIGKILL");
    }
    if (this.root != null) {
      rmDeepSync(this.root);
    }
  }
}

const rmDeep = async (dir: string) => {
  await rm(dir, { force: true, recursive: true });
};

const rmDeepSync = (dir: string) => {
  rmSync(dir, { force: true, recursive: true });
};

const treeKillAsync = promisify(
  // Explicit sig because overloads.
  treeKill as (
    pid: number,
    signal?: string | number,
    callback?: (error?: Error) => void,
  ) => void,
);

const config: string = `
# Work

    export let name = "work";
`;
