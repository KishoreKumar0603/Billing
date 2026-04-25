export const setMailContent = (name, otp) => {
    return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="text-align: center; color:rgb(0, 0, 0);">Billing-It - OTP Verification</h2>
    <p style="color: #333; text-align: center;">Hello <strong>${name}</strong>,</p>
    <p style="color: #555; text-align: center;">We received a request to verify your email address for your Billing-It account.</p>

    <p style="text-align: center; font-size: 18px; color: #333; font-weight: bold;">Your OTP Code:</p>
    <div style="text-align: center; background: rgba(124, 124, 124, 0.82); color: white; padding: 15px; font-size: 24px; font-weight: bold; border-radius: 5px;">
      ${otp}
    </div>

    <div style="text-align: center; margin-top: 15px;">
      <span style="background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 4px; display: inline-block; font-weight: bold;">
        Copy this OTP manually
      </span>
    </div>

    <p style="text-align: center; color: #777; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.</p>

    <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="text-align: center; font-size: 12px; color: #999;">If you did not request this, please ignore this email.</p>
    <p style="text-align: center; font-size: 12px; color: #999;">&copy; 2025 Billing-It. All rights reserved.</p>
  </div>
`
}