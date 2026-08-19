require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Banner = require("../models/Banner");
const Order = require("../models/Order");

// ======================================================
// CATEGORIES
// ======================================================

const categoryData = [
  {
    name: "Fashion",
    slug: "fashion",
    description:
      "Modern apparel, footwear and everyday style.",
    image:
      "https://picsum.photos/seed/category-fashion/900/700",
  },
  {
    name: "Beauty",
    slug: "beauty",
    description:
      "Skincare, grooming and self-care essentials.",
    image:
      "https://picsum.photos/seed/category-beauty/900/700",
  },
  {
    name: "Electronics",
    slug: "electronics",
    description:
      "Smart gadgets and useful technology for everyday life.",
    image:
      "https://picsum.photos/seed/category-electronics/900/700",
  },
  {
    name: "Home",
    slug: "home",
    description:
      "Thoughtful products for comfortable modern homes.",
    image:
      "https://picsum.photos/seed/category-home/900/700",
  },
  {
    name: "Grocery",
    slug: "grocery",
    description:
      "Everyday pantry and kitchen essentials.",
    image:
      "https://picsum.photos/seed/category-grocery/900/700",
  },
  {
    name: "Health",
    slug: "health",
    description:
      "Wellness and personal-care essentials.",
    image:
      "https://picsum.photos/seed/category-health/900/700",
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    description:
      "Products designed around a better everyday routine.",
    image:
      "https://picsum.photos/seed/category-lifestyle/900/700",
  },
  {
    name: "Sports",
    slug: "sports",
    description:
      "Training, movement and active lifestyle gear.",
    image:
      "https://picsum.photos/seed/category-sports/900/700",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description:
      "Finishing touches for work, travel and daily life.",
    image:
      "https://picsum.photos/seed/category-accessories/900/700",
  },
  {
    name: "Office",
    slug: "office",
    description:
      "Clean and practical workspace essentials.",
    image:
      "https://picsum.photos/seed/category-office/900/700",
  },
];

// ======================================================
// PRODUCTS
// ======================================================

