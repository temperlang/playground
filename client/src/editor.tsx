import type * as monacoEditor from "monaco-editor";
import { MonacoEditor } from "solid-monaco";

export type TemperEditorProps = {
  onChange(value: string): void;
  value: string;
};

export const TemperEditor = (props: TemperEditorProps) => {
  const onMount = (
    monaco: typeof monacoEditor,
    editor: monacoEditor.editor.IStandaloneCodeEditor,
  ) => {
    // Doesn't seem to work as an element attribute, so set here.
    monaco.editor.defineTheme("temper-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0a1c35",
        "editor.lineHighlightBorder": "#162640",
      },
    });
    monaco.editor.setTheme("temper-dark");
    editor.updateOptions({ minimap: { enabled: false } });
  };
  return (
    <MonacoEditor
      onChange={props.onChange}
      onMount={onMount}
      language="typescript"
      value={props.value}
    />
  );
};
