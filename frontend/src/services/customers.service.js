import { api } from "./api";

export const customersService = {
  /*
  ==========================================
  GET ALL CUSTOMERS
  ==========================================

  IMPORTANT:
  Replace endpoint if your backend route differs.

  Example backend:
  GET /customer
  */

  async list(search = "") {
    const { data } = await api.get(
      "/customer",
      {
        params: {
          search,
        },
      }
    );

    return data;
  },

  /*
  ==========================================
  GET SINGLE CUSTOMER
  ==========================================

  Example backend:
  GET /customer/:id
  */

  async get(id) {
    const { data } = await api.get(
      `/customer/${id}`
    );

    return data;
  },

  /*
  ==========================================
  CREATE CUSTOMER
  ==========================================

  Example backend:
  POST /customer
  */

  async create(customerData) {
    const { data } = await api.post(
      "/customer",
      customerData
    );

    return data;
  },

  /*
  ==========================================
  UPDATE CUSTOMER
  ==========================================

  OPTIONAL:
  Use only if backend exists
  */

  async update(id, customerData) {
    const { data } = await api.put(
      `/customer/${id}`,
      customerData
    );

    return data;
  },

  /*
  ==========================================
  DELETE CUSTOMER
  ==========================================

  OPTIONAL:
  Use only if backend exists
  */

  async remove(id) {
    const { data } = await api.delete(
      `/customer/${id}`
    );

    return data;
  },
};