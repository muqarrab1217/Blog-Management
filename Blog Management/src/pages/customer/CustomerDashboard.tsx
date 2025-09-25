import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from '../../components/customer/CustomerLayout';
import CustomerProfile from '../../components/customer/CustomerProfile';
import CustomerBlogs from '../../components/customer/CustomerBlogs';
import CustomerServices from '../../components/customer/CustomerServices';
import CustomerOverview from '../../components/customer/CustomerOverview';

function CustomerDashboard() {
  return (
    <CustomerLayout>
      <Routes>
        <Route path="/dashboard" element={<CustomerOverview />} />
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="/blogs" element={<CustomerBlogs />} />
        <Route path="/services" element={<CustomerServices />} />
        <Route path="/" element={<Navigate to="/customer/dashboard" replace />} />
      </Routes>
    </CustomerLayout>
  );
}

export default CustomerDashboard;