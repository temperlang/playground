import { Button } from "@kobalte/core/button";
import { Tabs } from "@kobalte/core/tabs";
import { createSignal, type Component } from "solid-js";

import logo from "./assets/temper-logo-256.png";
import styles from "./App.module.css";
import defaultSource from "./assets/default.temper?raw";
import { TemperEditor } from "./editor";
import { CodeView } from "./codeview";

const App: Component = () => {
  const [source, setSource] = createSignal(defaultSource);
  const [response, setResponse] = createSignal("");
  const onSourceChange = (value: string) => {
    setSource(value);
  };
  const postBuild = async () => {
    const response = await fetch("http://localhost:3001/", {
      method: "POST",
      body: JSON.stringify({ source: source() }),
    });
    const text = await response.text();
    setResponse(text);
  };
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <div class={styles.title}>Temper Language Playground</div>
      </header>
      <div class={styles.toolbar}>
        <div class={styles.devTools}>
          <Button onClick={postBuild}>Build Temper</Button>
        </div>
        <div class={styles.metaTools}>Share</div>
      </div>
      <div class={styles.workArea}>
        <div class={styles.sourceArea}>
          <TemperEditor onChange={onSourceChange} value={defaultSource} />
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
            <Tabs.Content value="csharp">
              <CodeView value={response()} />
            </Tabs.Content>
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
