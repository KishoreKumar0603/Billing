import { mockApi } from "./mockApi";
export const billsService = {
  list: (p) => mockApi.listBills(p),
  get: (id) => mockApi.getBill(id),
  create: (b) => mockApi.createBill(b),
  update: (id, b) => mockApi.updateBill(id, b),
  remove: (id) => mockApi.deleteBill(id),
};
