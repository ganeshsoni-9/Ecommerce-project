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
  quantity = 1
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
    };
  }

  // ID format
  // Example:
  // addToCart("123", 2)
  else {
    payload = {
      productId: productOrData,
      quantity: Number(quantity) || 1,
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
//
// Example:
// updateCartItem(productId, 2)
// ======================================================

export const updateCartItem = async (
  productId,
  quantity
) => {
  const { data } = await api.put(
    `/cart/${productId}`,
    {
      quantity: Number(quantity),
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
  quantityOrData
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
    Number(quantity)
  );
};

// ======================================================
// REMOVE CART ITEM
//
// Example:
// removeFromCart(productId)
// ======================================================

export const removeFromCart = async (
  productId
) => {
  const { data } = await api.delete(
    `/cart/${productId}`
  );

  return data;
};

// ======================================================
// REMOVE CART
//
// Alias used by Cart.jsx
// ======================================================

export const removeCart = async (
  productId
) => {
  return removeFromCart(productId);
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