const rawProducts = [
  [
    "AeroFlex Everyday Sneakers",
    "Fashion",
    2499,
    3299,
    "Nova",
    ["White", "Black"],
    ["7", "8", "9", "10"],
    "Lightweight everyday sneakers with a clean minimal silhouette.",
  ],
  [
    "Urban Layer Overshirt",
    "Fashion",
    1899,
    2499,
    "Urban",
    ["Olive", "Charcoal"],
    ["S", "M", "L", "XL"],
    "Structured overshirt designed for easy layering.",
  ],
  [
    "Essential Cotton Tee",
    "Fashion",
    799,
    999,
    "Aster",
    ["White", "Navy", "Black"],
    ["S", "M", "L", "XL"],
    "Soft premium cotton tee for everyday wear.",
  ],
  [
    "Metro Utility Backpack",
    "Fashion",
    2199,
    2999,
    "Nexa",
    ["Black", "Stone"],
    [],
    "A compact commuter backpack with organized storage.",
  ],
  [
    "CloudKnit Lounge Set",
    "Fashion",
    1599,
    2199,
    "Aster",
    ["Sand", "Grey"],
    ["S", "M", "L", "XL"],
    "Comfort-first lounge set for slow weekends and travel.",
  ],
  [
    "GlowDaily Hydrating Serum",
    "Beauty",
    1299,
    1699,
    "Luma",
    ["Clear"],
    [],
    "Lightweight hydrating serum for a fresh daily routine.",
  ],
  [
    "PureMist Face Cleanser",
    "Beauty",
    699,
    899,
    "Luma",
    ["Clear"],
    [],
    "Gentle daily cleanser with a refreshing finish.",
  ],
  [
    "VelvetTint Lip Color",
    "Beauty",
    899,
    1199,
    "Muse",
    ["Rose", "Berry", "Nude"],
    [],
    "Buildable color with a comfortable lightweight feel.",
  ],
  [
    "SatinGlow Body Lotion",
    "Beauty",
    749,
    999,
    "Muse",
    ["Ivory"],
    [],
    "Daily body moisturizer with a soft satin finish.",
  ],
  [
    "AirWave Hair Dryer",
    "Beauty",
    2299,
    2999,
    "Nexa",
    ["Black", "White"],
    [],
    "Fast-drying hair dryer with compact travel-friendly design.",
  ],
  [
    "Pulse Wireless Earbuds",
    "Electronics",
    2799,
    3999,
    "Nexa",
    ["Black", "White"],
    [],
    "Compact wireless earbuds with clear audio and low-latency mode.",
  ],
  [
    "ViewPoint Smart Watch",
    "Electronics",
    3499,
    4999,
    "Nova",
    ["Graphite", "Silver"],
    [],
    "Everyday smartwatch with activity and notification tracking.",
  ],
  [
    "Beam Mini Bluetooth Speaker",
    "Electronics",
    1599,
    2199,
    "Nexa",
    ["Black", "Blue"],
    [],
    "Portable speaker designed for desks, rooms and travel.",
  ],
  [
    "Volt 65W Fast Charger",
    "Electronics",
    1299,
    1799,
    "Nexa",
    ["White"],
    [],
    "Compact multi-device fast charger for work and travel.",
  ],
  [
    "Focus Mechanical Keyboard",
    "Electronics",
    2999,
    3999,
    "Urban",
    ["Black", "White"],
    [],
    "Tactile compact keyboard for productive workspaces.",
  ],
  [
    "Nordic Table Lamp",
    "Home",
    1699,
    2299,
    "Aster",
    ["White", "Black"],
    [],
    "Soft ambient table lamp for bedrooms and workspaces.",
  ],
  [
    "CloudSoft Cushion Set",
    "Home",
    999,
    1399,
    "Aster",
    ["Beige", "Grey"],
    [],
    "Set of two textured cushions for a cozy interior.",
  ],
  [
    "Stoneware Mug Pair",
    "Home",
    699,
    899,
    "Urban",
    ["Cream", "Charcoal"],
    [],
    "Minimal ceramic mug set for coffee and tea rituals.",
  ],
  [
    "Breeze Cotton Bedsheet",
    "Home",
    1899,
    2499,
    "Nova",
    ["White", "Sage"],
    [],
    "Breathable cotton bedsheet with a calm modern finish.",
  ],
  [
    "Form Storage Basket",
    "Home",
    849,
    1199,
    "Aster",
    ["Natural", "Black"],
    [],
    "Versatile storage basket for organized living.",
  ],
  [
    "Daily Oats 1kg",
    "Grocery",
    349,
    449,
    "Harvest",
    ["Natural"],
    [],
    "Whole-grain oats for breakfast bowls, smoothies and baking.",
  ],
  [
    "Almond Crunch Granola",
    "Grocery",
    499,
    649,
    "Harvest",
    ["Natural"],
    [],
    "Crunchy granola blend for quick breakfast and snacking.",
  ],
  [
    "Cold Brew Coffee Blend",
    "Grocery",
    599,
    799,
    "RoastLab",
    ["Brown"],
    [],
    "Smooth medium-roast coffee blend for cold brewing.",
  ],
  [
    "Kitchen Spice Starter Box",
    "Grocery",
    799,
    999,
    "Harvest",
    ["Multi"],
    [],
    "A practical collection of everyday kitchen spices.",
  ],
  [
    "Daily Wellness Journal",
    "Health",
    449,
    599,
    "Luma",
    ["Sage", "Blue"],
    [],
    "Guided journal for routines, habits and mindful planning.",
  ],
  [
    "Recovery Massage Ball",
    "Health",
    599,
    799,
    "Pulse",
    ["Black", "Blue"],
    [],
    "Compact massage tool for post-workout recovery.",
  ],
  [
    "HydraSteel Water Bottle",
    "Lifestyle",
    1099,
    1499,
    "Nova",
    ["Black", "Steel", "Sage"],
    [],
    "Double-wall insulated bottle for daily hydration.",
  ],
  [
    "Travel Organizer Pouch",
    "Lifestyle",
    899,
    1199,
    "Urban",
    ["Black", "Sand"],
    [],
    "Smart organizer pouch for cables, documents and essentials.",
  ],
  [
    "FlexGrip Training Mat",
    "Sports",
    1399,
    1899,
    "Pulse",
    ["Black", "Blue"],
    [],
    "Cushioned training mat for yoga, mobility and home workouts.",
  ],
  [
    "CoreLift Resistance Bands",
    "Sports",
    999,
    1399,
    "Pulse",
    ["Multi"],
    [],
    "Progressive resistance band set for strength and mobility training.",
  ],
];

