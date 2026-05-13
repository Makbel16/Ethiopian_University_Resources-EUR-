import { createContext, useContext, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const api = useMemo(() => {
    const instance = axios.create({ baseURL: API_BASE });
    if (token) instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    return instance;
  }, [token]);

  const login = (payload) => {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem("token", payload.token);
    localStorage.setItem("user", JSON.stringify(payload.user));
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return <AuthContext.Provider value={{ token, user, login, logout, api }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
