import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [basicSsl({ certDir: "../ignore/certs" }), solidPlugin()],
  server: {
    https: true as any,
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
