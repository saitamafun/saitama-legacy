import {
  defineConfig,
  presetUno,
  presetWind,
  presetAttributify,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  content: {
    filesystem: ["**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}"],
  },
  presets: [presetUno({ dark: "media" }), presetWind(), presetAttributify()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
