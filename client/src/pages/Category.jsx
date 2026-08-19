import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { listProducts } from "../services/productService";
import ProductCard from "../components/product/ProductCard";
import Loader from "../components/common/Loader";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Category() {
  const { slug } = useParams();
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest"); // newest, price_asc, price_desc, rating
  const [priceRange, setPriceRange] = useState("all");

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch category details from list categories
        const catRes = await api.get("/categories");
        const categories = catRes.data?.data || [];
        const currentCat = categories.find(c => c.slug === slug);
        setCategoryInfo(currentCat || { name: slug.charAt(0).toUpperCase() + slug.slice(1), description: "Browse our premium collection." });

        // 2. Fetch products for this category
        const prodRes = await listProducts({
          category: slug,
          limit: 100, // fetch all for local filter/sort
        });

        setProducts(prodRes?.products || []);
      } catch (err) {
        console.error("Failed to load category products:", err);
        toast.error("Failed to load products for this category");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadCategoryData();
    }
  }, [slug]);

  // Filter and Sort products locally
  const filteredProducts = products
    .filter(product => {
      // Search filter
      const matchesSearch = 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.brand.toLowerCase().includes(search.toLowerCase());
      
      // Price filter
      let matchesPrice = true;
      if (priceRange === "under-1000") matchesPrice = product.price < 1000;
      else if (priceRange === "1000-2500") matchesPrice = product.price >= 1000 && product.price <= 2500;
      else if (priceRange === "over-2500") matchesPrice = product.price > 2500;

      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      
      {/* Category Hero Banner */}
      <div className="relative bg-slate-950 text-white overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 opacity-30">
          {categoryInfo?.image && (
            <img 
              src={categoryInfo.image} 
              alt={categoryInfo.name} 
              className="w-full h-full object-cover filter blur-[2px]" 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="container-page relative z-10">
          <Link 
            to="/shop" 
            className="inline-flex items-center text-sm font-semibold text-indigo-300 hover:text-indigo-100 mb-6"
          >
            ← Back to all products
          </Link>
          <span className="text-indigo-400 font-bold uppercase tracking-wider text-xs block mb-2">Shop Category</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">{categoryInfo?.name}</h1>
          <p className="mt-4 text-slate-300 max-w-xl text-lg leading-relaxed">
            {categoryInfo?.description || "Curated products designed around a modern lifestyle."}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container-page mt-10">
        
        {/* Toolbar: Search, Sort, Filter */}
        <div className="card p-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm bg-white border border-slate-200/80 rounded-2xl">
          
          {/* Search within Category */}
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder={`Search in ${categoryInfo?.name || "category"}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto items-center justify-end">
            
            {/* Price Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-500 whitespace-nowrap">Price:</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="select"
              >
                <option value="all">All Prices</option>
                <option value="under-1000">Under ₹1,000</option>
                <option value="1000-2500">₹1,000 - ₹2,500</option>
                <option value="over-2500">Over ₹2,500</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-500 whitespace-nowrap">Sort by:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="select"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>

          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-20">
            <Loader />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mt-8 text-sm text-slate-500 font-semibold px-1">
              <span>Showing {filteredProducts.length} items</span>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-16 text-center mt-8 bg-white border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">No products found</h2>
            <p className="text-slate-500 mt-2">
              {search 
                ? `No products matched "${search}" in this category.` 
                : "No products are currently available in this category."}
            </p>
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="btn-primary mt-5"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}