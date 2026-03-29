import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GovSidebar from './GovSidebar';

/**
 * Government Portal Layout
 * Features a fixed left sidebar and responsive content area
 * strictly for 'government' role users.
 */
const GovLayout = () => {
  const { isGov, loading } = useAuth();
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    // Set admin role for specialized CSS hooks
    document.documentElement.setAttribute('data-role', 'government');
    return () => document.documentElement.removeAttribute('data-role');
  }, []);

  if (loading) return null;
  if (!isGov) return null; // Role guard secondary check

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <GovSidebar />
      <main 
        style={{
          flex: 1,
          overflowY: 'auto',
          background: isDark ? '#181e1b' : '#f4f6f5',
          transition: 'background 0.2s'
        }}
        className="dark:bg-[#181e1b]"
      >
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default GovLayout;
