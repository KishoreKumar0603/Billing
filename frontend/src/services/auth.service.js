import { api, tokenStore } from "./api";

export const authService = {
  // REGISTER
  async register(body) {
    const { data } = await api.post("/auth/register", body);

    return data;
  },

  // VERIFY OTP
  async verifyOtp(body) {
    const { data } = await api.post("/auth/verify-otp", body);

    if (data?.accessToken) {
      tokenStore.set(data.accessToken);
    }

    return data;
  },

  // RESEND OTP
  async resendOtp(body) {
    const { data } = await api.post("/auth/resend-otp", body);

    return data;
  },

  // LOGIN
  async login(body) {
    const { data } = await api.post("/auth/login", body);

    if (data?.accessToken) {
      tokenStore.set(data.accessToken);
    }

    return data;
  },

  // FORGOT PASSWORD
  async forgotPassword(body) {
    const { data } = await api.post("/auth/forgot-password", body);

    return data;
  },

  // RESET PASSWORD
  async resetPassword(token, body) {
    const { data } = await api.post(`/auth/reset-password/${token}`, body);

    return data;
  },

  // GET PROFILE
  async me() {
    const { data } = await api.post("/user/profile/");

    return data;
  },

  // CHANGE PASSWORD
  async changePassword(body) {
    const { data } = await api.post("/user/change-password/", body);

    return data;
  },

  // LOGOUT
  async logout() {
    await api.post("/auth/logout");
    tokenStore.clear();
  },

  googleLogin() {
    window.location.href = process.env.VITE_API_BASE_URL + "/auth/google";
  },
};
