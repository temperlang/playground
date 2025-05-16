export type CodeViewProps = {
  value: string;
};

export const CodeView = (props: CodeViewProps) => {
  return (
    <pre
      style={{
        // TODO This copies a bit from Monaco, but better to share directly.
        "font-family": "Consolas, 'Courier New', monospace",
        "font-size": "14px",
        "text-align": "left",
        "white-space": "pre-wrap",
      }}
    >
      {props.value}
    </pre>
  );
};
