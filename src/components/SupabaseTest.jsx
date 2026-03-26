import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../services/supabase'
import Button from './ui/Button'
import Card from './ui/Card'
import Badge from './ui/Badge'

/**
 * Supabase Connection Test Component
 * Helps diagnose Supabase configuration and storage issues
 */
const SupabaseTest = () => {
  const { isLight } = useTheme()
  const [testResults, setTestResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (test, success, message, details = null) => {
    setTestResults(prev => [...prev, { test, success, message, details, timestamp: new Date() }])
  }

  const clearResults = () => {
    setTestResults([])
  }

  // Test 1: Check environment variables
  const testEnvironment = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      addResult('Environment Variables', false, 'VITE_SUPABASE_URL is missing', 'Add it to your .env file')
      return false
    }

    if (!supabaseKey) {
      addResult('Environment Variables', false, 'VITE_SUPABASE_ANON_KEY is missing', 'Add it to your .env file')
      return false
    }

    addResult('Environment Variables', true, 'Environment variables are configured', {
      url: supabaseUrl.substring(0, 20) + '...',
      keyLength: supabaseKey.length
    })
    return true
  }

  // Test 2: Test Supabase connection
  const testConnection = async () => {
    try {
      // Test with a simple query
      const { data, error } = await supabase
        .from('reports')
        .select('count', { count: 'exact', head: true })

      if (error) {
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          addResult('Database Connection', true, 'Connected to Supabase', 'Reports table not found (this is OK for testing)')
        } else {
          addResult('Database Connection', false, 'Connection failed', error.message)
          return false
        }
      } else {
        addResult('Database Connection', true, 'Connected to Supabase', `Found ${data} reports`)
      }
      return true
    } catch (error) {
      addResult('Database Connection', false, 'Connection failed', error.message)
      return false
    }
  }

  // Test 3: Test storage bucket
  const testStorage = async () => {
    try {
      // Test if bucket exists by trying to list files
      const { data, error } = await supabase.storage
        .from('report-images')
        .list('', { limit: 1 })

      if (error) {
        if (error.message.includes('bucket') || error.message.includes('not found')) {
          addResult('Storage Bucket', false, 'Bucket "report-images" not found', 
            'Create it in Supabase Dashboard: Storage > Buckets > New bucket')
          return false
        } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          addResult('Storage Bucket', false, 'Permission denied', 
            'Check bucket permissions in Supabase Dashboard')
          return false
        } else {
          addResult('Storage Bucket', false, 'Storage test failed', error.message)
          return false
        }
      } else {
        addResult('Storage Bucket', true, 'Bucket "report-images" exists and accessible', 
          `Bucket contains ${data.length} files`)
        return true
      }
    } catch (error) {
      addResult('Storage Bucket', false, 'Storage test failed', error.message)
      return false
    }
  }

  // Test 4: Test file upload (small test file)
  const testUpload = async () => {
    try {
      // Create a small test image (1x1 pixel)
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#FF0000'
      ctx.fillRect(0, 0, 1, 1)
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'))
      const fileName = `test-${Date.now()}.jpg`
      const filePath = `tests/${fileName}`

      // Upload test file
      const { data, error } = await supabase.storage
        .from('report-images')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        addResult('File Upload', false, 'Upload failed', error.message)
        return false
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('report-images')
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        addResult('File Upload', false, 'Could not get public URL', 'URL generation failed')
        return false
      }

      // Clean up - delete test file
      await supabase.storage
        .from('report-images')
        .remove([filePath])

      addResult('File Upload', true, 'Upload and URL generation successful', 
        `File uploaded and deleted successfully`)
      return true

    } catch (error) {
      addResult('File Upload', false, 'Upload test failed', error.message)
      return false
    }
  }

  // Run all tests
  const runAllTests = async () => {
    setIsLoading(true)
    clearResults()

    // Test 1: Environment
    const envOk = testEnvironment()
    if (!envOk) {
      setIsLoading(false)
      return
    }

    // Test 2: Connection
    const connOk = await testConnection()

    // Test 3: Storage
    const storageOk = await testStorage()

    // Test 4: Upload (only if storage is OK)
    if (storageOk) {
      await testUpload()
    }

    setIsLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text mb-4">
          🔧 Supabase Connection Test
        </h1>
        <p className="text-text/60 mb-6">
          Diagnose Supabase configuration and storage issues
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            variant="primary" 
            onClick={runAllTests}
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Running Tests...' : '🧪 Run All Tests'}
          </Button>
          <Button 
            variant="outline" 
            onClick={clearResults}
            disabled={isLoading}
          >
            🗑️ Clear Results
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card className="mb-8">
        <h3 className="text-xl font-semibold text-text mb-4">📋 Setup Instructions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-text mb-2">1. Environment Variables (.env file):</h4>
            <code className="block p-3 bg-muted/10 rounded-lg text-sm text-text/80">
              VITE_SUPABASE_URL=your_supabase_url<br/>
              VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
            </code>
          </div>
          
          <div>
            <h4 className="font-medium text-text mb-2">2. Storage Bucket Setup:</h4>
            <ul className="space-y-1 text-sm text-text/60">
              <li>• Go to Supabase Dashboard → Storage → Buckets</li>
              <li>• Create bucket named: <code className="bg-muted/10 px-1 rounded">report-images</code></li>
              <li>• Set bucket to be publicly accessible</li>
              <li>• Enable upload permissions for anon users</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-text mb-2">3. Database Table (optional for testing):</h4>
            <code className="block p-3 bg-muted/10 rounded-lg text-sm text-text/80">
              CREATE TABLE reports (<br/>
              &nbsp;&nbsp;id UUID DEFAULT gen_random_uuid() PRIMARY KEY,<br/>
              &nbsp;&nbsp;image_url TEXT,<br/>
              &nbsp;&nbsp;description TEXT,<br/>
              &nbsp;&nbsp;latitude DECIMAL,<br/>
              &nbsp;&nbsp;longitude DECIMAL,<br/>
              &nbsp;&nbsp;status TEXT DEFAULT 'pending',<br/>
              &nbsp;&nbsp;created_at TIMESTAMP DEFAULT NOW()<br/>
              );
            </code>
          </div>
        </div>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <h3 className="text-xl font-semibold text-text mb-4">📊 Test Results</h3>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success 
                    ? 'bg-success/10 border-success/20' 
                    : 'bg-danger/10 border-danger/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={result.success ? 'text-success' : 'text-danger'}>
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className="font-medium text-text">{result.test}</span>
                  </div>
                  <Badge variant={result.success ? 'success' : 'danger'}>
                    {result.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
                
                <p className={`text-sm mb-2 ${
                  result.success ? 'text-success/80' : 'text-danger/80'
                }`}>
                  {result.message}
                </p>
                
                {result.details && (
                  <details className="text-sm text-text/60">
                    <summary className="cursor-pointer hover:text-text">
                      📋 Details
                    </summary>
                    <pre className="mt-2 p-2 bg-muted/10 rounded text-xs overflow-x-auto">
                      {typeof result.details === 'object' 
                        ? JSON.stringify(result.details, null, 2)
                        : result.details
                      }
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Troubleshooting */}
      <Card className="mt-8">
        <h3 className="text-xl font-semibold text-text mb-4">🔧 Common Issues & Solutions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-text mb-2">❌ "Environment variables missing":</h4>
            <p className="text-sm text-text/60">Create a .env file in your project root with the required variables.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-text mb-2">❌ "Bucket not found":</h4>
            <p className="text-sm text-text/60">Create the "report-images" bucket in Supabase Dashboard → Storage.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-text mb-2">❌ "Permission denied":</h4>
            <p className="text-sm text-text/60">Check bucket policies and ensure anon users have upload permissions.</p>
          </div>
          
          <div>
            <h4 className="font-medium text-text mb-2">❌ "Connection failed":</h4>
            <p className="text-sm text-text/60">Verify your Supabase URL and API key are correct.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SupabaseTest
