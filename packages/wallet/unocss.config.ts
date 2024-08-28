import {
    defineConfig,
    presetUno,
    presetWebFonts,
    transformerDirectives,
  } from "unocss";
  
  export default defineConfig({
    shortcuts: {
      "tab-list":
        "flex !bg-black/5 text-black/75 rounded  dark:!bg-dark-300 dark:text-white/75",
      tab: "flex-1  p-2   rounded data-[selected]:!bg-black data-[selected]:text-white data-[selected]:dark:!bg-white data-[selected]:dark:text-black",
    },
    presets: [
      presetUno({ dark: "media" }),
      presetWebFonts({
        provider: "google",
        fonts: {
          sans: "Open Sans",
          mono: "Lato",
        },
      }),
    ],
    safelist: ["font-sans", "font-mono"],
    transformers: [transformerDirectives()],
  });
  