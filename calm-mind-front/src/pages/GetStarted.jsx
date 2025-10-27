import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetStartedStore } from "../store/useGetStartedStore";

const GetStarted = () => {
  const navigate = useNavigate();
  const { submitGetStarted, loading, error } = useGetStartedStore();

  const [formData, setFormData] = useState({
    course: "",
    yearLevel: "",
    studentNumber: "",
    address: "",
    contactNumber: "",
  });
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    setFormVisible(true);
  }, []);

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitGetStarted(formData, navigate);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div
        className={`w-full max-w-[800px] bg-white rounded-3xl shadow-xl p-12 transition-all duration-500 transform 
        ${
          formVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-[32px] font-bold text-gray-900">
            Getting Started.
          </h1>
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
        </div>
        <p className="text-gray-600 mb-8 text-lg">
          Set up your account by adding the details below to get started.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-2">Course</label>
              <select
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-600 mb-2">Year Level</label>
              <select
                name="yearLevel"
                value={formData.yearLevel}
                onChange={handleInputChange}
                className="w-full p-3 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Select year level</option>
                {yearLevels.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-600 mb-2">Student Number</label>
            <input
              type="text"
              name="studentNumber"
              value={formData.studentNumber}
              onChange={handleInputChange}
              placeholder="Enter your Student Number"
              className="w-full p-3 border border-gray-300 rounded-2xl"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your Address"
              className="w-full p-3 border border-gray-300 rounded-2xl"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-2">Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              placeholder="Enter your Number"
              className="w-full p-3 border border-gray-300 rounded-2xl"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 bg-black text-white rounded-2xl mt-6 transition-all duration-200 transform
              ${
                loading
                  ? "opacity-75 cursor-not-allowed"
                  : "hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5"
              }
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Setting up...</span>
              </div>
            ) : (
              "Get Started"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GetStarted;
