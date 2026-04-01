import { Resend } from 'resend';

// Note: This service should be called from the backend environment
// For frontend use, it will make API calls to the backend
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

// Helper function to generate HTML email templates
const generateEmailTemplate = (type, data) => {
  const { issue, recipient } = data;
  
  const baseStyles = `
    <style>
      body { 
        font-family: Georgia, serif; 
        background-color: #f5f2ed; 
        margin: 0; 
        padding: 20px; 
        color: #1f2937;
      }
      .container { 
        max-width: 600px; 
        margin: 0 auto; 
        background: white; 
        border-radius: 16px; 
        overflow: hidden; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .header { 
        background-color: #7c2d12; 
        color: white; 
        padding: 24px; 
        text-align: center; 
      }
      .header h1 { 
        margin: 0; 
        font-size: 24px; 
        font-weight: 600;
      }
      .content { 
        padding: 32px; 
      }
      .cta-button { 
        display: inline-block; 
        background-color: #c2410c; 
        color: white; 
        padding: 12px 24px; 
        text-decoration: none; 
        border-radius: 8px; 
        font-weight: 600;
        margin: 16px 0;
      }
      .blockquote { 
        border-left: 4px solid #c2410c; 
        padding-left: 16px; 
        margin: 16px 0; 
        font-style: italic;
        background-color: #fef2f2;
        padding: 16px;
        border-radius: 0 8px 8px 0;
      }
      .footer { 
        background-color: #f9fafb; 
        padding: 24px; 
        text-align: center; 
        font-size: 14px; 
        color: #6b7280;
      }
      .footer a { 
        color: #c2410c; 
        text-decoration: none;
      }
      .status-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        margin: 0 4px;
      }
      .status-pending { background-color: #fef3c7; color: #92400e; }
      .status-in-progress { background-color: #dbeafe; color: #1e40af; }
      .status-resolved { background-color: #d1fae5; color: #065f46; }
      .status-closed { background-color: #f3f4f6; color: #374151; }
    </style>
  `;

  const issueUrl = `${APP_URL}/issue/${issue.id}`;
  
  switch (type) {
    case 'statusChanged':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔄 Status Update on Your Report</h1>
            </div>
            <div class="content">
              <h2>${issue.title}</h2>
              <p>Your civic report has been updated!</p>
              
              <div style="margin: 24px 0;">
                <div style="display: flex; align-items: center; justify-content: space-between; background: #f9fafb; padding: 16px; border-radius: 8px;">
                  <span style="font-weight: 600;">Previous Status:</span>
                  <span class="status-badge status-${issue.previousStatus?.toLowerCase().replace(' ', '-')}">${issue.previousStatus || 'Pending'}</span>
                </div>
                <div style="text-align: center; margin: 8px 0;">↓</div>
                <div style="display: flex; align-items: center; justify-content: space-between; background: #f0fdf4; padding: 16px; border-radius: 8px;">
                  <span style="font-weight: 600;">New Status:</span>
                  <span class="status-badge status-${issue.status?.toLowerCase().replace(' ', '-')}">${issue.status}</span>
                </div>
              </div>
              
              <a href="${issueUrl}" class="cta-button">View Full Report</a>
              
              <p>This update means your issue is moving through the resolution process. Thank you for your patience and for helping improve our community.</p>
            </div>
            <div class="footer">
              <p>
                <a href="${APP_URL}/settings/notifications">Manage notification preferences</a> | 
                <a href="${APP_URL}/unsubscribe?user=${recipient.id}">Unsubscribe</a>
              </p>
              <p style="margin-top: 12px;">© 2024 CivicSutra. Building better communities together.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
    case 'newComment':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 New Comment on Your Report</h1>
            </div>
            <div class="content">
              <h2>${issue.title}</h2>
              <p>An official has added an update to your civic report:</p>
              
              <div class="blockquote">
                ${issue.comment}
              </div>
              
              <a href="${issueUrl}" class="cta-button">View Full Report</a>
              
              <p>This comment may contain important information about the resolution process or next steps for your issue.</p>
            </div>
            <div class="footer">
              <p>
                <a href="${APP_URL}/settings/notifications">Manage notification preferences</a> | 
                <a href="${APP_URL}/unsubscribe?user=${recipient.id}">Unsubscribe</a>
              </p>
              <p style="margin-top: 12px;">© 2024 CivicSutra. Building better communities together.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
    case 'issueResolved':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Your Issue Has Been Resolved!</h1>
            </div>
            <div class="content">
              <h2>${issue.title}</h2>
              <p style="font-size: 18px; color: #059669; font-weight: 600;">🎉 Great news! Your civic report has been marked as resolved.</p>
              
              <p>Thank you for your patience and for being an active citizen in helping improve our community. Your report has made a real difference!</p>
              
              <a href="${issueUrl}" class="cta-button">View Resolution Details</a>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #059669;">What's Next?</h3>
                <ul style="color: #374151;">
                  <li>Visit the report to see resolution details</li>
                  <li>Confirm if the issue is truly resolved</li>
                  <li>Share your experience to help others</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>
                <a href="${APP_URL}/settings/notifications">Manage notification preferences</a> | 
                <a href="${APP_URL}/unsubscribe?user=${recipient.id}">Unsubscribe</a>
              </p>
              <p style="margin-top: 12px;">© 2024 CivicSutra. Building better communities together.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
};

// Queue notification for digest
const queueForDigest = async (type, issueId, userId) => {
  try {
    const response = await fetch(`${APP_URL}/api/notifications/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        issueId,
        userId,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to queue notification');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error queueing notification:', error);
    throw error;
  }
};

// Send email via backend API
const sendEmailViaBackend = async (emailData) => {
  try {
    const response = await fetch(`${APP_URL}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Main notification trigger function
export const triggerNotification = async ({ type, issue, recipient }) => {
  try {
    // Check if user has opted out of this notification type
    const prefKey = type === 'statusChanged' ? 'status_changed' : 
                   type === 'newComment' ? 'new_comment' : 
                   type === 'issueResolved' ? 'issue_resolved' : null;
    
    if (!prefKey || !recipient.prefs[prefKey]) {
      console.log(`User ${recipient.id} has opted out of ${type} notifications`);
      return;
    }
    
    // Check if user has disabled email notifications
    if (recipient.prefs.email_digest === 'none') {
      console.log(`User ${recipient.id} has disabled email notifications`);
      return;
    }
    
    // Queue for digest if not instant
    if (recipient.prefs.email_digest !== 'instant') {
      await queueForDigest(type, issue.id, recipient.id);
      console.log(`Queued ${type} notification for digest`);
      return;
    }
    
    // Send email immediately
    const subject = type === 'statusChanged' ? `Update on your report: ${issue.title}` :
                   type === 'newComment' ? `New update on: ${issue.title}` :
                   type === 'issueResolved' ? `Resolved: ${issue.title} ✓` :
                   `Notification about: ${issue.title}`;
    
    const html = generateEmailTemplate(type, { issue, recipient });
    
    const emailData = {
      from: 'CivicSutra <notifications@civicsutra.in>',
      to: recipient.email,
      subject,
      html,
    };
    
    const result = await resend.emails.send(emailData);
    console.log(`Sent ${type} notification to ${recipient.email}:`, result);
    
    return result;
  } catch (error) {
    console.error(`Error sending ${type} notification:`, error);
    throw error;
  }
};

// Helper function to get user notification preferences
export const getNotificationPrefs = async (userId) => {
  try {
    const response = await fetch(`${APP_URL}/api/notifications/prefs?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notification preferences');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    // Return default preferences
    return {
      status_changed: true,
      new_comment: true,
      issue_resolved: true,
      email_digest: 'instant',
      email: null,
    };
  }
};
