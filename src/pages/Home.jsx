import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Counter from '../components/ui/Counter'

/**
 * Home page component - Modern Active Design
 * Clean, minimal landing page with smooth animations and interactive elements
 * Features theme support and modern SaaS-like interface with activeness
 * Uses custom colors: Primary (#76D2DB), Secondary (#D6A99D), Beige background
 */
const Home = () => {
  const { isLight, isDark } = useTheme()
  const [activeSection, setActiveSection] = useState('hero')
  const [isLoaded, setIsLoaded] = useState(false)

  // Animate on mount
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Modern with Active Animations */}
      <section 
        id="hero"
        className={`
          relative overflow-hidden py-20 px-4 sm:py-24 sm:px-6 lg:py-32 lg:px-8
          ${isLight 
            ? 'bg-gradient-to-br from-primary/10 via-beige to-secondary/10' 
            : 'bg-gradient-to-br from-primary/10 via-surface to-secondary/10'
          }
          ${activeSection === 'hero' ? 'animate-fade-in' : ''}
        `}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`
            absolute -top-40 -right-40 w-80 h-80 rounded-full
            ${isLight ? 'bg-primary/15' : 'bg-primary/25'}
            blur-3xl
            ${isLoaded ? 'animate-scale-in' : 'opacity-0'}
            transition-all duration-1000 ease-out
          `}></div>
          <div className={`
            absolute -bottom-40 -left-40 w-80 h-80 rounded-full
            ${isLight ? 'bg-secondary/15' : 'bg-secondary/25'}
            blur-3xl
            ${isLoaded ? 'animate-scale-in' : 'opacity-0'}
            transition-all duration-1000 ease-out
            animation-delay-200
          `}></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* App Title */}
          <div className={`
            mb-8
            ${isLoaded ? 'animate-slide-in' : 'opacity-0 translate-y-4'}
            transition-all duration-700 ease-out
          `}>
            <div className="inline-flex items-center space-x-3 mb-6 group">
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center
                shadow-soft hover:shadow-medium transform hover:scale-105 transition-all duration-300
                ${isLight ? 'bg-primary' : 'bg-primary/20'}
                group-hover:rotate-12
              `}>
                <span className={`
                  font-bold text-2xl transition-all duration-300
                  ${isLight ? 'text-text' : 'text-primary'}
                `}>
                  CS
                </span>
              </div>
              <h1 className={`
                text-5xl sm:text-6xl lg:text-7xl font-bold
                bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent
                transition-all duration-300
                group-hover:scale-105
              `}>
                Civic Sutra
              </h1>
            </div>
            <div className={`
              w-32 h-1 mx-auto rounded-full
              ${isLight ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gradient-to-r from-primary/70 to-secondary/70'}
              ${isLoaded ? 'animate-scale-in' : 'scale-x-0'}
              transition-all duration-700 ease-out
              animation-delay-300
            `}></div>
          </div>
          
          {/* Short Description */}
          <p className={`
            text-lg sm:text-xl lg:text-2xl text-text/80 max-w-3xl mx-auto leading-relaxed mb-12
            ${isLoaded ? 'animate-fade-in' : 'opacity-0'}
            transition-all duration-700 ease-out
            animation-delay-500
          `}>
            Report and track civic issues in your community. 
            <span className="font-semibold text-primary transition-colors duration-300">Together, we can make our neighborhoods better.</span>
          </p>
          
          {/* Main Action Buttons */}
          <div className={`
            flex flex-col sm:flex-row gap-4 justify-center items-center mb-16
            ${isLoaded ? 'animate-fade-in' : 'opacity-0'}
            transition-all duration-700 ease-out
            animation-delay-700
          `}>
            <Link to="/report" className="w-full sm:w-auto group">
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth={true}
                className="text-lg sm:text-xl py-4 sm:py-4 shadow-soft hover:shadow-medium transform hover:scale-105 transition-all duration-300 group-hover:rotate-1"
              >
                <span className="flex items-center justify-center">
                  📝 
                  <span className="ml-2">Report Issue</span>
                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                </span>
              </Button>
            </Link>
            <Link to="/map" className="w-full sm:w-auto group">
              <Button 
                variant="secondary" 
                size="lg" 
                fullWidth={true}
                className="text-lg sm:text-xl py-4 sm:py-4 shadow-soft hover:shadow-medium transform hover:scale-105 transition-all duration-300 group-hover:rotate-1"
              >
                <span className="flex items-center justify-center">
                  🗺️ 
                  <span className="ml-2">View Map</span>
                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                </span>
              </Button>
            </Link>
            <Link to="/ai-vision" className="w-full sm:w-auto group">
              <Button 
                variant="outline" 
                size="lg" 
                fullWidth={true}
                className="text-lg sm:text-xl py-4 sm:py-4 transform hover:scale-105 transition-all duration-300 group-hover:rotate-1"
              >
                <span className="flex items-center justify-center">
                  🤖 
                  <span className="ml-2">AI Vision</span>
                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                </span>
              </Button>
            </Link>
            <Link to="/my-reports" className="w-full sm:w-auto group">
              <Button 
                variant="outline" 
                size="lg" 
                fullWidth={true}
                className="text-lg sm:text-xl py-4 sm:py-4 transform hover:scale-105 transition-all duration-300 group-hover:rotate-1"
              >
                <span className="flex items-center justify-center">
                  📋 
                  <span className="ml-2">My Reports</span>
                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Interactive Cards */}
      <section 
        id="features"
        className={`
          py-16 px-4 sm:py-20 sm:px-6 lg:px-8
          ${activeSection === 'features' ? 'animate-fade-in' : ''}
        `}
      >
        <div className="max-w-6xl mx-auto">
          <div className={`
            text-center mb-16
            ${isLoaded ? 'animate-slide-in' : 'opacity-0 translate-y-4'}
            transition-all duration-700 ease-out
            animation-delay-900
          `}>
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              How It Works
            </h2>
            <p className="text-lg text-text/60 max-w-2xl mx-auto">
              Simple three-step process to report and resolve civic issues
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card 
              hover={true} 
              className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-105"
              onMouseEnter={() => setActiveSection('features')}
            >
              <div className="flex flex-col items-center">
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6
                  bg-primary/10 group-hover:bg-primary/20 transition-all duration-300
                  group-hover:scale-110 transform
                  relative overflow-hidden
                `}>
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="text-3xl relative z-10">📸</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-text group-hover:text-primary transition-colors duration-300">
                  Document Issues
                </h3>
                <p className="text-text/60 leading-relaxed">
                  Take photos, record voice notes, and provide detailed descriptions of civic problems in your area.
                </p>
                <div className="mt-4">
                  <Badge variant="primary" size="sm" className="group-hover:scale-110 transition-transform duration-300">
                    Step 1
                  </Badge>
                </div>
              </div>
            </Card>
            
            <Card 
              hover={true} 
              className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-105"
              onMouseEnter={() => setActiveSection('features')}
            >
              <div className="flex flex-col items-center">
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6
                  bg-secondary/10 group-hover:bg-secondary/20 transition-all duration-300
                  group-hover:scale-110 transform
                  relative overflow-hidden
                `}>
                  <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="text-3xl relative z-10">📍</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-text group-hover:text-secondary transition-colors duration-300">
                  Pin Location
                </h3>
                <p className="text-text/60 leading-relaxed">
                  Automatically capture GPS coordinates or manually point to exact location on map.
                </p>
                <div className="mt-4">
                  <Badge variant="secondary" size="sm" className="group-hover:scale-110 transition-transform duration-300">
                    Step 2
                  </Badge>
                </div>
              </div>
            </Card>
            
            <Card 
              hover={true} 
              className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-105"
              onMouseEnter={() => setActiveSection('features')}
            >
              <div className="flex flex-col items-center">
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6
                  bg-primary/10 group-hover:bg-primary/20 transition-all duration-300
                  group-hover:scale-110 transform
                  relative overflow-hidden
                `}>
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="text-3xl relative z-10">🤖</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-text group-hover:text-primary transition-colors duration-300">
                  AI Analysis
                </h3>
                <p className="text-text/60 leading-relaxed">
                  Our AI system classifies issues, assigns priority, and routes them to right department.
                </p>
                <div className="mt-4">
                  <Badge variant="primary" size="sm" className="group-hover:scale-110 transition-transform duration-300">
                    Step 3
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Issue Types Section - Interactive Grid */}
      <section 
        id="issues"
        className={`
          py-16 px-4 sm:py-20 sm:px-6 lg:px-8
          ${isLight ? 'bg-muted/20' : 'bg-muted/10'}
          ${activeSection === 'issues' ? 'animate-fade-in' : ''}
        `}
      >
        <div className="max-w-6xl mx-auto">
          <div className={`
            text-center mb-16
            ${isLoaded ? 'animate-slide-in' : 'opacity-0 translate-y-4'}
            transition-all duration-700 ease-out
            animation-delay-1100
          `}>
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Types of Issues You Can Report
            </h2>
            <p className="text-lg text-text/60 max-w-2xl mx-auto">
              From potholes to streetlights, we cover all civic issues
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🚗', title: 'Potholes', description: 'Damaged roads', color: 'danger', count: '234' },
              { icon: '🗑️', title: 'Garbage', description: 'Waste issues', color: 'secondary', count: '189' },
              { icon: '💧', title: 'Water Leakage', description: 'Pipe problems', color: 'primary', count: '156' },
              { icon: '💡', title: 'Streetlights', description: 'Broken lights', color: 'secondary', count: '98' },
              { icon: '🌳', title: 'Trees', description: 'Tree maintenance', color: 'primary', count: '67' },
              { icon: '🚦', title: 'Traffic Signals', description: 'Traffic lights', color: 'danger', count: '45' },
              { icon: '🏗️', title: 'Construction', description: 'Unsafe sites', color: 'primary', count: '89' },
              { icon: '🔌', title: 'Power Issues', description: 'Electrical problems', color: 'secondary', count: '123' }
            ].map((issue, index) => (
              <Card 
                key={index} 
                hover={true} 
                className="text-center p-6 group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                onMouseEnter={() => setActiveSection('issues')}
              >
                <div className="relative">
                  <div className={`
                    text-3xl mb-4 transform transition-all duration-300
                    ${activeSection === 'issues' ? 'animate-bounce' : ''}
                    group-hover:scale-125 group-hover:rotate-12
                  `}>
                    {issue.icon}
                  </div>
                  <h3 className="font-semibold mb-2 text-text group-hover:text-primary transition-colors duration-300">
                    {issue.title}
                  </h3>
                  <p className="text-sm text-text/60">{issue.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant={issue.color} size="sm" className="group-hover:scale-110 transition-transform duration-300">
                      {issue.title}
                    </Badge>
                    <span className="text-xs text-muted bg-muted/10 px-2 py-1 rounded-full">
                      {issue.count} reports
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Animated Counters */}
      <section 
        id="stats"
        className={`
          py-16 px-4 sm:py-20 sm:px-6 lg:px-8
          ${activeSection === 'stats' ? 'animate-fade-in' : ''}
        `}
      >
        <div className="max-w-6xl mx-auto">
          <div className={`
            text-center mb-16
            ${isLoaded ? 'animate-slide-in' : 'opacity-0 translate-y-4'}
            transition-all duration-700 ease-out
            animation-delay-1200
          `}>
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Community Impact
            </h2>
            <p className="text-lg text-text/60 max-w-2xl mx-auto">
              Real numbers showing our collective progress
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card 
              hover={true} 
              className="text-center p-8 group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              onMouseEnter={() => setActiveSection('stats')}
            >
              <div className="relative">
                <div className={`
                  text-4xl sm:text-5xl font-bold mb-2 text-primary group-hover:scale-110 transition-all duration-300
                  ${activeSection === 'stats' ? 'animate-pulse' : ''}
                `}>
                  <Counter end={1234} duration={2000} />
                </div>
                <div className="text-text/60 font-medium">Issues Reported</div>
                <div className="mt-4 flex items-center justify-center">
                  <div className="text-sm text-text/40">
                    <span className="inline-flex items-center">
                      <span className="text-green-500">↑</span>
                      <span className="ml-1">+12% from last month</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card 
              hover={true} 
              className="text-center p-8 group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              onMouseEnter={() => setActiveSection('stats')}
            >
              <div className="relative">
                <div className={`
                  text-4xl sm:text-5xl font-bold mb-2 text-secondary group-hover:scale-110 transition-all duration-300
                  ${activeSection === 'stats' ? 'animate-pulse' : ''}
                `}>
                  <Counter end={856} duration={2000} delay={200} />
                </div>
                <div className="text-text/60 font-medium">Issues Resolved</div>
                <div className="mt-4 flex items-center justify-center">
                  <div className="text-sm text-text/40">
                    <span className="inline-flex items-center">
                      <span className="text-green-500">↑</span>
                      <span className="ml-1">+8% from last month</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card 
              hover={true} 
              className="text-center p-8 group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              onMouseEnter={() => setActiveSection('stats')}
            >
              <div className="relative">
                <div className={`
                  text-4xl sm:text-5xl font-bold mb-2 text-primary group-hover:scale-110 transition-all duration-300
                  ${activeSection === 'stats' ? 'animate-pulse' : ''}
                `}>
                  <Counter end={92} duration={2000} delay={400} suffix="%" />
                </div>
                <div className="text-text/60 font-medium">Resolution Rate</div>
                <div className="mt-4 flex items-center justify-center">
                  <div className="text-sm text-text/40">
                    <span className="inline-flex items-center">
                      <span className="text-green-500">⭐</span>
                      <span className="ml-1">Above industry average</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Interactive */}
      <section 
        id="cta"
        className={`
          py-16 px-4 sm:py-20 sm:px-6 lg:px-8
          ${activeSection === 'cta' ? 'animate-fade-in' : ''}
        `}
      >
        <div className="max-w-4xl mx-auto text-center">
          <Card 
            className="p-12 text-center group cursor-pointer transform transition-all duration-300 hover:scale-105"
            onMouseEnter={() => setActiveSection('cta')}
          >
            <div className={`
              ${isLoaded ? 'animate-slide-in' : 'opacity-0 translate-y-4'}
              transition-all duration-700 ease-out
              animation-delay-1400
            `}>
              <h2 className={`
                text-3xl sm:text-4xl font-bold text-text mb-6 group-hover:scale-105 transition-transform duration-300
                ${activeSection === 'cta' ? 'animate-pulse' : ''}
              `}>
                Ready to Make a Difference?
              </h2>
              <p className="text-lg text-text/60 mb-8 max-w-2xl mx-auto">
                Join thousands of citizens working together to improve our communities.
              </p>
              <Link to="/report">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="text-lg sm:text-xl px-8 sm:px-12 py-4 shadow-soft hover:shadow-medium transform hover:scale-105 transition-all duration-300 group-hover:rotate-3"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    <span>Start Reporting Now</span>
                    <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                  </span>
                </Button>
              </Link>
              
              <div className="mt-8 flex justify-center space-x-8">
                <div className="flex items-center text-sm text-muted">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
                  <span>Active community members</span>
                  <Counter end={2847} duration={1500} delay={1600} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default Home
