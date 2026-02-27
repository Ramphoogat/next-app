"use client";
import React, { useState, useEffect } from 'react';
import { FiLayout, FiEdit3, FiFeather, FiShield, FiChevronDown } from 'react-icons/fi';
import type { UserRole } from '../utils/rolePermissions';
import { getNavigationItems, getRoleDisplayName } from '../utils/rolePermissions';
import { decodeJwt } from '../utils/jwtUtils';


const DashboardSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsClient(true), 10);
    return () => clearTimeout(timer);
  }, []);

  if (!isClient) {
    return <div className="h-8 w-24"></div>;
  }

  // PERMISSIONS ROLE: Base role (Admin/Editor/etc). We prefer the 'perm_role' key set during login.
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
  const storedRoleStr = typeof window !== 'undefined' ? (localStorage.getItem('role') || sessionStorage.getItem('role')) : null;
  const permRoleStr = typeof window !== 'undefined' ? (localStorage.getItem('perm_role') || sessionStorage.getItem('perm_role')) : null;

  let permissionRole: UserRole = 'user';

  if (permRoleStr) {
    const normalized = permRoleStr.toLowerCase();
    if (normalized === 'admin' || normalized === 'administrator') permissionRole = 'admin';
    else if (normalized === 'editor') permissionRole = 'editor';
    else if (normalized === 'author') permissionRole = 'author';
  } else if (token) {
    const payload = decodeJwt(token);
    const rawRole = payload ? (payload.role || payload.Role || payload.user?.role || payload.userRole) : null;
    if (typeof rawRole === 'string') {
      const normalized = rawRole.toLowerCase();
      if (normalized === 'admin' || normalized === 'administrator') permissionRole = 'admin';
      else if (normalized === 'editor') permissionRole = 'editor';
      else if (normalized === 'author') permissionRole = 'author';
    }
  }

  // ACTIVE ROLE: The specific workspace view currently active.
  const activeRole = storedRoleStr ? storedRoleStr.toLowerCase() : permissionRole;

  // Build items based on PERMANENT permissions.
  const navItems = getNavigationItems(permissionRole);

  // Find current active dashboard based on stored activeRole
  const currentDashboard = navItems.find(item => item.role === activeRole) || navItems[0];

  const getIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <FiShield className="w-4 h-4" />;
      case 'author':
        return <FiFeather className="w-4 h-4" />;
      case 'editor':
        return <FiEdit3 className="w-4 h-4" />;
      case 'user':
      default:
        return <FiLayout className="w-4 h-4" />;
    }
  };


  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 transition-all shadow-sm group"
      >
        <div className="text-gray-500 dark:text-gray-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
          {getIcon(currentDashboard.role)}
        </div>
        <span className="font-medium text-[10px] sm:text-xs md:text-sm text-gray-700 dark:text-gray-200">
          {currentDashboard.name} <span className="hidden sm:inline">Workspace</span>
        </span>
        <FiChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed sm:absolute right-4 sm:right-0 left-4 sm:left-auto top-16 sm:top-full mt-2 sm:w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex justify-between">
                <span>Workspace Switcher</span>
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{getRoleDisplayName(permissionRole)}</p>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                  {navItems.length} Workspaces
                </span>
              </div>
            </div>

            <div className="p-2 space-y-1">
              {navItems.map((item) => {
                const isActive = item.role === activeRole;
                return (
                  <button
                    key={item.path + item.role}
                    onClick={() => {
                      localStorage.setItem('role', item.role);
                      sessionStorage.setItem('role', item.role); // fallback sync
                      setIsOpen(false);
                      // Force reload to apply new dashboard role since UnifiedDashboard reads from storage on mount
                      window.location.reload();
                    }}
                    className={`w-full flex items-start space-x-3 px-3 py-3 rounded-xl transition-all group ${isActive
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                      }`}
                  >
                    <div className={`mt-0.5 p-2 rounded-lg ${isActive ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}>
                      {getIcon(item.role)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-semibold ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-200'}`}>
                        {item.name}
                      </p>
                      <p className={`text-xs mt-0.5 ${isActive ? 'text-emerald-600/80 dark:text-emerald-400/70' : 'text-gray-500 dark:text-gray-400'}`}>
                        {item.description}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2"></div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center font-medium">
                Switch between your accessible workspaces
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardSwitcher;
