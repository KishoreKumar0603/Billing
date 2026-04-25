/** Mock backend. Replace by wiring `api` calls in services to real endpoints. */
import {
  seedBills,
  seedCustomers,
  buildSummary,
  buildAnalytics,
} from "@/lib/mockData";

const KEY_C = "billingit_mock_customers";
const KEY_B = "billingit_mock_bills";
const KEY_U = "billingit_mock_user";

function load(k, fallback) {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function save(k, v) {
  localStorage.setItem(k, JSON.stringify(v));
}

function init() {
  if (!localStorage.getItem(KEY_C)) {
    const customers = seedCustomers();
    save(KEY_C, customers);
    save(KEY_B, seedBills(customers));
  }
}
init();

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  // Auth
  async register(body) {
    await delay();
    save(KEY_U, {
      id: "u1",
      name: body.name,
      email: body.email,
      phone: body.phone,
    });
    return { message: "OTP sent", email: body.email };
  },
  async verifyOtp(_) {
    await delay();
    return { accessToken: "mock-token-" + Date.now() };
  },
  async resendOtp(_) {
    await delay();
    return { message: "OTP resent" };
  },
  async login(body) {
    await delay();
    let u = load(KEY_U, null);
    if (!u) {
      u = { id: "u1", name: body.email.split("@")[0], email: body.email };
      save(KEY_U, u);
    }
    return { accessToken: "mock-token-" + Date.now(), user: u };
  },
  async forgotPassword(_) {
    await delay();
    return { message: "Reset link sent" };
  },
  async resetPassword(_) {
    await delay();
    return { message: "Password reset" };
  },
  async me() {
    await delay(200);
    return load(KEY_U, {
      id: "u1",
      name: "Demo User",
      email: "demo@billingit.app",
    });
  },
  async updateProfile(patch) {
    await delay();
    const u = { ...load(KEY_U, {}), ...patch };
    save(KEY_U, u);
    return u;
  },
  async logout() {
    await delay(100);
    return { ok: true };
  },

  // Dashboard
  async dashboardSummary() {
    await delay();
    return buildSummary(load(KEY_B, []));
  },
  async ordersAnalytics(range) {
    await delay();
    return { analytics: buildAnalytics(load(KEY_B, []), range, "orders") };
  },
  async revenueAnalytics(range) {
    await delay();
    return { analytics: buildAnalytics(load(KEY_B, []), range, "revenue") };
  },

  // Customers
  async listCustomers(q = "") {
    await delay();
    const arr = load(KEY_C, []);
    return q
      ? arr.filter((c) =>
          (c.name + c.phone).toLowerCase().includes(q.toLowerCase()),
        )
      : arr;
  },
  async getCustomer(id) {
    await delay();
    const customer = load(KEY_C, []).find((c) => c._id === id);
    const bills = load(KEY_B, []).filter((b) => b.customer._id === id);
    const totalBusiness = bills.reduce((s, b) => s + b.totalAmount, 0);
    const received = bills.reduce((s, b) => s + b.receivedAmount, 0);
    return {
      customer,
      analytics: {
        totalOrders: bills.length,
        totalBusinessAmount: totalBusiness,
        totalReceivedAmount: received,
        totalPendingAmount: totalBusiness - received,
      },
      recentBills: bills.slice(0, 10),
    };
  },
  async createCustomer(body) {
    await delay();
    const arr = load(KEY_C, []);
    const c = {
      _id: "c_" + Date.now(),
      createdAt: new Date().toISOString(),
      ...body,
    };
    arr.unshift(c);
    save(KEY_C, arr);
    return c;
  },

  // Bills
  async listBills(params = {}) {
    await delay();
    let arr = load(KEY_B, []);
    const {
      search,
      status,
      paymentStatus,
      customer,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = params;
    if (search)
      arr = arr.filter((b) =>
        (b.billNumber + " " + b.lotNumber + " " + b.customer.name)
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    if (status) arr = arr.filter((b) => b.status === status);
    if (paymentStatus)
      arr = arr.filter((b) => b.paymentStatus === paymentStatus);
    if (customer) arr = arr.filter((b) => b.customer._id === customer);
    arr.sort((a, b) => {
      const va = a[sortBy],
        vb = b[sortBy];
      return (order === "asc" ? 1 : -1) * (va > vb ? 1 : va < vb ? -1 : 0);
    });
    const total = arr.length;
    const start = (page - 1) * limit;
    return { bills: arr.slice(start, start + limit), total, page, limit };
  },
  async getBill(id) {
    await delay();
    return load(KEY_B, []).find((b) => b._id === id);
  },
  async createBill(body) {
    await delay();
    const arr = load(KEY_B, []);
    const customers = load(KEY_C, []);
    const cust = customers.find((c) => c._id === body.customer) || customers[0];
    const rows = body.rows.map((r) => ({ ...r, amount: r.quantity * r.rate }));
    const total = rows.reduce((s, r) => s + r.amount, 0);
    const received = body.receivedAmount || 0;
    const bill = {
      _id: "b_" + Date.now(),
      billNumber: `CH-${2024000 + arr.length + 1}`,
      customer: cust,
      lotNumber: body.lotNumber,
      vehicleNumber: body.vehicleNumber,
      fromName: body.fromName,
      address: body.address,
      rows,
      totalAmount: total,
      receivedAmount: received,
      balanceAmount: total - received,
      status: body.status || "working",
      paymentStatus:
        received === 0
          ? "not_received"
          : received < total
            ? "partially"
            : "received",
      notes: body.notes,
      createdAt: new Date().toISOString(),
    };
    arr.unshift(bill);
    save(KEY_B, arr);
    return bill;
  },
  async updateBill(id, body) {
    await delay();
    const arr = load(KEY_B, []);
    const idx = arr.findIndex((b) => b._id === id);
    if (idx < 0) throw new Error("Not found");
    const customers = load(KEY_C, []);
    const cust =
      typeof body.customer === "string"
        ? customers.find((c) => c._id === body.customer)
        : body.customer;
    const rows = (body.rows || arr[idx].rows).map((r) => ({
      ...r,
      amount: r.quantity * r.rate,
    }));
    const total = rows.reduce((s, r) => s + r.amount, 0);
    const received = body.receivedAmount ?? arr[idx].receivedAmount;
    arr[idx] = {
      ...arr[idx],
      ...body,
      customer: cust || arr[idx].customer,
      rows,
      totalAmount: total,
      receivedAmount: received,
      balanceAmount: total - received,
      paymentStatus:
        received === 0
          ? "not_received"
          : received < total
            ? "partially"
            : "received",
    };
    save(KEY_B, arr);
    return arr[idx];
  },
  async deleteBill(id) {
    await delay();
    const arr = load(KEY_B, []).filter((b) => b._id !== id);
    save(KEY_B, arr);
    return { ok: true };
  },
};
