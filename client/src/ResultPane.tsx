import { Tabs } from "@kobalte/core/tabs";
import { createSignal, For, onCleanup, onMount } from "solid-js";
import { CodeView } from "./CodeView";
import styles from "./ResultPane.module.css";
import { backendInfos, type BuildResponse } from "./support";

export type ResultPaneProps = {
  response: BuildResponse;
};

export const ResultPane = (props: ResultPaneProps) => {
  const response = () => props.response;
  const [backend, setBackend] = createSignal("");
  const [file, setFile] = createSignal("");
  return (
    <>
      <Tabs class={styles.resultTabs} onChange={setBackend}>
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
            <Tabs.Content class={styles.files} value={translation.backend}>
              <Tabs class={styles.filesTabs} onChange={setFile}>
                <Tabs.List>
                  <For each={translation.files}>
                    {(file) => (
                      <Tabs.Trigger value={file.name}>{file.name}</Tabs.Trigger>
                    )}
                  </For>
                </Tabs.List>
              </Tabs>
            </Tabs.Content>
          )}
        </For>
      </Tabs>
      {/* Seems to work better out here than in actual tab panels. */}
      <div class={styles.code}>
        <CodeView
          language={backend()}
          value={
            response()
              .translations.find((it) => it.backend == backend())
              ?.files.find((it) => it.name == file())?.content ?? ""
          }
        />
      </div>
    </>
  );
};
