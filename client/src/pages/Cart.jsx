import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getCart,
  updateCart,
  removeCart,
} from "../services/cartService";
import { setCart } from "../redux/slices/cartSlice";
import { Link } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";
import toast from "react-hot-toast";

export default function Cart() {
  const items = useSelector((state) => state.cart.items || []);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // ==========================================
  // LOAD CART
  // ==========================================
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);

        const response = await getCart();

        const cartData = response?.data?.data || response?.data || {};

        dispatch(setCart(cartData));
      } catch (error) {
        console.error("Failed to load cart:", error);

        toast.error(
          error?.response?.data?.message || "Failed to load cart"
        );
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [dispatch]);

  // ==========================================
  // REFRESH CART
  // ==========================================
  const refreshCart = async () => {
    try {
      const response = await getCart();

      const cartData = response?.data?.data || response?.data || {};

      dispatch(setCart(cartData));
    } catch (error) {
      console.error("Failed to refresh cart:", error);

      toast.error(
        error?.response?.data?.message || "Failed to refresh cart"
      );
    }
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================
  const handleQuantityChange = async (productId, quantity) => {
    const newQuantity = Number(quantity);

    if (!newQuantity || newQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    try {
      setUpdatingId(productId);

      await updateCart(productId, {
        quantity: newQuantity,
      });

      await refreshCart();

      toast.success("Cart updated");
    } catch (error) {
      console.error("Failed to update cart:", error);

      toast.error(
        error?.response?.data?.message || "Failed to update cart"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // REMOVE ITEM
  // ==========================================
  const handleRemove = async (productId) => {
    try {
      setUpdatingId(productId);

      await removeCart(productId);

      await refreshCart();

      toast.success("Product removed from cart");
    } catch (error) {
      console.error("Failed to remove product:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to remove product"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // SUBTOTAL
  // ==========================================
  const subtotal = items.reduce((total, item) => {
    const price = Number(item?.product?.price || 0);
    const quantity = Number(item?.quantity || 0);

    return total + price * quantity;
  }, 0);

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="flex justify-center items-center min-h-60">
          <div className="text-slate-500">
            Loading your cart...
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // EMPTY CART
  // ==========================================
  if (!items.length) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Your cart is empty"
          text="Explore the collection and add something you love."
        />

        <div className="text-center mt-5">
          <Link className="btn-primary" to="/shop">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // CART UI
  // ==========================================
  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-indigo-600 font-semibold">
            SHOPPING CART
          </p>

          <h1 className="text-4xl font-black mt-1">
            Your cart
          </h1>
        </div>

        <Link
          to="/shop"
          className="hidden sm:inline-flex text-sm font-semibold text-slate-600 hover:text-indigo-600"
        >
          Continue shopping →
        </Link>
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        {/* ==========================================
            CART ITEMS
        ========================================== */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const product = item?.product;

            if (!product) return null;

            const isUpdating = updatingId === product._id;

            return (
              <div
                className="card p-4 flex flex-col sm:flex-row gap-4 sm:items-center"
                key={product._id}
              >
                {/* Product Image */}
                <img
                  src={product.images?.[0]}
                  className="w-24 h-24 rounded-xl object-cover bg-slate-100"
                  alt={product.name}
                />

                {/* Product Information */}
                <div className="flex-1">
                  <Link
                    to={`/product/${product._id}`}
                    className="font-bold hover:text-indigo-600"
                  >
                    {product.name}
                  </Link>

                  {product.brand && (
                    <p className="text-sm text-slate-500 mt-1">
                      {product.brand}
                    </p>
                  )}

                  <p className="font-semibold mt-2">
                    ₹{Number(product.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-500">
                    Qty
                  </label>

                  <input
                    className="input !w-20"
                    type="number"
                    min="1"
                    value={item.quantity}
                    disabled={isUpdating}
                    onChange={(e) =>
                      handleQuantityChange(
                        product._id,
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* Remove */}
                <button
                  type="button"
                  disabled={isUpdating}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold disabled:opacity-50"
                  onClick={() => handleRemove(product._id)}
                >
                  {isUpdating ? "Updating..." : "Remove"}
                </button>
              </div>
            );
          })}
        </div>

        {/* ==========================================
            ORDER SUMMARY
        ========================================== */}
        <div className="card p-6 h-fit">
          <h2 className="font-bold text-xl">
            Order summary
          </h2>

          <div className="flex justify-between mt-5 text-slate-600">
            <span>Items</span>

            <span>{items.length}</span>
          </div>

          <div className="flex justify-between mt-3 text-slate-600">
            <span>Subtotal</span>

            <b className="text-slate-900">
              ₹{subtotal.toLocaleString("en-IN")}
            </b>
          </div>

          <div className="border-t border-slate-200 my-5" />

          <div className="flex justify-between text-lg">
            <span className="font-semibold">
              Total
            </span>

            <b>
              ₹{subtotal.toLocaleString("en-IN")}
            </b>
          </div>

          <p className="text-xs text-slate-500 mt-3">
            Taxes and shipping charges will be calculated
            during checkout.
          </p>

          <Link
            to="/checkout"
            className="btn-primary w-full mt-6 text-center"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
