import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, getToken, setToken, setUnauthorizedHandler } from "./api.js";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  // Reload the logged-in user (also used after onboarding to pick up onboarding_completed).
  const refresh = useCallback(async () => {
    const res = await authApi.me();
    setUser(res.data);
    return res.data;
  }, []);

  // Restore the session from a saved token on page load.
  useEffect(() => {
    if (!getToken()) return;
    refresh()
      .catch(logout)
      .finally(() => setLoading(false));
  }, [refresh, logout]);

  async function authenticate(call, payload) {
    const res = await call(payload);
    setToken(res.token);
    setUser(res.user);
  }

  const login = (credentials) => authenticate(authApi.login, credentials);
  const register = (data) => authenticate(authApi.register, data);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
