import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "../../redux/slices/cartSlice";
import { addToCart, getCart } from "../../services/cartService";
import toast from "react-hot-toast";
import OtpModal from "../modals/OtpModal";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth.token);
  const [loading, setLoading] = useState(false);

  const add = async () => {
    if (!token) {
      localStorage.setItem(
        "pending_cart_action",
        JSON.stringify({ productId: product._id, quantity: 1 })
      );
      toast("Please create an account or login to add this product to your cart.");
      navigate("/login");
      return;
    }
    await performAdd();
  };

  const performAdd = async () => {
    try {
      setLoading(true);
      await addToCart({ productId: product._id, quantity: 1 });
      const r = await getCart();
      const cartData = r.data?.data || r.data || {};
      dispatch(setCart(cartData));
      toast.success("Added to cart");
      navigate("/cart");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card overflow-hidden group">
      <Link to={`/product/${product._id}`}>
        <img
          src={product.images?.[0] || "https://picsum.photos/seed/product/900/900"}
          className="w-full aspect-square object-cover group-hover:scale-[1.02] transition"
          alt={product.name}
        />
      </Link>
      <div className="p-4">
        <p className="text-xs text-slate-500">{product.brand}</p>
        <Link to={`/product/${product._id}`} className="font-semibold mt-1 block truncate">
          {product.name}
        </Link>
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-yellow-500 font-semibold">
            <span className="text-yellow-400">★</span>
            <span className="text-slate-700">{Number(product.rating).toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({product.reviewCount || 0} reviews)</span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="font-bold">₹{product.price}</span>
            {product.compareAtPrice > product.price && (
              <span className="ml-2 text-xs text-slate-400 line-through">
                ₹{product.compareAtPrice}
              </span>
            )}
          </div>
          <button onClick={add} disabled={loading} className="btn-light !p-2">
            <ShoppingBag size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
