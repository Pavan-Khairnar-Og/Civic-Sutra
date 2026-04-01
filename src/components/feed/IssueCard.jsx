import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, MessageSquare, ThumbsUp } from 'lucide-react';

const getRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const daysDifference = Math.round((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (Math.abs(daysDifference) < 1) {
    const hoursDifference = Math.round((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60));
    if (Math.abs(hoursDifference) < 1) return 'Just now';
    return rtf.format(hoursDifference, 'hour');
  }
  return rtf.format(daysDifference, 'day');
};

const getSeverityColor = (severity) => {
  const normalized = severity?.toLowerCase();
  if (normalized === 'critical') return 'bg-red-500 text-white';
  if (normalized === 'high') return 'bg-orange-500 text-white';
  if (normalized === 'medium') return 'bg-amber-500 text-white';
  if (normalized === 'low') return 'bg-teal-500 text-white';
  return 'bg-amber-500 text-white';
};

const getReporterInfo = (issue) => {
  if (issue.is_anonymous) {
    return { name: 'Anonymous Citizen', initials: 'AC' };
  }
  const fullName = issue.profiles?.full_name || issue.citizen_name || 'Citizen';
  const name = fullName.split(' ')[0];
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return { name, initials };
};

const normalizeCategory = (cat) => {
  if (!cat) return 'General';
  const c = cat.toLowerCase();
  if (c.includes('road') || c.includes('footpath')) return 'Roads & Footpaths';
  if (c.includes('water')) return 'Water Supply';
  if (c.includes('light') || c.includes('street')) return 'Street Lighting';
  if (c.includes('sanit') || c.includes('waste')) return 'Sanitation & Waste';
  if (c.includes('park') || c.includes('garden')) return 'Parks & Gardens';
  if (c.includes('safety')) return 'Public Safety';
  if (c.includes('municipal') || c.includes('admin')) return 'Municipal Administration';
  return cat; // return original if no match
};

export default function IssueCard({ issue, currentUserId, onLike }) {
  const navigate = useNavigate();
  const reporter = getReporterInfo(issue);
  const { name, initials } = reporter;
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(issue.upvotes || 0);

  const score = Math.min(Math.round(issue.priority_score || 0), 100);

  const getScoreColor = (s) =>
    s >= 75 ? '#dc2626' :
    s >= 55 ? '#c2410c' :
    s >= 30 ? '#d97706' : '#16a34a';

  const getScoreLabel = (s) =>
    s >= 75 ? 'Critical' :
    s >= 55 ? 'High' :
    s >= 30 ? 'Medium' : 'Low';

  const color = getScoreColor(score);

  const handleLike = (e) => {
    e.stopPropagation();
    if (isLiked) {
      setLikesCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setIsLiked(true);
      if (onLike) onLike(issue.id);
    }
  };

  return (
    <div 
      className="bg-white dark:bg-[#26221e] rounded-2xl border border-stone-200 dark:border-[#4a4035] overflow-hidden cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
      onClick={() => navigate(`/report/${issue.id}`)}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-stone-100 dark:border-[#3d3630]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D4522A] text-white flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <div>
            <div className="font-semibold text-stone-900 dark:text-[#e8e0d5] text-sm">
              {name}
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-400 dark:text-[#6e5f50]">
              <Clock size={10} />
              {getRelativeTime(issue.created_at)}
            </div>
          </div>
        </div>

        {issue.distance_km !== undefined && (
          <div className="flex items-center gap-1 bg-[#FBF0EB] dark:bg-[#D4522A]/20 text-[#D4522A] px-2 py-1 rounded-md text-xs font-bold">
            <MapPin size={10} />
            {Math.round(issue.distance_km * 10) / 10} km
          </div>
        )}
      </div>

      {/* Image Area */}
      {issue.image_url && (
        <div className="relative h-48 w-full">
          <img 
            src={issue.image_url} 
            alt={issue.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content Area */}
      <div className="p-4 pb-2">
        <div className="flex gap-2 flex-wrap mb-3">
          <span className="px-2 py-1 bg-stone-100 dark:bg-[#3d3630] border border-stone-200 dark:border-[#4a4035] rounded-full text-[10px] font-semibold text-stone-600 dark:text-[#c4b5a2] uppercase tracking-wider">
            {normalizeCategory(issue.ai_issue_type || issue.issue_type)}
          </span>
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(issue.ai_severity || issue.severity)}`}>
            {issue.ai_severity || issue.severity || 'Medium'} Severity
          </span>
        </div>

        <h3 className="font-bold text-lg text-stone-900 dark:text-white mb-2 leading-tight">
          {issue.title}
        </h3>
        
        <p className="text-sm text-stone-600 dark:text-[#a89880] line-clamp-2 mb-4">
          {issue.description}
        </p>

        {/* Priority Score Bar */}
        {issue.priority_score !== undefined && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-stone-400 dark:text-[#6e5f50] uppercase tracking-wide font-medium">
                Priority
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: getScoreColor(score) }}>
                  {getScoreLabel(score)}
                </span>
                <span className="text-xs font-semibold text-stone-500 dark:text-[#a89880]">
                  {score}/100
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-stone-100 dark:bg-[#3d3630]">
              <div style={{
                width: `${score}%`,
                background: color,
                height: '100%',
                borderRadius: '999px',
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Footer Area with Actions */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-stone-100 dark:border-[#3d3630]">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isLiked 
                ? 'text-[#D4522A]' 
                : 'text-stone-600 dark:text-[#a89880] hover:text-[#D4522A]'
            }`}
          >
            <ThumbsUp size={16} className={isLiked ? "fill-current" : ""} />
            <span>{likesCount}</span>
          </button>

          <div className="flex items-center gap-1.5 text-sm font-medium text-stone-600 dark:text-[#a89880]">
            <MessageSquare size={16} />
            <span>0</span>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
          issue.status === 'resolved' 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-[#e8692a]'
        }`}>
          {issue.status?.replace('_', ' ') || 'Pending'}
        </div>
      </div>
    </div>
  );
}