// ======================================================
// IMAGE HELPER
// ======================================================

const imageFor = (slug) => {
  return `https://picsum.photos/seed/${slug}/900/900`;
};

// ======================================================
// MAIN SEED FUNCTION
// ======================================================

(async () => {
  try {
    // ==================================================
    // CONNECT DATABASE
    // ==================================================

    await connectDB();

    console.log("");
    console.log("MongoDB connected.");
    console.log("Clearing existing seed data...");

    // ==================================================
    // CLEAR OLD DATA
    // ==================================================

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Banner.deleteMany({}),
      Order.deleteMany({}),
    ]);

    console.log("Old data cleared.");
    console.log("");

    // ==================================================
    // CREDENTIALS
    // ==================================================

    const adminEmail =
      process.env.SEED_ADMIN_EMAIL ||
      "admin@commerce-scale.local";

    const adminPassword =
      process.env.SEED_ADMIN_PASSWORD ||
      "ChangeMe_Admin_123!";

    const managerEmail =
      process.env.SEED_MANAGER_EMAIL ||
      "manager@commerce-scale.local";

    const managerPassword =
      process.env.SEED_MANAGER_PASSWORD ||
      "ChangeMe_Manager_123!";

    // ==================================================
    // CREATE ADMIN
    // ==================================================

    const admin = await User.create({
      name: "CommerceScale Admin",
      email: adminEmail,
      password: adminPassword,
      role: "ADMIN",
      isVerified: true,
      isActive: true,
    });

    console.log("Admin created.");

    // ==================================================
    // CREATE MANAGER
    // ==================================================

    const manager = await User.create({
      name: "CommerceScale Manager",
      email: managerEmail,
      password: managerPassword,
      role: "MANAGER",
      isVerified: true,
      isActive: true,
    });

    console.log("Manager created.");

    // ==================================================
    // CREATE DEMO CUSTOMERS
    // ==================================================

    const demoCustomerPassword = "Customer@123456";

    // IMPORTANT:
    // User.create() use kar rahe hain taaki User.js ka
    // pre("save") password hashing hook execute ho.

    const customers = await Promise.all([
      User.create({
        name: "Aarav Sharma",
        email: "aarav@demo.com",
        phone: "9876500001",
        password: demoCustomerPassword,
        role: "CUSTOMER",
        isVerified: true,
        isActive: true,
      }),

      User.create({
        name: "Priya Mehta",
        email: "priya@demo.com",
        phone: "9876500002",
        password: demoCustomerPassword,
        role: "CUSTOMER",
        isVerified: true,
        isActive: true,
      }),

      User.create({
        name: "Rohan Verma",
        email: "rohan@demo.com",
        phone: "9876500003",
        password: demoCustomerPassword,
        role: "CUSTOMER",
        isVerified: true,
        isActive: true,
      }),

      User.create({
        name: "Ananya Singh",
        email: "ananya@demo.com",
        phone: "9876500004",
        password: demoCustomerPassword,
        role: "CUSTOMER",
        isVerified: true,
        isActive: true,
      }),

      User.create({
        name: "Kabir Jain",
        email: "kabir@demo.com",
        phone: "9876500005",
        password: demoCustomerPassword,
        role: "CUSTOMER",
        isVerified: true,
        isActive: true,
      }),
    ]);

    console.log(
      `${customers.length} demo customers created.`
    );

    // ==================================================
    // CREATE CATEGORIES
    // ==================================================

    const categories =
      await Category.insertMany(categoryData);

    const categoryMap = Object.fromEntries(
      categories.map((category) => [
        category.name,
        category._id,
      ])
    );

    console.log(
      `${categories.length} categories created.`
    );

    // ==================================================
    // CREATE PRODUCTS
    // ==================================================

    const products = rawProducts.map((item, index) => {
      const [
        name,
        category,
        price,
        compareAtPrice,
        brand,
        colors,
        sizes,
        description,
      ] = item;

      // Create slug
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Calculate discount
      const discountPercentage =
        compareAtPrice > price
          ? Math.round(
              ((compareAtPrice - price) /
                compareAtPrice) *
                100
            )
          : 0;

      return {
        name,

        slug,

        description,

        shortDescription: description,

        brand,

        category: categoryMap[category],

        images: [
          imageFor(`product-${slug}`),
        ],

        price,

        compareAtPrice,

        discountPercentage,

        // REQUIRED + UNIQUE
        sku: `CS-${String(index + 1).padStart(
          4,
          "0"
        )}`,

        stock: 18 + (index % 13),

        soldCount: 8 + index * 4,

        rating: Number(
          (4.1 + (index % 9) * 0.1).toFixed(1)
        ),

        reviewCount: 12 + index * 3,

        sizes,

        colors,

        variants: colors.map((color) => ({
          color,
          stock: 8 + (index % 8),
        })),

        specifications: {
          material:
            category === "Fashion"
              ? "Premium blend"
              : "Everyday quality materials",

          warranty:
            ["Electronics", "Sports"].includes(
              category
            )
              ? "1 year"
              : "Not applicable",
        },

        tags: [
          category.toLowerCase(),
          brand.toLowerCase(),
          "new",
          index < 12
            ? "featured"
            : "bestseller",
        ],

        isFeatured: index < 12,

        isActive: true,
      };
    });

    const insertedProducts =
      await Product.insertMany(products);

    console.log(
      `${insertedProducts.length} products created.`
    );

    // ==================================================
    // ADDRESS HELPER
    // ==================================================

    const address = (name, phone) => ({
      fullName: name,
      phone,
      address: "42 Commerce Avenue",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302001",
      country: "India",
    });

    // ==================================================
    // CREATE DEMO ORDERS
    // ==================================================

    const orderStatuses = [
      "DELIVERED",
      "SHIPPED",
      "PROCESSING",
      "CONFIRMED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "SHIPPED",
      "CONFIRMED",
    ];

    const demoOrders = Array.from(
      { length: 8 },
      (_, index) => {
        const customer =
          customers[index % customers.length];

        const first =
          insertedProducts[
            (index * 2) %
              insertedProducts.length
          ];

        const second =
          insertedProducts[
            (index * 2 + 1) %
              insertedProducts.length
          ];

        const qty1 = (index % 2) + 1;

        const qty2 =
          index % 3 === 0 ? 2 : 1;

        // ----------------------------------------------
        // PRICE CALCULATION
        // ----------------------------------------------

        const subtotal =
          first.price * qty1 +
          second.price * qty2;

        const discount =
          index % 3 === 0
            ? Math.min(
                250,
                Math.round(subtotal * 0.1)
              )
            : 0;

        const tax = Math.round(
          (subtotal - discount) * 0.05
        );

        const shippingFee =
          subtotal - discount >= 1999
            ? 0
            : 99;

        const totalAmount =
          subtotal -
          discount +
          tax +
          shippingFee;

        const orderStatus =
          orderStatuses[index];

        // ----------------------------------------------
        // PAYMENT
        // ----------------------------------------------

        const paymentMethod =
          index % 2 === 0
            ? "RAZORPAY"
            : "COD";

        const paymentStatus =
          paymentMethod === "RAZORPAY"
            ? "PAID"
            : orderStatus === "DELIVERED"
            ? "PAID"
            : "PENDING";

        // ----------------------------------------------
        // ORDER
        // ----------------------------------------------

        return {
          // REQUIRED + UNIQUE
          orderNumber: `CS-DEMO-${String(
            index + 1
          ).padStart(4, "0")}`,

          user: customer._id,

          items: [
            {
              product: first._id,
              name: first.name,
              image: first.images[0],
              price: first.price,
              quantity: qty1,
              sku: first.sku,
            },

            {
              product: second._id,
              name: second.name,
              image: second.images[0],
              price: second.price,
              quantity: qty2,
              sku: second.sku,
            },
          ],

          shippingAddress: address(
            customer.name,
            customer.phone
          ),

          subtotal,

          discount,

          tax,

          shippingFee,

          totalAmount,

          couponCode:
            discount > 0
              ? "WELCOME10"
              : "",

          paymentMethod,

          paymentStatus,

          orderStatus,

          trackingNumber:
            orderStatus === "SHIPPED" ||
            orderStatus === "OUT_FOR_DELIVERY" ||
            orderStatus === "DELIVERED"
              ? `CSTK${20260000 + index + 1}`
              : "",

          notes:
            "Demo seeded order for CommerceScale dashboard",

          deliveredAt:
            orderStatus === "DELIVERED"
              ? new Date()
              : null,

          cancelledAt: null,
        };
      }
    );

    const insertedOrders =
      await Order.insertMany(demoOrders);

    console.log(
      `${insertedOrders.length} demo orders created.`
    );

    // ==================================================
    // CREATE COUPONS
    // ==================================================

    const expiresAt = new Date();

    // Coupons 1 year tak valid
    expiresAt.setFullYear(
      expiresAt.getFullYear() + 1
    );

    await Coupon.insertMany([
      {
        code: "WELCOME10",

        description:
          "10% off on your first order.",

        discountType: "percentage",

        discountValue: 10,

        minimumAmount: 500,

        maximumDiscount: 500,

        usageLimit: 1000,

        usedCount: 0,

        expiresAt,

        isActive: true,
      },

      {
        code: "SAVE200",

        description:
          "Flat Rs. 200 off on orders above Rs. 1999.",

        discountType: "fixed",

        discountValue: 200,

        minimumAmount: 1999,

        maximumDiscount: 200,

        usageLimit: 500,

        usedCount: 0,

        expiresAt,

        isActive: true,
      },

      {
        code: "SCALE15",

        description:
          "15% off on orders above Rs. 2999.",

        discountType: "percentage",

        discountValue: 15,

        minimumAmount: 2999,

        maximumDiscount: 750,

        usageLimit: 250,

        usedCount: 0,

        expiresAt,

        isActive: true,
      },
    ]);

    console.log("Coupons created.");

    // ==================================================
    // CREATE BANNERS
    // ==================================================

    await Banner.insertMany([
      {
        title:
          "New season. Better everyday.",

        subtitle:
          "Discover 30 curated products across fashion, beauty, tech and home.",

        image:
          "https://picsum.photos/seed/commerce-scale-banner-1/1600/700",

        buttonText: "Shop Now",

        buttonLink: "/products",

        isActive: true,

        order: 1,
      },

      {
        title:
          "Up to 40% off selected picks",

        subtitle:
          "Limited-time prices on customer favorites.",

        image:
          "https://picsum.photos/seed/commerce-scale-banner-2/1600/700",

        buttonText: "Explore Offers",

        buttonLink: "/products",

        isActive: true,

        order: 2,
      },
    ]);

    console.log("Banners created.");

    // ==================================================
    // SUCCESS
    // ==================================================

    console.log("");
    console.log("========================================");
    console.log(
      "CommerceScale seed completed successfully"
    );
    console.log("========================================");

    console.log(
      `Admin     : ${adminEmail}`
    );

    console.log(
      `Manager   : ${managerEmail}`
    );

    console.log(
      `Customers : ${customers.length}`
    );

    console.log(
      `Categories: ${categories.length}`
    );

    console.log(
      `Products  : ${insertedProducts.length}`
    );

    console.log(
      `Orders    : ${insertedOrders.length}`
    );

    console.log(
      "Customer  : aarav@demo.com / Customer@123456"
    );

    console.log(
      "Coupons   : WELCOME10, SAVE200, SCALE15"
    );

    console.log("========================================");
    console.log("");

    // ==================================================
    // CLOSE DATABASE
    // ==================================================

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("Seed failed");
    console.error("========================================");
    console.error(error.message);

    if (error.errors) {
      console.error("");

      Object.keys(error.errors).forEach((field) => {
        console.error(
          `${field}: ${error.errors[field].message}`
        );
      });
    }

    console.error("");

    await mongoose.connection
      .close()
      .catch(() => {});

    process.exit(1);
  }
})();
