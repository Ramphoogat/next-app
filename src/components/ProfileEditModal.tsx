"use client";

import React, { useState, useEffect } from "react";
import { FiX, FiUser, FiMail, FiLock, FiSave, FiAlertCircle } from "react-icons/fi";
import api from "@/api/axios";
import { useToast } from "@/components/ToastProvider";
import { logActivity } from "@/utils/activityLogger";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    username: string;
    email: string;
  };
  onUpdate: () => void;
}

interface UpdateProfilePayload {
  name: string;
  username: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdate,
}) => {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData({
        name: currentUser.name || "",
        username: currentUser.username || "",
        email: currentUser.email || "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [isOpen, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: UpdateProfilePayload = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
      };

      if (formData.newPassword) {
        if (!formData.currentPassword) {
          showError("Current password is required to set a new password.");
          setLoading(false);
          return;
        }
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await api.put("/auth/profile", payload);

      showSuccess(res.data.message);
      logActivity("UPDATE", "Profile", "Updated profile details");
      onUpdate();
      onClose();
    } catch (err: unknown) {
      const errorStr = err as { response?: { data?: { message?: string } } };
      const msg = errorStr.response?.data?.message || "Failed to update profile";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop — clicking it closes both panels */}
      <div
        className={`fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* ── Left Panel (blank — to be filled later) ─────────────────────── */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-[95] w-full max-w-xs flex flex-col
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
          border-r border-gray-200 dark:border-gray-800 shadow-2xl
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button */}
        <div className="flex items-center justify-end px-5 pt-6 pb-4">
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Blank area — reserved for future content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-10">
          <div className="text-center space-y-3">
            <div className="size-16 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto border border-gray-200 dark:border-gray-700">
              <FiUser className="w-7 h-7 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-[11px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
              Coming Soon
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Edit Profile form) ─────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[95] w-full max-w-sm flex flex-col
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
          border-l border-gray-200 dark:border-gray-800 shadow-2xl
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Decorative gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none rounded-none" />

        {/* Header */}
        <div className="relative px-8 pt-10 pb-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="size-3 rounded-full bg-indigo-500 animate-pulse" />
              <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                Edit Profile
              </h2>
            </div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 pl-6">
              Update your personal details
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form — scrollable */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name & Username */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">
                  Name
                </label>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">
                  Username
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors font-bold text-sm">@</span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-9 pr-4 py-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                  placeholder="name@example.com"
                />
              </div>
              {formData.email !== currentUser.email && (
                <p className="text-[10px] text-amber-600 flex items-center mt-1 ml-1 font-bold">
                  <FiAlertCircle className="mr-1.5 shrink-0" />
                  Changing email will require re-verification.
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-800 my-2" />

            {/* Password */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">
                  New Password <span className="normal-case font-bold text-gray-300">(optional)</span>
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>

              {formData.newPassword && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] ml-1">
                    Current Password <span className="normal-case">(required)</span>
                  </label>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-3.5 text-red-400 group-focus-within:text-red-500 transition-colors" />
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-red-50/40 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all text-sm font-bold text-gray-900 dark:text-white placeholder-red-300 dark:placeholder-red-500/40"
                      placeholder="Confirm current password"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black py-3.5 rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-sm uppercase tracking-widest"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    <span>Update Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProfileEditModal;
