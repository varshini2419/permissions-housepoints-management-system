// backend/services/emailService.js
const nodemailer = require('nodemailer');

/**
 * Email Service Module
 * Handles all email notifications for the Campus Permission & House Point Management System
 */

// Create reusable transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials not configured. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // Only for development
    }
  });
};

// Common email sending function
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('📧 Email would be sent:', { to, subject });
      return {
        success: true,
        message: 'Email not sent (credentials missing) - Development mode',
        preview: { to, subject }
      };
    }

    const mailOptions = {
      from: `"Campus Permission System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
      preview: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send email when student submits a permission request
 * @param {string} studentEmail - Student's email address
 * @param {object} permissionData - Permission details
 * @returns {Promise<object>} Email sending result
 */
const sendPermissionSubmittedEmail = async (studentEmail, permissionData) => {
  const subject = 'Permission Request Submitted Successfully';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6cf7; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { margin-bottom: 10px; }
        .label { font-weight: bold; color: #4a6cf7; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .status { background-color: #ffc107; color: #000; padding: 5px 10px; border-radius: 3px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Permission Request Submitted</h2>
        </div>
        <div class="content">
          <p>Dear Student,</p>
          <p>Your permission request has been successfully submitted and is now pending approval.</p>
          
          <div class="details">
            <h3 style="margin-top: 0;">Request Details:</h3>
            <div class="detail-row"><span class="label">Request ID:</span> ${permissionData._id || 'N/A'}</div>
            <div class="detail-row"><span class="label">Title:</span> ${permissionData.title || 'N/A'}</div>
            <div class="detail-row"><span class="label">Type:</span> ${permissionData.permissionType || 'N/A'}</div>
            <div class="detail-row"><span class="label">From:</span> ${permissionData.fromDate ? new Date(permissionData.fromDate).toLocaleDateString() : 'N/A'}</div>
            <div class="detail-row"><span class="label">To:</span> ${permissionData.toDate ? new Date(permissionData.toDate).toLocaleDateString() : 'N/A'}</div>
            <div class="detail-row"><span class="label">Status:</span> <span class="status">Pending</span></div>
          </div>
          
          <p>You will be notified once your request is reviewed by the faculty and HOD.</p>
          <p>You can track the status of your request in the student dashboard.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from the Campus Permission System. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Campus Permission & House Point Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(studentEmail, subject, htmlContent);
};

/**
 * Send email when permission is approved
 * @param {string} studentEmail - Student's email address
 * @param {object} permissionData - Permission details
 * @returns {Promise<object>} Email sending result
 */
const sendPermissionApprovedEmail = async (studentEmail, permissionData) => {
  const subject = 'Permission Request Approved';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { margin-bottom: 10px; }
        .label { font-weight: bold; color: #28a745; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .status { background-color: #28a745; color: white; padding: 5px 10px; border-radius: 3px; display: inline-block; }
        .approved { background-color: #d4edda; color: #155724; padding: 15px; border-radius: 5px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Permission Request Approved</h2>
        </div>
        <div class="content">
          <p>Dear Student,</p>
          <div class="approved">
            <h3 style="margin: 0;">✓ Your permission request has been APPROVED</h3>
          </div>
          
          <div class="details">
            <h3 style="margin-top: 0;">Approved Request Details:</h3>
            <div class="detail-row"><span class="label">Request ID:</span> ${permissionData._id || 'N/A'}</div>
            <div class="detail-row"><span class="label">Title:</span> ${permissionData.title || 'N/A'}</div>
            <div class="detail-row"><span class="label">Type:</span> ${permissionData.permissionType || 'N/A'}</div>
            <div class="detail-row"><span class="label">From:</span> ${permissionData.fromDate ? new Date(permissionData.fromDate).toLocaleDateString() : 'N/A'}</div>
            <div class="detail-row"><span class="label">To:</span> ${permissionData.toDate ? new Date(permissionData.toDate).toLocaleDateString() : 'N/A'}</div>
            <div class="detail-row"><span class="label">Status:</span> <span class="status">Approved</span></div>
            ${permissionData.facultyRemarks ? `<div class="detail-row"><span class="label">Faculty Remarks:</span> ${permissionData.facultyRemarks}</div>` : ''}
            ${permissionData.hodRemarks ? `<div class="detail-row"><span class="label">HOD Remarks:</span> ${permissionData.hodRemarks}</div>` : ''}
          </div>
          
          <p>You may proceed with your planned activity during the approved period.</p>
          <p>Please carry this approval (physical or digital copy) when required.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from the Campus Permission System. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Campus Permission & House Point Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(studentEmail, subject, htmlContent);
};

/**
 * Send email when permission is rejected
 * @param {string} studentEmail - Student's email address
 * @param {object} permissionData - Permission details
 * @returns {Promise<object>} Email sending result
 */
const sendPermissionRejectedEmail = async (studentEmail, permissionData) => {
  const subject = 'Permission Request Rejected';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { margin-bottom: 10px; }
        .label { font-weight: bold; color: #dc3545; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .status { background-color: #dc3545; color: white; padding: 5px 10px; border-radius: 3px; display: inline-block; }
        .rejected { background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Permission Request Rejected</h2>
        </div>
        <div class="content">
          <p>Dear Student,</p>
          <div class="rejected">
            <h3 style="margin: 0;">✗ Your permission request has been REJECTED</h3>
          </div>
          
          <div class="details">
            <h3 style="margin-top: 0;">Request Details:</h3>
            <div class="detail-row"><span class="label">Request ID:</span> ${permissionData._id || 'N/A'}</div>
            <div class="detail-row"><span class="label">Title:</span> ${permissionData.title || 'N/A'}</div>
            <div class="detail-row"><span class="label">Type:</span> ${permissionData.permissionType || 'N/A'}</div>
            <div class="detail-row"><span class="label">From:</span> ${permissionData.fromDate ? new Date(permissionData.fromDate).toLocaleDateString() : 'N/A'}</div>
            <div class="detail-row"><span class="label">To:</span> ${permissionData.toDate ? new Date(permissionData.toDate).toLocaleDateString() : 'N/A'}</div>
            <div class="detail-row"><span class="label">Status:</span> <span class="status">Rejected</span></div>
            <div class="detail-row"><span class="label">Rejection Reason:</span> ${permissionData.rejectionReason || permissionData.facultyRemarks || permissionData.hodRemarks || 'No reason provided'}</div>
          </div>
          
          <p>If you have any questions, please contact your class teacher or HOD for clarification.</p>
          <p>You may submit a new request addressing the concerns mentioned in the rejection reason.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from the Campus Permission System. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Campus Permission & House Point Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(studentEmail, subject, htmlContent);
};

/**
 * Send email when activity is approved and points are assigned
 * @param {string} studentEmail - Student's email address
 * @param {object} activityData - Activity details
 * @param {number} points - Points awarded
 * @returns {Promise<object>} Email sending result
 */
const sendActivityApprovedEmail = async (studentEmail, activityData, points) => {
  const subject = 'Activity Approved & House Points Assigned';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { margin-bottom: 10px; }
        .label { font-weight: bold; color: #28a745; }
        .points-box { background-color: #ffc107; color: #000; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
        .points-number { font-size: 48px; font-weight: bold; color: #000; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Activity Approved & Points Awarded</h2>
        </div>
        <div class="content">
          <p>Dear Student,</p>
          <p>Congratulations! Your activity has been approved and house points have been assigned.</p>
          
          <div class="points-box">
            <div style="font-size: 18px;">Points Awarded</div>
            <div class="points-number">+${points}</div>
          </div>
          
          <div class="details">
            <h3 style="margin-top: 0;">Activity Details:</h3>
            <div class="detail-row"><span class="label">Activity ID:</span> ${activityData._id || 'N/A'}</div>
            <div class="detail-row"><span class="label">Title:</span> ${activityData.title || 'N/A'}</div>
            <div class="detail-row"><span class="label">Type:</span> ${activityData.activityType || 'N/A'}</div>
            <div class="detail-row"><span class="label">Date:</span> ${activityData.date ? new Date(activityData.date).toLocaleDateString() : 'N/A'}</div>
            ${activityData.facultyRemarks ? `<div class="detail-row"><span class="label">Faculty Remarks:</span> ${activityData.facultyRemarks}</div>` : ''}
          </div>
          
          <p>Keep up the great work! Continue participating in activities to earn more house points.</p>
          <p>You can view your updated house points in the student dashboard.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from the Campus Permission System. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Campus Permission & House Point Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(studentEmail, subject, htmlContent);
};

/**
 * Send email when activity is rejected
 * @param {string} studentEmail - Student's email address
 * @param {object} activityData - Activity details
 * @returns {Promise<object>} Email sending result
 */
const sendActivityRejectedEmail = async (studentEmail, activityData) => {
  const subject = 'Activity Submission Rejected';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .detail-row { margin-bottom: 10px; }
        .label { font-weight: bold; color: #dc3545; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Activity Submission Rejected</h2>
        </div>
        <div class="content">
          <p>Dear Student,</p>
          <p>Your activity submission has been reviewed and rejected.</p>
          
          <div class="details">
            <h3 style="margin-top: 0;">Activity Details:</h3>
            <div class="detail-row"><span class="label">Activity ID:</span> ${activityData._id || 'N/A'}</div>
            <div class="detail-row"><span class="label">Title:</span> ${activityData.title || 'N/A'}</div>
            <div class="detail-row"><span class="label">Type:</span> ${activityData.activityType || 'N/A'}</div>
            <div class="detail-row"><span class="label">Date:</span> ${activityData.date ? new Date(activityData.date).toLocaleDateString() : 'N/A'}</div>
            <div class="detail-row"><span class="label">Rejection Reason:</span> ${activityData.facultyRemarks || activityData.rejectionReason || 'No reason provided'}</div>
          </div>
          
          <p>Please review the rejection reason and submit a new activity with correct information or proper proof.</p>
          <p>If you have any questions, please contact your class teacher.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from the Campus Permission System. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Campus Permission & House Point Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(studentEmail, subject, htmlContent);
};

/**
 * Send email to faculty about pending approvals
 * @param {string} facultyEmail - Faculty's email address
 * @param {number} pendingPermissions - Count of pending permissions
 * @param {number} pendingActivities - Count of pending activities
 * @returns {Promise<object>} Email sending result
 */
const sendPendingApprovalsReminderEmail = async (facultyEmail, pendingPermissions, pendingActivities) => {
  const subject = 'Reminder: Pending Approvals Require Your Attention';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ffc107; color: #000; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .stats { display: flex; justify-content: space-around; margin: 30px 0; }
        .stat-box { text-align: center; padding: 20px; background-color: white; border-radius: 5px; flex: 1; margin: 0 10px; }
        .stat-number { font-size: 36px; font-weight: bold; }
        .stat-label { font-size: 14px; color: #666; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Pending Approvals Reminder</h2>
        </div>
        <div class="content">
          <p>Dear Faculty Member,</p>
          <p>You have pending approvals that require your attention.</p>
          
          <div class="stats">
            <div class="stat-box">
              <div class="stat-number" style="color: #ffc107;">${pendingPermissions}</div>
              <div class="stat-label">Pending Permission Requests</div>
            </div>
            <div class="stat-box">
              <div class="stat-number" style="color: #28a745;">${pendingActivities}</div>
              <div class="stat-label">Pending Activity Submissions</div>
            </div>
          </div>
          
          <p>Please log in to the faculty dashboard to review and process these requests.</p>
          <p>Timely approvals help maintain smooth campus operations and student engagement.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from the Campus Permission System. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Campus Permission & House Point Management System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(facultyEmail, subject, htmlContent);
};

module.exports = {
  sendPermissionSubmittedEmail,
  sendPermissionApprovedEmail,
  sendPermissionRejectedEmail,
  sendActivityApprovedEmail,
  sendActivityRejectedEmail,
  sendPendingApprovalsReminderEmail
};