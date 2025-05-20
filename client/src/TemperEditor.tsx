import * as monacoEditor from "monaco-editor";
import { MonacoEditor as EditorComponent } from "solid-monaco";
import { MarkerData } from "./types";

export type Monaco = typeof monacoEditor;
export type MonacoEditor = monacoEditor.editor.IStandaloneCodeEditor;

export type TemperEditorProps = {
  onChange: (value: string) => void;
  onMount?: (state: TemperEditorState) => void;
  value: string;
};

export type TemperEditorState = {
  setMarkers: (markers: MarkerData[]) => void;
};

export const TemperEditor = (props: TemperEditorProps) => {
  const onMount = (monaco: Monaco, editor: MonacoEditor) => {
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
    editor.updateOptions({ contextmenu: false, minimap: { enabled: false } });
    props.onMount?.call(undefined, {
      setMarkers(markers: MarkerData[]) {
        // Dodge actual component updates to Monaco. Instead directly tweak things.
        monaco.editor.setModelMarkers(
          editor.getModel()!,
          "playground",
          markers.map((marker) => ({
            severity: monacoEditor.MarkerSeverity.Error,
            ...marker,
          })),
        );
      },
    });
  };
  return (
    <EditorComponent
      onChange={props.onChange}
      onMount={onMount}
      language="typescript"
      value={props.value}
    />
  );
};
