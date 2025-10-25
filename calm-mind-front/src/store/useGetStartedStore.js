import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const useGetStartedStore = create((set) => ({
  completed: false,
  getStartedData: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    year: "",
    course: "",
    studentNumber: "",
    address: "",
  },
  loading: false,
  error: null,

  // Setters
  setCompleted: (value) => set({ completed: value }),
  setGetStartedData: (data) =>
    set((state) => ({ getStartedData: { ...state.getStartedData, ...data } })),
  setLoading: (value) => set({ loading: value }),
  setError: (error) => set({ error }),

  // Fetching / submission
  submitGetStarted: async (data, navigate) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) {
      alert("User not logged in. Please refresh or login again.");
      return;
    }

    set({ loading: true, error: null });

    try {
      // Add userId to the payload
      const payload = { ...data, userId: user.id };

      const response = await axios.post(
        "http://localhost:4000/api/get-started",
        payload
      );

      if (response.status === 201) {
        set({ getStartedData: data, completed: true });
        navigate("/home");
      }
    } catch (err) {
      console.error("Error submitting get-started form:", err.response?.data || err.message);
      set({ error: err.response?.data || err.message });
      alert("Failed to submit form. Please try again.");
    } finally {
      set({ loading: false });
    }
  },

  resetGetStarted: () =>
    set({
      completed: false,
      getStartedData: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        year: "",
        course: "",
        studentNumber: "",
        address: "",
      },
      loading: false,
      error: null,
    }),
}));
