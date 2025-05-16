import { Tabs } from "@kobalte/core/tabs";
import { For } from "solid-js";
import { CodeView } from "./CodeView";
import styles from "./ResultPane.module.css";
import { backendInfos, type BuildResponse } from "./types";

export type ResultPaneProps = {
  response: BuildResponse;
};

export const ResultPane = (props: ResultPaneProps) => {
  const response = () => props.response;
  return (
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
          <Tabs.Content class={styles.files} value={translation.backend}>
            <Tabs>
              <Tabs.List>
                <For each={translation.files}>
                  {(file) => (
                    <Tabs.Trigger value={file.name}>{file.name}</Tabs.Trigger>
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
  );
};
