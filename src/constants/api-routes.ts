export const API_ROUTES = {
  HEALTH: "/api/health",
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
} as const;

export const APP_CONFIG = {
  NAME: "D2R Simulator",
  DEFAULT_PAGE_SIZE: 20,
} as const;
