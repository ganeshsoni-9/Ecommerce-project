import api from "./api";

// ======================================================
// GET CART
// ======================================================

export const getCart = async () => {
  const { data } = await api.get("/cart");
  return data;
};

// ======================================================
// ADD TO CART
//
// Supports both:
//
// addToCart(productId, quantity)
// addToCart({ productId, quantity })
// ======================================================

export const addToCart = async (
  productOrData,
  quantity = 1,
  size = "",
  color = ""
) => {
  let payload;

  // Object format
  // Example:
  // addToCart({
  //   productId: "123",
  //   quantity: 2
  // })
  if (
    productOrData !== null &&
    typeof productOrData === "object"
  ) {
    payload = {
      productId: productOrData.productId,
      quantity: Number(productOrData.quantity) || 1,
      size: productOrData.size || "",
      color: productOrData.color || "",
    };
  }

  // ID format
  // Example:
  // addToCart("123", 2)
  else {
    payload = {
      productId: productOrData,
      quantity: Number(quantity) || 1,
      size: size || "",
      color: color || "",
    };
  }

  const { data } = await api.post(
    "/cart/add",
    payload
  );

  return data;
};

// ======================================================
// UPDATE CART ITEM
// ======================================================

export const updateCartItem = async (
  productId,
  quantity,
  size = "",
  color = ""
) => {
  const { data } = await api.put(
    `/cart/${productId}`,
    {
      quantity: Number(quantity),
      size,
      color,
    }
  );

  return data;
};

// ======================================================
// UPDATE CART
//
// Alias used by Cart.jsx
//
// Supports:
// updateCart(productId, quantity)
//
// Also supports:
// updateCart(productId, { quantity })
// ======================================================

export const updateCart = async (
  productId,
  quantityOrData,
  size = "",
  color = ""
) => {
  let quantity;

  if (
    quantityOrData !== null &&
    typeof quantityOrData === "object"
  ) {
    quantity = quantityOrData.quantity;
  } else {
    quantity = quantityOrData;
  }

  return updateCartItem(
    productId,
    Number(quantity),
    size,
    color
  );
};

// ======================================================
// REMOVE CART ITEM
//
// Example:
// removeFromCart(productId)
// ======================================================

export const removeFromCart = async (
  productId,
  size = "",
  color = ""
) => {
  const { data } = await api.delete(
    `/cart/${productId}`,
    {
      params: { size, color }
    }
  );

  return data;
};

// ======================================================
// REMOVE CART
//
// Alias used by Cart.jsx
// ======================================================

export const removeCart = async (
  productId,
  size = "",
  color = ""
) => {
  return removeFromCart(productId, size, color);
};

// ======================================================
// CLEAR ENTIRE CART
// ======================================================

export const clearCart = async () => {
  const { data } = await api.delete("/cart");

  return data;
};

// ======================================================
// CLEAR CART ITEMS
//
// Optional alias
// ======================================================

export const clearCartItems = async () => {
  return clearCart();
};
