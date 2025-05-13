import type { Component } from "solid-js";
import { MonacoEditor } from "solid-monaco";
import type * as monacoEditor from "monaco-editor";

import logo from "./assets/temper-logo-256.png";
import styles from "./App.module.css";
import defaultSource from "./assets/default.temper?raw";

const TemperEditor = () => {
  const handleMount = (
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
      onMount={handleMount}
      language="typescript"
      value={defaultSource}
    />
  );
};

const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <div class={styles.title}>Temper Language Playground</div>
        {/* <a
          class={styles.link}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a> */}
      </header>
      <div class={styles.toolbar}>
        <div class={styles.devTools}>Build</div>
        <div class={styles.metaTools}>Share</div>
      </div>
      <div class={styles.workArea}>
        <div class={styles.sourceArea}>
          <TemperEditor />
        </div>
        <div class={styles.resultArea}>Result Area</div>
      </div>
      <div class={styles.toolbar}>Legal Stuff</div>
    </div>
  );
};

export default App;
