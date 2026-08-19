import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
  Sparkles,
  Star,
  ChevronRight,
} from "lucide-react";

import { getProducts } from "../services/productService";
import ProductCard from "../components/product/ProductCard";
import Loader from "../components/common/Loader";

// ======================================================
// CATEGORIES
// ======================================================

const categories = [
  {
    name: "Fashion",
    slug: "fashion",
    image:
      "https://picsum.photos/seed/category-fashion/900/700",
    text: "Everyday style",
  },
  {
    name: "Beauty",
    slug: "beauty",
    image:
      "https://picsum.photos/seed/category-beauty/900/700",
    text: "Care essentials",
  },
  {
    name: "Electronics",
    slug: "electronics",
    image:
      "https://picsum.photos/seed/category-electronics/900/700",
    text: "Smart technology",
  },
  {
    name: "Home",
    slug: "home",
    image:
      "https://picsum.photos/seed/category-home/900/700",
    text: "Modern living",
  },
  {
    name: "Sports",
    slug: "sports",
    image:
      "https://picsum.photos/seed/category-sports/900/700",
    text: "Move better",
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    image:
      "https://picsum.photos/seed/category-lifestyle/900/700",
    text: "Live well",
  },
];

// ======================================================
// BRANDS
// ======================================================

const brands = [
  "NOVA",
  "ASTER",
  "NEXA",
  "URBAN",
  "LUMA",
  "PULSE",
];

// ======================================================
// RESPONSE HELPER
// ======================================================

const extractProducts = (response) => {
  const payload = response?.data;

  // API response:
  // { success: true, data: { products: [...] } }

  if (Array.isArray(payload?.data?.products)) {
    return payload.data.products;
  }

  // API response:
  // { success: true, data: [...] }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  // API response:
  // { products: [...] }

  if (Array.isArray(payload?.products)) {
    return payload.products;
  }

  // Direct array

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};

