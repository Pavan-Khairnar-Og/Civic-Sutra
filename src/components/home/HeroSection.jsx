import React from 'react';
import { motion, useTransform, useScroll } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';

const HeroSection = () => {
  const { scrollYProgress } = useScroll();
  const dashboardY = useTransform(scrollYProgress, [0, 0.3], [80, 0]);
  const dashboardRotateX = useTransform(scrollYProgress, [0, 0.3], [6, 0]);

  return (
    <section 
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
                  <div className="bg-[#FEF3C7] border-l-2 border-[#D97706] p-2 rounded">
                    <div className="text-[10px] font-medium text-stone-900">Water Leak</div>
                    <div className="text-[10px] text-stone-500">In Progress</div>
                  </div>
                  <div className="bg-[#FFEDD5] border-l-2 border-[#EA580C] p-2 rounded">
                    <div className="text-[10px] font-medium text-stone-900">Road Repair</div>
                    <div className="text-[10px] text-stone-500">Pending</div>
                  </div>
                  <div className="bg-[#E1F1EE] border-l-2 border-[#2A9D8F] p-2 rounded">
                    <div className="text-[10px] font-medium text-stone-900">Light Fixed</div>
                    <div className="text-[10px] text-stone-500">Resolved</div>
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
  );
};

export default HeroSection;
