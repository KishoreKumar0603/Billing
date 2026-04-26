import { api } from "./api";

export const billsService = {
  /*
  ==========================================
  GET ALL BILLS
  ==========================================
  BACKEND:
  GET /bill
  */

  async list(params = {}) {
    const { data } = await api.get("/bill", {
      params,
    });

    return data;
  },

  /*
  ==========================================
  GET SINGLE BILL
  ==========================================
  BACKEND:
  GET /bill/:id
  */

  async get(id) {
    const { data } = await api.get(
      `/bill/${id}`
    );

    return data;
  },

  /*
  ==========================================
  CREATE BILL
  ==========================================
  BACKEND:
  POST /bill
  */

  async create(billData) {
    const { data } = await api.post(
      "/bill",
      billData
    );

    return data;
  },

  /*
  ==========================================
  UPDATE BILL
  ==========================================
  BACKEND:
  PUT /bill/:id
  */

  async update(id, billData) {
    const { data } = await api.put(
      `/bill/${id}`,
      billData
    );

    return data;
  },

  /*
  ==========================================
  DELETE BILL
  ==========================================
  BACKEND:
  DELETE /bill/:id
  */

  async remove(id) {
    const { data } = await api.delete(
      `/bill/${id}`
    );

    return data;
  },

  /*
  ==========================================
  DOWNLOAD BILL PDF
  ==========================================
  BACKEND:
  GET /bill/:id/pdf
  */

  async downloadPdf(id) {
    const response = await api.get(
      `/bill/${id}/pdf`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  },
};