// ======================================================
// HOME
// ======================================================

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);

  const [loadingFeatured, setLoadingFeatured] =
    useState(true);

  const [loadingTrending, setLoadingTrending] =
    useState(true);

  // ====================================================
  // LOAD FEATURED PRODUCTS
  // ====================================================

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoadingFeatured(true);

        const response = await getProducts({
          limit: 8,
          isFeatured: true,
        });

        const products = extractProducts(response);

        setFeaturedProducts(products);
      } catch (error) {
        console.error(
          "Failed to load featured products:",
          error
        );

        setFeaturedProducts([]);
      } finally {
        setLoadingFeatured(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  // ====================================================
  // LOAD TRENDING PRODUCTS
  // ====================================================

  useEffect(() => {
    const loadTrendingProducts = async () => {
      try {
        setLoadingTrending(true);

        const response = await getProducts({
          limit: 8,
          sort: "price_desc",
        });

        const products = extractProducts(response);

        setTrendingProducts(products);
      } catch (error) {
        console.error(
          "Failed to load trending products:",
          error
        );

        setTrendingProducts([]);
      } finally {
        setLoadingTrending(false);
      }
    };

    loadTrendingProducts();
  }, []);

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="bg-white">

      {/* ==================================================
          TOP OFFER BAR
      ================================================== */}

      <div className="bg-indigo-600 text-white text-center text-sm py-2.5 px-4">
        <span>
          Free shipping on orders above ₹1,999 · Use{" "}
          <strong>WELCOME10</strong> for 10% off
        </span>
      </div>

      {/* ==================================================
          HERO SECTION
      ================================================== */}

      <section className="bg-slate-950 text-white overflow-hidden">
        <div className="container-page py-16 md:py-24 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* LEFT */}

          <div>
            <span className="text-indigo-300 font-semibold tracking-wide">
              THE MODERN D2C STACK
            </span>

            <h1 className="mt-4 text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.98]">
              Commerce that scales with your ambition.
            </h1>

            <p className="mt-6 text-slate-300 max-w-xl text-lg leading-8">
              Discover thoughtfully selected fashion,
              beauty, technology, home and lifestyle
              products in one premium shopping
              experience.
            </p>

            {/* BUTTONS */}

            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                to="/shop"
                className="btn bg-white text-slate-900 hover:bg-slate-100 inline-flex items-center"
              >
                Shop collection
                <ArrowRight
                  size={17}
                  className="ml-2"
                />
              </Link>

              <Link
                to="/about"
                className="btn border border-slate-700 hover:bg-slate-900"
              >
                Why CommerceScale
              </Link>

            </div>

            {/* FEATURES */}

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-300">
              <span>✓ 30+ curated products</span>
              <span>✓ Secure checkout</span>
              <span>✓ Easy order tracking</span>
            </div>
          </div>

          {/* RIGHT */}

          <div className="relative">

            <img
              src="https://picsum.photos/seed/commercehero/1000/800"
              className="rounded-3xl w-full aspect-[5/4] object-cover"
              alt="CommerceScale collection"
            />

            <div className="absolute left-5 bottom-5 bg-white text-slate-950 rounded-2xl px-5 py-4 shadow-xl">

              <p className="text-xs text-slate-500">
                THIS WEEK
              </p>

              <p className="font-black text-lg">
                Up to 40% off
              </p>

              <p className="text-sm text-slate-500">
                Selected essentials
              </p>

            </div>
          </div>

        </div>
      </section>

      {/* ==================================================
          SHOP BY CATEGORY
      ================================================== */}

      <section className="container-page py-16">

        <div className="flex items-end justify-between gap-5">

          <div>
            <p className="text-indigo-600 font-semibold">
              SHOP BY CATEGORY
            </p>

            <h2 className="text-3xl md:text-4xl font-black mt-2">
              Find your next favorite
            </h2>
          </div>

          <Link
            to="/shop"
            className="hidden sm:flex items-center font-semibold"
          >
            All products
            <ChevronRight size={18} />
          </Link>

        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">

          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-3xl bg-slate-900 min-h-52"
            >

              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition duration-500"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

              <div className="relative h-full min-h-52 p-5 flex flex-col justify-end text-white">

                <p className="text-sm text-slate-300">
                  {category.text}
                </p>

                <h3 className="text-2xl font-black">
                  {category.name}
                </h3>

              </div>
            </Link>
          ))}

        </div>
      </section>

      {/* ==================================================
          FEATURED PRODUCTS
      ================================================== */}

      <section className="bg-white border-y border-slate-200">

        <div className="container-page py-16">

          <div className="flex items-end justify-between gap-5">

            <div>
              <p className="text-indigo-600 font-semibold">
                CURATED FOR YOU
              </p>

              <h2 className="text-3xl md:text-4xl font-black mt-2">
                Featured products
              </h2>
            </div>

            <Link
              to="/shop"
              className="font-semibold hidden sm:block"
            >
              View all →
            </Link>

          </div>

          {loadingFeatured ? (
            <div className="mt-8">
              <Loader />
            </div>
          ) : featuredProducts.length > 0 ? (

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}

            </div>

          ) : (

            <div className="mt-8 card p-8 text-center text-slate-500">
              No featured products available.
            </div>

          )}

        </div>
      </section>

      {/* ==================================================
          SALE SECTION
      ================================================== */}

      <section className="container-page py-16">

        <div className="rounded-3xl bg-indigo-600 text-white p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">

          {/* LEFT */}

          <div>

            <div className="inline-flex items-center gap-2 text-indigo-100 text-sm font-semibold">
              <Sparkles size={17} />
              SCALE SALE
            </div>

            <h2 className="text-4xl md:text-5xl font-black mt-3">
              Good products. Better prices.
            </h2>

            <p className="text-indigo-100 mt-4 max-w-lg">
              Save on selected customer favorites
              across fashion, technology, beauty and
              home.
            </p>

            <Link
              to="/shop"
              className="btn bg-white text-slate-950 mt-7 inline-flex items-center"
            >
              Explore sale
              <ArrowRight
                size={17}
                className="ml-2"
              />
            </Link>

          </div>

          {/* RIGHT STATS */}

          <div className="grid grid-cols-2 gap-3">

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-3xl font-black">
                40%
              </p>

              <p className="text-indigo-100 text-sm mt-1">
                Maximum savings
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-3xl font-black">
                30+
              </p>

              <p className="text-indigo-100 text-sm mt-1">
                Curated products
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-3xl font-black">
                10
              </p>

              <p className="text-indigo-100 text-sm mt-1">
                Categories
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-3xl font-black">
                4.6★
              </p>

              <p className="text-indigo-100 text-sm mt-1">
                Average rating
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==================================================
          TRENDING PRODUCTS
      ================================================== */}

      <section className="container-page pb-16">

        <div className="flex items-end justify-between gap-5">

          <div>
            <p className="text-indigo-600 font-semibold">
              TRENDING NOW
            </p>

            <h2 className="text-3xl font-black mt-2">
              Popular picks
            </h2>
          </div>

          <Link
            to="/shop"
            className="font-semibold"
          >
            Shop all →
          </Link>

        </div>

        {loadingTrending ? (

          <div className="mt-8">
            <Loader />
          </div>

        ) : trendingProducts.length > 0 ? (

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

            {trendingProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}

          </div>

        ) : (

          <div className="mt-8 card p-8 text-center text-slate-500">
            No trending products available.
          </div>

        )}

      </section>

      {/* ==================================================
          BRANDS
      ================================================== */}

      <section className="bg-slate-100 border-y border-slate-200">

        <div className="container-page py-14">

          <p className="text-center text-sm font-semibold text-slate-500 tracking-widest">
            BRANDS YOU CAN DISCOVER
          </p>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">

            {brands.map((brand) => (

              <div
                key={brand}
                className="bg-white rounded-2xl border border-slate-200 py-5 text-center font-black tracking-widest text-slate-700"
              >
                {brand}
              </div>

            ))}

          </div>

        </div>
      </section>

      {/* ==================================================
          WHY COMMERCE SCALE
      ================================================== */}

      <section className="container-page py-16">

        <div className="text-center max-w-2xl mx-auto">

          <p className="text-indigo-600 font-semibold">
            WHY COMMERCE SCALE
          </p>

          <h2 className="text-3xl md:text-4xl font-black mt-2">
            Built around a better shopping experience
          </h2>

          <p className="text-slate-500 mt-4">
            Simple discovery, transparent pricing,
            reliable fulfillment and support when you
            need it.
          </p>

        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-10">

          <Feature
            icon={<ShieldCheck />}
            title="Secure checkout"
            text="Your account and payment flow are designed with security in mind."
          />

          <Feature
            icon={<Truck />}
            title="Fast fulfillment"
            text="Track your order from confirmation through delivery."
          />

          <Feature
            icon={<Headphones />}
            title="Human support"
            text="A clear support experience for questions, returns and orders."
          />

        </div>
      </section>

      {/* ==================================================
          CUSTOMER LOVE
      ================================================== */}

      <section className="bg-slate-950 text-white">

        <div className="container-page py-16 grid md:grid-cols-3 gap-8 items-center">

          <div className="md:col-span-2">

            <p className="text-indigo-300 font-semibold">
              CUSTOMER LOVE
            </p>

            <h2 className="text-3xl md:text-4xl font-black mt-2">
              “Simple, premium and actually easy to shop.”
            </h2>

            <p className="text-slate-400 mt-4">
              A modern commerce experience designed to
              remove friction from discovery to delivery.
            </p>

          </div>

          <div className="md:text-right">

            <div className="flex md:justify-end text-yellow-300">

              <Star
                fill="currentColor"
                size={18}
              />

              <Star
                fill="currentColor"
                size={18}
              />

              <Star
                fill="currentColor"
                size={18}
              />

              <Star
                fill="currentColor"
                size={18}
              />

              <Star
                fill="currentColor"
                size={18}
              />

            </div>

            <p className="mt-2 font-semibold">
              4.6 / 5 average product rating
            </p>

          </div>

        </div>
      </section>

      {/* ==================================================
          NEWSLETTER
      ================================================== */}

      <section className="container-page py-16">

        <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 text-center">

          <p className="text-indigo-600 font-semibold">
            STAY IN THE LOOP
          </p>

          <h2 className="text-3xl md:text-4xl font-black mt-2">
            Get new drops and offers
          </h2>

          <p className="text-slate-500 mt-3">
            Product launches, useful guides and
            CommerceScale offers — without the noise.
          </p>

          <form
            className="max-w-xl mx-auto mt-7 flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => e.preventDefault()}
          >

            <input
              className="input"
              type="email"
              placeholder="Your email address"
              required
            />

            <button
              type="submit"
              className="btn-primary whitespace-nowrap"
            >
              Subscribe
            </button>

          </form>

        </div>
      </section>

    </div>
  );
}

// ======================================================
// FEATURE COMPONENT
// ======================================================

function Feature({ icon, title, text }) {
  return (
    <div className="card p-7">

      <div className="text-indigo-600">
        {icon}
      </div>

      <h3 className="font-bold text-lg mt-4">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2 leading-6">
        {text}
      </p>

    </div>
  );
}
