export const backendInfos: { [key: string]: BackendInfo } = Object.assign(
  {},
  ...[
    { key: "csharp", name: "C#" },
    { key: "java", name: "Java" },
    { key: "js", name: "JS" },
    { key: "lua", name: "Lua" },
    { key: "py", name: "Python" },
    { key: "rust", name: "Rust" },
  ].map((info) => ({ [info.key]: info })),
);

export type BackendInfo = {
  key: string;
  name: string;
};

export type BuildRequest = {
  source: string;
};

export type BuildResponse = {
  errors: any[];
  translations: Translation[];
};

export type File = {
  name: string;
  content: string;
};

export type Translation = {
  backend: string;
  files: File[];
};
