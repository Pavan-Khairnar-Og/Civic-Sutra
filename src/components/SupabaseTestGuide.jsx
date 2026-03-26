import React from 'react'
import { useTheme } from '../context/ThemeContext'
import Card from './ui/Card'
import Badge from './ui/Badge'

/**
 * Supabase Test Results Guide
 * Helps interpret test results and provides solutions
 */
const SupabaseTestGuide = () => {
  const { isLight } = useTheme()

  const testResults = [
    {
      test: 'Environment Variables',
      success: true,
      message: 'Environment variables are configured',
      solution: null
    },
    {
      test: 'Database Connection',
      success: true,
      message: 'Connected to Supabase',
      solution: null
    },
    {
      test: 'Storage Bucket',
      success: false,
      message: 'Bucket "report-images" not found',
      solution: 'Create bucket in Supabase Dashboard'
    },
    {
      test: 'File Upload',
      success: false,
      message: 'Upload failed',
      solution: 'Fix bucket permissions and setup'
    }
  ]

  const getTestStatus = (success) => success ? '✅' : '❌'

  const getStatusColor = (success) => success ? 'success' : 'danger'

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text mb-4">
          📋 Supabase Test Results Guide
        </h1>
        <p className="text-text/60">
          How to interpret and fix your test results
        </p>
      </div>

      {/* Test Results Examples */}
      <Card className="mb-8">
        <h3 className="text-xl font-semibold text-text mb-4">📊 Example Test Results</h3>
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
                    {getTestStatus(result.success)}
                  </span>
                  <span className="font-medium text-text">{result.test}</span>
                </div>
                <Badge variant={getStatusColor(result.success)}>
                  {result.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
              
              <p className={`text-sm mb-2 ${
                result.success ? 'text-success/80' : 'text-danger/80'
              }`}>
                {result.message}
              </p>
              
              {result.solution && (
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="text-sm font-medium text-warning mb-1">
                    💡 Solution:
                  </p>
                  <p className="text-sm text-text/80">
                    {result.solution}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Common Scenarios and Solutions */}
      <Card className="mb-8">
        <h3 className="text-xl font-semibold text-text mb-4">🔧 Common Scenarios & Solutions</h3>
        
        <div className="space-y-6">
          {/* Scenario 1: All Tests Pass */}
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <h4 className="font-semibold text-success mb-2">✅ All Tests Pass</h4>
            <p className="text-sm text-text/80 mb-3">
              Great! Your Supabase is properly configured. Image upload should work.
            </p>
            <div className="p-3 bg-success/5 rounded">
              <p className="text-sm font-medium text-success">Next Steps:</p>
              <ul className="text-sm text-text/80 mt-2 space-y-1">
                <li>• Test image upload at /report</li>
                <li>• If still fails, check browser console for specific errors</li>
                <li>• Verify image size is under 10MB</li>
              </ul>
            </div>
          </div>

          {/* Scenario 2: Bucket Not Found */}
          <div className="p-4 bg-danger/10 rounded-lg border border-danger/20">
            <h4 className="font-semibold text-danger mb-2">❌ Bucket Not Found</h4>
            <p className="text-sm text-text/80 mb-3">
              The "report-images" storage bucket doesn't exist in your Supabase project.
            </p>
            <div className="p-3 bg-warning/10 rounded">
              <p className="text-sm font-medium text-warning">Solution Steps:</p>
              <ol className="text-sm text-text/80 mt-2 space-y-2">
                <li><strong>1. Go to Supabase Dashboard</strong> → Storage → Buckets</li>
                <li><strong>2. Click "New bucket"</strong></li>
                <li><strong>3. Name it:</strong> <code className="bg-muted/10 px-1 rounded">report-images</code></li>
                <li><strong>4. Set to Public</strong> (important for image URLs)</li>
                <li><strong>5. Click "Save"</strong></li>
                <li><strong>6. Run tests again</strong></li>
              </ol>
            </div>
          </div>

          {/* Scenario 3: Permission Denied */}
          <div className="p-4 bg-danger/10 rounded-lg border border-danger/20">
            <h4 className="font-semibold text-danger mb-2">❌ Permission Denied</h4>
            <p className="text-sm text-text/80 mb-3">
              Bucket exists but anon users don't have upload permissions.
            </p>
            <div className="p-3 bg-warning/10 rounded">
              <p className="text-sm font-medium text-warning">Solution Steps:</p>
              <ol className="text-sm text-text/80 mt-2 space-y-2">
                <li><strong>1. Go to bucket settings</strong> in Supabase Dashboard</li>
                <li><strong>2. Click "Policies"</strong></li>
                <li><strong>3. Create new policy:</strong></li>
                <li><strong>4. Use this policy:</strong></li>
                <li><code className="block p-2 bg-muted/10 rounded text-xs mt-2">
{`{
  "name": "Allow public uploads",
  "definition": "INSERT INTO report-images (id, storage_path) VALUES (auth.uid(), storage_path)",
  "allow_anonymous": true
}`}
                </code></li>
                <li><strong>5. Save policy</strong> and test again</li>
              </ol>
            </div>
          </div>

          {/* Scenario 4: Environment Variables Missing */}
          <div className="p-4 bg-danger/10 rounded-lg border border-danger/20">
            <h4 className="font-semibold text-danger mb-2">❌ Environment Variables Missing</h4>
            <p className="text-sm text-text/80 mb-3">
              Your .env file is missing or has incorrect values.
            </p>
            <div className="p-3 bg-warning/10 rounded">
              <p className="text-sm font-medium text-warning">Solution Steps:</p>
              <ol className="text-sm text-text/80 mt-2 space-y-2">
                <li><strong>1. Create .env file</strong> in project root</li>
                <li><strong>2. Add these lines:</strong></li>
                <li><code className="block p-2 bg-muted/10 rounded text-xs mt-2">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
                </code></li>
                <li><strong>3. Replace values</strong> with your actual Supabase URL and key</li>
                <li><strong>4. Restart dev server</strong> (npm run dev)</li>
              </ol>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Fixes Summary */}
      <Card>
        <h3 className="text-xl font-semibold text-text mb-4">⚡ Quick Fixes</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-muted/10 rounded-lg">
            <h4 className="font-medium text-text mb-2">🔑 Most Common Fix</h4>
            <p className="text-sm text-text/60 mb-3">
              90% of upload failures are due to missing storage bucket.
            </p>
            <div className="p-3 bg-primary/10 rounded">
              <p className="text-sm font-medium text-primary">Quick Fix:</p>
              <ol className="text-sm text-text/80 mt-2 space-y-1">
                <li>1. <strong>Supabase Dashboard</strong> → Storage</li>
                <li>2. <strong>Create bucket:</strong> "report-images"</li>
                <li>3. <strong>Set to Public</strong></li>
                <li>4. <strong>Test again</strong></li>
              </ol>
            </div>
          </div>

          <div className="p-4 bg-muted/10 rounded-lg">
            <h4 className="font-medium text-text mb-2">🔧 If Still Failing</h4>
            <p className="text-sm text-text/60 mb-3">
              Check these specific areas if tests pass but upload still fails.
            </p>
            <div className="p-3 bg-warning/10 rounded">
              <p className="text-sm font-medium text-warning">Advanced Checks:</p>
              <ul className="text-sm text-text/80 mt-2 space-y-1">
                <li>• <strong>Browser Console:</strong> Check for specific error messages</li>
                <li>• <strong>Image Size:</strong> Ensure image is under 10MB</li>
                <li>• <strong>Network:</strong> Check internet connection</li>
                <li>• <strong>Browser:</strong> Try different browser</li>
                <li>• <strong>Ad Blockers:</strong> Disable temporarily</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="mt-8">
        <h3 className="text-xl font-semibold text-text mb-4">🎯 Next Steps</h3>
        <div className="text-center space-y-4">
          <p className="text-text/60">
            After fixing the issues, test your image upload:
          </p>
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="font-medium text-primary mb-2">Test Workflow:</p>
            <ol className="text-sm text-text/80 space-y-2">
              <li>1. <strong>Fix any failed tests</strong> using the solutions above</li>
              <li>2. <strong>Run tests again</strong> to verify fixes</li>
              <li>3. <strong>Go to /report</strong> and capture a photo</li>
              <li>4. <strong>Fill form</strong> and submit</li>
              <li>5. <strong>Check console</strong> for any remaining errors</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SupabaseTestGuide
