import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Home page component
 * Landing page for the Civic Sutra application
 * Provides overview and quick access to main features
 */
const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Civic Sutra
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Report and track civic issues in your community. Together, we can make our neighborhoods better.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/report"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              📝 Report an Issue
            </Link>
            <Link 
              to="/map"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg"
            >
              🗺️ View Issues Map
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Document Issues</h3>
              <p className="text-gray-600">
                Take photos, record voice notes, and provide detailed descriptions of civic problems in your area.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Pin Location</h3>
              <p className="text-gray-600">
                Automatically capture GPS coordinates or manually point to the exact location on the map.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI system classifies issues, assigns priority, and routes them to the right department.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Issue Types Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Types of Issues You Can Report
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🚗', title: 'Potholes', description: 'Damaged roads and highways' },
              { icon: '🗑️', title: 'Garbage', description: 'Waste management issues' },
              { icon: '💧', title: 'Water Leakage', description: 'Pipe bursts and water supply' },
              { icon: '💡', title: 'Streetlights', description: 'Broken or non-working lights' },
              { icon: '🌳', title: 'Trees', description: 'Fallen branches or maintenance' },
              { icon: '🚦', title: 'Traffic Signals', description: 'Malfunctioning traffic lights' },
              { icon: '🏗️', title: 'Construction', description: 'Unsafe construction sites' },
              { icon: '🔌', title: 'Power Issues', description: 'Electrical problems' }
            ].map((issue, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">{issue.icon}</div>
                <h3 className="font-semibold mb-2">{issue.title}</h3>
                <p className="text-sm text-gray-600">{issue.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Community Impact
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1,234</div>
              <div className="text-blue-100">Issues Reported</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">856</div>
              <div className="text-blue-100">Issues Resolved</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">92%</div>
              <div className="text-blue-100">Resolution Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of citizens working together to improve our communities.
          </p>
          <Link 
            to="/report"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            Start Reporting Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
