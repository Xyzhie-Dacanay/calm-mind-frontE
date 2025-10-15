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

          const res = await api.post("/users/register", {
            name,
            email,
            password,
          });
          const { user, token } = res.data;

          localStorage.setItem("token", token);
          set({ user, token, loading: false });

          return true;
        } catch (err) {
          console.error("Signup failed:", err.response?.data || err.message);
          set({
            error: err.response?.data?.message || "Signup failed",
            loading: false,
          });
          return false;
        }
      },

      // Login
      login: async (email, password) => {
        try {
          set({ loading: true, error: null });

          const res = await api.post("/users/login", { email, password });
          const { user, token } = res.data;

          localStorage.setItem("token", token);
          set({ user, token, loading: false });

          return true;
        } catch (err) {
          console.error("Login failed:", err.response?.data || err.message);
          set({
            error: err.response?.data?.message || "Login failed",
            loading: false,
          });
          return false;
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-store",
    }
  )
);
