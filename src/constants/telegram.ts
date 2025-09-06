export const TELEGRAM_SCRIPT_URL =
  "https://telegram.org/js/telegram-web-app.js";
export const AUTH_VALIDITY_DURATION = 86400; // 24 hours in seconds
export const LOADING_DELAYS = {
  DEVELOPMENT: 500,
  PRODUCTION: 500,
  SCRIPT_LOAD: 300,
} as const;

export const TELEGRAM_THEME = {
  HEADER_COLOR: "#151515",
  BACKGROUND_COLOR: "#151515",
} as const;
