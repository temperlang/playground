import { Button } from "@kobalte/core/button";
import { createSignal, onCleanup, onMount, type Component } from "solid-js";
import styles from "./App.module.css";
import logo from "./assets/temper-logo-256.png";
import defaultSource from "./assets/default.temper?raw";
import { ResultPane } from "./ResultPane";
import { TemperEditor, TemperEditorState } from "./TemperEditor";
import type { BuildResponse, MarkerData } from "./types";

const App: Component = () => {
  let source = defaultSource;
  let sourceVersion = 0;
  const [response, setResponse] = createSignal<BuildResponse>({
    errors: [],
    translations: [],
  });
  let editor: TemperEditorState | undefined;
  const onMountEditor = (mountedEditor: TemperEditorState) => {
    editor = mountedEditor;
  };
  const onSourceChange = (value: string) => {
    source = value;
    sourceVersion += 1;
    editor!.setMarkers([]);
  };
  let postedVersion = 0;
  const postBuild = async () => {
    postedVersion = sourceVersion;
    const response = await fetch("http://localhost:3001/", {
      method: "POST",
      body: JSON.stringify({ source }),
    });
    const buildResponse = (await response.json()) as BuildResponse;
    if (postedVersion == sourceVersion) {
      editor!.setMarkers(buildResponse.errors);
    }
    // They might come sorted, but ensure in frontend.
    buildResponse.translations.sort((a, b) =>
      a.backend.localeCompare(b.backend),
    );
    for (const translation of buildResponse.translations) {
      translation.files.sort((a, b) => a.name.localeCompare(b.name));
    }
    setResponse(buildResponse);
  };
  let app: HTMLDivElement;
  let workArea: HTMLDivElement;
  const resize = () => {
    const total = window.innerHeight;
    let used = 0;
    for (const kid of app!.childNodes) {
      if (kid !== workArea!) {
        used += (kid as HTMLElement).getBoundingClientRect().height;
      }
    }
    workArea!.style.height = `${total - used}px`;
  };
  onMount(() => {
    window.addEventListener("resize", resize);
    requestAnimationFrame(resize);
  });
  onCleanup(() => {
    window.removeEventListener("resize", resize);
  });
  return (
    <div ref={app!} class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <div class={styles.title}>Temper Language Playground</div>
      </header>
      <div class={styles.toolbar}>
        <div class={styles.devTools}>
          <Button onClick={postBuild}>Build Temper</Button>
        </div>
        <div class={styles.metaTools}>
          <Button>Share</Button>
        </div>
      </div>
      <div ref={workArea!} class={styles.workArea}>
        <div class={styles.sourceArea}>
          <TemperEditor
            onChange={onSourceChange}
            onMount={onMountEditor}
            value={defaultSource}
          />
        </div>
        <div class={styles.resultArea}>
          <ResultPane response={response()}></ResultPane>
        </div>
      </div>
      <div class={styles.footer}>
        By Temper contributors. Copyright © 2020-2025 Temper Systems Inc. |
        Legal:&nbsp;
        <a href="https://temperlang.github.io/tld/legal/eula/">
          End User License Agreement (EULA)
        </a>
      </div>
    </div>
  );
};

export default App;
