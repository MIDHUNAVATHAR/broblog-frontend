export const API_PATHS = {
  AUTH: {
    SIGNUP: "/auth/signup",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    PREFIX: "/auth/"
  },
  BLOGS: {
    BASE: "/blogs",
    MY_BLOGS: "/blogs/my-blogs",
    BY_ID: (id: string) => `/blogs/${id}`,
    LIKE: (id: string) => `/blogs/${id}/like`
  },
  UPLOAD: "/upload"
} as const;
