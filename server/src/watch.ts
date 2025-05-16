import { type ChildProcessByStdio, spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Stream } from "node:stream";
import { promisify } from "node:util";
import treeKill from "tree-kill";
import stripAnsi from "strip-ansi";
import { gatherTemperOut } from "./gather.ts";

export type BuildRequest = {
  source: string;
};

export class Watch {
  listener: ((message: string) => void) | undefined;
  proc: ChildProcessByStdio<null, null, Stream.Readable> | undefined;
  root: string | undefined;
  workDir: string | undefined;

  async build(request: BuildRequest) {
    console.log(request);
    // Don't await write because we want to be awaiting messages before yield.
    writeFile(this.srcFile(), request.source);
    const chunks = [] as string[];
    while (true) {
      const chunk = await new Promise((resolve: (message: string) => void) => {
        this.listener = resolve;
      });
      chunks.push(stripAnsi(chunk));
      if (/^Finished build/m.test(chunk)) {
        break;
      }
    }
    console.log(chunks);
    const results = await gatherTemperOut(this.temperOut());
    console.log(results);
    this.listener = undefined;
    // Reset watch to avoid memory leaks.
    await this.prepare();
    return request.source;
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
    this.proc = spawn("temper", ["watch"], {
      cwd: workDir,
      shell: true,
      stdio: ["ignore", "inherit", "pipe"],
    });
    this.proc.stderr.on("data", (chunkBuffer) => {
      const chunk = chunkBuffer.toString("utf8");
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
