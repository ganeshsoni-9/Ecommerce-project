import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  Package,
  ShieldCheck,
  Truck,
  Star,
} from "lucide-react";
import { getProduct } from "../services/productService";
import { addToCart, getCart } from "../services/cartService";
import { useDispatch } from "react-redux";
import { setCart } from "../redux/slices/cartSlice";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const dispatch = useDispatch();

  // ======================================================
  // GET PRODUCT
  // ======================================================

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);

        const response = await getProduct(id);

        // API response:
        // {
        //   success: true,
        //   data: {...product}
        // }

        setProduct(response?.data || null);
      } catch (error) {
        console.error("Failed to load product:", error);

        toast.error(
          error.response?.data?.message ||
            "Unable to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  // ======================================================
  // ADD TO CART
  // ======================================================

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAdding(true);

      // cartService expects:
      // addToCart(productId, quantity)

      await addToCart(product._id, quantity);

      // Refresh cart after adding product
      const cartResponse = await getCart();

      // API response:
      // {
      //   success: true,
      //   data: {...cart}
      // }

      dispatch(setCart(cartResponse?.data || null));

      toast.success("Product added to cart");
    } catch (error) {
      console.error("Add to cart error:", error);

      toast.error(
        error.response?.data?.message ||
          "Please login to add products to cart"
      );
    } finally {
      setAdding(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return <Loader />;
  }

  // ======================================================
  // PRODUCT NOT FOUND
  // ======================================================

  if (!product) {
    return (
      <div className="container-page py-20">
        <div className="card p-10 text-center">
          <h1 className="text-2xl font-black">
            Product not found
          </h1>

          <p className="text-slate-500 mt-3">
            The product you are looking for does not exist
            or has been removed.
          </p>

          <Link
            to="/shop"
            className="btn-primary inline-flex mt-6"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const image =
    product.images?.[0] ||
    "https://picsum.photos/seed/product/900/900";

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container-page py-10">
      {/* ==================================================
          BACK TO SHOP
      ================================================== */}

      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 mb-8"
      >
        <ArrowLeft size={17} />
        Back to Shop
      </Link>

      {/* ==================================================
          PRODUCT
      ================================================== */}

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* PRODUCT IMAGE */}

        <div>
          <div className="overflow-hidden rounded-3xl bg-slate-100">
            <img
              src={image}
              className="w-full aspect-square object-cover"
              alt={product.name}
            />
          </div>

          {/* Additional images */}

          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {product.images.slice(0, 4).map(
                (img, index) => (
                  <div
                    key={`${img}-${index}`}
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* PRODUCT INFORMATION */}

        <div className="py-2 md:py-5">
          {/* Brand */}

          {product.brand && (
            <p className="text-indigo-600 font-semibold uppercase tracking-wide text-sm">
              {product.brand}
            </p>
          )}

          {/* Name */}

          <h1 className="text-4xl md:text-5xl font-black mt-2 tracking-tight">
            {product.name}
          </h1>

          {/* Rating */}

          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center text-yellow-400">
              <Star
                size={18}
                fill="currentColor"
              />

              <span className="text-slate-900 font-semibold ml-2">
                {Number(product.rating || 0).toFixed(1)}
              </span>
            </div>

            <span className="text-sm text-slate-500">
              ({product.reviewCount || 0} reviews)
            </span>
          </div>

          {/* Short Description */}

          {product.shortDescription && (
            <p className="mt-5 text-lg text-slate-600 leading-7">
              {product.shortDescription}
            </p>
          )}

          {/* Description */}

          {product.description && (
            <p className="mt-4 text-slate-600 leading-7">
              {product.description}
            </p>
          )}

          {/* PRICE */}

          <div className="mt-7 flex items-center gap-4 flex-wrap">
            <span className="text-3xl font-black">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>

            {product.compareAtPrice > product.price && (
              <span className="text-lg text-slate-400 line-through">
                ₹
                {Number(
                  product.compareAtPrice
                ).toLocaleString("en-IN")}
              </span>
            )}

            {product.discountPercentage > 0 && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* STOCK */}

          <div className="mt-3">
            {isOutOfStock ? (
              <p className="text-red-600 font-semibold">
                Out of stock
              </p>
            ) : (
              <p className="text-green-600 font-semibold">
                {product.stock} items in stock
              </p>
            )}
          </div>

          {/* SKU */}

          {product.sku && (
            <p className="text-sm text-slate-400 mt-2">
              SKU: {product.sku}
            </p>
          )}

          {/* SIZE */}

          {product.sizes?.length > 0 && (
            <div className="mt-7">
              <h3 className="font-bold mb-3">
                Select Size
              </h3>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className="border border-slate-300 rounded-xl px-4 py-2 text-sm font-semibold hover:border-indigo-600 hover:text-indigo-600"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COLORS */}

          {product.colors?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold mb-3">
                Available Colors
              </h3>

              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <span
                    key={color}
                    className="border border-slate-300 rounded-xl px-4 py-2 text-sm"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITY */}

          {!isOutOfStock && (
            <div className="mt-7">
              <h3 className="font-bold mb-3">
                Quantity
              </h3>

              <div className="inline-flex items-center border border-slate-300 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  className="px-4 py-2 text-lg hover:bg-slate-100"
                >
                  −
                </button>

                <span className="px-5 py-2 font-bold border-x border-slate-300">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(
                        product.stock,
                        current + 1
                      )
                    )
                  }
                  className="px-4 py-2 text-lg hover:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* ADD TO CART */}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className="btn-primary mt-8 w-full md:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={19} />

            {adding
              ? "Adding..."
              : isOutOfStock
              ? "Out of Stock"
              : "Add to Cart"}
          </button>

          {/* BENEFITS */}

          <div className="grid sm:grid-cols-3 gap-3 mt-8">
            <div className="rounded-2xl bg-slate-50 p-4">
              <ShieldCheck
                size={20}
                className="text-indigo-600"
              />

              <p className="font-semibold text-sm mt-2">
                Secure Payment
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <Truck
                size={20}
                className="text-indigo-600"
              />

              <p className="font-semibold text-sm mt-2">
                Fast Delivery
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <Package
                size={20}
                className="text-indigo-600"
              />

              <p className="font-semibold text-sm mt-2">
                Easy Returns
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          SPECIFICATIONS
      ================================================== */}

      {product.specifications && (
        <section className="mt-16 border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-black">
            Product Specifications
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {product.specifications.material && (
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Material
                </p>

                <p className="font-bold mt-1">
                  {product.specifications.material}
                </p>
              </div>
            )}

            {product.specifications.warranty && (
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Warranty
                </p>

                <p className="font-bold mt-1">
                  {product.specifications.warranty}
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
