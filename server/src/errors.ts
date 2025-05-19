// Subset of https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IMarkerData.html
export type MarkerData = {
  endColumn: number;
  endLineNumber: number;
  message: string;
  // severity: MarkerSeverity; // TODO? Always error level for now?
  startColumn: number;
  startLineNumber: number;
};

export const parseErrors = (chunks: string[], source: string): MarkerData[] => {
  const markers = [] as MarkerData[];
  chunks: for (const chunk of chunks) {
    // Support possibly multiple matches per chunk.
    regex.lastIndex = 0;
    while (true) {
      const groups = regex.exec(chunk)?.groups;
      if (!groups) {
        continue chunks;
      }
      const pos = (() => {
        const { rawIndex } = groups;
        if (rawIndex) {
          // Need to calculate lines and columns from source text.
          const indexNumber = +rawIndex;
          const lines = source.slice(0, indexNumber).split(/\r\n|\r|\n/);
          const startLineNumber = lines.length;
          const startColumn = lines.at(-1)!.length + 1;
          return {
            startLineNumber,
            startColumn,
            endLineNumber: startLineNumber,
            endColumn: startColumn,
          };
        } else {
          // Need to see if the end is line and column or just column.
          const { startLine, startColumn } = groups;
          const { endLineOrColumn, endColumn: maybeEndColumn } = groups;
          const endLine = maybeEndColumn == null ? startLine : endLineOrColumn;
          const endColumn = maybeEndColumn ?? endLineOrColumn;
          return {
            startLineNumber: +startLine,
            startColumn: +startColumn + 1,
            endLineNumber: +endLine,
            endColumn: +endColumn + 1,
          };
        }
      })();
      markers.push({ message: groups.message, ...pos });
    }
  }
  return markers;
};

const buildRegex = () => {
  const file = /(?<file>[^+:]+)/.source;
  const rawIndex = /\+(?<rawIndex>\d+)/.source;
  const lineStart = /(?<startLine>\d+)\+(?<startColumn>\d+)/.source;
  const end = /(?<endLineOrColumn>\d+)(?:\+(?<endColumn>\d+))?/.source;
  const lineBased = `:${lineStart}(?:\\s*-\\s*${end})?`;
  const message = /[^:]*: (?<message>.*)/.source;
  const full = `\\[${file}(?:${rawIndex}|${lineBased})\\]${message}`;
  return new RegExp(full, "g");
};

const regex = buildRegex();
