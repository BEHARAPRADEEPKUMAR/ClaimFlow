import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to load stored user:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me/")
      .then((response) => {
        const currentUser = response.data;

        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      })
      .catch((error) => {
        console.error("Authentication check failed:", error);

        // Token is invalid/expired
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login/", {
        email: email.trim(),
        password,
      });

      const data = response.data;

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);

      return data.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    // Remove all ClaimFlow authentication data
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    // Clear React authentication state
    setUser(null);

    // Go back to ClaimFlow login page
    navigate("/login", { replace: true });
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case "EMPLOYEE":
        return "/employee";

      case "MANAGER":
        return "/manager";

      case "FINANCE":
        return "/finance";

      default:
        return "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        getDashboardPath,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
