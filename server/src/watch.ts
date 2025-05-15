import { type ChildProcessByStdio, spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { Stream } from "node:stream";

export class Watch {
  chunks: string[] = [];
  proc: ChildProcessByStdio<null, null, Stream.Readable> | undefined;
  root: string | undefined;
  workDir: string | undefined;

  async prepare() {
    const workDir = this.workDir!;
    // Prep dirs, ensuring empty src and temper.out.
    if (this.proc) {
      this.proc.kill("SIGKILL");
      this.proc = undefined;
    }
    await mkdir(workDir, { recursive: true });
    const srcDir = join(workDir, "src");
    await rmDeep(srcDir);
    await rmDeep(join(workDir, "temper.out"));
    // Make sure we have empty source.
    this.chunks.length = 0;
    await mkdir(srcDir, { recursive: true });
    await writeFile(join(srcDir, "config.temper.md"), config);
    await writeFile(join(srcDir, "work.temper"), "");
    console.log(workDir);
    // Start watch process, so we're primed for an actual request.
    this.proc = spawn("temper", ["watch"], {
      cwd: workDir,
      shell: true,
      stdio: ["ignore", "inherit", "pipe"],
    });
    this.proc.stderr.on("data", (chunk) => {
      this.chunks.push(chunk.toString("utf8"));
      console.log(this.chunks);
    });
  }

  async start() {
    this.root = await mkdtemp(join(tmpdir(), "temper-watch-"));
    this.workDir = join(this.root, "work");
    console.log(this.root);
    await this.prepare();
  }

  stop() {
    if (this.proc != null) {
      this.proc.kill("SIGKILL");
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

const config: string = `
# Work

    export let name = "work";
`;
