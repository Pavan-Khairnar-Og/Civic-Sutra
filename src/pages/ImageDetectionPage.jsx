import React from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ImageDetection from '../components/ImageDetection'

/**
 * Image Detection Page
 * 
 * Dedicated page for Google Vision AI image detection feature.
 * Includes navigation, hero section, and the main detection component.
 */
const ImageDetectionPage = () => {
  const { isLight } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className={`
        relative overflow-hidden py-16 px-4 sm:py-20 sm:px-6 lg:px-8
        ${isLight 
          ? 'bg-gradient-to-br from-primary/10 via-beige to-secondary/10' 
          : 'bg-gradient-to-br from-primary/10 via-surface to-secondary/10'
        }
      `}>
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
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3 mb-6 group">
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center
                shadow-soft hover:shadow-medium transform hover:scale-105 transition-all duration-300
                ${isLight ? 'bg-primary' : 'bg-primary/20'}
              `}>
                <span className={`
                  font-bold text-2xl transition-all duration-300
                  ${isLight ? 'text-text' : 'text-primary'}
                `}>
                  🤖
                </span>
              </div>
              <h1 className={`
                text-4xl sm:text-5xl lg:text-6xl font-bold
                bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent
                transition-all duration-300
              `}>
                AI Vision Detection
              </h1>
            </div>
            <div className={`
              w-32 h-1 mx-auto rounded-full
              ${isLight ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gradient-to-r from-primary/70 to-secondary/70'}
            `}></div>
          </div>
          
          <p className="text-lg sm:text-xl text-text/80 max-w-3xl mx-auto leading-relaxed mb-12">
            Harness the power of Google Cloud Vision AI to detect objects and concepts in your images.
            <span className="font-semibold text-primary"> Advanced machine learning at your fingertips.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link to="/" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                fullWidth={true}
                className="text-lg sm:text-xl py-4 sm:py-4 transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  🏠 
                  <span className="ml-2">Back to Home</span>
                  <span className="ml-2">←</span>
                </span>
              </Button>
            </Link>
            <Link to="/report" className="w-full sm:w-auto">
              <Button 
                variant="secondary" 
                size="lg" 
                fullWidth={true}
                className="text-lg sm:text-xl py-4 sm:py-4 shadow-soft hover:shadow-medium transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  📝 
                  <span className="ml-2">Report Issue</span>
                  <span className="ml-2">→</span>
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Powerful AI Capabilities
            </h2>
            <p className="text-lg text-text/60 max-w-2xl mx-auto">
              Leverage Google's advanced computer vision technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card hover={true} className="text-center group">
              <div className={`
                w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6
                bg-primary/10 group-hover:bg-primary/20 transition-all duration-300
                group-hover:scale-110 transform
              `}>
                <span className="text-3xl">🏷️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text">Label Detection</h3>
              <p className="text-text/60 leading-relaxed">
                Automatically identify and label objects, concepts, and entities in your images with high accuracy.
              </p>
            </Card>
            
            <Card hover={true} className="text-center group">
              <div className={`
                w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6
                bg-secondary/10 group-hover:bg-secondary/20 transition-all duration-300
                group-hover:scale-110 transform
              `}>
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text">Confidence Scores</h3>
              <p className="text-text/60 leading-relaxed">
                Get detailed confidence percentages for each detected label, helping you understand the AI's certainty.
              </p>
            </Card>
            
            <Card hover={true} className="text-center group">
              <div className={`
                w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6
                bg-primary/10 group-hover:bg-primary/20 transition-all duration-300
                group-hover:scale-110 transform
              `}>
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text">Fast Processing</h3>
              <p className="text-text/60 leading-relaxed">
                Get instant results with Google's optimized infrastructure and real-time API responses.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Detection Component */}
      <section className="py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Try It Now
            </h2>
            <p className="text-lg text-text/60 max-w-2xl mx-auto">
              Upload an image to see AI detection in action
            </p>
          </div>
          
          <ImageDetection />
        </div>
      </section>
    </div>
  )
}

export default ImageDetectionPage
