import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, RefreshCw, MessageSquare, CheckCircle, Clock, Calendar, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const { 
    prefs, 
    loading, 
    saving, 
    saveSuccess, 
    updatePrefs, 
    toggleStatusChanged, 
    toggleNewComment, 
    toggleIssueResolved, 
    updateEmail,
    updateEmailDigest 
  } = useNotifications();
  
  const [emailInput, setEmailInput] = useState(prefs.email || '');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleEmailSave = async () => {
    try {
      await updateEmail(emailInput);
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 2500);
    } catch (error) {
      console.error('Failed to save email:', error);
    }
  };

  const handleEmailDigestChange = async (value) => {
    try {
      await updateEmailDigest(value);
    } catch (error) {
      console.error('Failed to update email digest:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f2ed] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c2410c] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notification preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f2ed] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center text-gray-600 hover:text-[#c2410c] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Settings
          </button>
          
          <h1 className="text-4xl font-serif text-gray-900 mb-2">Notification Settings</h1>
          <p className="text-gray-600 text-lg">Manage how you receive updates about your civic reports</p>
        </div>

        {/* Email Address Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <div className="flex items-center mb-4">
            <Mail className="w-6 h-6 text-[#c2410c] mr-3" />
            <h2 className="text-xl font-serif text-gray-900">Email Address</h2>
          </div>
          
          <div className="flex gap-3">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:border-transparent"
            />
            <button
              onClick={handleEmailSave}
              disabled={saving}
              className="px-6 py-3 bg-[#c2410c] text-white rounded-xl hover:bg-[#a8350a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          
          {showSavedFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-green-600 font-medium flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Email saved successfully
            </motion.div>
          )}
        </motion.div>

        {/* Notification Types Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-serif text-gray-900 mb-6">Notify me when...</h2>
          
          <div className="space-y-4">
            {/* Status Changed */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center flex-1">
                <RefreshCw className="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <h3 className="font-medium text-gray-900">Issue status changed</h3>
                  <p className="text-sm text-gray-600">Get notified when your issue moves from Pending → In Progress, etc.</p>
                </div>
              </div>
              <button
                onClick={toggleStatusChanged}
                role="switch"
                aria-checked={prefs.status_changed}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  prefs.status_changed ? 'bg-[#c2410c]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    prefs.status_changed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* New Comment */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center flex-1">
                <MessageSquare className="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <h3 className="font-medium text-gray-900">New comment or update</h3>
                  <p className="text-sm text-gray-600">Receive an email when an official adds a note to your report.</p>
                </div>
              </div>
              <button
                onClick={toggleNewComment}
                role="switch"
                aria-checked={prefs.new_comment}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  prefs.new_comment ? 'bg-[#c2410c]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    prefs.new_comment ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Issue Resolved */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center flex-1">
                <CheckCircle className="w-5 h-5 text-gray-400 mr-4" />
                <div>
                  <h3 className="font-medium text-gray-900">Issue resolved</h3>
                  <p className="text-sm text-gray-600">We'll email you when your issue is marked resolved.</p>
                </div>
              </div>
              <button
                onClick={toggleIssueResolved}
                role="switch"
                aria-checked={prefs.issue_resolved}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  prefs.issue_resolved ? 'bg-[#c2410c]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    prefs.issue_resolved ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Email Frequency Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-xl font-serif text-gray-900 mb-6">Email Frequency</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instantly */}
            <button
              onClick={() => handleEmailDigestChange('instant')}
              className={`p-4 rounded-xl border-2 transition-all ${
                prefs.email_digest === 'instant'
                  ? 'border-[#c2410c] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Clock className="w-6 h-6 mb-2 mx-auto text-gray-600" />
              <h3 className="font-medium text-gray-900 mb-1">Instantly</h3>
              <p className="text-sm text-gray-600">Get notified immediately when updates happen</p>
            </button>

            {/* Daily Digest */}
            <button
              onClick={() => handleEmailDigestChange('daily')}
              className={`p-4 rounded-xl border-2 transition-all ${
                prefs.email_digest === 'daily'
                  ? 'border-[#c2410c] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-6 h-6 mb-2 mx-auto text-gray-600" />
              <h3 className="font-medium text-gray-900 mb-1">Daily digest</h3>
              <p className="text-sm text-gray-600">Receive a summary of all updates once per day</p>
            </button>

            {/* Weekly Digest */}
            <button
              onClick={() => handleEmailDigestChange('weekly')}
              className={`p-4 rounded-xl border-2 transition-all ${
                prefs.email_digest === 'weekly'
                  ? 'border-[#c2410c] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-6 h-6 mb-2 mx-auto text-gray-600" />
              <h3 className="font-medium text-gray-900 mb-1">Weekly digest</h3>
              <p className="text-sm text-gray-600">Get a weekly summary of all your issue updates</p>
            </button>

            {/* Off */}
            <button
              onClick={() => handleEmailDigestChange('none')}
              className={`p-4 rounded-xl border-2 transition-all ${
                prefs.email_digest === 'none'
                  ? 'border-[#c2410c] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <X className="w-6 h-6 mb-2 mx-auto text-gray-600" />
              <h3 className="font-medium text-gray-900 mb-1">Off</h3>
              <p className="text-sm text-gray-600">Don't receive email notifications</p>
            </button>
          </div>
        </motion.div>

        {/* Success Feedback */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Settings saved successfully
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
