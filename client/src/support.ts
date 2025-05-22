export type BackendInfo = {
  key: string;
  name: string;
};

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

export type BuildRequest = {
  source: string;
};

export type BuildResponse = {
  errors: MarkerData[];
  translations: Translation[];
};

export const distributeWidth = (box: HTMLElement, dividerClass: string) => {
  const total = window.innerWidth;
  let used = 0;
  const panes = [] as HTMLElement[];
  for (const kid of box.childNodes as Iterable<HTMLElement>) {
    if (kid.className.indexOf(dividerClass) >= 0) {
      used += kid.getBoundingClientRect().width;
    } else {
      panes.push(kid);
    }
  }
  const each = (total - used) / panes.length;
  for (const pane of panes) {
    pane.style.width = `${each}px`;
  }
};

export type File = {
  name: string;
  content: string;
};

export const loadGist = async (id: string): Promise<string> => {
  const response = await fetch(`https://api.github.com/gists/${id}`);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const gist = await response.json();
  const file = gist.files["playground.temper"];
  // Presume not truncated since we also limit our sizes.
  return file.content;
};

export const manageResponse = async (
  promise: Promise<Response>,
): Promise<Response | undefined> => {
  let response: Response;
  try {
    response = await promise;
    if (response.ok) {
      return response;
    }
    console.log(response);
  } catch (error) {
    console.error(error);
  }
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

export type RequestStatus = "" | "error" | "loading";

export type ShareResponse = {
  id: string;
};

export type Translation = {
  backend: string;
  files: File[];
};
