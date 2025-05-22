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
import {
  distributeWidth,
  loadGist,
  manageResponse,
  RequestStatus,
  type BuildResponse,
  type ShareResponse,
} from "./support";
import { TemperEditor, TemperEditorState } from "./TemperEditor";
import { Spinner } from "./Spinner";

const server = "http://localhost:3001";
const initialSource = await (() => {
  const gistId = new URLSearchParams(window.location.search).get("gist");
  return gistId ? loadGist(gistId) : defaultSource;
})();

const App: Component = () => {
  let source = initialSource;
  let sourceVersion = 0;
  const [buildStatus, setBuildStatus] = createSignal<RequestStatus>("");
  const [gistId, setGistId] = createSignal("");
  const [response, setResponse] = createSignal<BuildResponse>({
    errors: [],
    translations: [],
  });
  const [shareStatus, setShareStatus] = createSignal<RequestStatus>("");
  let editor: TemperEditorState | undefined;
  const onMountEditor = (mountedEditor: TemperEditorState) => {
    editor = mountedEditor;
  };
  const onSourceChange = (value: string) => {
    source = value;
    sourceVersion += 1;
    editor!.setMarkers([]);
    // Clear ui state for changed source.
    if (buildStatus() == "error") {
      setBuildStatus("");
    }
    if (shareStatus() == "error") {
      setShareStatus("");
    }
    setGistId("");
    const url = new URL(window.location.href);
    url.search = "";
    const link = url.toString();
    history.replaceState(null, "", link);
  };
  let builtVersion = 0;
  const doBuild = async () => {
    // TODO Unify build and share status handling?
    // TODO Understand when multiple requests are out?
    setBuildStatus("loading");
    builtVersion = sourceVersion;
    const response = await manageResponse(
      fetch(`${server}/build`, {
        method: "POST",
        body: JSON.stringify({ source }),
      }),
    );
    if (!response) {
      setBuildStatus("error");
      return;
    }
    try {
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
    } finally {
      setBuildStatus("");
    }
  };
  let sharedVersion = 0;
  const doShare = async () => {
    setShareStatus("loading");
    sharedVersion = sourceVersion;
    const response = await manageResponse(
      fetch(`${server}/share`, {
        method: "POST",
        body: JSON.stringify({ source }),
      }),
    );
    if (!response) {
      setShareStatus("error");
      return;
    }
    try {
      const shareResponse = (await response.json()) as ShareResponse;
      let { id } = shareResponse;
      // Put link on clipboard, and also update window url if source unchanged.
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("gist", id);
      const link = url.toString();
      await window.navigator.clipboard.writeText(link);
      if (sharedVersion == sourceVersion) {
        history.replaceState(null, "", link);
      }
      setGistId(id);
    } finally {
      setShareStatus("");
    }
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.ctrlKey && !event.repeat) {
      let action = {
        // I tried hotkeys for share also, but they seemed more trouble than good.
        // In particular, Ctrl+S is out of control in Firefox.
        Enter: doBuild,
      }[event.key];
      if (action) {
        event.preventDefault();
        action();
      }
    }
  };
  let app: HTMLDivElement;
  let workArea: HTMLDivElement;
  const resize = () => {
    // Horizontal
    distributeWidth(workArea!, styles.divider);
    // Vertical
    const total = window.innerHeight;
    let used = 0;
    for (const kid of app!.childNodes as Iterable<HTMLElement>) {
      if (kid !== workArea!) {
        used += kid.getBoundingClientRect().height;
      }
    }
    workArea!.style.height = `${total - used}px`;
  };
  onMount(() => {
    window.addEventListener("keydown", keydown);
    window.addEventListener("resize", resize);
    requestAnimationFrame(resize);
  });
  onCleanup(() => {
    window.removeEventListener("keydown", keydown);
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
          <Button
            onClick={doBuild}
            title="Translate Temper source (Ctrl+Enter)"
          >
            Build Temper
          </Button>
          <Show when={buildStatus() == "error"}>
            <div>❌</div>
          </Show>
          <Show when={buildStatus() == "loading"}>
            <Spinner />
          </Show>
        </div>
        <div class={styles.metaTools}>
          <Show when={gistId()}>
            <div class={styles.shareInfo}>
              <a
                href={window.location.href}
                rel="noopener noreferrer"
                target="_blank"
                title="Current Temper source (link already copied to clipboard)"
              >
                Playground link
              </a>{" "}
              copied!{" "}
              <a
                href={`https://gist.github.com/temperlang-play/${gistId()}`}
                rel="noopener noreferrer"
                target="_blank"
                title="Backing storage for shared Temper source"
              >
                (Gist here)
              </a>
            </div>
          </Show>
          <Show when={shareStatus() == "error"}>
            <div>❌</div>
          </Show>
          <Show when={shareStatus() == "loading"}>
            <Spinner />
          </Show>
          <Button
            onClick={doShare}
            title="Save Temper source and copy link for sharing"
          >
            Share
          </Button>
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
        <div class={styles.divider} />
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
