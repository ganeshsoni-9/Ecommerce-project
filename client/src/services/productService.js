import api from "./api";

// ======================================================
// GET ALL PRODUCTS
// ======================================================

export const getProducts = async (params = {}) => {
  const { data } = await api.get("/products", {
    params,
  });

  return data;
};

// ======================================================
// LIST PRODUCTS
// Alias used by Home / Shop pages
// ======================================================

export const listProducts = async (params = {}) => {
  const { data } = await api.get("/products", {
    params,
  });

  return data;
};

// ======================================================
// GET FEATURED PRODUCTS
// ======================================================

export const featured = async (params = {}) => {
  const { data } = await api.get("/products", {
    params: {
      ...params,
      isFeatured: true,
    },
  });

  return data;
};

// ======================================================
// GET PRODUCT BY ID
// ======================================================

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);

  return data;
};

// ======================================================
// GET SINGLE PRODUCT
// Alias used by ProductDetails.jsx
// ======================================================

export const getProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);

  return data;
};

// ======================================================
// CREATE PRODUCT
// Admin
// ======================================================

export const createProduct = async (product) => {
  const { data } = await api.post("/products", product);

  return data;
};

// ======================================================
// UPDATE PRODUCT
// Admin
// ======================================================

export const updateProduct = async (id, product) => {
  const { data } = await api.put(
    `/products/${id}`,
    product
  );

  return data;
};

// ======================================================
// DELETE PRODUCT
// Admin
// ======================================================

export const deleteProduct = async (id) => {
  const { data } = await api.delete(
    `/products/${id}`
  );

  return data;
};
