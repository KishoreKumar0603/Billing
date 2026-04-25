import { mockApi } from "./mockApi";
export const customersService = {
  list: (q) => mockApi.listCustomers(q),
  get: (id) => mockApi.getCustomer(id),
  create: (c) => mockApi.createCustomer(c),
};
