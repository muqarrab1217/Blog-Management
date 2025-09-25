import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminCustomers from '../../components/admin/AdminCustomers';
import AdminBlogs from '../../components/admin/AdminBlogs';
import AdminRequests from '../../components/admin/AdminRequests';
import AdminOverview from '../../components/admin/AdminOverview';

function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/dashboard" element={<AdminOverview />} />
        <Route path="/customers" element={<AdminCustomers />} />
        <Route path="/blogs" element={<AdminBlogs />} />
        <Route path="/requests" element={<AdminRequests />} />
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default AdminDashboard;