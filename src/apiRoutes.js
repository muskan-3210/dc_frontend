// One entry per API route. The key is what the rest of the app uses.
const crudRoutes = (name, base) => ({
  [`${name}_LIST`]: { method: "GET", path: base },
  [`${name}_GET`]: { method: "GET", path: `${base}/:id` },
  [`${name}_CREATE`]: { method: "POST", path: base },
  [`${name}_UPDATE`]: { method: "PATCH", path: `${base}/:id` },
  [`${name}_DELETE`]: { method: "DELETE", path: `${base}/:id` },
});

export const ROUTES = {
  AUTH_REGISTER: { method: "POST", path: "/auth/register" },
  AUTH_LOGIN: { method: "POST", path: "/auth/login" },
  AUTH_ME: { method: "GET", path: "/auth/me" },
  MOVIE_LIST: { method: "GET", path: "/movies" },

  ONBOARDING_CREATE: { method: "POST", path: "/onboarding" },
  ONBOARDING_ME: { method: "GET", path: "/onboarding/me" },
  UPLOAD_PRODUCT_IMAGE: { method: "POST", path: "/uploads/product-image" },
  ONBOARDING_UPDATE: { method: "PATCH", path: "/onboarding/me" },

  ...crudRoutes("CATEGORY", "/categories"),
  ...crudRoutes("PRODUCT", "/products"),
};

// API.CATEGORY_LIST === "CATEGORY_LIST". Use this so a typo fails loudly instead of silently.
export const API = Object.fromEntries(Object.keys(ROUTES).map((key) => [key, key]));