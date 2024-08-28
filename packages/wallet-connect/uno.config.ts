import {
  defineConfig,
  presetUno,
  presetWind,
  presetAttributify,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup,
  presetWebFonts,
} from "unocss"; 

export default defineConfig({
  content: {
    filesystem: ["**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}"],
  },
  theme: {
    colors: {
      primary: "#000",
    },
  },
  shortcuts: {
    btn: "flex space-x-2 items-center justify-center px-4 py-2",
    "btn-primary": " bg-black text-white hover:bg-black/80",
    "btn-secondary": "bg-violet-700 text-white hover:bg-violet-700/80",
  },
  presets: [
    presetUno(),
    presetWind(),
    presetTypography(),
    presetAttributify(),
    presetWebFonts({
      provider: "google",
      fonts: {
        sans: "Open Sans",
      },
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
