"use client";

import AdminDashboard from "@/components/admin/AdminDashboard";

/**
 * Admin dashboard page.
 * Authentication is enforced server-side by src/middleware.ts.
 * Unauthenticated requests are redirected to /admin/login before this page loads.
 */
export default function AdminPage() {
  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  };

  return <AdminDashboard onLogout={handleLogout} />;
}
