"use client";
import React, { useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { logActivity } from "../utils/activityLogger";
import { FiX, FiBell, FiTrash2 } from "react-icons/fi";

interface NotificationCenterProps {
  onClose?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { notifications, removeNotification, clearAll } = useNotifications();
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        if (onClose) onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={notificationRef}
      className="fixed inset-x-4 top-[76px] sm:absolute sm:inset-auto sm:top-full sm:mt-3 sm:-right-4 md:right-0 w-auto sm:w-[400px] bg-white dark:bg-gray-950 rounded-[28px] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_70px_-10px_rgba(0,0,0,0.6)] overflow-hidden z-[110] border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-3xl animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800/50 flex justify-between items-center bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
            <FiBell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-gray-900 dark:text-white font-bold text-lg tracking-tight">Notifications</h3>
          {notifications.length > 0 && (
            <span className="flex items-center justify-center h-5 px-2 text-[11px] font-bold bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100/50 dark:border-blue-500/20">
              {notifications.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={() => {
                clearAll();
                logActivity("DELETE", "Notifications", "Cleared all notifications");
              }}
              className="text-[13px] text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-medium transition-all px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl flex items-center gap-2"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors md:hidden"
            aria-label="Close notifications"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>


      <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiBell className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">All caught up!</p>
            <p className="text-gray-400 dark:text-gray-500 text-[12px] mt-1">No new notifications at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all group relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-900 dark:text-gray-100 font-bold text-[14px] tracking-tight">
                    {notif.title}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400/80 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full mr-6">
                    {notif.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-[13px] leading-relaxed pr-6">
                  {notif.message}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notif.id);
                    logActivity("DELETE", "Notifications", `Dismissed notification: ${notif.title}`);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Remove notification"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
