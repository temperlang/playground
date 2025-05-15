export type CodeViewProps = {
  value: string;
};

export const CodeView = (props: CodeViewProps) => {
  return (
    <pre
      style={{
        "white-space": "pre-wrap",
        // TODO This copies a bit from Monaco, but better to share directly.
        "font-family": "Consolas, 'Courier New', monospace",
        "font-size": "14px",
      }}
    >
      {props.value}
    </pre>
  );
};
