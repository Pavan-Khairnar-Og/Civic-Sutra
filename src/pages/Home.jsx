import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { 
  ArrowRight, MapPin, Camera, Cpu, TrendingUp, CheckCircle, 
  Droplets, Construction, Trash2, Lightbulb, Trees, ShieldAlert,
  Building, Home as HomeIcon, AlertTriangle, FileText, Map, Star, Quote
} from 'lucide-react'

// Social Media Icon Components
const TwitterIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className="text-civic-textSecondary hover:text-civic-orange cursor-pointer transition-colors"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const GithubIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className="text-civic-textSecondary hover:text-civic-orange cursor-pointer transition-colors"
  >
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className="text-civic-textSecondary hover:text-civic-orange cursor-pointer transition-colors"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)

const Home = () => {
  const { isAuthenticated, isAnonymous } = useAuth()
  const [visibleStats, setVisibleStats] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const heroRef = useRef(null)
  const statsRef = useRef(null)
  const { scrollYProgress } = useScroll()

  // 3D perspective effect for hero dashboard
  const dashboardY = useTransform(scrollYProgress, [0, 0.3], [80, 0])
  const dashboardRotateX = useTransform(scrollYProgress, [0, 0.3], [6, 0])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleStats(true)
        }
      },
      { threshold: 0.3 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Animated Counter Component
  const AnimatedCounter = ({ end, suffix = "", duration = 2000 }) => {
    const [count, setCount] = useState(0)
    
    useEffect(() => {
      if (!visibleStats) return
      
      let start = 0
      const increment = end / (duration / 16)
      
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)
      
      return () => clearInterval(timer)
    }, [end, duration, visibleStats])
    
    return <span>{count.toLocaleString()}{suffix}</span>
  }

  // Department data
  const departments = [
    { name: "Water Supply", icon: Droplets, color: "#0077B6", issues: 245 },
    { name: "Roads & Footpaths", icon: Construction, color: "#92400E", issues: 189 },
    { name: "Street Lighting", icon: Lightbulb, color: "#D97706", issues: 98 },
    { name: "Sanitation", icon: Trash2, color: "#4A4E69", issues: 156 },
    { name: "Parks", icon: Trees, color: "#2A9D8F", issues: 67 },
    { name: "Public Safety", icon: ShieldAlert, color: "#C1121F", issues: 134 },
    { name: "Municipal Admin", icon: Building, color: "#6B6560", issues: 89 }
  ]

  // Live issues ticker data
  const liveIssues = [
    { category: "Water", title: "Pipeline leak near Market Street", location: "Downtown", status: "In Progress", time: "2 min ago", color: "#0077B6" },
    { category: "Roads", title: "Pothole repair needed on Highway 45", location: "North Sector", status: "Pending", time: "5 min ago", color: "#92400E" },
    { category: "Lighting", title: "Street light not working", location: "Park Avenue", status: "Resolved", time: "8 min ago", color: "#D97706" },
    { category: "Sanitation", title: "Garbage collection overflow", location: "Residential Area", status: "In Progress", time: "12 min ago", color: "#4A4E69" },
    { category: "Parks", title: "Tree branch fallen on walking path", location: "Central Park", status: "Pending", time: "15 min ago", color: "#2A9D8F" },
    { category: "Safety", title: "Traffic signal malfunction", location: "City Center", status: "In Progress", time: "18 min ago", color: "#C1121F" },
    { category: "Water", title: "Drainage blockage reported", location: "Old Town", status: "Resolved", time: "22 min ago", color: "#0077B6" },
    { category: "Roads", title: "Road sign damaged", location: "Highway 12", status: "Pending", time: "25 min ago", color: "#92400E" }
  ]

  // Testimonials
  const testimonials = [
    {
      quote: "CivicSutra made it so easy to report the broken water pipe in our area. It was fixed within 24 hours!",
      name: "Priya Sharma",
      city: "Mumbai",
      initials: "PS"
    },
    {
      quote: "Finally, a platform that actually works. The government responded to my complaint about street lighting.",
      name: "Rahul Verma",
      city: "Delhi", 
      initials: "RV"
    },
    {
      quote: "Love how I can track the progress of my reports. The transparency is amazing!",
      name: "Anita Patel",
      city: "Bangalore",
      initials: "AP"
    }
  ]

  return (
    <div className="min-h-screen bg-civic-parchment">
      {/* HERO SECTION */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: '#F8F6F1',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231C1917' fill-opacity='0.06'%3E%3Cpath d='M0 0h48v48H0V0zm1 1h46v46H1V1zm1 1h44v44H2V2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pill Label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center mb-8"
          >
            <span className="inline-flex items-center gap-1.5 border border-civic-orange/30 bg-civic-orangeLight text-civic-orange text-xs font-medium px-3 py-1 rounded-full">
              🇮🇳 Civic Reporting Platform
            </span>
          </motion.div>

          {/* Main Heading */}
          <div className="mb-8">
            {["Your City.", "Your Voice.", "Real Change."].map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
              >
                <h1 className={`serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight ${
                  index === 1 ? 'text-[#D4522A]' : 'text-[#1C1917]'
                }`}>
                  {line}
                </h1>
              </motion.div>
            ))}
          </div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-civic-textSecondary text-lg max-w-2xl mx-auto text-center mb-12"
          >
            CivicSutra connects citizens with local government. Report issues, track progress, and see your city improve — together.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              to="/report"
              className="bg-[#D4522A] hover:bg-[#B8441F] text-white font-medium text-base px-8 py-3.5 rounded-full flex items-center gap-2 transition-all duration-200 hover:shadow-[0_8px_24px_rgba(212,82,42,0.35)]"
            >
              Report an Issue <ArrowRight size={18} />
            </Link>
            <Link
              to="/map"
              className="bg-white border border-civic-muted text-civic-textPrimary rounded-full px-8 py-3.5 font-medium text-base hover:bg-civic-muted transition-all duration-200 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Explore the Map
            </Link>
          </motion.div>

          {/* Floating Dashboard Mockup */}
          <motion.div
            className="relative max-w-4xl mx-auto"
            style={{ perspective: '1200px', perspectiveOrigin: 'center top' }}
          >
            <motion.div
              style={{
                y: dashboardY,
                rotateX: dashboardRotateX,
                transformStyle: 'preserve-3d'
              }}
              className="relative"
              initial={{ y: 80, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Floating Badges */}
              <motion.div
                className="absolute -top-4 -left-4 bg-white rounded-xl shadow-md p-3 z-10"
                animate={{ y: [-6, 0, -6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-xs text-civic-teal font-medium">✓ AI Classified</span>
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-md p-3 z-10"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.25 }}
              >
                <span className="text-xs text-civic-orange font-medium">🔔 Issue Resolved!</span>
              </motion.div>

              {/* Dashboard Card */}
              <div className="bg-white rounded-2xl shadow-[0_32px_80px_rgba(26,26,26,0.14)] p-6 border border-civic-muted/20">
                {/* Mini Navbar */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-civic-muted">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-sm font-medium text-civic-textPrimary">CivicSutra Dashboard</span>
                  </div>
                  <div className="text-xs text-civic-textSecondary">Live</div>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Heatmap Grid */}
                  <div className="grid grid-cols-6 gap-1 p-3 bg-[#F8F6F1] rounded-xl">
                    {[
                      '#E8F6F4','#2A9D8F','#E9A84C','#D4522A','#E8F6F4','#2A9D8F',
                      '#2A9D8F','#E9A84C','#D4522A','#C1121F','#D4522A','#E9A84C',
                      '#E8F6F4','#2A9D8F','#E9A84C','#D4522A','#2A9D8F','#E8F6F4',
                      '#E9A84C','#C1121F','#D4522A','#E9A84C','#E8F6F4','#2A9D8F',
                      '#2A9D8F','#E9A84C','#E8F6F4','#2A9D8F','#E9A84C','#D4522A',
                      '#E8F6F4','#2A9D8F','#2A9D8F','#E9A84C','#2A9D8F','#E8F6F4',
                    ].map((color, i) => (
                      <div key={i} style={{ backgroundColor: color, opacity: 0.85 }} 
                           className="w-full aspect-square rounded-sm" />
                    ))}
                  </div>

                  {/* Issue Cards */}
                  <div className="space-y-2">
                    <div className="bg-civic-orangeLight border-l-3 border-civic-orange p-2 rounded">
                      <div className="text-xs font-medium text-civic-textPrimary">Water Leak</div>
                      <div className="text-xs text-civic-textSecondary">In Progress</div>
                    </div>
                    <div className="bg-civic-amberLight border-l-3 border-civic-amber p-2 rounded">
                      <div className="text-xs font-medium text-civic-textPrimary">Road Repair</div>
                      <div className="text-xs text-civic-textSecondary">Pending</div>
                    </div>
                    <div className="bg-civic-tealLight border-l-3 border-civic-teal p-2 rounded">
                      <div className="text-xs font-medium text-civic-textPrimary">Light Fixed</div>
                      <div className="text-xs text-civic-textSecondary">Resolved</div>
                    </div>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="flex items-center justify-between text-xs text-civic-textSecondary border-t border-civic-muted pt-4">
                  <span>1,247 Issues Reported</span>
                  <span className="w-px h-3 bg-civic-muted"></span>
                  <span>89% Resolved</span>
                  <span className="w-px h-3 bg-civic-muted"></span>
                  <span>12 Departments</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <section ref={statsRef} className="w-full bg-[#1C1917] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 12, label: "Departments" },
              { value: 1247, label: "Issues Reported" },
              { value: 89, label: "Resolution Rate", suffix: "%" },
              { value: 48, label: "Cities" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="serif text-4xl font-bold text-white mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix || ""} />
                </div>
                <div className="text-[#6B6560] text-sm uppercase tracking-widest mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-civic-orange text-xs font-medium tracking-[0.15em] uppercase mb-4">
              THE PROCESS
            </div>
            <h2 className="serif text-4xl font-bold text-civic-textPrimary mb-4">
              From Report to Resolution
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-12 left-12 right-12 h-0.5">
              <svg className="w-full h-full">
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#D4522A" strokeWidth="2" strokeDasharray="8 4" />
              </svg>
            </div>

            {[
              { icon: Camera, step: "01", title: "Capture", desc: "Take a photo or describe the issue in detail" },
              { icon: Cpu, step: "02", title: "AI Classifies", desc: "Our system automatically routes to the right department" },
              { icon: TrendingUp, step: "03", title: "Track & Resolve", desc: "Monitor real-time status updates until completion" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-6">
                  <div className="text-6xl font-bold text-[#E8E4DC] absolute inset-0 flex items-center justify-center">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 bg-civic-orange/15 rounded-xl flex items-center justify-center mx-auto relative z-10">
                    <item.icon className="w-8 h-8 text-civic-orange" />
                  </div>
                </div>
                <h3 className="font-semibold text-civic-textPrimary text-xl mb-3">{item.title}</h3>
                <p className="text-civic-textSecondary">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE ISSUES TICKER */}
      <section className="bg-civic-orangeLight py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-civic-orange text-xs font-bold tracking-widest uppercase">
              HAPPENING NOW
            </span>
          </div>
          
          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-ticker">
              {[...liveIssues, ...liveIssues].map((issue, index) => (
                <div key={index} className="bg-white rounded-xl px-4 py-3 shadow-sm border border-civic-muted min-w-[320px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: issue.color }}></div>
                      <span className="text-xs font-medium text-civic-textPrimary">{issue.category}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      issue.status === 'Resolved' ? 'bg-civic-tealLight text-civic-teal' :
                      issue.status === 'In Progress' ? 'bg-civic-orangeLight text-civic-orange' :
                      'bg-civic-muted text-civic-textSecondary'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-civic-textPrimary mb-1 truncate">
                    {issue.title}
                  </div>
                  <div className="flex items-center justify-between text-xs text-civic-textSecondary">
                    <span>{issue.location}</span>
                    <span>{issue.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DEPARTMENT GRID */}
      <section className="py-20 bg-civic-parchment">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="serif text-4xl font-bold text-civic-textPrimary mb-4">
              Every Problem, Right Department
            </h2>
            <p className="text-civic-textSecondary text-lg max-w-2xl mx-auto">
              Connect directly with the right government department for faster resolution
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept, index) => (
              <motion.div
                key={index}
                className="bg-white border border-civic-muted rounded-2xl p-6 cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ 
                  y: -4, 
                  borderColor: '#D4522A',
                  backgroundColor: '#FBF0EB'
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${dept.color}15` }}
                  >
                    <dept.icon className="w-8 h-8" style={{ color: dept.color }} />
                  </div>
                  <h3 className="font-semibold text-civic-textPrimary mb-2">{dept.name}</h3>
                  <span className="text-civic-textSecondary text-sm">{dept.issues} issues this month</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="serif text-4xl font-bold text-civic-textPrimary">
              Citizens Speaking Up
            </h2>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-8 border border-civic-muted"
              >
                <div className="relative">
                  <Quote className="absolute top-4 left-6 w-16 h-16 text-civic-orange opacity-30" />
                  <p className="serif italic text-civic-textPrimary mb-6 relative z-10 text-lg">
                    {testimonials[currentTestimonial].quote}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-civic-orangeLight text-civic-orange rounded-full flex items-center justify-center font-bold">
                      {testimonials[currentTestimonial].initials}
                    </div>
                    <div>
                      <div className="font-medium text-civic-textPrimary">
                        {testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-sm text-civic-textSecondary">
                        {testimonials[currentTestimonial].city}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-civic-amber" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentTestimonial 
                      ? 'bg-civic-orange' 
                      : 'bg-civic-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section 
        className="bg-civic-textPrimary py-20 relative overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="serif text-4xl font-bold text-white mb-4">
            Ready to make your city better?
          </h2>
          <p className="text-civic-orangeLight text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of citizens already using CivicSutra to report issues and track their resolution
          </p>
          <Link
            to="/report"
            className="inline-block bg-civic-orange hover:bg-civic-orangeHover text-white font-semibold text-lg px-10 py-4 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            Get Started — It's Free
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-civic-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-civic-orange text-white rounded-xl flex items-center justify-center font-bold text-sm">
                  CS
                </div>
                <div>
                  <div className="font-semibold text-civic-textPrimary text-lg">CivicSutra</div>
                  <div className="text-civic-textSecondary text-sm">Connecting Citizens & Government</div>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-civic-textPrimary font-semibold text-sm uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li><Link to="/home" className="text-civic-textSecondary text-sm hover:text-civic-orange transition-colors">Home</Link></li>
                <li><Link to="/report" className="text-civic-textSecondary text-sm hover:text-civic-orange transition-colors">Report Issue</Link></li>
                <li><Link to="/map" className="text-civic-textSecondary text-sm hover:text-civic-orange transition-colors">Map View</Link></li>
                <li><Link to="/my-reports" className="text-civic-textSecondary text-sm hover:text-civic-orange transition-colors">My Reports</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="text-civic-textPrimary font-semibold text-sm uppercase tracking-wider mb-4">
                Departments
              </h3>
              <ul className="space-y-2">
                <li><span className="text-civic-textSecondary text-sm hover:text-civic-orange cursor-pointer transition-colors">Water Supply</span></li>
                <li><span className="text-civic-textSecondary text-sm hover:text-civic-orange cursor-pointer transition-colors">Roads & Safety</span></li>
                <li><span className="text-civic-textSecondary text-sm hover:text-civic-orange cursor-pointer transition-colors">Sanitation</span></li>
                <li><span className="text-civic-textSecondary text-sm hover:text-civic-orange cursor-pointer transition-colors">Parks & Recreation</span></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="text-civic-textPrimary font-semibold text-sm uppercase tracking-wider mb-4">
                Connect
              </h3>
              <div className="flex gap-3 mb-4">
                <TwitterIcon />
                <GithubIcon />
                <LinkedInIcon />
              </div>
              <p className="text-civic-textSecondary text-sm">
                contact@civicsutra.in
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-civic-muted pt-6 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <span className="text-civic-textSecondary text-sm">
                © 2024 CivicSutra. All rights reserved.
              </span>
              <span className="text-civic-textSecondary text-sm">
                Made with ❤️ for Bharat
              </span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

export default Home
