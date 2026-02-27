"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { UserRole } from '../utils/rolePermissions';
import { decodeJwt } from '../utils/jwtUtils';

const ProtectedRoute = ({ allowedRoles, children }: { allowedRoles?: UserRole[], children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      // Decode JWT to check role using the robust utility
      const payload = decodeJwt(token);

      if (!payload) {
        throw new Error('Invalid token payload');
      }

      const userRole = payload.role as UserRole;

      // Check role-based access
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to their default dashboard
        router.replace("/dashboard");
        return;
      }

      setIsAuthorized(true);
    } catch {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      router.replace("/login");
    }
  }, [router, allowedRoles]);

  if (!isAuthorized) return null; // Or a loader

  return <>{children}</>;
};

export default ProtectedRoute;
