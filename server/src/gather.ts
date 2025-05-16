import { readdir } from "node:fs/promises";
import { join } from "node:path";

export const gatherTemperOut = async (temperOut: string) => {
  return Object.assign(
    ...(await Promise.all([
      gatherDir({ backend: "csharp", temperOut }),
      gatherDir({ backend: "java", temperOut }),
      gatherDir({ backend: "js", temperOut }),
      gatherDir({ backend: "lua", temperOut }),
      gatherDir({ backend: "py", temperOut }),
      gatherDir({ backend: "rust", temperOut }),
    ])),
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

const gatherDir = async (args: GatherDirArgs) => {
  const { ext, path, reject } = backendInfos[args.backend] as BackendInfo;
  const dir = join(args.temperOut, args.backend, path);
  const files = (await readdir(dir)).filter(
    (name) => name.endsWith(ext) && !(reject && reject.test(name)),
  );
  // TODO Read files.
  return { [args.backend]: files };
};
