import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        win98: {
          bg: "#c0c0c0",
          darkBg: "#808080",
          blue: "#000080",
          blueLight: "#1084d0",
          teal: "#008080",
          grayDark: "#404040",
          grayLight: "#dfdfdf",
        },
        retro: {
          screen: "#0f172a",
          screenGlow: "#00ff66",
          amber: "#ffb000",
        }
      },
      boxShadow: {
        'neu-flat': '6px 6px 12px #bebebe, -6px -6px 12px #ffffff',
        'neu-pressed': 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff',
        'neu-dark-flat': '6px 6px 14px #0b0f19, -6px -6px 14px #1b263b',
        'neu-dark-pressed': 'inset 4px 4px 8px #0b0f19, inset -4px -4px 8px #1b263b',
        'win98-raised': 'inset 1px 1px #fff, inset -1px -1px #000, inset 2px 2px #dfdfdf, inset -2px -2px #808080',
        'win98-sunken': 'inset 1px 1px #000, inset -1px -1px #fff, inset 2px 2px #808080, inset -2px -2px #dfdfdf',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      }
    },
  },
  plugins: [],
};
export default config;
