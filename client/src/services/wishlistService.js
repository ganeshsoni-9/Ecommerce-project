import api from "./api";

export const getWishlist = async () => {
  const { data } = await api.get("/wishlist");
  return data;
};

export const toggleWishlist = async (productId) => {
  const { data } = await api.post("/wishlist", { productId });
  return data;
};
