import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';

const NearbyFeed = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    const fetchNearby = async (lat, lng) => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_nearby_issues', {
          user_lat: lat,
          user_lng: lng,
          radius_km: 5
        });
        
        if (error) {
          console.error('Feed RPC error:', error);
          setIssues([]);
          return;
        }
        setIssues(data || []);
      } catch (err) {
        console.error('Feed fetch failed:', err);
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchNearby(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn('Geolocation denied or failed:', err);
          setLocationError(true);
          setLoading(false); // Critical fix
        },
        { timeout: 8000, enableHighAccuracy: false } // Added timeout
      );
    } else {
      setLocationError(true);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4522A] mx-auto mb-4"></div>
        <p className="text-gray-500">Finding issues near you...</p>
      </div>
    );
  }

  if (locationError && issues.length === 0) {
    return (
      <div className="py-12 text-center bg-gray-50 dark:bg-[#2e2924] rounded-2xl border border-dashed border-gray-200 dark:border-[#4a4035]">
        <MapPin className="mx-auto text-gray-400 mb-2" size={32} />
        <p className="text-gray-600 dark:text-gray-400">Location access required to show nearby issues.</p>
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="serif text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MapPin size={24} className="text-[#D4522A]" />
          Issues in Your Area
        </h2>
        <span className="text-xs font-bold text-[#D4522A] uppercase tracking-widest">Live Updates</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.length > 0 ? (
          issues.map((issue) => (
            <Card key={issue.id} className="p-5 border-none shadow-sm hover:shadow-md transition-all dark:bg-[#26221e] group">
              <div className="flex justify-between items-start mb-3">
                <Badge variant="outline" className="text-[10px] uppercase border-gray-200">{issue.ai_issue_type || 'Civic Issue'}</Badge>
                <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  issue.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {issue.status}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-[#D4522A] transition-colors">{issue.title}</h3>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-[#3d3630]">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Clock size={12} />
                  {new Date(issue.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#D4522A]">
                  {Math.round(issue.distance_km * 10) / 10} km away
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border border-dashed border-gray-200 dark:border-[#4a4035] rounded-2xl">
            <p className="text-gray-500 italic">No recent issues found within 5km of your location.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NearbyFeed;
