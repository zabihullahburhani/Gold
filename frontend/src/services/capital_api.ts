// frontend/src/services/capital_api.ts
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
const API_URL = `${API_BASE}/api/v1/capital`;

export const fetchCapitals = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createCapital = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const updateCapital = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};

export const deleteCapital = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
