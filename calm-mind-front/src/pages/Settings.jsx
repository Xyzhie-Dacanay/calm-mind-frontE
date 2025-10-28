import React, { useState, useContext, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfileStore } from "../store/useProfileStore";
import "../styles/theme.css";

const Settings = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const { profile, fetchProfile, updateProfile, loading, error } =
    useProfileStore();

  const [editMode, setEditMode] = useState(false);
  const [draftProfile, setDraftProfile] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const pathname = location.pathname || "";
  let activeTab = "Edit Profile";
  if (pathname.startsWith("/settings/login")) activeTab = "Login & Password";
  else if (pathname.startsWith("/settings/about")) activeTab = "About";
  const tabs = ["Edit Profile", "Login & Password", "About"];

  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const courses = [
    "Bachelor of Science in Information Technology (CITE)",
    "Bachelor of Science in Nursing (CAHS)",
    "Bachelor of Science in Pharmacy (CAHS)",
    "Bachelor in Medical Laboratory Science (CAHS)",
    "Bachelor of Science in Psychology (CAHS)",
    "Bachelor of Science in Architecture (CEA)",
    "Bachelor of Science in Computer Engineering (CEA)",
    "Bachelor of Science in Civil Engineering (CEA)",
    "Bachelor of Science in Electrical Engineering (CEA)",
    "Bachelor of Science in Mechanical Engineering (CEA)",
    "Bachelor of Science in Criminology (CCJE)",
    "Bachelor of Arts in Political Science (CELA)",
    "Bachelor of Science in Elementary Education (CELA)",
    "Bachelor of Secondary Education Major in English (CELA)",
    "Bachelor of Secondary Education Major in Math (CELA)",
    "Bachelor of Secondary Education Major in Science (CELA)",
    "Bachelor of Secondary Education Major in Social Studies (CELA)",
    "Bachelor of Science in Accountancy (CMA)",
    "Bachelor of Science in Management Accounting (CMA)",
    "Bachelor of Science in Accountancy Technology (CMA)",
    "Bachelor of Science in Hospitality Management (CMA)",
    "Bachelor of Science in Tourism Management (CMA)",
    "Bachelor of Science in Business Administration Major in Marketing Management (CMA)",
    "Bachelor of Science in Business Administration Major in Financial Management (CMA)",
  ];

  // ✅ Logged-in user ID
  const userId = localStorage.getItem("userId");
  console.debug("🪪 userId from localStorage:", userId);

  // ✅ Fetch profile on mount
  useEffect(() => {
    console.debug("🌀 useEffect(fetchProfile) triggered. userId:", userId);
    if (userId) {
      console.debug("🚀 Calling fetchProfile...");
      fetchProfile(userId)
        .then(() => console.debug("✅ fetchProfile completed"))
        .catch((err) => console.error("❌ fetchProfile error:", err));
    } else {
      console.warn("⚠️ No userId found in localStorage.");
    }
  }, [userId, fetchProfile]);

  // ✅ Handle ?edit=profile URL param
  useEffect(() => {
    console.debug(
      "🔍 useEffect(location.search) triggered with:",
      location.search
    );
    const params = new URLSearchParams(location.search);
    if (params.get("edit") === "profile") {
      console.debug("✏️ Edit mode via URL param detected.");
      setDraftProfile({ ...profile });
      setEditMode(true);
      setTimeout(() => {
        const el = document.querySelector(".profile-content");
        if (el && typeof el.scrollIntoView === "function") {
          console.debug("📜 Scrolling to profile-content...");
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location.search, profile]);

  useEffect(() => {
    console.debug("🧠 Current profile from store:", profile);
  }, [profile]);

  const startEdit = () => {
    console.debug("✏️ startEdit() called. Current profile:", profile);
    setDraftProfile({ ...profile });
    setEditMode(true);
  };

  const cancelEdit = () => {
    console.debug("🚫 cancelEdit() called.");
    setDraftProfile(null);
    setEditMode(false);
  };

  // ✅ Save updated profile to backend
  const saveEdit = async () => {
    if (!userId) {
      console.error("❌ No userId found, cannot save profile.");
      return;
    }
    console.debug("💾 saveEdit() called. draftProfile:", draftProfile);
    setIsSaving(true);

    const formData = new FormData();
    formData.append("firstName", draftProfile?.firstName || profile.firstName);
    formData.append("lastName", draftProfile?.lastName || profile.lastName);
    formData.append("yearLevel", draftProfile?.year || profile.year);
    formData.append("course", draftProfile?.course || profile.course);
    formData.append(
      "studentNumber",
      draftProfile?.studentNumber || profile.studentNumber
    );
    formData.append("contactNumber", draftProfile?.phone || profile.phone);
    formData.append("address", draftProfile?.address || profile.address);

    if (draftProfile?.avatar && draftProfile.avatar.startsWith("data:")) {
      console.debug("🖼️ Adding profileImage to formData (base64 detected)");
      formData.append("profileImage", draftProfile.avatar);
    }

    console.debug("📦 Final formData entries:");
    for (let pair of formData.entries()) {
      console.debug(`➡️ ${pair[0]}:`, pair[1]);
    }

    try {
      console.debug("🚀 Calling updateProfile API...");
      await updateProfile(userId, formData);
      console.debug("✅ updateProfile successful");
      setEditMode(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch (err) {
      console.error("❌ Error updating profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const current = editMode && draftProfile ? draftProfile : profile;
  console.debug("🧾 current profile view:", current);

  if (loading) {
    console.debug("⏳ Loading profile...");
    return (
      <div className="flex items-center justify-center h-screen bg-card">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    console.error("🔥 Profile error:", error);
    return (
      <div className="flex items-center justify-center h-screen bg-card">
        <p className="text-red-500">Error: {JSON.stringify(error)}</p>
      </div>
    );
  }

  return (
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
                      activeTab === tab
                        ? "border-yellow-500 text-yellow-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => {
                      console.debug("🧭 Tab clicked:", tab);
                      if (tab === "Login & Password")
                        navigate("/settings/login");
                      else if (tab === "Edit Profile") navigate("/settings");
                      else if (tab === "About") navigate("/settings/about");
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {activeTab === "Edit Profile" && (
            <div className="profile-content bg-card rounded-lg pt-1 pl-8 pr-8 pb-8 shadow-lg">
              <div className="profile-header mb-8">
                <h2 className="text-2xl font-semibold text-primary mb-4">
                  My Profile
                </h2>
                <div className="profile-card bg-card p-6 rounded-lg border border-gray-200 flex items-center gap-8 justify-between">
                  <div className="flex items-center gap-8">
                    {/* Avatar */}
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                        <img
                          src={current.avatar || "/default-avatar.png"}
                          alt="Profile"
                          className={`w-full h-full object-cover cursor-pointer transition-all duration-300 ${
                            editMode
                              ? "ring-2 ring-yellow-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
                              : ""
                          }`}
                          onClick={() => {
                            console.debug(
                              "🖼️ Avatar clicked. editMode:",
                              editMode
                            );
                            editMode && fileInputRef.current?.click();
                          }}
                        />
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            console.debug("📸 File selected:", file);
                            if (file) {
                              setIsImageLoading(true);
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                console.debug("✅ Image loaded as base64.");
                                setDraftProfile((prev) => ({
                                  ...prev,
                                  avatar: ev.target?.result,
                                }));
                                setIsImageLoading(false);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div>
                      {editMode ? (
                        <input
                          className="text-xl font-semibold text-primary bg-transparent outline-none"
                          value={`${
                            draftProfile?.firstName || profile.firstName
                          } ${draftProfile?.lastName || profile.lastName}`}
                          readOnly
                        />
                      ) : (
                        <h3 className="text-xl font-semibold text-primary">
                          {profile.fullName}
                        </h3>
                      )}

                      {editMode ? (
                        <select
                          value={draftProfile?.year || profile.year}
                          onChange={(e) => {
                            console.debug("🎓 Year changed:", e.target.value);
                            setDraftProfile((p) => ({
                              ...p,
                              year: e.target.value,
                            }));
                          }}
                          className="text-muted bg-transparent border border-gray-200 rounded px-2 py-1 w-full mb-1"
                        >
                          {yearLevels.map((y) => (
                            <option key={y}>{y}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-muted">{profile.year}</p>
                      )}

                      {editMode ? (
                        <select
                          value={draftProfile?.course || profile.course}
                          onChange={(e) => {
                            console.debug("📘 Course changed:", e.target.value);
                            setDraftProfile((p) => ({
                              ...p,
                              course: e.target.value,
                            }));
                          }}
                          className="text-muted bg-transparent border border-gray-200 rounded px-2 py-1 w-full mb-1 text-sm"
                        >
                          {courses.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-muted text-sm">{profile.course}</p>
                      )}

                      <p className="text-muted">{profile.studentNumber}</p>
                    </div>
                  </div>

                  {!editMode ? (
                    <button
                      onClick={startEdit}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={isSaving}
                        className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2 
                          transition-all duration-300 ${
                            isSaving ? "opacity-75 cursor-not-allowed" : ""
                          }`}
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isSaving}
                        className={`px-4 py-2 bg-gray-200 text-primary rounded-md hover:bg-gray-300 ${
                          isSaving ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Info */}
              <div className="personal-info mt-8">
                <h3 className="text-xl font-semibold mb-6 text-primary">
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      First Name
                    </label>
                    {editMode ? (
                      <input
                        className="text-primary bg-transparent border border-gray-200 rounded px-2 py-1 w-full"
                        value={draftProfile?.firstName || profile.firstName}
                        onChange={(e) => {
                          console.debug(
                            "✏️ First Name changed:",
                            e.target.value
                          );
                          setDraftProfile((p) => ({
                            ...p,
                            firstName: e.target.value,
                          }));
                        }}
                      />
                    ) : (
                      <p className="text-primary">{profile.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      Last Name
                    </label>
                    {editMode ? (
                      <input
                        className="text-primary bg-transparent border border-gray-200 rounded px-2 py-1 w-full"
                        value={draftProfile?.lastName || profile.lastName}
                        onChange={(e) => {
                          console.debug(
                            "✏️ Last Name changed:",
                            e.target.value
                          );
                          setDraftProfile((p) => ({
                            ...p,
                            lastName: e.target.value,
                          }));
                        }}
                      />
                    ) : (
                      <p className="text-primary">{profile.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      Phone
                    </label>
                    {editMode ? (
                      <input
                        className="text-primary bg-transparent border border-gray-200 rounded px-2 py-1 w-full"
                        value={draftProfile?.phone || profile.phone}
                        onChange={(e) => {
                          console.debug("📱 Phone changed:", e.target.value);
                          setDraftProfile((p) => ({
                            ...p,
                            phone: e.target.value,
                          }));
                        }}
                      />
                    ) : (
                      <p className="text-primary">{profile.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                      Email
                    </label>
                    <p className="text-primary">{profile.email}</p>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-muted mb-2">
                      Address
                    </label>
                    {editMode ? (
                      <input
                        className="text-primary bg-transparent border border-gray-200 rounded px-2 py-1 w-full"
                        value={draftProfile?.address || profile.address}
                        onChange={(e) => {
                          console.debug("🏠 Address changed:", e.target.value);
                          setDraftProfile((p) => ({
                            ...p,
                            address: e.target.value,
                          }));
                        }}
                      />
                    ) : (
                      <p className="text-primary">{profile.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
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
            onClick={() => {
              console.debug("🌞 Switching to light mode");
              setTheme("light");
            }}
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
            onClick={() => {
              console.debug("🌙 Switching to dark mode");
              setTheme("dark");
            }}
          >
            🌙
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
