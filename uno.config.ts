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
  presets: [presetUno(), presetWind(), presetAttributify()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
