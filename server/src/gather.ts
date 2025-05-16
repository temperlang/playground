import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export const gatherTemperOut = async (temperOut: string) => {
  return await Promise.all(
    (Object.keys(backendInfos) as Backend[]).map((backend) =>
      gatherDir({ backend, temperOut }),
    ),
  );
};

type BackendInfo = {
  ext: string;
  path: string;
  reject?: RegExp;
};

const backendInfos = {
  csharp: { ext: ".cs", path: "work/src", reject: /Logging.cs$/ },
  java: { ext: ".java", path: "work/src/main/java/work", reject: /Main.java$/ },
  js: { ext: ".js", path: "work" },
  lua: { ext: ".lua", path: "work" },
  py: { ext: ".py", path: "work/work" },
  rust: { ext: ".rs", path: "work/src", reject: /main.rs$/ },
} satisfies Record<string, BackendInfo>;

type Backend = keyof typeof backendInfos;

type GatherDirArgs = {
  backend: Backend;
  temperOut: string;
};

export type File = {
  name: string;
  content: string;
};

export type Translation = {
  backend: Backend;
  files: File[];
};

const gatherDir = async (args: GatherDirArgs): Promise<Translation> => {
  const { backend } = args;
  const { ext, path, reject } = backendInfos[backend] as BackendInfo;
  const dir = join(args.temperOut, backend, path);
  const files = await Promise.all(
    (await readdir(dir))
      .filter((name) => name.endsWith(ext) && !(reject && reject.test(name)))
      .map(async (name) => ({
        name,
        content: await readFile(join(dir, name), { encoding: "utf8" }),
      })),
  );
  return { backend, files };
};
