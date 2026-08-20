import { useEffect, useState } from "react";
import { getWishlist, toggleWishlist } from "../services/wishlistService";
import { addToCart } from "../services/cartService";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";
import { Heart, ShoppingCart, Trash2, Tag } from "lucide-react";
import { useSelector } from "react-redux";

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const token = useSelector((s) => s.auth.token);
  const navigate = useNavigate();

  const loadWishlist = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await getWishlist();
      setProducts(res.data?.products || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [token]);

  const handleRemove = async (productId) => {
    try {
      setActionId(productId);
      await toggleWishlist(productId);
      toast.success("Removed from wishlist");
      
      // Update local state
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
    } finally {
      setActionId(null);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      setActionId(productId);
      await addToCart(productId, 1);
      toast.success("Added to cart successfully");
      navigate("/cart");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-20 flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container-page py-20 max-w-xl mx-auto text-center">
        <div className="card p-10 bg-white border rounded-3xl">
          <Heart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Please login to view wishlist</h2>
          <p className="text-slate-500 mt-2">Create an account or login to save your favorite collections.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link className="btn-primary" to="/login">Login</Link>
            <Link className="btn-light" to="/shop">Shop Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 bg-slate-50 min-h-screen">
      <div className="border-b border-slate-200 pb-5 mb-8">
        <span className="text-indigo-600 font-bold uppercase tracking-wider text-xs">Customer Profile</span>
        <h1 className="text-4xl font-black text-slate-900 mt-1">My Wishlist</h1>
        <p className="text-slate-500 text-sm mt-1.5">View your saved items and add them to your cart when ready.</p>
      </div>

      {products.length === 0 ? (
        <div className="card p-10 text-center max-w-xl mx-auto bg-white border rounded-3xl">
          <Heart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 font-sans">Your wishlist is empty</h2>
          <p className="text-slate-500 mt-2">Explore the shop to find designs and products to add here.</p>
          <Link className="btn-primary mt-6" to="/shop">
            Explore Shop
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const isProcessing = actionId === product._id;
            return (
              <div
                key={product._id}
                className="card flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-lg transition duration-300 relative"
              >
                {/* Remove button absolute badge */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleRemove(product._id)}
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white text-slate-500 hover:text-red-650 p-2 rounded-full border shadow-sm z-10"
                  title="Remove from wishlist"
                >
                  <Trash2 size={15} />
                </button>

                {/* Product Image */}
                <Link to={`/product/${product._id}`} className="block overflow-hidden bg-slate-50">
                  <img
                    src={product.images?.[0] || "https://picsum.photos/seed/product/900/900"}
                    alt={product.name}
                    className="w-full aspect-square object-cover hover:scale-105 transition duration-500"
                  />
                </Link>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      {product.brand || "Category"}
                    </span>
                    <Link
                      to={`/product/${product._id}`}
                      className="font-bold text-slate-900 hover:text-indigo-600 block mt-1 leading-snug line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-extrabold text-slate-900">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>
                      {product.compareAtPrice > product.price && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{Number(product.compareAtPrice).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing || product.stock <= 0}
                    onClick={() => handleAddToCart(product._id)}
                    className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShoppingCart size={13} />
                    {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}