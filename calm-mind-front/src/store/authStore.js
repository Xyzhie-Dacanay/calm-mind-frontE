// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/client";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      // Signup
      signup: async (name, email, password) => {
        try {
          set({ loading: true, error: null });

          const res = await api.post(
            "http://localhost:4000/api/users/register",
            {
              name,
              email,
              password,
            }
          );

          const { user, token } = res.data;

          // Save token and user to localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          set({ user, token, loading: false });

          return user; // ✅ Return full user object
        } catch (err) {
          console.error("Signup failed:", err.response?.data || err.message);
          set({
            error: err.response?.data?.message || "Signup failed",
            loading: false,
          });
          return null;
        }
      },

      // Login
      login: async (email, password) => {
        try {
          set({ loading: true, error: null });

          const res = await api.post("http://localhost:4000/api/users/login", {
            email,
            password,
          });

          const { user, token } = res.data;

          // Save token and user to localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          set({ user, token, loading: false });

          return user; // ✅ Return full user object for LoginScreen navigation
        } catch (err) {
          console.error("Login failed:", err.response?.data || err.message);
          set({
            error: err.response?.data?.message || "Login failed",
            loading: false,
          });
          return null;
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-store",
    }
  )
);
