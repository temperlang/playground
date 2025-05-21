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
  errors: MarkerData[];
  translations: Translation[];
};

export type File = {
  name: string;
  content: string;
};

// Subset of https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IMarkerData.html
export type MarkerData = {
  endColumn: number;
  endLineNumber: number;
  message: string;
  // severity: MarkerSeverity; // TODO? Always error level for now?
  startColumn: number;
  startLineNumber: number;
};

export type ShareResponse = {
  id: string;
};

export type Translation = {
  backend: string;
  files: File[];
};
