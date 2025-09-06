// Centralized color constants for Neuronium AI Design System
export const COLORS = {
  // Backgrounds
  BG_PRIMARY: "#151515",
  BG_SECONDARY: "#343434",
  BG_TERTIARY: "#2a2a2a",
  BG_HOVER: "rgba(255, 255, 255, 0.05)",
  BG_ACTIVE: "rgba(255, 255, 255, 0.1)",

  // Text
  TEXT_PRIMARY: "#ffffff",
  TEXT_SECONDARY: "#8a8b8c",
  TEXT_TERTIARY: "#8c8c8c",

  // Borders
  BORDER_PRIMARY: "#343434",
  BORDER_SECONDARY: "rgba(255, 255, 255, 0.1)",

  // Brand/Accent
  ACCENT_VIOLET: "#8854f3",
  ACCENT_VIOLET_HOVER: "#7B3FF2",
  ACCENT_VIOLET_ACTIVE: "#6525D3",

  // Quick Action Tags
  TAG_HEALTH: "#53D769",
  TAG_EDUCATION: "#FF9500",
  TAG_PRODUCTIVITY: "#007AFF",
  TAG_GOALS: "#AF52DE",
  TAG_DEVELOPMENT: "#00C7BE",
  TAG_RELATIONSHIPS: "#FF2D55",

  // Gradients
  GRADIENT_PRIMARY: "linear-gradient(135deg, #8854f3 0%, #F78F55 100%)",
  GRADIENT_BG: "linear-gradient(180deg, #151515 0%, #1a1a1a 100%)",

  // Status Colors
  ERROR: "#ED4245",
  SUCCESS: "#57F287",
  WARNING: "#FEE75C",
  INFO: "#5865F2",
} as const;

// Type for color keys
export type ColorKey = keyof typeof COLORS;

// Helper function to get color value
export const getColor = (key: ColorKey): string => COLORS[key];
