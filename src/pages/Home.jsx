import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

/**
 * Home page component - Custom Color Palette
 * Clean, minimal landing page with smooth animations
 * Features theme support and modern SaaS-like interface
 * Uses custom colors: Primary (#76D2DB), Secondary (#D6A99D), Beige background
 */
const Home = () => {
  const { isLight, isDark, theme, currentColors } = useTheme()

  // Debug: Log theme state
  React.useEffect(() => {
    console.log('Home page theme:', { theme, isLight, isDark, currentColors })
  }, [theme, isLight, isDark, currentColors])

  return (
    <div className="min-h-screen bg-background">
      {/* Debug Section - Remove after testing */}
      <div className="fixed top-20 right-4 z-50 p-4 bg-surface border border-border rounded-xl shadow-soft">
        <h3 className="text-sm font-semibold text-text mb-2">Theme Debug</h3>
        <p className="text-xs text-muted">Theme: {theme}</p>
        <p className="text-xs text-muted">Light: {isLight ? 'Yes' : 'No'}</p>
        <p className="text-xs text-muted">Dark: {isDark ? 'Yes' : 'No'}</p>
        <div className="mt-2 space-y-1">
          <div className="w-4 h-4 bg-primary rounded"></div>
          <div className="w-4 h-4 bg-secondary rounded"></div>
          <div className="w-4 h-4 bg-danger rounded"></div>
        </div>
      </div>
      {/* Hero Section - Modern with Custom Colors */}
      <section className={`
        relative overflow-hidden py-20 px-4 sm:py-24 sm:px-6 lg:py-32 lg:px-8
        ${isLight 
          ? 'bg-gradient-to-br from-primary/10 via-beige to-secondary/10' 
          : 'bg-gradient-to-br from-primary/10 via-surface to-secondary/10'
        }
      `}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`
            absolute -top-40 -right-40 w-80 h-80 rounded-full
            ${isLight ? 'bg-primary/15' : 'bg-primary/25'}
            blur-3xl
          `}></div>
          <div className={`
            absolute -bottom-40 -left-40 w-80 h-80 rounded-full
            ${isLight ? 'bg-secondary/15' : 'bg-secondary/25'}
            blur-3xl
          `}></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* App Title */}
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center
                shadow-soft transform hover:scale-105 transition-all duration-200
                ${isLight ? 'bg-primary' : 'bg-primary/20'}
              `}>
                <span className={`
                  font-bold text-2xl transition-colors
                  ${isLight ? 'text-text' : 'text-primary'}
                `}>
                  CS
                </span>
              </div>
              <h1 className={`
                text-5xl sm:text-6xl lg:text-7xl font-bold
                bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent
                transition-all duration-200
              `}>
                Civic Sutra
              </h1>
            </div>
            <div className={`
              w-24 h-1 mx-auto rounded-full
              ${isLight ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gradient-to-r from-primary/70 to-secondary/70'}
            `}></div>
          </div>
          
          {/* Short Description */}
          <p className={`
            text-lg sm:text-xl lg:text-2xl text-text/80 max-w-3xl mx-auto leading-relaxed mb-12
            transition-all duration-200
          `}>
            Report and track civic issues in your community. 
            <span className="font-semibold text-primary">Together, we can make our neighborhoods better.</span>
          </p>
          
          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/report" className="w-full sm:w-auto">
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth={true}
                className="text-lg sm:text-xl py-4 sm:py-4 shadow-soft hover:shadow-medium transform hover:scale-105 transition-all duration-200"
              >
                📝 Report Issue
              </Button>
            </Link>
            <Link to="/map" className="w-full sm:w-auto">
              <Button 
                variant="secondary" 
                size="lg" 
                fullWidth={true}
                className="text-lg sm:text-xl py-4 sm:py-4 shadow-soft hover:shadow-medium transform hover:scale-105 transition-all duration-200"
              >
                🗺️ View Map
              </Button>
            </Link>
            <Link to="/my-reports" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                fullWidth={true}
                className="text-lg sm:text-xl py-4 sm:py-4 transform hover:scale-105 transition-all duration-200"
              >
                📋 My Reports
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Modern Cards */}
      <section className="py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              How It Works
            </h2>
            <p className="text-lg text-text/60 max-w-2xl mx-auto">
              Simple three-step process to report and resolve civic issues
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card hover={true} className="text-center group">
              <div className={`
                w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6
                bg-primary/10 group-hover:bg-primary/20 transition-all duration-200
                group-hover:scale-110 transform
              `}>
                <span className="text-3xl">📸</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text">Document Issues</h3>
              <p className="text-text/60 leading-relaxed">
                Take photos, record voice notes, and provide detailed descriptions of civic problems in your area.
              </p>
            </Card>
            
            <Card hover={true} className="text-center group">
              <div className={`
                w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6
                bg-secondary/10 group-hover:bg-secondary/20 transition-all duration-200
                group-hover:scale-110 transform
              `}>
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text">Pin Location</h3>
              <p className="text-text/60 leading-relaxed">
                Automatically capture GPS coordinates or manually point to the exact location on the map.
              </p>
            </Card>
            
            <Card hover={true} className="text-center group">
              <div className={`
                w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6
                bg-primary/10 group-hover:bg-primary/20 transition-all duration-200
                group-hover:scale-110 transform
              `}>
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text">AI Analysis</h3>
              <p className="text-text/60 leading-relaxed">
                Our AI system classifies issues, assigns priority, and routes them to the right department.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Issue Types Section - Grid Layout */}
      <section className={`
        py-16 px-4 sm:py-20 sm:px-6 lg:px-8
        ${isLight ? 'bg-muted/20' : 'bg-muted/10'}
      `}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Types of Issues You Can Report
            </h2>
            <p className="text-lg text-text/60 max-w-2xl mx-auto">
              From potholes to streetlights, we cover all civic issues
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🚗', title: 'Potholes', description: 'Damaged roads', color: 'danger' },
              { icon: '🗑️', title: 'Garbage', description: 'Waste issues', color: 'secondary' },
              { icon: '💧', title: 'Water Leakage', description: 'Pipe problems', color: 'primary' },
              { icon: '💡', title: 'Streetlights', description: 'Broken lights', color: 'secondary' },
              { icon: '🌳', title: 'Trees', description: 'Tree maintenance', color: 'primary' },
              { icon: '🚦', title: 'Traffic Signals', description: 'Traffic lights', color: 'danger' },
              { icon: '🏗️', title: 'Construction', description: 'Unsafe sites', color: 'primary' },
              { icon: '🔌', title: 'Power Issues', description: 'Electrical problems', color: 'secondary' }
            ].map((issue, index) => (
              <Card key={index} hover={true} className="text-center p-6 group">
                <div className={`
                  text-3xl mb-4 group-hover:scale-110 transform transition-all duration-200
                `}>
                  {issue.icon}
                </div>
                <h3 className="font-semibold mb-2 text-text">{issue.title}</h3>
                <p className="text-sm text-text/60">{issue.description}</p>
                <Badge variant={issue.color} size="sm" className="mt-3">
                  {issue.title}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Modern Design */}
      <section className="py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Community Impact
            </h2>
            <p className="text-lg text-text/60 max-w-2xl mx-auto">
              Real numbers showing our collective progress
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card hover={true} className="text-center p-8 group">
              <div className="text-4xl sm:text-5xl font-bold mb-2 text-primary group-hover:scale-110 transform transition-all duration-200">
                1,234
              </div>
              <div className="text-text/60 font-medium">Issues Reported</div>
              <div className="mt-4 text-sm text-text/40">
                +12% from last month
              </div>
            </Card>
            
            <Card hover={true} className="text-center p-8 group">
              <div className="text-4xl sm:text-5xl font-bold mb-2 text-secondary group-hover:scale-110 transform transition-all duration-200">
                856
              </div>
              <div className="text-text/60 font-medium">Issues Resolved</div>
              <div className="mt-4 text-sm text-text/40">
                +8% from last month
              </div>
            </Card>
            
            <Card hover={true} className="text-center p-8 group">
              <div className="text-4xl sm:text-5xl font-bold mb-2 text-primary group-hover:scale-110 transform transition-all duration-200">
                92%
              </div>
              <div className="text-text/60 font-medium">Resolution Rate</div>
              <div className="mt-4 text-sm text-text/40">
                Above industry average
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 text-center group">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-6 group-hover:scale-105 transform transition-all duration-200">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-text/60 mb-8 max-w-2xl mx-auto">
              Join thousands of citizens working together to improve our communities.
            </p>
            <Link to="/report">
              <Button 
                variant="primary" 
                size="lg" 
                className="text-lg sm:text-xl px-8 sm:px-12 py-4 shadow-soft hover:shadow-medium transform hover:scale-105 transition-all duration-200"
              >
                Start Reporting Now
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default Home
