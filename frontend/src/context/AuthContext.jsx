import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to load saved user:", error);

      localStorage.removeItem("user");

      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // Restore existing login session
  // --------------------------------------------------

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");

    if (!accessToken || !savedUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch (error) {
      console.error("Invalid saved user:", error);

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      setUser(null);
    }

    setLoading(false);
  }, []);

  // --------------------------------------------------
  // Login
  // --------------------------------------------------

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login/", {
        email: email.trim().toLowerCase(),
        password: password,
      });

      const data = response.data;

      // -----------------------------------------------
      // Validate backend response
      // -----------------------------------------------

      if (!data.access || !data.refresh || !data.user) {
        throw new Error("Invalid login response from server.");
      }

      // -----------------------------------------------
      // Save JWT tokens
      // -----------------------------------------------

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // -----------------------------------------------
      // Save logged-in user
      // -----------------------------------------------

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // -----------------------------------------------
      // Update React authentication state
      // -----------------------------------------------

      setUser(data.user);

      // -----------------------------------------------
      // IMPORTANT:
      // Return only the user object.
      // Login.jsx expects user.username and user.role.
      // -----------------------------------------------

      return data.user;
    } catch (error) {
      console.error("Login error:", error);

      throw error;
    }
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const logout = () => {
    console.log("Logging out...");

    // Remove JWT tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    // Remove saved user
    localStorage.removeItem("user");

    // Clear React authentication state
    setUser(null);

    // Redirect to login page
    navigate("/login", {
      replace: true,
    });
  };

  // --------------------------------------------------
  // Authentication status
  // --------------------------------------------------

  const isAuthenticated = Boolean(
    user && localStorage.getItem("access_token")
  );

  // --------------------------------------------------
  // Context value
  // --------------------------------------------------

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// --------------------------------------------------
// Custom authentication hook
// --------------------------------------------------

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
