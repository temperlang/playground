import hljs from "highlight.js";
import { createEffect } from "solid-js";

export type CodeViewProps = {
  language: string;
  value: string;
};

export const CodeView = (props: CodeViewProps) => {
  let code: HTMLElement;
  createEffect(() => {
    props.value;
    props.language;
    // Need to assign this to convince solid to update the element.
    code!.textContent = props.value;
    requestAnimationFrame(() => {
      code!.removeAttribute("data-highlighted");
      hljs.highlightElement(code!);
    });
  });
  return (
    <pre
      style={{
        // TODO This copies a bit from Monaco, but better to share directly.
        "font-family": "Consolas, 'Courier New', monospace",
        "font-size": "14px",
        margin: "0",
        "text-align": "left",
        "white-space": "pre-wrap",
        "text-wrap": "nowrap",
      }}
    >
      <code
        ref={code!}
        class={`language-${props.language}`}
        style={{ overflow: "visible" }}
      >
        {props.value}
      </code>
    </pre>
  );
};
