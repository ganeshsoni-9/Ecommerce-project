import api from "./api";

export const getAddresses = async () => {
  const { data } = await api.get("/addresses");
  return data;
};

export const getAddressById = async (id) => {
  const { data } = await api.get(`/addresses/${id}`);
  return data;
};

export const createAddress = async (addressData) => {
  const { data } = await api.post("/addresses", addressData);
  return data;
};

export const updateAddress = async (id, addressData) => {
  const { data } = await api.put(`/addresses/${id}`, addressData);
  return data;
};

export const setDefaultAddress = async (id) => {
  const { data } = await api.patch(`/addresses/${id}/default`);
  return data;
};

export const deleteAddress = async (id) => {
  const { data } = await api.delete(`/addresses/${id}`);
  return data;
};
