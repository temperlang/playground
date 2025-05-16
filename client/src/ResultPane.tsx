import { Tabs } from "@kobalte/core/tabs";
import { createSignal, For, onCleanup, onMount } from "solid-js";
import { CodeView } from "./CodeView";
import styles from "./ResultPane.module.css";
import { backendInfos, type BuildResponse } from "./types";

export type ResultPaneProps = {
  response: BuildResponse;
};

export const ResultPane = (props: ResultPaneProps) => {
  // let rulerRef: HTMLDivElement;
  // let codeRef: HTMLDivElement;
  const response = () => props.response;
  const [backend, setBackend] = createSignal("");
  const [file, setFile] = createSignal("");
  // const [visible, setVisible] = createSignal(true);
  // const resize = () => {
  //   setVisible(false);
  //   requestAnimationFrame(() => {
  //     const height = rulerRef!.getBoundingClientRect().height;
  //     codeRef!.style.height = `${height}px`;
  //     setVisible(true);
  //   });
  // };
  // onMount(() => {
  //   const observer = new ResizeObserver(resize);
  //   observer.observe(rulerRef!);
  //   window.addEventListener("resize", resize);
  //   requestAnimationFrame(resize);
  // });
  // onCleanup(() => {
  //   window.removeEventListener("resize", resize);
  // });
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
                {/* <For each={translation.files}>
                  {(file) => (
                    <Tabs.Content class={styles.codeBox} value={file.name}>
                    </Tabs.Content>
                  )}
                </For> */}
              </Tabs>
            </Tabs.Content>
          )}
        </For>
      </Tabs>
      {/* <MonacoEditor
        value={
          response()
            .translations.find((it) => it.backend == backend())
            ?.files.find((it) => it.name == file())?.content ?? ""
        }
      /> */}
      <div class={styles.code}>
        <CodeView value={response()
            .translations.find((it) => it.backend == backend())
            ?.files.find((it) => it.name == file())?.content ?? ""} />
      </div>
    </>
  );
};
