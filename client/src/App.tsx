import { Button } from "@kobalte/core/button";
import { Tabs } from "@kobalte/core/tabs";
import { MonacoEditor } from "solid-monaco";
import { createSignal, type Component } from "solid-js";
import type * as monacoEditor from "monaco-editor";

import logo from "./assets/temper-logo-256.png";
import styles from "./App.module.css";
import defaultSource from "./assets/default.temper?raw";

const BuildButton = () => {
  const [response, setResponse] = createSignal("");
  const handleClick = async () => {
    const response = await fetch("http://localhost:3001/");
    const text = await response.text();
    setResponse(text);
  };
  return (
    <>
      <Button onClick={handleClick}>Build</Button>
      <div>{response()}</div>
    </>
  );
};

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
        <div class={styles.devTools}>
          <BuildButton />
        </div>
        <div class={styles.metaTools}>Share</div>
      </div>
      <div class={styles.workArea}>
        <div class={styles.sourceArea}>
          <TemperEditor />
        </div>
        <div class={styles.resultArea}>
          <Tabs>
            <Tabs.List>
              <Tabs.Trigger value="csharp">C#</Tabs.Trigger>
              <Tabs.Trigger value="java">Java</Tabs.Trigger>
              <Tabs.Trigger value="js">JS</Tabs.Trigger>
              <Tabs.Trigger value="lua">Lua</Tabs.Trigger>
              <Tabs.Trigger value="py">Python</Tabs.Trigger>
              <Tabs.Trigger value="rust">Rust</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="csharp">Totally C# here.</Tabs.Content>
            <Tabs.Content value="java">Totally Java here.</Tabs.Content>
            <Tabs.Content value="js">Totally JS here.</Tabs.Content>
            <Tabs.Content value="lua">Totally Lua here.</Tabs.Content>
            <Tabs.Content value="py">Totally Python here.</Tabs.Content>
            <Tabs.Content value="rust">Totally Rust here.</Tabs.Content>
          </Tabs>
        </div>
      </div>
      <div class={styles.toolbar}>Legal Stuff</div>
    </div>
  );
};

export default App;
