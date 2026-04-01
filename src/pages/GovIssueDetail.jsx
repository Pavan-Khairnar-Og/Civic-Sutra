import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Clock, MapPin, User, FileText, 
  MessageSquare, CheckCircle, AlertTriangle, 
  Shield, Send, Calendar, ExternalLink
} from 'lucide-react';

const GovIssueDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [internalNotes, setInternalNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    if (id) fetchIssueDetails();
  }, [id]);

  const fetchIssueDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setIssue(data);

      // Fetch internal notes
      const { data: notes, error: notesError } = await supabase
        .from('internal_notes')
        .select('*')
        .eq('issue_id', id)
        .order('created_at', { ascending: false });
      
      if (!notesError) setInternalNotes(notes || []);
    } catch (err) {
      console.error('Error fetching issue:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      setIssue({ ...issue, status: newStatus });
      fetchIssueDetails();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      setSubmittingNote(true);
      const { error } = await supabase
          .from('internal_notes')
          .insert({
            issue_id: id,
            admin_id: user.id,
            note_text: newNote,
            admin_name: user.name
          });
      
      if (error) throw error;
      setNewNote('');
      fetchIssueDetails();
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading command interface...</div>;
  if (!issue) return <div className="p-8 text-center text-red-500">Issue not found in registry.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-bold uppercase tracking-wider">{t('common.back')}</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-mono">CASE ID: {issue.id}</span>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
            issue.status === 'resolved' ? 'bg-green-100 text-green-700' :
            issue.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {issue.status === 'resolved' ? t('status.resolved') : issue.status === 'in_progress' ? t('status.inProgress') : t('status.pending')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Issue Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {issue.title || t('issue.title')}
            </h1>
            
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-8">
              {issue.description || t('messages.noReportsFound')}
            </div>

            {issue.image_url && (
              <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 mb-8">
                <img src={issue.image_url} alt="Evidence" className="w-full h-auto object-cover max-h-[500px]" />
                <div className="p-3 bg-gray-50 dark:bg-gray-900 flex justify-center">
                  <button 
                    onClick={() => window.open(issue.image_url, '_blank')}
                    className="text-xs font-bold text-blue-500 flex items-center gap-2"
                  >
                    <ExternalLink size={14} /> VIEW FULL RESOLUTION
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Internal Notes Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={20} className="text-[#DA532D]" />
              <h2 className="text-lg font-bold">{t('dashboard.systemSettings')}</h2>
            </div>

            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {internalNotes.length > 0 ? internalNotes.map(note => (
                <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-[#DA532D] uppercase tracking-tighter">{note.admin_name || 'Gov Official'}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{new Date(note.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-height-relaxed">{note.note_text}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-400 text-sm italic">No internal logs for this case yet.</div>
              )}
            </div>

            <div className="relative">
              <textarea 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a strictly internal note..."
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-4 pr-12 text-sm focus:ring-2 focus:ring-[#DA532D] transition-all min-h-[100px]"
              />
              <button 
                onClick={addNote}
                disabled={submittingNote || !newNote.trim()}
                className="absolute bottom-4 right-4 p-2 bg-[#DA532D] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Controls */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Command Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => updateStatus('in_progress')}
                disabled={issue.status === 'in_progress'}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                DEPLOY RESOURCES
              </button>
              <button 
                onClick={() => updateStatus('resolved')}
                disabled={issue.status === 'resolved'}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 hover:bg-green-700 transition-all disabled:opacity-50"
              >
                MARK RESOLVED
              </button>
              <button 
                onClick={() => updateStatus('pending')}
                disabled={issue.status === 'pending'}
                className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-all disabled:opacity-50"
              >
                RESET TO PENDING
              </button>
            </div>
          </div>

          {/* AI Intelligence Section */}
          {issue.ai_description && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6" style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1.5px',
                color: '#94a3b8',
                marginBottom: '16px'
              }}>
                AI INTELLIGENCE
              </p>

              {/* AI Observations */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{
                  fontSize: '11px',
                  color: '#64748b',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  🤖 AI OBSERVATIONS
                </p>
                <p style={{
                  fontSize: '13px',
                  color: '#cbd5e1',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  padding: '12px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  borderLeft: '3px solid #3b82f6'
                }}>
                  "{issue.ai_description}"
                </p>
              </div>

              {/* Detected Objects */}
              {issue.detectedObjects?.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{
                    fontSize: '11px',
                    color: '#64748b',
                    fontWeight: 600,
                    marginBottom: '8px'
                  }}>
                    DETECTED OBJECTS
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {issue.detectedObjects.map((obj, i) => (
                      <span key={i} style={{
                        fontSize: '11px',
                        padding: '3px 10px',
                        background: 'rgba(59,130,246,0.15)',
                        color: '#93c5fd',
                        borderRadius: '20px',
                        border: '1px solid rgba(59,130,246,0.3)'
                      }}>
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence + Severity row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                    CONFIDENCE
                  </p>
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    height: '6px',
                    marginBottom: '4px'
                  }}>
                    <div style={{
                      width: `${Math.round((issue.ai_confidence || 0) * 100)}%`,
                      height: '100%',
                      background: '#3b82f6',
                      borderRadius: '4px'
                    }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#e2e8f0' }}>
                    {Math.round((issue.ai_confidence || 0) * 100)}%
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                    AI SEVERITY
                  </p>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: issue.ai_severity === 'critical' ? '#ef4444' :
                           issue.ai_severity === 'high' ? '#f97316' :
                           issue.ai_severity === 'medium' ? '#eab308' : '#22c55e'
                  }}>
                    {(issue.ai_severity || 'unknown').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Auto-routed department */}
              {issue.ai_department && (
                <div>
                  <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    AUTO-ROUTED TO
                  </p>
                  <p style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>
                    {issue.ai_department} Department
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Case Metadata</h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"><User size={16} className="text-gray-400" /></div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Reporter</div>
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{issue.citizen_email || 'Anonymous'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"><MapPin size={16} className="text-gray-400" /></div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Location</div>
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    {issue.latitude?.toFixed(4)}, {issue.longitude?.toFixed(4)}
                    {issue.location_name && <div className="text-xs font-normal text-gray-400 mt-0.5">{issue.location_name}</div>}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"><Calendar size={16} className="text-gray-400" /></div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Reported Date</div>
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{new Date(issue.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"><AlertTriangle size={16} className="text-gray-400" /></div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">AI Severity</div>
                  <div className={`text-sm font-bold uppercase ${issue.ai_severity === 'critical' ? 'text-red-500' : 'text-orange-500'}`}>
                    {issue.ai_severity || 'MEDIUM'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg"><FileText size={16} className="text-gray-400" /></div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">Category</div>
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{issue.ai_issue_type || 'General'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovIssueDetail;
