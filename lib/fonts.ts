export const FONT_MAP = {
  inter: {
    label: "Inter",
    cssFamily: "Inter, sans-serif",
    variable: "--font-inter",
  },
  roboto: {
    label: "Roboto",
    cssFamily: "Roboto, sans-serif",
    variable: "--font-roboto",
  },
  montserrat: {
    label: "Montserrat",
    cssFamily: "Montserrat, sans-serif",
    variable: "--font-montserrat",
  },
} as const;

export type FontKey = keyof typeof FONT_MAP;
