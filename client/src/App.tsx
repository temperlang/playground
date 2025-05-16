import { Button } from "@kobalte/core/button";
import { Tabs } from "@kobalte/core/tabs";
import { createSignal, For, type Component } from "solid-js";

import logo from "./assets/temper-logo-256.png";
import styles from "./App.module.css";
import defaultSource from "./assets/default.temper?raw";
import { TemperEditor } from "./editor";
import { CodeView } from "./codeview";
import { backendInfos, BuildResponse } from "./types";

const App: Component = () => {
  const [source, setSource] = createSignal(defaultSource);
  const [response, setResponse] = createSignal<BuildResponse>({
    errors: [],
    translations: [],
  });
  const onSourceChange = (value: string) => {
    setSource(value);
  };
  const postBuild = async () => {
    const response = await fetch("http://localhost:3001/", {
      method: "POST",
      body: JSON.stringify({ source: source() }),
    });
    const buildResponse = (await response.json()) as BuildResponse;
    // They might come sorted, but ensure in frontend.
    buildResponse.translations.sort((a, b) =>
      a.backend.localeCompare(b.backend),
    );
    for (const translation of buildResponse.translations) {
      translation.files.sort((a, b) => a.name.localeCompare(b.name));
    }
    setResponse(buildResponse);
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
        <div class={styles.metaTools}>
          <Button>Share</Button>
        </div>
      </div>
      <div class={styles.workArea}>
        <div class={styles.sourceArea}>
          <TemperEditor onChange={onSourceChange} value={defaultSource} />
        </div>
        <div class={styles.resultArea}>
          <Tabs class={styles.resultTabs}>
            <Tabs.List>
              <For each={response().translations}>
                {({ backend }) => (
                  <Tabs.Trigger value={backend}>
                    {backendInfos[backend].name}
                  </Tabs.Trigger>
                )}
              </For>
            </Tabs.List>
            <For each={response().translations}>
              {(translation) => (
                <Tabs.Content value={translation.backend}>
                  <Tabs>
                    <Tabs.List>
                      <For each={translation.files}>
                        {(file) => (
                          <Tabs.Trigger value={file.name}>
                            {file.name}
                          </Tabs.Trigger>
                        )}
                      </For>
                    </Tabs.List>
                    <For each={translation.files}>
                      {(file) => (
                        <Tabs.Content value={file.name}>
                          <CodeView value={file.content} />
                        </Tabs.Content>
                      )}
                    </For>
                  </Tabs>
                </Tabs.Content>
              )}
            </For>
          </Tabs>
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
