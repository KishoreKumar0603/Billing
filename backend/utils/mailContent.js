export const setMailContent = (name, otp, emailType = "verification") => {
  const templates = {
    verification: {
      title: "Verify Your Billing-It Account",
      subject: "Billing - Verify your account",
      greeting: `Hello <strong>${name}</strong>,`,
      intro:
        "We received a request to verify your email address for your Billing-It account. Please use the OTP below to verify your account.",
      otpLabel: "Your OTP Code:",
    },
    resend: {
      title: "OTP Resend - Billing-It",
      subject: "Billing - OTP Resend",
      greeting: `Hello <strong>${name}</strong>,`,
      intro:
        "You requested to resend your OTP. Please use the code below to verify your email address.",
      otpLabel: "Your New OTP Code:",
    },
    otp: {
      title: "OTP Verification - Billing-It",
      subject: "Billing - OTP Verification",
      greeting: `Hello <strong>${name}</strong>,`,
      intro:
        "We received a request to verify your account. Please use the OTP below within the next 5 minutes.",
      otpLabel: "Your OTP Code:",
    },
  };

  const template = templates[emailType] || templates.verification;

  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Billing-It</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Secure Account Verification</p>
    </div>

    <!-- Main Content -->
    <div style="background-color: #ffffff; padding: 40px 30px; text-align: center;">
      <h2 style="color: #333; margin: 0 0 10px 0; font-size: 22px; font-weight: 600;">${template.title}</h2>
      
      <p style="color: #555; text-align: center; margin: 20px 0; font-size: 16px; line-height: 1.6;">
        ${template.greeting}
      </p>

      <p style="color: #666; text-align: center; margin: 15px 0 30px 0; font-size: 15px; line-height: 1.6;">
        ${template.intro}
      </p>

      <!-- OTP Display Box -->
      <div style="margin: 30px 0;">
        <p style="color: #333; font-size: 14px; margin: 0 0 12px 0; font-weight: 500;">${template.otpLabel}</p>
        
        <!-- OTP Code with Copy Button -->
        <div style="display: inline-block; width: 100%; max-width: 300px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; user-select: all; cursor: pointer;" title="Click to select OTP">
            ${otp}
          </div>
          
          <!-- Copy Button (Visual - for display in email clients that don't support JavaScript) -->
          <div style="background-color: #f0f0f0; color: #333; padding: 12px 20px; border-radius: 6px; font-size: 13px; font-weight: 500; border: 2px solid #667eea; cursor: pointer; display: inline-block; width: 100%; box-sizing: border-box; text-align: center;">
            📋 Click OTP above to select & copy
          </div>
        </div>
      </div>

      <!-- Important Info -->
      <div style="background-color: #f9f9f9; border-left: 4px solid #667eea; padding: 15px; margin: 25px 0; border-radius: 4px; text-align: left;">
        <p style="color: #555; margin: 0; font-size: 13px; line-height: 1.6;">
          <strong style="color: #667eea;">Important:</strong>
          <br/>• This OTP is valid for <strong>5 minutes only</strong>
          <br/>• Do not share this code with anyone
          <br/>• Billing-It will never ask for your OTP via email
        </p>
      </div>

      <!-- Warning Section -->
      <p style="color: #999; text-align: center; margin: 20px 0; font-size: 12px; line-height: 1.5;">
        If you did not request this verification, please ignore this email or contact support immediately.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
      <p style="color: #999; margin: 0; font-size: 11px;">
        &copy; 2026 Billing-It. All rights reserved.
        <br/>
        <a href="https://billing-it.com" style="color: #667eea; text-decoration: none;">Visit our website</a>
      </p>
    </div>
  </div>
`;
};
