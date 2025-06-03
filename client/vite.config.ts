import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import solidPlugin from "vite-plugin-solid";

export default defineConfig(({ mode }) => ({
  build: {
    target: "esnext",
  },
  define:
    mode == "production"
      ? {
          SERVER_URL: JSON.stringify("https://playground.temper.systems"),
        }
      : {
          SERVER_URL: JSON.stringify("http://localhost:3001"),
        },
  plugins: [basicSsl({ certDir: "../ignore/certs" }), solidPlugin()],
  server: {
    https: true as any,
    port: 3000,
  },
}));
