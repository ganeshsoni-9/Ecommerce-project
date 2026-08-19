import { useEffect, useState } from "react";
import { listProducts } from "../services/productService";
import ProductCard from "../components/product/ProductCard";
import Loader from "../components/common/Loader";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await listProducts({
        search: q,
        limit: 24,
      });

      console.log("Products API response:", response);

      // Backend response:
      // {
      //   success: true,
      //   products: [],
      //   pagination: {}
      // }

      setProducts(response?.products || []);
    } catch (error) {
      console.error("Failed to load products:", error);

      setProducts([]);

      setError(
        error?.response?.data?.message ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="container-page py-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">

        <div>
          <p className="text-indigo-600 font-semibold">
            COLLECTION
          </p>

          <h1 className="text-4xl font-black mt-1">
            Shop all
          </h1>

          <p className="text-slate-500 mt-2">
            Discover our complete collection of products.
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-2 w-full md:w-auto">
          <input
            className="input max-w-sm w-full"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                loadProducts();
              }
            }}
            placeholder="Search products"
          />

          <button
            className="btn-primary"
            onClick={loadProducts}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 text-red-700 p-4">
          {error}
        </div>
      )}

      {/* Products */}
      {loading ? (
        <div className="mt-8">
          <Loader />
        </div>
      ) : products.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 card p-10 text-center">
          <h2 className="text-xl font-bold text-slate-800">
            No products found
          </h2>

          <p className="text-slate-500 mt-2">
            {q
              ? `No products matched "${q}".`
              : "No products are available right now."}
          </p>

          {q && (
            <button
              className="btn-primary mt-5"
              onClick={() => {
                setQ("");
                setTimeout(() => {
                  loadProducts();
                }, 0);
              }}
            >
              View all products
            </button>
          )}
        </div>
      )}

    </div>
  );
}
