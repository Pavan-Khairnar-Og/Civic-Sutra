import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
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

import HeroSection from '../components/home/HeroSection'
import StatsSection from '../components/home/StatsSection'
import NearbyFeed from '../components/feed/NearbyFeed'
import { ErrorBoundary } from '../components/ErrorBoundary'

const Home = () => {
  const { isAuthenticated, isAnonymous } = useAuth()

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

  return (
    <div className="min-h-screen bg-civic-parchment dark:bg-[#1e1a17]">
      {/* HERO SECTION */}
      <ErrorBoundary>
        <HeroSection />
      </ErrorBoundary>

      {/* STATS BAR */}
      <ErrorBoundary>
        <StatsSection />
      </ErrorBoundary>

      {/* NEARBY FEED */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorBoundary>
          <NearbyFeed />
        </ErrorBoundary>
      </div>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white dark:bg-[#26221e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-[#D4522A] text-xs font-bold tracking-[0.15em] uppercase mb-4">
              THE PROCESS
            </div>
            <h2 className="serif text-4xl font-bold text-stone-900 dark:text-white mb-4">
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
                  <div className="text-6xl font-bold text-stone-100 dark:text-[#302b26] absolute inset-0 flex items-center justify-center">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 bg-[#FBF0EB] dark:bg-[#3d3630] rounded-xl flex items-center justify-center mx-auto relative z-10">
                    <item.icon className="w-8 h-8 text-[#D4522A]" />
                  </div>
                </div>
                <h3 className="font-bold text-stone-900 dark:text-white text-xl mb-3">{item.title}</h3>
                <p className="text-stone-600 dark:text-stone-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE ISSUES TICKER */}
      <section className="bg-[#FBF0EB] dark:bg-[#302b26] py-8 overflow-hidden border-y border-[#F3E8E2] dark:border-[#4a4035]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-[#D4522A] text-xs font-black tracking-widest uppercase">
              HAPPENING NOW
            </span>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex gap-4 animate-ticker">
              {[...liveIssues, ...liveIssues].map((issue, index) => (
                <div key={index} className="bg-white dark:bg-[#26221e] rounded-xl px-4 py-3 shadow-sm border border-stone-200 dark:border-[#4a4035] min-w-[320px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: issue.color }}></div>
                      <span className="text-xs font-bold text-stone-900 dark:text-white">{issue.category}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      issue.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-stone-900 dark:text-white mb-1 truncate">
                    {issue.title}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-medium">
                    <span>{issue.location}</span>
                    <span>{issue.time}</span>
                  </div>
                </div>
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
      <footer className="bg-white dark:bg-[#26221e] border-t border-stone-200 dark:border-[#4a4035]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#D4522A] text-white rounded-xl flex items-center justify-center font-bold text-sm">
                  CS
                </div>
                <div>
                  <div className="font-bold text-stone-900 dark:text-white text-lg">CivicSutra</div>
                  <div className="text-stone-500 dark:text-stone-400 text-xs font-medium">Connecting Citizens & Government</div>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="text-stone-900 dark:text-white font-black text-xs uppercase tracking-widest mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm font-medium">
                <li><Link to="/home" className="text-stone-600 dark:text-stone-400 hover:text-[#D4522A] transition-colors">Home</Link></li>
                <li><Link to="/report" className="text-stone-600 dark:text-stone-400 hover:text-[#D4522A] transition-colors">Report Issue</Link></li>
                <li><Link to="/map" className="text-stone-600 dark:text-stone-400 hover:text-[#D4522A] transition-colors">Map View</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="text-stone-900 dark:text-white font-black text-xs uppercase tracking-widest mb-4">
                Departments
              </h3>
              <ul className="space-y-2 text-sm font-medium">
                <li className="text-stone-600 dark:text-stone-400 hover:text-[#D4522A] transition-colors cursor-pointer">Water Supply</li>
                <li className="text-stone-600 dark:text-stone-400 hover:text-[#D4522A] transition-colors cursor-pointer">Roads & Safety</li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="text-stone-900 dark:text-white font-black text-xs uppercase tracking-widest mb-4">
                Connect
              </h3>
              <div className="flex gap-4 items-center">
                <TwitterIcon />
                <GithubIcon />
                <LinkedInIcon />
              </div>
            </div>
          </div>
          <div className="border-t border-stone-100 dark:border-[#3d3630] pt-8 mt-12 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-stone-500 dark:text-stone-400 text-[xs font-medium]">
              © 2024 CivicSutra. All rights reserved.
            </span>
            <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              Made with ❤️ for Bharat
            </span>
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
