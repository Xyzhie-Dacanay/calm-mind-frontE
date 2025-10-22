import React from 'react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const SettingsAbout = () => {
  const navigate = useNavigate();
  const tabs = ['Edit Profile', 'Login & Password', 'About'];

  return (
  <div className="flex h-screen bg-card">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-card z-10">
          <div className="p-3">
            <div className="bg-card rounded-lg shadow-lg px-6 py-6 flex items-center justify-between border border-gray-200">
              <h1 className="text-3xl font-bold text-primary">Settings</h1>
            </div>
            <div className="mt-4 border-b border-gray-200">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      tab === 'About' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      if (tab === 'Edit Profile') navigate('/settings');
                      if (tab === 'Login & Password') navigate('/settings/login');
                      if (tab === 'About') navigate('/settings/about');
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 cm-fade-up cm-delay-1">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-semibold text-gray-900 mb-4">About Calm Mind</h2>
                  <p className="text-lg text-gray-600">Your companion for academic success and mental wellness</p>
                </div>
                
                {/* About Content */}
                <div className="space-y-12">
                  <section className="flex items-start gap-6 cm-fade-up cm-delay-1">
                    <div className="bg-yellow-50 p-3 rounded-lg cm-card-hover cm-focus-ring">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Calm Mind is dedicated to helping students manage their academic journey with peace and clarity. 
                        We provide tools for task management, scheduling, and mental wellness to ensure a balanced 
                        educational experience.
                      </p>
                    </div>
                  </section>

                  <section className="flex items-start gap-6 cm-fade-up cm-delay-2">
                    <div className="bg-blue-50 p-3 rounded-lg cm-card-hover">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Key Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600">Smart Task Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600">Calendar Integration</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600">AI-powered Support</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600">Progress Analytics</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="flex items-start gap-6 cm-fade-up cm-delay-3">
                    <div className="bg-green-50 p-3 rounded-lg cm-card-hover">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Version & Updates</h3>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Current Version</p>
                            <p className="text-gray-600">1.0.0</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Last Updated</p>
                            <p className="text-gray-600">October 2025</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="flex items-start gap-6 cm-fade-up cm-delay-4">
                    <div className="bg-purple-50 p-3 rounded-lg cm-card-hover">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Support</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Email</p>
                          <p className="text-gray-600">support@calmmind.edu</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Hours</p>
                          <p className="text-gray-600">Mon - Fri, 8:00 AM - 5:00 PM PST</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAbout;