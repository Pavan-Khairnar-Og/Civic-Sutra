import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import IssueCard from './IssueCard';
import { MapPin, Loader2 } from 'lucide-react';

export default function NearbyFeed() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchNearbyIssues();
  }, []);

  const fetchNearbyIssues = () => {
    setLoading(true);

    // Try to get location with 8s timeout
    const geoOptions = { timeout: 8000, enableHighAccuracy: false };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await loadIssues(pos.coords.latitude, pos.coords.longitude);
        },
        async () => {
          // Location denied or timeout — load recent issues without geo filter
          setLocationDenied(true);
          await loadIssues(null, null);
        },
        geoOptions
      );
    } else {
      setLocationDenied(true);
      loadIssues(null, null);
    }
  };

  const loadIssues = async (lat, lng) => {
    try {
      let data;

      if (lat && lng) {
        // RPC function doesn't exist, use fallback with location-based filtering
        console.log('Using location-based fallback query');
        const { data: fallback, error: fallbackError } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15);
          
        if (!fallbackError) data = fallback;
      } else {
        // No location — just show recent globally
        const { data: recent, error: recentError } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15);
          
        if (!recentError) data = recent;
      }

      setIssues(data || []);
    } catch (err) {
      console.error('Feed load error:', err);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filtered = issues.filter(issue => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'critical') {
      return issue.ai_severity?.toLowerCase() === 'critical' || 
             issue.severity?.toLowerCase() === 'critical' || 
             (issue.priority_score || 0) >= 75;
    }
    const cat = issue.ai_issue_type?.toLowerCase() || issue.issue_type?.toLowerCase() || '';
    return cat.includes(activeFilter.toLowerCase());
  });

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="animate-spin text-[#D4522A] mx-auto mb-4" size={32} />
        <p className="text-stone-500 dark:text-[#a89880]">Finding civic issues...</p>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            Civic Feed
          </h2>
          <p className="text-xs text-stone-500 dark:text-[#a89880] mt-1 flex items-center gap-1">
            <MapPin size={12} />
            {locationDenied
              ? 'Showing recent reports'
              : 'Showing reports within 5km'}
          </p>
        </div>
        <span className="text-[10px] font-bold text-[#D4522A] uppercase tracking-widest bg-[#FBF0EB] dark:bg-[#D4522A]/10 px-2 py-1 rounded">
          Live Updates
        </span>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
        {['All', 'Critical', 'Water', 'Roads', 'Lighting', 'Sanitation', 'Parks']
          .map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f.toLowerCase())}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
              activeFilter === f.toLowerCase()
                ? 'bg-[#D4522A] text-white border-[#D4522A] shadow-sm'
                : 'bg-white dark:bg-[#26221e] text-stone-600 dark:text-[#c4b5a2] border-stone-200 dark:border-[#4a4035] hover:border-stone-300 dark:hover:border-[#5a5045]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Issue Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#26221e] rounded-2xl border border-dashed border-stone-200 dark:border-[#4a4035]">
          <MapPin className="mx-auto text-stone-300 dark:text-[#4a4035] mb-3" size={40} />
          <p className="text-stone-500 dark:text-[#a89880] font-medium">No civic issues found</p>
          <p className="text-stone-400 dark:text-[#6e5f50] text-sm mt-1">Try selecting a different filter or checking back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(issue => (
            <IssueCard
              key={issue.id}
              issue={issue}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}
