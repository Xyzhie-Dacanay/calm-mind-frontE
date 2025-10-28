import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../components/Sidebar";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../store/useProfileStore";
import axios from "axios";

// ✅ Reusable success modal
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 rounded-lg p-6 shadow-2xl max-w-sm w-full mx-4 relative border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600 mb-6">Password updated successfully</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsLogin = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useContext(ThemeContext);
  const { profile, fetchProfile, loading, error } = useProfileStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const tabs = ["Edit Profile", "Login & Password", "About"];
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // ✅ Fetch profile data
  useEffect(() => {
    if (userId) fetchProfile(userId);
  }, [userId, fetchProfile]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-card">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-card">
        <p className="text-red-500">Error: {JSON.stringify(error)}</p>
      </div>
    );

  // ✅ Handle password update
  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrMsg("All fields are required");
      return;
    }
    if (newPassword.length < 6) {
      setErrMsg("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrMsg("Passwords do not match");
      return;
    }

    try {
      const res = await axios.put(
        "http://localhost:4000/api/users/update-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Password updated:", res.data);

      setEditing(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrMsg("");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("❌ Error updating password:", err);
      if (err.response?.data?.message) {
        setErrMsg(err.response.data.message);
      } else {
        setErrMsg("Failed to update password");
      }
    }
  };

  return (
    <>
      <div className="flex h-screen bg-card">
        <Sidebar />

        <div className="flex-1 overflow-auto">
          <div className="p-3">
            <div className="mb-8">
              <div className="bg-card rounded-lg shadow-lg px-6 py-6 flex items-center justify-between border border-gray-200">
                <h1 className="text-3xl font-bold text-primary">Settings</h1>
              </div>

              <div className="mt-4 border-b border-gray-200">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        tab === "Login & Password"
                          ? "border-yellow-500 text-yellow-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        if (tab === "Edit Profile") navigate("/settings");
                        if (tab === "Login & Password")
                          navigate("/settings/login");
                        if (tab === "About") navigate("/settings/about");
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="profile-content bg-card rounded-lg pt-1 pl-8 pr-8 pb-8 shadow-lg">
              <div className="profile-header mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  My Profile
                </h2>

                <div className="profile-card bg-card p-6 rounded-lg border border-gray-200 flex items-center gap-8 justify-between">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                      <img
                        src={profile.avatar || "/default-avatar.png"}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-primary">
                        {profile.fullName}
                      </div>
                      <p className="text-muted">{profile.year}</p>
                      <p className="text-muted text-sm">{profile.course}</p>
                      <p className="text-muted">{profile.studentNumber}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditing((s) => !s);
                      setErrMsg("");
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    {editing ? "Cancel" : "Edit"}
                  </button>
                </div>
              </div>

              {/* ✅ Login & Password Section */}
              <div className="bg-card rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold mb-6 text-primary">
                  Login & Password
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      Email Address
                    </label>
                    <div className="font-medium text-primary">
                      {profile.email || "No email found"}
                    </div>
                  </div>

                  {/* Current Password */}
                  {editing && (
                    <div>
                      <label className="block text-sm font-medium text-muted mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrent ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full p-3 rounded-md bg-white border border-gray-200 text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
                        >
                          {showCurrent ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      New Password
                    </label>
                    {editing ? (
                      <div className="relative">
                        <input
                          type={showNew ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full p-3 rounded-md bg-white border border-gray-200 text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
                        >
                          {showNew ? "Hide" : "Show"}
                        </button>
                      </div>
                    ) : (
                      <div className="w-full p-3 rounded-md bg-white border border-gray-200 text-gray-600">
                        {"•".repeat(8)}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      Confirm Password
                    </label>
                    {editing ? (
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full p-3 rounded-md bg-white border border-gray-200 text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
                        >
                          {showConfirm ? "Hide" : "Show"}
                        </button>
                      </div>
                    ) : (
                      <div className="w-full p-3 rounded-md bg-white border border-gray-200 text-gray-600">
                        {"•".repeat(8)}
                      </div>
                    )}
                  </div>

                  {errMsg && (
                    <div className="text-sm text-red-600">{errMsg}</div>
                  )}

                  {editing && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setShowCurrent(false);
                          setShowNew(false);
                          setShowConfirm(false);
                          setErrMsg("");
                        }}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme toggle */}
        <div className="block lg:hidden fixed bottom-4 left-4 z-50">
          <div
            className={`theme-switch ${theme === "dark" ? "dark" : ""}`}
            role="group"
            aria-label="Theme toggle"
          >
            <button
              type="button"
              className="sun-button"
              aria-pressed={theme === "light"}
              aria-label="Switch to light mode"
              onClick={() => setTheme("light")}
            >
              ☀️
            </button>
            <button
              type="button"
              className="knob-button"
              aria-hidden="true"
              tabIndex={-1}
            />
            <button
              type="button"
              className="moon-button"
              aria-pressed={theme === "dark"}
              aria-label="Switch to dark mode"
              onClick={() => setTheme("dark")}
            >
              🌙
            </button>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
};

export default SettingsLogin;
