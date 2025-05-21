import { Button } from "@kobalte/core/button";
import {
  createSignal,
  onCleanup,
  onMount,
  Show,
  type Component,
} from "solid-js";
import styles from "./App.module.css";
import logo from "./assets/temper-logo-256.png";
import defaultSource from "./assets/default.temper?raw";
import { ResultPane } from "./ResultPane";
import { loadGist, type BuildResponse, type ShareResponse } from "./support";
import { TemperEditor, TemperEditorState } from "./TemperEditor";

const server = "http://localhost:3001";
const initialSource = await (() => {
  const gistId = new URLSearchParams(location.search).get("gist");
  return gistId ? loadGist(gistId) : defaultSource;
})();

const App: Component = () => {
  let source = initialSource;
  let sourceVersion = 0;
  const [response, setResponse] = createSignal<BuildResponse>({
    errors: [],
    translations: [],
  });
  const [gistId, setGistId] = createSignal("");
  let editor: TemperEditorState | undefined;
  const onMountEditor = (mountedEditor: TemperEditorState) => {
    editor = mountedEditor;
  };
  const onSourceChange = (value: string) => {
    source = value;
    sourceVersion += 1;
    editor!.setMarkers([]);
    // Clear any url params.
    setGistId("");
    const url = new URL(location.href);
    url.search = "";
    const link = url.toString();
    history.replaceState(null, "", link);
  };
  let builtVersion = 0;
  const doBuild = async () => {
    builtVersion = sourceVersion;
    const response = await fetch(`${server}/build`, {
      method: "POST",
      body: JSON.stringify({ source }),
    });
    const buildResponse = (await response.json()) as BuildResponse;
    if (builtVersion == sourceVersion) {
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
  let sharedVersion = 0;
  const doShare = async () => {
    sharedVersion = sourceVersion;
    const response = await fetch(`${server}/share`, {
      method: "POST",
      body: JSON.stringify({ source }),
    });
    const shareResponse = (await response.json()) as ShareResponse;
    let { id } = shareResponse;
    // Put link on clipboard, and also update window url if source unchanged.
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("gist", id);
    const link = url.toString();
    await navigator.clipboard.writeText(link);
    if (sharedVersion == sourceVersion) {
      history.replaceState(null, "", link);
    }
    setGistId(id);
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
          <Button onClick={doBuild}>Build Temper</Button>
        </div>
        <div class={styles.metaTools}>
          <Show when={gistId()}>
            <div class={styles.shareInfo}>
              Playground link copied!{" "}
              <a
                href={`https://gist.github.com/temperlang-play/${gistId()}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                (Gist here)
              </a>
            </div>
          </Show>
          <Button onClick={doShare}>Share</Button>
        </div>
      </div>
      <div ref={workArea!} class={styles.workArea}>
        <div class={styles.sourceArea}>
          <TemperEditor
            onChange={onSourceChange}
            onMount={onMountEditor}
            value={source}
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
