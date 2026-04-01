import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { IconFingerprint } from '@tabler/icons-react'
import { fadeUp, slideInRight, scaleIn } from '../lib/animations.jsx'
import { supabase } from '../services/supabase'

/**
 * CivicSutra Login Page
 * Split-screen design with role selection and beautiful SVG illustration
 */
const Login = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, isGov, isAnonymous } = useAuth()
  
  const [activeTab, setActiveTab] = useState('citizen')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    fullName: '',
    phone: '',
    department: ''
  })

  // Government registration state
  const [showGovRegistration, setShowGovRegistration] = useState(false)
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState(null)
  const [regSuccess, setRegSuccess] = useState(false)

  const tabs = ['Citizen', 'Government', 'Anonymous'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (activeTab === 'citizen' || activeTab === 'government') {
      if (!formData.email) {
        newErrors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email'
      }

      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      }

      if (activeTab === 'government' && !formData.department) {
        newErrors.department = 'Department is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', { activeTab, formData });
    
    setAuthError(null);
    setErrors({});
    setLoading(true);

    // Basic validation
    const newErrors = {};
    if (activeTab === 'citizen' || activeTab === 'government') {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
    }
    if (activeTab === 'government') {
      if (!formData.department) newErrors.department = 'Department is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting Supabase login with:', {
        email: formData.email.trim().toLowerCase(),
        activeTab
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase auth error:', error);
        if (error.message.includes('Invalid login credentials')) {
          setAuthError('Incorrect email or password. Please register a new government account first.');
        } else if (error.message.includes('Email not confirmed')) {
          setAuthError('Please verify your email before logging in.');
        } else if (error.message.includes('Too many requests')) {
          setAuthError('Too many attempts. Please wait a few minutes.');
        } else {
          setAuthError(error.message);
        }
        return;
      }

      if (!data?.user) {
        setAuthError('Login failed. Please try again.');
        return;
      }

      // Check government access with robust logic
      const checkGovernmentAccess = async (user) => {
        // Check 1: user metadata (most reliable, set at signup)
        const meta = user.user_metadata || {};
        if (meta.user_type === 'government') {
          console.log("Gov access granted via metadata");
          return { isGov: true, department: meta.department };
        }

        // Check 2: profiles table (fallback if metadata missing)
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('user_type, department')
            .eq('id', user.id)
            .single();

          if (!error && profile?.user_type === 'government') {
            console.log("Gov access granted via profile");
            return { isGov: true, department: profile.department };
          }
        } catch (e) {
          console.warn("Profile lookup failed:", e.message);
        }

        console.log("No gov access found for user:", user.id);
        return { isGov: false, department: null };
      };

      const access = await checkGovernmentAccess(data.user);
      if (activeTab === 'government' && !access.isGov) {
        await supabase.auth.signOut();
        setAuthError('This account does not have government access. Please register as a government employee.');
        return;
      }

      // Skip email confirmation check for development
      // Users can login immediately after registration

      // Try to get profile data, but don't fail if RLS blocks it
      let profile = null;
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, department')
          .eq('id', data.user.id)
          .single();
        profile = profileData;
      } catch (profileErr) {
        console.log('Profile access blocked by RLS, using user metadata instead');
      }

      // Use profile data if available, otherwise use user metadata
      const department = profile?.department || access.department;

      // Update user data with government info
      const userData = {
        name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        email: data.user.email,
        role: 'gov',
        department: department
      };

      console.log('Government login successful, userData:', userData);
      login(userData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced government signup with profile creation
  const handleGovernmentSignup = async (e) => {
    setLoading(true);
    setRegError(null);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const fullName = formData.get('fullName');
    const phone = formData.get('phone');
    const department = formData.get('department');

    if (!email || !password || !fullName || !department) {
      setRegError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Sign up with full metadata
      // Even if profile insert fails, metadata has everything
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: 'government',
            department: selectedDepartment,
            full_name: fullName || email,
            phone
          }
        }
      });

      if (signUpError) {
        setRegError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!data?.user) {
        setRegError("Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      // Step 2: Try profile insert with delay
      // Delay gives Supabase time to activate the session
      setTimeout(async () => {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email,
            user_type: 'government',
            department: selectedDepartment,
            phone,
            created_at: new Date().toISOString()
          }, { onConflict: 'id' });
          console.log("Profile created successfully");
        } catch (e) {
          console.warn("Profile insert failed but metadata is set:", e.message);
          // Non-blocking — login will use metadata fallback
        }
      }, 2000); // 2 second delay

      // Step 3: Show success — don't wait for profile insert
      setRegSuccess(true);
      setTimeout(() => {
        setRegSuccess(false);
        setAuthSuccess('Government account created! Please sign in.');
        setIsSignUp(false);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setRegError(err.message || 'Failed to create government account. Please try again.');
      setLoading(false);
    }
  };

  // Handle government user registration
  const handleGovRegistration = async (e) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(false);

    // Validate registration form
    const regErrors = {};
    if (!formData.fullName.trim()) regErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) regErrors.email = 'Email is required';
    if (!formData.password) regErrors.password = 'Password is required';
    if (!formData.department) regErrors.department = 'Department is required';

    if (Object.keys(regErrors).length > 0) {
      setErrors(regErrors);
      return;
    }

    try {
      setRegLoading(true);

      // Step 1: Create Supabase user account with government role in metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'government',
            department: formData.department,
            phone: formData.phone
          },
          // Skip email confirmation for development
          emailRedirectTo: window.location.origin
        }
      });

      if (authError) {
        throw authError;
      }

      console.log('Auth data:', authData);

      // Step 2: Try to create profile record (may fail due to RLS, but that's ok)
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            role: 'government',
            department: formData.department,
            phone: formData.phone,
            created_at: new Date().toISOString()
          });
        
        // If profile insertion fails, it's likely due to RLS - the user metadata should be sufficient
        if (profileError) {
          console.log('Profile insertion failed (likely due to RLS), but user metadata contains the info:', profileError);
        }
      } catch (profileErr) {
        console.log('Profile insertion failed (likely due to RLS), but user metadata contains the info:', profileErr);
      }

      // Success - account created with government role in user metadata
      setRegSuccess(true);
      setShowGovRegistration(false);
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        rememberMe: false,
        fullName: '',
        phone: '',
        department: ''
      });

      // Show success message - user can login immediately
      setRegError(null);
      setTimeout(() => {
        setRegSuccess(false);
        setAuthError('Government account created successfully! You can now sign in with your credentials.');
      }, 3000);

    } catch (err) {
      console.error('Registration error:', err);
      setRegError(err.message || 'Failed to create government account. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleAnonymousLogin = () => {
    setLoading(true)
    setTimeout(() => {
      const userData = {
        name: 'Anonymous User',
        email: 'anonymous@civicsutra.com',
        role: 'anonymous'
      }
      login(userData)
      navigate('/home')
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Visual */}
      <div className="w-[55%] bg-civic-parchment relative overflow-hidden">
        {/* SVG Illustration */}
        <svg
          viewBox="0 0 800 600"
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Animated SVG paths */}
          <motion.path
            d="M100 300 Q200 200 300 300 T500 300"
            stroke="#D4522A"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M150 400 Q250 350 350 400 T550 400"
            stroke="#E9A84C"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
          />
          <motion.path
            d="M200 500 Q300 450 400 500 T600 500"
            stroke="#2A9D8F"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
          />

          {/* City elements */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            {/* Municipal Building */}
            <rect x="350" y="200" width="100" height="150" fill="#D4522A" opacity="0.8" />
            <rect x="370" y="180" width="60" height="20" fill="#D4522A" />
            
            {/* Auto Rickshaw */}
            <circle cx="250" cy="380" r="15" fill="#E9A84C" />
            <rect x="235" y="360" width="30" height="20" fill="#E9A84C" />
            
            {/* Water Tank */}
            <circle cx="500" cy="250" r="25" fill="#2A9D8F" opacity="0.7" />
            
            {/* Street Light */}
            <rect x="150" y="300" width="8" height="100" fill="#6B6560" />
            <circle cx="154" cy="290" r="12" fill="#E9A84C" />
          </motion.g>
        </svg>

        {/* Logo and Tagline */}
        <motion.div 
          className="absolute top-12 left-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            {/* Logo Mark */}
            <div className="w-12 h-12 bg-civic-orange rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-civic-textPrimary">CivicSutra</h1>
          </div>
          <p className="mt-2 text-lg italic text-civic-textSecondary font-serif">
            "Nagarik Awaaz. Sarkar Ka Jawab."
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-[45%] bg-white flex items-center justify-center p-12">
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="show"
          variants={fadeUp}
        >
          {/* Tab Navigation */}
          <div style={{
            position: 'relative',
            display: 'flex',
            background: '#f9ede8',
            borderRadius: '999px',
            padding: '4px',
            gap: '0',
            width: '100%',
            marginBottom: '2rem',
          }}>
            {/* Sliding pill */}
            <div style={{
              position: 'absolute',
              top: '4px',
              bottom: '4px',
              left: `calc(${tabs.indexOf(activeTab === 'citizen' ? 'Citizen' : activeTab === 'government' ? 'Government' : 'Anonymous')} * 33.333% + 4px)`,
              width: 'calc(33.333% - 4px)',
              background: '#c2410c',
              borderRadius: '999px',
              transition: 'left 0.2s ease',
              zIndex: 0,
            }} />
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab === 'Citizen' ? 'citizen' : tab === 'Government' ? 'government' : 'anonymous')}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: (activeTab === 'citizen' && tab === 'Citizen') || (activeTab === 'government' && tab === 'Government') || (activeTab === 'anonymous' && tab === 'Anonymous') ? '#ffffff' : '#78716c',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 1,
                  transition: 'color 0.2s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <AnimatePresence>
            {activeTab === 'citizen' && (
              <motion.form
                key="citizen"
                onSubmit={handleLogin}
                className="space-y-6"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={slideInRight}
              >
                <div>
                  <h2 className="text-2xl font-serif text-civic-textPrimary mb-2">Welcome back</h2>
                  <p className="text-civic-textSecondary">Sign in to report and track issues</p>
                </div>

                {authError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {authError}
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e7e3dc',
                      background: '#f5f2ed',
                      color: '#1c1917',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    className="dark:bg-[#2e2924] dark:border-[#4a4035] dark:text-[#e8e0d5]
                               dark:placeholder-[#6e5f50]"
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e7e3dc',
                      background: '#f5f2ed',
                      color: '#1c1917',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    className="dark:bg-[#2e2924] dark:border-[#4a4035] dark:text-[#e8e0d5]
                               dark:placeholder-[#6e5f50]"
                  />
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                      className="w-4 h-4 text-civic-orange border-civic-muted rounded focus:ring-civic-orange"
                    />
                    <span className="ml-2 text-sm text-civic-textSecondary">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-civic-orange hover:text-civic-orangeHover">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-civic-orange text-white rounded-full font-medium hover:bg-civic-orangeHover transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-civic-muted"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-civic-textSecondary">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3 border border-civic-orange text-civic-orange rounded-full font-medium hover:bg-civic-orangeLight transition-all"
                >
                  Create account
                </button>

                <p className="text-center text-sm text-civic-textSecondary">
                  New to CivicSutra? <a href="#" className="text-civic-orange hover:text-civic-orangeHover">Register as Citizen →</a>
                </p>
              </motion.form>
            )}

            {activeTab === 'government' && (
              <motion.form
                key="government"
                onSubmit={handleLogin}
                className="space-y-6"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={slideInRight}
              >
                <div>
                  <h2 className="text-2xl font-serif text-civic-textPrimary mb-2">Government Portal</h2>
                  <p className="text-civic-textSecondary">Sign in as government employee</p>
                </div>

                {authError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {authError}
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-civic-parchment border border-civic-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-orange focus:border-transparent transition-all"
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e7e3dc',
                      background: '#f5f2ed',
                      color: '#1c1917',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    className="dark:bg-[#2e2924] dark:border-[#4a4035] dark:text-[#e8e0d5]
                               dark:placeholder-[#6e5f50]"
                  />
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e7e3dc',
                      background: '#f5f2ed',
                      color: '#1c1917',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    className="dark:bg-[#2e2924] dark:border-[#4a4035] dark:text-[#e8e0d5]"
                  >
                    <option value="">Select Department</option>
                    <option value="water">Water Supply</option>
                    <option value="roads">Roads & Footpaths</option>
                    <option value="lighting">Street Lighting</option>
                    <option value="sanitation">Sanitation & Waste</option>
                    <option value="parks">Parks & Gardens</option>
                    <option value="safety">Public Safety</option>
                    <option value="admin">Municipal Administration</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-civic-orange text-white rounded-full font-medium hover:bg-civic-orangeHover transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Sign In as Government Employee
                    </>
                  )}
                </button>

                {/* Government Registration Section */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-civic-muted"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-civic-textSecondary">New Government Employee?</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGovRegistration(!showGovRegistration)}
                  className="w-full py-3 border border-civic-orange text-civic-orange rounded-full font-medium hover:bg-civic-orangeLight transition-all"
                >
                  {showGovRegistration ? 'Cancel Registration' : 'Register New Government Account'}
                </button>

                {regSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    Government account created successfully! You can now sign in with your credentials.
                  </div>
                )}

                {regError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {regError}
                  </div>
                )}
              </motion.form>
            )}

            {/* Government Registration Form */}
            {activeTab === 'government' && showGovRegistration && (
              <motion.form
                key="gov-registration"
                onSubmit={handleGovRegistration}
                className="space-y-6"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={slideInRight}
              >
                <div>
                  <h2 className="text-2xl font-serif text-civic-textPrimary mb-2">Register Government Account</h2>
                  <p className="text-civic-textSecondary">Create a new government employee account</p>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e7e3dc',
                      background: '#f5f2ed',
                      color: '#1c1917',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    className="dark:bg-[#2e2924] dark:border-[#4a4035] dark:text-[#e8e0d5]
                               dark:placeholder-[#6e5f50]"
                  />
                  <AnimatePresence>
                    {errors.fullName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.fullName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e7e3dc',
                      background: '#f5f2ed',
                      color: '#1c1917',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    className="dark:bg-[#2e2924] dark:border-[#4a4035] dark:text-[#e8e0d5]
                               dark:placeholder-[#6e5f50]"
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e7e3dc',
                      background: '#f5f2ed',
                      color: '#1c1917',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    className="dark:bg-[#2e2924] dark:border-[#4a4035] dark:text-[#e8e0d5]
                               dark:placeholder-[#6e5f50]"
                  />
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number (Optional)"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e7e3dc',
                      background: '#f5f2ed',
                      color: '#1c1917',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    className="dark:bg-[#2e2924] dark:border-[#4a4035] dark:text-[#e8e0d5]
                               dark:placeholder-[#6e5f50]"
                  />
                </div>

                <div>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e7e3dc',
                      background: '#f5f2ed',
                      color: '#1c1917',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    className="dark:bg-[#2e2924] dark:border-[#4a4035] dark:text-[#e8e0d5]"
                  >
                    <option value="">Select Department</option>
                    <option value="water">Water Supply</option>
                    <option value="roads">Roads & Footpaths</option>
                    <option value="lighting">Street Lighting</option>
                    <option value="sanitation">Sanitation & Waste</option>
                    <option value="parks">Parks & Gardens</option>
                    <option value="safety">Public Safety</option>
                    <option value="admin">Municipal Administration</option>
                  </select>
                  <AnimatePresence>
                    {errors.department && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.department}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 bg-civic-orange text-white rounded-full font-medium hover:bg-civic-orangeHover transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {regLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create Government Account
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {activeTab === 'anonymous' && (
              <motion.div
                key="anonymous"
                className="text-center space-y-8"
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={scaleIn}
              >
                <div className="space-y-4">
                  <motion.div
                    className="w-20 h-20 bg-civic-orangeLight rounded-full flex items-center justify-center mx-auto"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <IconFingerprint size={40} className="text-civic-orange" />
                  </motion.div>
                  
                  <div>
                    <h2 className="text-2xl font-serif text-civic-textPrimary mb-2">Report Without Signing In</h2>
                    <p className="text-civic-textSecondary">
                      Your identity stays private. Reports are linked to this device only.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2 bg-civic-tealLight px-4 py-2 rounded-full">
                      <span className="text-civic-teal">✓</span>
                      <span className="text-sm text-civic-textPrimary">Full reporting access</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-civic-amberLight px-4 py-2 rounded-full">
                      <span className="text-civic-amber">✓</span>
                      <span className="text-sm text-civic-textPrimary">Track your reports locally</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAnonymousLogin}
                  disabled={loading}
                  className="w-full py-3 bg-civic-orange text-white rounded-full font-medium hover:bg-civic-orangeHover transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Setting up...
                    </div>
                  ) : (
                    'Continue Anonymously'
                  )}
                </button>

                <p className="text-xs text-civic-textSecondary mt-4">
                  No account needed. No data stored on our servers.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
