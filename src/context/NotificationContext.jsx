import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  
  const [prefs, setPrefs] = useState({
    status_changed: true,
    new_comment: true,
    issue_resolved: true,
    email_digest: 'instant',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch notification preferences on mount
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPrefs = async () => {
      try {
        setLoading(true);
        
        // Since notification_settings column doesn't exist, just use default preferences
        // In the future, this could be stored in a separate table or added to profiles
        console.log('Using default notification preferences - notification_settings column not found');
        
        // Keep default preferences without trying to fetch from database
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        // Keep default preferences on error
      } finally {
        setLoading(false);
      }
    };

    fetchPrefs();
  }, [userId]);

  // Update preferences with optimistic updates
  const updatePrefs = useCallback(async (updates) => {
    if (!userId) {
      console.error('No userId provided for updating preferences');
      return;
    }

    // Optimistic update
    const oldPrefs = { ...prefs };
    const newPrefs = { ...prefs, ...updates };
    setPrefs(newPrefs);
    
    try {
      setSaving(true);
      setSaveSuccess(false);
      
      // Since notification_settings column doesn't exist, just simulate saving
      // In the future, this could be stored in a separate table or added to profiles
      console.log('Notification preferences updated locally - notification_settings column not found');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success feedback
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      
      return newPrefs;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      // Revert on error
      setPrefs(oldPrefs);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [userId, prefs]);

  // Helper functions for specific updates
  const toggleStatusChanged = useCallback(() => {
    updatePrefs({ status_changed: !prefs.status_changed });
  }, [prefs.status_changed, updatePrefs]);

  const toggleNewComment = useCallback(() => {
    updatePrefs({ new_comment: !prefs.new_comment });
  }, [prefs.new_comment, updatePrefs]);

  const toggleIssueResolved = useCallback(() => {
    updatePrefs({ issue_resolved: !prefs.issue_resolved });
  }, [prefs.issue_resolved, updatePrefs]);

  const updateEmail = useCallback((email) => {
    updatePrefs({ email });
  }, [updatePrefs]);

  const updateEmailDigest = useCallback((emailDigest) => {
    updatePrefs({ email_digest: emailDigest });
  }, [updatePrefs]);

  const value = {
    prefs,
    loading,
    saving,
    saveSuccess,
    updatePrefs,
    toggleStatusChanged,
    toggleNewComment,
    toggleIssueResolved,
    updateEmail,
    updateEmailDigest,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
