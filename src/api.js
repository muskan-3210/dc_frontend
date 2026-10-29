import { API, ROUTES } from "./apiRoutes.js";

const TOKEN_KEY = "dc_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

// Called when the server answers 401 for a logged-in user (expired or invalid token).
let onUnauthorized = () => { };
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

// Thin wrapper around fetch. All requests go to /api (proxied to dc_server).
async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(!(options.body instanceof FormData) && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (res.status === 204) return null;

  let body = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    const details = body?.errors?.map((e) => `${e.field}: ${e.message}`).join(", ");
    throw new Error([body?.message || `Request failed (${res.status})`, details].filter(Boolean).join(" - "));
  }
  return body;
}

const toQuery = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== "" && v !== undefined && v !== null) q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
};

/**
 * Call an API by key.
 *   params -> fills :id style placeholders in the path
 *   query  -> becomes ?page=1&limit=10
 *   body   -> JSON request body
 */
export function callApi(key, { params = {}, query = {}, body } = {}) {
  const route = ROUTES[key];
  if (!route) throw new Error(`Unknown API key: ${key}`);

  const path = route.path.replace(/:(\w+)/g, (_, name) => {
    if (params[name] === undefined) throw new Error(`Missing path param "${name}" for ${key}`);
    return encodeURIComponent(params[name]);
  });

  return request(`${path}${toQuery(query)}`, {
    method: route.method,
    ...(body !== undefined && { body: body instanceof FormData ? body : JSON.stringify(body) }),
  });
}

// Same five calls for every table, built from the CATEGORY_* / PRODUCT_* route keys.
const crudApi = (name) => ({
  list: (query) => callApi(API[`${name}_LIST`], { query }),
  get: (id) => callApi(API[`${name}_GET`], { params: { id } }),
  create: (body) => callApi(API[`${name}_CREATE`], { body }),
  update: (id, body) => callApi(API[`${name}_UPDATE`], { params: { id }, body }),
  remove: (id) => callApi(API[`${name}_DELETE`], { params: { id } }),
});

export const authApi = {
  register: (body) => callApi(API.AUTH_REGISTER, { body }),
  login: (body) => callApi(API.AUTH_LOGIN, { body }),
  me: () => callApi(API.AUTH_ME),
};

export const onboardingApi = {
  create: (body) => callApi(API.ONBOARDING_CREATE, { body }),
  me: () => callApi(API.ONBOARDING_ME),
  update: (body) => callApi(API.ONBOARDING_UPDATE, { body }),
};

export const categoryApi = crudApi("CATEGORY");
export const productApi = crudApi("PRODUCT");
