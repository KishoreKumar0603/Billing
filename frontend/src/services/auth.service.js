import { mockApi } from "./mockApi";
import { tokenStore } from "./api";

export const authService = {
  async register(body) {
    return mockApi.register(body);
  },
  async verifyOtp(body) {
    const r = await mockApi.verifyOtp(body);
    tokenStore.set(r.accessToken);
    return r;
  },
  async resendOtp(body) {
    return mockApi.resendOtp(body);
  },
  async login(body) {
    const r = await mockApi.login(body);
    tokenStore.set(r.accessToken);
    return r;
  },
  async googleLogin() {
    const r = await mockApi.login({ email: "google@billingit.app" });
    tokenStore.set(r.accessToken);
    return r;
  },
  async forgotPassword(body) {
    return mockApi.forgotPassword(body);
  },
  async resetPassword(body) {
    return mockApi.resetPassword(body);
  },
  async me() {
    return mockApi.me();
  },
  async updateProfile(p) {
    return mockApi.updateProfile(p);
  },
  async logout() {
    await mockApi.logout();
    tokenStore.clear();
  },
};
