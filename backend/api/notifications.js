require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const router = express.Router();

// Initialize Resend with server-side API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// GET /api/notifications/prefs?userId=xxx
router.get('/prefs', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const { data, error } = await supabase
      .from('notification_prefs')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }
    
    // Return existing prefs or default prefs if not found
    const prefs = data || {
      status_changed: true,
      new_comment: true,
      issue_resolved: true,
      email_digest: 'instant',
      email: null,
    };
    
    res.json(prefs);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// POST /api/notifications/prefs
router.post('/prefs', async (req, res) => {
  try {
    const { 
      userId, 
      statusChanged, 
      newComment, 
      issueResolved, 
      emailDigest, 
      email 
    } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const prefsData = {
      user_id: userId,
      status_changed: statusChanged !== undefined ? statusChanged : true,
      new_comment: newComment !== undefined ? newComment : true,
      issue_resolved: issueResolved !== undefined ? issueResolved : true,
      email_digest: emailDigest || 'instant',
      email: email || null,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('notification_prefs')
      .upsert(prefsData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.json({ ok: true, data });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// POST /api/notifications/queue
router.post('/queue', async (req, res) => {
  try {
    const { type, issueId, userId } = req.body;
    
    if (!type || !issueId || !userId) {
      return res.status(400).json({ error: 'type, issueId, and userId are required' });
    }
    
    const queueData = {
      user_id: userId,
      type,
      issue_id: issueId,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('notification_queue')
      .insert(queueData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.json({ ok: true, data });
  } catch (error) {
    console.error('Error queueing notification:', error);
    res.status(500).json({ error: 'Failed to queue notification' });
  }
});

// GET /api/notifications/queue?userId=xxx (for digest processing)
router.get('/queue', async (req, res) => {
  try {
    const { userId, sent = false } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const { data, error } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('user_id', userId)
      .eq('sent', sent === 'true')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching notification queue:', error);
    res.status(500).json({ error: 'Failed to fetch notification queue' });
  }
});

// POST /api/notifications/queue/:id/mark-sent
router.post('/queue/:id/mark-sent', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('notification_queue')
      .update({ sent: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.json({ ok: true, data });
  } catch (error) {
    console.error('Error marking notification as sent:', error);
    res.status(500).json({ error: 'Failed to mark notification as sent' });
  }
});

// POST /api/notifications/send
router.post('/send', async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'to, subject, and html are required' });
    }
    
    const emailData = {
      from: 'CivicSutra <notifications@civicsutra.in>',
      to,
      subject,
      html,
    };
    
    const result = await resend.emails.send(emailData);
    
    res.json({ ok: true, data: result });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;
