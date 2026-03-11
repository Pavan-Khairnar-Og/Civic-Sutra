# Civic Sutra

AI-powered civic issue reporting platform that enables citizens to report, track, and resolve civic issues in their communities.

## 🚀 Features

### For Citizens
- **Issue Reporting**: Report civic issues with photos, voice notes, and GPS location
- **Real-time Tracking**: Track the status of reported issues
- **Interactive Map**: View all reported issues on a map interface
- **Voice-to-Text**: Convert voice recordings to text descriptions
- **Image Upload**: Capture and upload photos of issues

### For Government Staff
- **Admin Dashboard**: Comprehensive dashboard for issue management
- **AI Analysis**: Automatic issue classification and priority assignment
- **Department Assignment**: Smart routing to appropriate departments
- **Status Management**: Update issue status and assign staff
- **Analytics**: Track resolution times and department performance

### AI-Powered Features
- **Issue Classification**: Automatically categorize issues by type
- **Priority Assignment**: AI suggests priority based on severity
- **Department Routing**: Intelligent assignment to responsible departments
- **Text Summarization**: Generate concise summaries of reports
- **Image Analysis**: Detect and analyze issues from uploaded photos

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Maps**: Leaflet + OpenStreetMap
- **AI Services**: OpenAI, Google Vision API (placeholders)
- **Routing**: React Router

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   ├── ReportCard.jsx
│   ├── ImageUploader.jsx
│   ├── VoiceRecorder.jsx
│   └── IssueMap.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── ReportIssue.jsx
│   ├── MyReports.jsx
│   ├── MapView.jsx
│   └── AdminDashboard.jsx
├── services/           # API and external services
│   ├── supabase.js
│   └── aiService.js
├── hooks/              # Custom React hooks
│   ├── useAuth.js
│   └── useReports.js
├── utils/              # Utility functions
│   ├── constants.js
│   └── helpers.js
├── context/            # React context providers
│   └── AuthContext.jsx
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pavan-Khairnar-Og/Civic-Sutra.git
   cd Civic-Sutra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase configuration:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Create the following tables in your Supabase project:

   ```sql
   -- Reports table
   CREATE TABLE reports (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     title TEXT NOT NULL,
     issue_type TEXT NOT NULL,
     description TEXT NOT NULL,
     status TEXT DEFAULT 'pending',
     priority TEXT DEFAULT 'medium',
     department TEXT,
     location TEXT,
     latitude DECIMAL,
     longitude DECIMAL,
     image_url TEXT,
     voice_transcript TEXT,
     contact_info TEXT,
     ai_classification JSONB,
     assigned_to TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS (Row Level Security)
   ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view own reports" ON reports
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own reports" ON reports
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Admins can view all reports" ON reports
     FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

   CREATE POLICY "Admins can update all reports" ON reports
     FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗄️ Database Schema

### Reports Table
- `id`: Unique identifier (UUID)
- `user_id`: User who reported the issue
- `title`: Brief title of the issue
- `issue_type`: Type of issue (pothole, garbage, etc.)
- `description`: Detailed description
- `status`: Current status (pending, in-progress, resolved)
- `priority`: Priority level (low, medium, high)
- `department`: Assigned department
- `location`: Text description of location
- `latitude`/`longitude`: GPS coordinates
- `image_url`: URL of uploaded image
- `voice_transcript`: Transcribed voice text
- `contact_info`: Optional contact information
- `ai_classification`: AI analysis results
- `assigned_to`: Staff member assigned
- `created_at`/`updated_at`: Timestamps

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from project settings
3. Add them to your `.env` file
4. Set up the database schema using the SQL provided above
5. Configure authentication providers if needed

### AI Services (Optional)

To enable AI features, add API keys to your `.env`:

```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GOOGLE_VISION_API_KEY=your_google_vision_api_key
```

## 📱 Usage

### For Citizens

1. **Report an Issue**: 
   - Navigate to "Report Issue"
   - Fill in the form with issue details
   - Upload photos or record voice notes
   - Select location on map
   - Submit the report

2. **Track Reports**:
   - View "My Reports" to see all your submissions
   - Check status updates and resolution progress

3. **Browse Issues**:
   - Use "Map View" to see all reported issues
   - Filter by type, status, or priority

### For Government Staff

1. **Access Admin Dashboard**:
   - Navigate to "/admin"
   - Requires admin role authentication

2. **Manage Issues**:
   - Review new reports
   - Update status and assign departments
   - View AI analysis and recommendations

3. **Analytics**:
   - Track resolution times
   - Monitor department performance
   - Generate reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use React functional components with hooks
- Follow the existing folder structure
- Write clean, commented code
- Test your changes thoroughly
- Update documentation as needed

## 📝 API Documentation

### Supabase Services

The `src/services/supabase.js` file provides:

- **Authentication**: Sign up, sign in, sign out
- **Reports**: CRUD operations for issue reports
- **Storage**: File upload and management
- **Real-time**: Subscriptions for live updates

### AI Services

The `src/services/aiService.js` file provides:

- **Issue Analysis**: Classify and prioritize issues
- **Image Analysis**: Analyze uploaded images
- **Audio Transcription**: Convert voice to text
- **Batch Processing**: Analyze multiple reports

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## 🔒 Security

- Row Level Security (RLS) enabled on Supabase tables
- User authentication required for most actions
- Admin role verification for sensitive operations
- Input validation and sanitization
- File upload restrictions and virus scanning

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:

- Create an issue on GitHub
- Email: support@civicsutra.com
- Documentation: [Wiki](https://github.com/Pavan-Khairnar-Og/Civic-Sutra/wiki)

## 🌟 Acknowledgments

- [Supabase](https://supabase.com) for the backend services
- [Leaflet](https://leafletjs.com/) for mapping functionality
- [TailwindCSS](https://tailwindcss.com/) for styling
- [OpenStreetMap](https://www.openstreetmap.org/) for map data
- All contributors and community members

**Civic Sutra** - Empowering communities to report and resolve civic issues through technology.
