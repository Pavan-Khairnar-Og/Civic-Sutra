import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

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
        const response = await fetch(`${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/api/notifications/prefs?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch notification preferences');
        }
        
        const data = await response.json();
        setPrefs({
          status_changed: data.status_changed ?? true,
          new_comment: data.new_comment ?? true,
          issue_resolved: data.issue_resolved ?? true,
          email_digest: data.email_digest ?? 'instant',
          email: data.email || '',
        });
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
    setPrefs(prev => ({ ...prev, ...updates }));
    
    try {
      setSaving(true);
      setSaveSuccess(false);
      
      const response = await fetch(`${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/api/notifications/prefs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          statusChanged: updates.status_changed !== undefined ? updates.status_changed : prefs.status_changed,
          newComment: updates.new_comment !== undefined ? updates.new_comment : prefs.new_comment,
          issueResolved: updates.issue_resolved !== undefined ? updates.issue_resolved : prefs.issue_resolved,
          emailDigest: updates.email_digest !== undefined ? updates.email_digest : prefs.email_digest,
          email: updates.email !== undefined ? updates.email : prefs.email,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }
      
      // Show success feedback
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      
      return await response.json();
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
