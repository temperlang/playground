import styles from "./Spinner.module.css";

export type SpinnerProps = {
  size?: string;
};

export const Spinner = (props: SpinnerProps) => {
  return (
    <div
      class={styles.spinner}
      style={
        props.size == null ? {} : { height: props.size, width: props.size }
      }
    />
  );
};
