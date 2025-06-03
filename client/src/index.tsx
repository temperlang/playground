/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

if (import.meta.env.PROD) {
  // Analytics support external script.
  const gtagScript = document.createElement("script");
  gtagScript.async = true;
  gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-3T0PZK7D3F";
  document.head.appendChild(gtagScript);
  // And our own call.
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]): void;
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-3T0PZK7D3F");
}

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

render(() => <App />, root!);
