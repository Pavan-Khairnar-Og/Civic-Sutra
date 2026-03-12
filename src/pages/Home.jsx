import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

/**
 * Home page component - Modern, mobile-first design
 * Landing page for the Civic Sutra application
 * Provides overview and quick access to main features
 */
const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Mobile First */}
      <section className="py-12 px-4 sm:py-16 sm:px-6 lg:py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* App Title */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Civic Sutra
            </h1>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          </div>
          
          {/* Short Description */}
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Report and track civic issues in your community. Together, we can make our neighborhoods better.
          </p>
          
          {/* Main Action Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/report" className="w-full sm:w-auto">
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth={true}
                className="text-lg sm:text-xl py-4 sm:py-4"
              >
                📝 Report Issue
              </Button>
            </Link>
            <Link to="/map" className="w-full sm:w-auto">
              <Button 
                variant="secondary" 
                size="lg" 
                fullWidth={true}
                className="text-lg sm:text-xl py-4 sm:py-4"
              >
                🗺️ View Map
              </Button>
            </Link>
            <Link to="/my-reports" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                fullWidth={true}
                className="text-lg sm:text-xl py-4 sm:py-4"
              >
                � My Reports
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Card Based */}
      <section className="py-12 px-4 sm:py-16 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <Card hover={true} className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Document Issues</h3>
              <p className="text-gray-600 leading-relaxed">
                Take photos, record voice notes, and provide detailed descriptions of civic problems in your area.
              </p>
            </Card>
            
            <Card hover={true} className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Pin Location</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically capture GPS coordinates or manually point to the exact location on the map.
              </p>
            </Card>
            
            <Card hover={true} className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">AI Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI system classifies issues, assigns priority, and routes them to the right department.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Issue Types Section - Grid Layout */}
      <section className="py-12 px-4 sm:py-16 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
            Types of Issues You Can Report
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: '🚗', title: 'Potholes', description: 'Damaged roads' },
              { icon: '🗑️', title: 'Garbage', description: 'Waste issues' },
              { icon: '💧', title: 'Water Leakage', description: 'Pipe problems' },
              { icon: '💡', title: 'Streetlights', description: 'Broken lights' },
              { icon: '🌳', title: 'Trees', description: 'Tree maintenance' },
              { icon: '🚦', title: 'Traffic Signals', description: 'Traffic lights' },
              { icon: '🏗️', title: 'Construction', description: 'Unsafe sites' },
              { icon: '🔌', title: 'Power Issues', description: 'Electrical problems' }
            ].map((issue, index) => (
              <Card key={index} hover={true} className="text-center p-4 sm:p-6">
                <div className="text-2xl sm:text-3xl mb-3">{issue.icon}</div>
                <h3 className="font-semibold mb-2 text-gray-900">{issue.title}</h3>
                <p className="text-sm text-gray-600">{issue.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Modern Design */}
      <section className="py-12 px-4 sm:py-16 sm:px-6 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Community Impact
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">1,234</div>
              <div className="text-blue-100">Issues Reported</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">856</div>
              <div className="text-blue-100">Issues Resolved</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">92%</div>
              <div className="text-blue-100">Resolution Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 sm:py-16 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Join thousands of citizens working together to improve our communities.
          </p>
          <Link to="/report">
            <Button 
              variant="primary" 
              size="lg" 
              className="text-lg sm:text-xl px-8 sm:px-12 py-4"
            >
              Start Reporting Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
