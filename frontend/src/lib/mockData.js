const names = [
  "Ravi Textiles",
  "Krishna Garments",
  "Sharma Fabrics",
  "Lotus Apparel",
  "Diamond Weaves",
  "Om Cotton",
  "Silk Route Co",
  "Zenith Fashion",
  "Prime Threads",
  "Royal Looms",
];
const sizes = ["S", "M", "L", "XL", "XXL"];

export const seedCustomers = () =>
  names.map((n, i) => ({
    _id: `c_${i + 1}`,
    name: n,
    phone: `98${String(10000000 + i * 12345).slice(0, 8)}`,
    address: `${100 + i} Market Road, Surat`,
    notes: "",
    createdAt: new Date(Date.now() - i * 86400000 * 7).toISOString(),
  }));

export const seedBills = (customers) => {
  const bills = [];
  for (let i = 0; i < 24; i++) {
    const cust = customers[i % customers.length];
    const rows = Array.from({ length: 3 + (i % 3) }).map((_, j) => {
      const qty = 10 + (((i + j) * 7) % 40);
      const rate = 120 + (((i + j) * 13) % 200);
      return {
        label: sizes[j % sizes.length],
        quantity: qty,
        rate,
        amount: qty * rate,
      };
    });
    const total = rows.reduce((s, r) => s + (r.amount || 0), 0);
    const received =
      i % 4 === 0 ? 0 : i % 3 === 0 ? Math.floor(total / 2) : total;
    const paymentStatus =
      received === 0
        ? "not_received"
        : received < total
          ? "partially"
          : "received";
    const status = i % 5 === 0 ? "working" : "completed";
    bills.push({
      _id: `b_${i + 1}`,
      billNumber: `CH-${2024000 + i}`,
      customer: cust,
      lotNumber: `LOT-${500 + i}`,
      vehicleNumber: `GJ-05-${String(1000 + i).slice(-4)}`,
      fromName: "BillingIT Textiles",
      address: "Ring Road, Surat, Gujarat",
      rows,
      totalAmount: total,
      receivedAmount: received,
      balanceAmount: total - received,
      status: status,
      paymentStatus: paymentStatus,
      notes: "",
      createdAt: new Date(Date.now() - i * 86400000 * 1.3).toISOString(),
    });
  }
  return bills;
};

export const buildSummary = (bills) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todays = bills.filter((b) => new Date(b.createdAt) >= today);
  const totalRevenue = bills.reduce((s, b) => s + b.receivedAmount, 0);
  const pending = bills.reduce((s, b) => s + b.balanceAmount, 0);
  const total = bills.reduce((s, b) => s + b.totalAmount, 0);
  return {
    overview: {
      totalOrders: bills.length,
      completedOrders: bills.filter((b) => b.status === "completed").length,
      workingOrders: bills.filter((b) => b.status === "working").length,
      totalRevenue,
      pendingPayments: pending,
      totalBusinessAmount: total,
    },
    today: {
      orders: todays.length,
      revenue: todays.reduce((s, b) => s + b.receivedAmount, 0),
    },
  };
};

export const buildAnalytics = (bills, range, field) => {
  const days =
    range === "7days"
      ? 7
      : range === "30days"
        ? 30
        : range === "90days"
          ? 90
          : 365;
  const points = [];
  const step = days > 90 ? 30 : days > 30 ? 7 : 1;
  for (let i = days; i >= 0; i -= step) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const seed = (i * 7 + (field === "orders" ? 3 : 11)) % 97;
    const value = field === "orders" ? 5 + (seed % 25) : 8000 + seed * 450;
    points.push({ label, value });
  }
  return points;
};
