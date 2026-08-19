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

const categoryProductsMap = {
  Fashion: [
    ["AeroFlex Everyday Sneakers", 2499, 3299, "Nova", ["White", "Black"], ["7", "8", "9", "10"], "Lightweight everyday sneakers with a clean minimal silhouette."],
    ["Urban Layer Overshirt", 1899, 2499, "Urban", ["Olive", "Charcoal"], ["S", "M", "L", "XL"], "Structured overshirt designed for easy layering."],
    ["Essential Cotton Tee", 799, 999, "Aster", ["White", "Navy", "Black"], ["S", "M", "L", "XL"], "Soft premium cotton tee for everyday wear."],
    ["Metro Utility Backpack", 2199, 2999, "Nexa", ["Black", "Stone"], [], "A compact commuter backpack with organized storage."],
    ["CloudKnit Lounge Set", 1599, 2199, "Aster", ["Sand", "Grey"], ["S", "M", "L", "XL"], "Comfort-first lounge set for slow weekends and travel."],
    ["Classic Denim Jacket", 2299, 3499, "Nova", ["Indigo"], ["M", "L", "XL"], "Classic denim jacket with a clean wash and durable brass buttons."],
    ["Slim Fit Stretch Chinos", 1499, 1999, "Urban", ["Navy", "Khaki"], ["30", "32", "34"], "Breathable cotton chinos designed for smart-casual wear."],
    ["Knitted Roll Neck Sweater", 1799, 2499, "Aster", ["Black", "Beige"], ["M", "L"], "Premium knit roll neck sweater for warm comfort during winters."],
    ["Leather Chelsea Boots", 3499, 4999, "Nova", ["Tan", "Black"], ["8", "9", "10"], "Handcrafted leather Chelsea boots with durable elastic side panels."],
    ["Windbreaker Active Jacket", 1999, 2999, "Pulse", ["Grey", "Blue"], ["S", "M", "L"], "Water-resistant windbreaker jacket with zipped side pockets."],
    ["Premium Linen Summer Shirt", 1299, 1799, "Aster", ["White", "Sage"], ["S", "M", "L"], "Lightweight, breathable linen shirt perfect for summer days."],
    ["Structured Tailored Blazer", 3999, 5999, "Urban", ["Navy", "Charcoal"], ["M", "L", "XL"], "Formal slim-fit blazer tailored for corporate and evening events."],
    ["Athletic Jogger Pants", 1199, 1599, "Pulse", ["Black", "Grey"], ["S", "M", "L"], "Comfy jogger pants with elasticated waistband and drawcords."],
    ["Streetwear Fleece Hoodie", 1699, 2299, "Urban", ["Black", "Sand"], ["M", "L", "XL"], "Heavyweight cotton hoodie with a cozy brushed fleece lining."],
    ["Full Grain Leather Belt", 799, 1299, "Nova", ["Brown", "Black"], [], "Classic leather belt featuring a polished metal buckle."],
    ["Ribbed Wool Beanie", 499, 799, "Aster", ["Grey", "Navy"], [], "Snug wool-blend beanie for keeping warm in style."],
    ["Quilted Puffer Coat", 2999, 3999, "Nexa", ["Olive", "Black"], ["M", "L", "XL"], "Warm insulated puffer coat with a zip-up hood."],
    ["Breathable Workout Shorts", 699, 999, "Pulse", ["Black", "Red"], ["S", "M", "L"], "Moisture-wicking mesh shorts designed for intense training."],
    ["Mulberry Silk Scarf", 1199, 1899, "Luma", ["Emerald", "Rose"], [], "Luxuriously soft silk scarf with elegant hand-rolled edges."],
    ["Suede Penny Loafers", 2799, 3999, "Nova", ["Brown", "Navy"], ["8", "9", "10"], "Elegant suede loafers that elevate any smart outfit."],
    ["Retro Platform Sneakers", 2199, 2999, "Nova", ["White", "Yellow"], ["7", "8", "9"], "Chunky platform sneakers inspired by classic 90s designs."],
    ["Handstitched Oxford Shoes", 3299, 4499, "Nova", ["Black", "Tan"], ["8", "9", "10"], "Traditional leather Oxford shoes with refined wingtip detailing."],
    ["Water-Resistant Bomber Jacket", 2499, 3499, "Urban", ["Burgundy", "Black"], ["M", "L", "XL"], "Classic bomber jacket with ribbed cuffs and utility arm pocket."],
    ["Multi-Pocket Cargo Pants", 1599, 2199, "Urban", ["Khaki", "Black"], ["30", "32", "34"], "Heavy-duty cotton cargo pants with spacious utility pockets."],
    ["Premium Crewneck Sweatshirt", 1399, 1899, "Aster", ["Grey", "Navy"], ["S", "M", "L"], "Minimalist crewneck sweatshirt made of soft organic cotton."]
  ],
  Beauty: [
    ["GlowDaily Hydrating Serum", 1299, 1699, "Luma", ["Clear"], [], "Lightweight hydrating serum for a fresh daily routine."],
    ["PureMist Face Cleanser", 699, 899, "Luma", ["Clear"], [], "Gentle daily cleanser with a refreshing finish."],
    ["VelvetTint Lip Color", 899, 1199, "Muse", ["Rose", "Berry", "Nude"], [], "Buildable color with a comfortable lightweight feel."],
    ["SatinGlow Body Lotion", 749, 999, "Muse", ["Ivory"], [], "Daily body moisturizer with a soft satin finish."],
    ["AirWave Hair Dryer", 2299, 2999, "Nexa", ["Black", "White"], [], "Fast-drying hair dryer with compact travel-friendly design."],
    ["Clarifying Clay Mask", 849, 1199, "Luma", [], [], "Deep-cleansing clay mask designed to purify and refine skin texture."],
    ["Vitamin C Radiance Oil", 1499, 1999, "Luma", [], [], "Nourishing facial oil that restores natural radiance and glow."],
    ["Matte Foundation SPF 15", 1199, 1599, "Muse", ["Fair", "Medium", "Dark"], [], "Full-coverage foundation with a lightweight, non-greasy matte finish."],
    ["Mineral Sunscreen SPF 50", 999, 1399, "Luma", [], [], "Broad-spectrum mineral sunscreen that leaves no white cast."],
    ["Rose Water Face Toner", 499, 699, "Luma", [], [], "Refreshing and soothing face toner made of pure organic rose petals."],
    ["Shea Butter Lip Balm", 299, 399, "Muse", ["Cherry", "Vanilla"], [], "Ultra-nourishing lip balm to soothe dry, chapped lips."],
    ["Argan Oil Hair Mask", 899, 1299, "Luma", [], [], "Deep conditioning mask that repairs and strengthens dry, damaged hair."],
    ["Gentle Exfoliating Scrub", 599, 799, "Luma", [], [], "Face scrub with micro-fine particles to remove dead skin cells gently."],
    ["Hydrating Eye Cream", 799, 1099, "Luma", [], [], "Revitalizing eye cream that reduces dark circles and under-eye puffiness."],
    ["Anti-Aging Night Cream", 1699, 2299, "Muse", [], [], "Night cream with retinol to firm, smooth, and rejuvenate the skin."],
    ["Charcoal Peel-Off Mask", 449, 599, "Luma", [], [], "Peel-off mask that extracts blackheads and controls excess sebum."],
    ["Herbal Hair Growth Oil", 649, 899, "Luma", [], [], "Nutrient-rich hair oil with natural herbs for thicker, stronger hair."],
    ["Deodorant Cream Natural", 399, 549, "Muse", ["Lavender", "Citrus"], [], "Aluminum-free natural deodorant paste for long-lasting freshness."],
    ["Makeup Setting Spray", 799, 1099, "Muse", [], [], "Long-lasting setting spray with a dewy, glowing finish."],
    ["Matte Liquid Lipstick", 699, 899, "Muse", ["Scarlet", "Plum", "Peach"], [], "Highly pigmented transfer-proof liquid lipstick with a matte finish."],
    ["Waterproof Volumizing Mascara", 599, 799, "Muse", ["Black"], [], "Smudge-proof volumizing mascara for defined, dramatic lashes."],
    ["Teatree Acne Gel", 499, 699, "Luma", [], [], "Spot treatment gel formulated with tea tree oil to soothe breakouts."],
    ["Brightening Face Wash", 399, 549, "Luma", [], [], "Brightening cleanser with Vitamin C to even out skin tone."],
    ["Micellar Cleansing Water", 449, 599, "Luma", [], [], "Gentle makeup remover that cleanses and hydrates in one step."],
    ["Avocado Body Butter", 899, 1199, "Muse", [], [], "Whipped, rich body moisturizer with organic avocado oil."]
  ],
  Electronics: [
    ["Pulse Wireless Earbuds", 2799, 3999, "Nexa", ["Black", "White"], [], "Compact wireless earbuds with clear audio and low-latency mode."],
    ["ViewPoint Smart Watch", 3499, 4999, "Nova", ["Graphite", "Silver"], [], "Everyday smartwatch with activity and notification tracking."],
    ["Beam Mini Bluetooth Speaker", 1599, 2199, "Nexa", ["Black", "Blue"], [], "Portable speaker designed for desks, rooms and travel."],
    ["Volt 65W Fast Charger", 1299, 1799, "Nexa", ["White"], [], "Compact multi-device fast charger for work and travel."],
    ["Focus Mechanical Keyboard", 2999, 3999, "Urban", ["Black", "White"], [], "Tactile compact keyboard for productive workspaces."],
    ["Active Noise Cancelling Headphones", 5999, 7999, "Nexa", ["Black", "Navy"], [], "Over-ear headphones with superior noise cancellation and deep bass."],
    ["Ultra Slim Power Bank 10k", 1499, 1999, "Nova", ["Black", "Grey"], [], "Compact power bank offering 10000mAh with fast charging ports."],
    ["Ergonomic Wireless Mouse", 999, 1499, "Nova", ["Black"], [], "Wireless mouse with ergonomic palm rest and adjustable DPI settings."],
    ["Dual Band Wi-Fi Router", 2499, 3299, "Nexa", ["Black"], [], "High-speed gigabit Wi-Fi router for seamless gaming and streaming."],
    ["1080p Webcam with Mic", 1999, 2699, "Nexa", [], [], "Full HD webcam with autofocus and dual noise-reducing microphones."],
    ["USB-C Multiport Adapter", 1199, 1699, "Nova", ["Grey"], [], "8-in-1 USB hub with HDMI, card reader, and power delivery port."],
    ["RGB Underglow Mousepad", 799, 1199, "Urban", ["Black"], [], "Large gaming mousepad with customizable RGB LED lighting borders."],
    ["Smart LED Desk Lamp", 1499, 1999, "Aster", ["White"], [], "Desk lamp with dimmable brightness levels and wireless phone charger."],
    ["Wireless Charging Stand", 999, 1399, "Nova", ["Black"], [], "15W fast wireless charging stand for Qi-enabled devices."],
    ["Portable Solid State Drive 1TB", 6999, 9999, "Nexa", ["Silver"], [], "Ultra-fast external SSD with high-speed data transfer capabilities."],
    ["Hi-Fi Desktop Speakers", 3499, 4499, "Nexa", ["Wood"], [], "Compact desktop speakers with clear acoustics and wood-cabinet style."],
    ["Bluetooth Audio Receiver", 599, 899, "Nexa", ["Black"], [], "Bluetooth adapter to turn standard speakers into wireless systems."],
    ["Flexible Phone Tripod", 499, 799, "Nova", ["Black"], [], "Flexible leg tripod with universal phone mount and remote control."],
    ["Smart Key Finder Tag", 899, 1299, "Nova", ["White"], [], "Bluetooth tracker for keys, wallets, and bags via a mobile app."],
    ["Noise Isolating Earplugs", 399, 599, "Nexa", ["Grey"], [], "Reusable silicone earplugs for sleep, work, and noise reduction."],
    ["Condenser USB Microphone", 2799, 3699, "Nexa", ["Black"], [], "USB condenser mic with pop filter for streaming and recording."],
    ["4K HDMI Splitter Switch", 699, 999, "Nexa", ["Black"], [], "3-port HDMI switch support 4K resolution and remote selection."],
    ["Digital Smart Scale", 1299, 1799, "Pulse", ["Black"], [], "Smart scale tracking body weight, fat percentage, and muscle mass."],
    ["Car Wireless Charger Mount", 1499, 1999, "Nova", ["Black"], [], "Automatic clamping car vent mount with wireless charging sensor."],
    ["Graphite Drawing Tablet", 4299, 5999, "Urban", ["Black"], [], "Digital pen tablet with battery-free stylus for art and design."]
  ],
  Home: [
    ["Nordic Table Lamp", 1699, 2299, "Aster", ["White", "Black"], [], "Soft ambient table lamp for bedrooms and workspaces."],
    ["CloudSoft Cushion Set", 999, 1399, "Aster", ["Beige", "Grey"], [], "Set of two textured cushions for a cozy interior."],
    ["Stoneware Mug Pair", 699, 899, "Urban", ["Cream", "Charcoal"], [], "Minimal ceramic mug set for coffee and tea rituals."],
    ["Breeze Cotton Bedsheet", 1899, 2499, "Nova", ["White", "Sage"], [], "Breathable cotton bedsheet with a calm modern finish."],
    ["Form Storage Basket", 849, 1199, "Aster", ["Natural", "Black"], [], "Versatile storage basket for organized living."],
    ["Abstract Wall Art Frame", 1299, 1899, "Aster", [], [], "Set of 3 minimalist wall frames with abstract geometric art prints."],
    ["Aromatic Soy Candle Set", 699, 999, "Aster", [], [], "Three scented natural soy candles: Lavender, Sandalwood, Jasmine."],
    ["Minimalist Wall Clock", 999, 1499, "Urban", ["Black", "White"], [], "Non-ticking silent wall clock with a modern wooden rim."],
    ["Bamboo Drawer Organizers", 899, 1299, "Urban", ["Natural"], [], "Set of 4 adjustable drawer dividers made of eco-friendly bamboo."],
    ["Ceramic Flower Vase", 799, 1099, "Aster", ["Cream"], [], "Textured matte ceramic vase for dried flowers and pampas grass."],
    ["Memory Foam Pillow", 1499, 1999, "Nova", ["White"], [], "Ergonomic contour neck pillow for comfortable sleeping posture."],
    ["Waffle Knit Bath Towels", 1299, 1799, "Aster", ["Grey", "Sage"], [], "Set of 2 highly absorbent quick-dry cotton bath towels."],
    ["Self-Watering Planter Pot", 599, 899, "Urban", ["White", "Grey"], [], "Pack of 3 self-watering plastic planters for indoor herbs."],
    ["Fleece Throw Blanket", 999, 1499, "Aster", ["Beige", "Charcoal"], [], "Super soft micro-fleece blanket for couches, beds, and travel."],
    ["Cozy Accent Rug", 2499, 3499, "Aster", ["Cream", "Grey"], [], "Plush shaggy floor carpet for living rooms and nursery."],
    ["Stainless Steel Kitchen Utensils", 1699, 2499, "Urban", ["Silver"], [], "12-piece heat-resistant silicone and steel cooking utensils."],
    ["Glass Food Storage Containers", 1299, 1799, "Urban", [], [], "Set of 5 leak-proof airtight borosilicate glass food containers."],
    ["Non-Stick Ceramic Frying Pan", 1499, 1999, "Nova", ["Grey"], [], "Eco-friendly non-stick ceramic skillet free of PFOA and PTFE."],
    ["Electric Salt & Pepper Grinders", 1199, 1699, "Nexa", [], [], "Automatic gravity-activated battery-operated spice grinders."],
    ["French Press Coffee Maker", 999, 1399, "Urban", ["Black"], [], "Double-walled stainless steel plunger and heat-resistant glass carafe."],
    ["Over-the-Door Organizer Rack", 799, 1099, "Aster", ["Black"], [], "Metal hanging hook rack for jackets, bags, and towels."],
    ["Under-Bed Storage Bags", 599, 899, "Aster", ["Grey"], [], "Pack of 3 breathable fabric storage bins with clear windows."],
    ["Silicone Baking Mat Set", 499, 799, "Urban", [], [], "Non-stick reusable silicone pastry mats for baking pans."],
    ["Magnetic Key Holder Shelf", 399, 599, "Urban", ["Black"], [], "Wall-mounted entryway organizer for mail, keys, and accessories."],
    ["Aroma Essential Oil Diffuser", 1299, 1799, "Luma", ["Woodgrain"], [], "Cool-mist ultrasonic humidifier with 7-color LED lights."]
  ],
  Grocery: [
    ["Daily Oats 1kg", 349, 449, "Harvest", ["Natural"], [], "Whole-grain oats for breakfast bowls, smoothies and baking."],
    ["Almond Crunch Granola", 499, 649, "Harvest", ["Natural"], [], "Crunchy granola blend for quick breakfast and snacking."],
    ["Cold Brew Coffee Blend", 599, 799, "RoastLab", ["Brown"], [], "Smooth medium-roast coffee blend for cold brewing."],
    ["Kitchen Spice Starter Box", 799, 999, "Harvest", ["Multi"], [], "A practical collection of everyday kitchen spices."],
    ["Premium Organic Quinoa 500g", 399, 499, "Harvest", ["Natural"], [], "Gluten-free nutrient-rich white quinoa seeds for salads."],
    ["Raw Himalayan Honey", 449, 599, "Harvest", ["Honey"], [], "100% pure raw unprocessed forest honey harvested from hives."],
    ["Extra Virgin Olive Oil", 899, 1199, "Harvest", ["Green"], [], "First cold-pressed extra virgin olive oil for salads and cooking."],
    ["Organic Green Tea Bags", 299, 399, "Harvest", [], [], "Pack of 50 organic green tea bags packed with antioxidants."],
    ["Roasted Almonds Salted", 499, 649, "Harvest", [], [], "Premium California almonds roasted and lightly salted."],
    ["Chia Seeds Superfood", 249, 349, "Harvest", [], [], "Organic black chia seeds loaded with omega-3 fatty acids."],
    ["Gluten-Free Almond Flour", 599, 799, "Harvest", [], [], "Finely ground blanched almonds perfect for gluten-free baking."],
    ["Organic Coconut Sugar", 299, 399, "Harvest", [], [], "Unrefined natural sweetener harvested from coconut palm blossoms."],
    ["Himalayan Pink Salt", 149, 199, "Harvest", [], [], "Pure mineral-rich coarse pink salt crystals for grinding."],
    ["Pure Maple Syrup", 799, 999, "Harvest", [], [], "100% pure organic grade-A dark maple syrup from Canada."],
    ["Natural Peanut Butter Creamy", 349, 449, "Harvest", [], [], "Unsweetened creamy peanut butter made with 100% roasted peanuts."],
    ["Dark Chocolate Bars 80%", 299, 399, "RoastLab", [], [], "Pack of 3 rich, bitter-sweet dark chocolate bars with sea salt."],
    ["Spiced Chai Tea Powder", 399, 549, "Harvest", [], [], "Traditional instant masala chai tea blend with cardamom and ginger."],
    ["Organic Apple Cider Vinegar", 349, 499, "Harvest", [], [], "Raw unfiltered apple cider vinegar with the 'mother' enzyme."],
    ["Mixed Seeds Healthy Blend", 279, 379, "Harvest", [], [], "Power mix of pumpkin, sunflower, flax, and sesame seeds."],
    ["Multigrain Breakfast Flakes", 249, 329, "Harvest", [], [], "High-fiber breakfast cereal made with wheat, oats, and ragi."],
    ["Natural Cashew Butter", 499, 649, "Harvest", [], [], "Creamy cashew nut butter spread without added oils or sugar."],
    ["Quinoa Pasta Gluten-Free", 299, 399, "Harvest", [], [], "Healthy gluten-free penne pasta made with quinoa and corn flour."],
    ["Matcha Green Tea Powder", 899, 1199, "Harvest", [], [], "Pure culinary grade Japanese matcha powder for lattes."],
    ["Dehydrated Fruit Mix", 349, 449, "Harvest", [], [], "Healthy snack mix of dried cranberries, raisins, and apricots."],
    ["Whole Wheat Couscous", 199, 279, "Harvest", [], [], "Easy-to-cook whole wheat couscous for healthy side dishes."]
  ],
  Health: [
    ["Daily Wellness Journal", 449, 599, "Luma", ["Sage", "Blue"], [], "Guided journal for routines, habits and mindful planning."],
    ["Recovery Massage Ball", 599, 799, "Pulse", ["Black", "Blue"], [], "Compact massage tool for post-workout recovery."],
    ["Multivitamin Daily Gummies", 699, 899, "Luma", [], [], "Chewable daily multivitamin gummies for adults with fruit flavor."],
    ["Vegan Plant Protein Powder", 1899, 2499, "Pulse", ["Chocolate"], [], "Pea and brown rice plant protein isolate with BCAAs."],
    ["Apple Cider Vinegar Gummies", 599, 799, "Luma", [], [], "Digestive wellness gummies enriched with B-vitamins and beetroot."],
    ["Premium Fish Oil Softgels", 799, 1099, "Luma", [], [], "High-potency omega-3 EPA/DHA softgels for heart and joint health."],
    ["Melatonin Sleep Support Drops", 499, 699, "Luma", [], [], "Liquid melatonin supplement for regulating sleep cycles naturally."],
    ["Organic Ashwagandha Capsules", 599, 799, "Luma", [], [], "Stress-relief herbal capsules standard to 5% withanolides."],
    ["Turmeric Curcumin Pills", 649, 899, "Luma", [], [], "Joint support supplement with black pepper extract for absorption."],
    ["Magnesium Complex Tablets", 549, 749, "Luma", [], [], "High-absorption magnesium supplement for muscle and nerve relaxation."],
    ["Vitamin D3 + K2 Spray", 449, 599, "Luma", [], [], "Sublingual liquid spray for bone strength and calcium absorption."],
    ["Probiotic Gut Health Capsules", 899, 1199, "Luma", [], [], "Daily probiotic supplement with 30 billion CFUs and 10 strains."],
    ["Elderberry Immune Syrup", 699, 949, "Luma", [], [], "High-antioxidant elderberry syrup with zinc and vitamin C."],
    ["Collagen Peptides Powder", 1499, 1999, "Luma", [], [], "Hydrolyzed bovine collagen powder for skin, hair, and nail health."],
    ["Epsom Salt Soaking Blend", 349, 499, "Pulse", ["Lavender"], [], "Pure magnesium sulfate crystals for soothing sore muscles in a bath."],
    ["Herbal Sleep Tea Infusion", 299, 399, "Luma", [], [], "Caffeine-free chamomile, valerian root, and lavender tea blend."],
    ["Joint Support Glucosamine", 799, 1099, "Luma", [], [], "Triple-strength glucosamine, chondroitin, and MSM joint tablets."],
    ["Electrolyte Hydration Packets", 499, 699, "Pulse", ["Lemon"], [], "Rapid hydration powder packets with optimal electrolyte balance."],
    ["Iron Supplement Gentle", 399, 549, "Luma", [], [], "Non-constipating gentle iron capsules with Vitamin C."],
    ["Coenzyme Q10 Softgels", 999, 1399, "Luma", [], [], "Antioxidant cellular energy supplement supporting cardiovascular health."],
    ["Ginger Soothing Lozenges", 199, 299, "Luma", [], [], "Organic ginger cough drops for throat irritation and motion sickness."],
    ["Activated Charcoal Powder", 299, 449, "Luma", [], [], "Food-grade natural charcoal powder for detox and teeth whitening."],
    ["Digital Blood Pressure Monitor", 1899, 2499, "Nova", [], [], "Upper arm digital BP monitor with large LCD screen memory."],
    ["First Aid Emergency Kit", 699, 999, "Pulse", [], [], "Compact 100-piece medical kit for home, travel, and camping."],
    ["Compressive Knee Sleeve", 499, 699, "Pulse", ["Black"], ["M", "L"], "Elastic knee brace support for running and joint relief."]
  ],
  Lifestyle: [
    ["HydraSteel Water Bottle", 1099, 1499, "Nova", ["Black", "Steel", "Sage"], [], "Double-wall insulated bottle for daily hydration."],
    ["Travel Organizer Pouch", 899, 1199, "Urban", ["Black", "Sand"], [], "Smart organizer pouch for cables, documents and essentials."],
    ["Leather Passport Wallet", 1199, 1699, "Urban", ["Tan", "Black"], [], "Genuine leather passport holder with RFID blocking slot."],
    ["Compact Travel Umbrella", 699, 999, "Nova", ["Navy", "Black"], [], "Windproof folding umbrella with auto open-close button."],
    ["Reusable Shopping Tote Bag", 299, 399, "Aster", ["Beige"], [], "Durable cotton canvas grocery shopping shoulder bag."],
    ["Insulated Lunch Bag Box", 599, 899, "Urban", ["Grey", "Black"], [], "Thermal insulated leakproof lunch bag with pockets."],
    ["UV Sanitizer Box Case", 1999, 2999, "Nexa", ["White"], [], "UVC light sanitizing box for smartphones, keys, and jewelry."],
    ["Sleep Eye Mask Silk", 399, 599, "Aster", ["Black", "Pink"], [], "100% natural mulberry silk blindfold for sleeping comfort."],
    ["Key Organizer Leather", 599, 899, "Urban", ["Black", "Brown"], [], "Compact key holder pocket fold organizer in genuine leather."],
    ["Minimalist Card Holder Wallet", 499, 799, "Urban", ["Carbon"], [], "Slim metal card holder wallet with elastic band cash strap."],
    ["Travel Neck Pillow Memory Foam", 899, 1299, "Nova", ["Navy"], [], "360-degree support memory foam neck pillow with plush cover."],
    ["Luggage Tag Set Premium", 299, 449, "Urban", ["Brown"], [], "Genuine leather privacy luggage tags for travel bags."],
    ["Desktop Calendar Wooden", 449, 599, "Urban", ["Natural"], [], "Perpetual block calendar made of eco-friendly pine wood."],
    ["Glass Water Bottle Sleeve", 599, 799, "Nova", ["Grey"], [], "Borosilicate glass water bottle with protective silicone sleeve."],
    ["Linen Apron with Pockets", 699, 999, "Aster", ["Charcoal"], [], "Criss-cross back style chef apron made of linen and cotton."],
    ["Eco-Friendly Yoga Block", 499, 699, "Pulse", ["Purple"], [], "High-density EVA foam block to support yoga poses."],
    ["Bamboo Travel Cutlery Set", 399, 549, "Aster", [], [], "Reusable wooden fork, spoon, knife, and straw in canvas pouch."],
    ["Stainless Steel Drinking Straws", 249, 349, "Aster", [], [], "Set of 4 reusable metal straws with cleaning brush pouch."],
    ["Canvas Drawstring Laundry Bag", 349, 499, "Aster", ["Off-white"], [], "Heavy-duty canvas laundry hamper bag with shoulder strap."],
    ["Felt Laptop Sleeve Bag", 699, 999, "Urban", ["Grey"], [], "Premium felt fabric laptop sleeve case for 14-inch notebooks."],
    ["Pocket Notebooks Set of 3", 299, 399, "Urban", [], [], "Kraft paper softcover pocket journals with dotted pages."],
    ["Self-Cleaning Water Bottle", 3999, 5499, "Nexa", ["Black"], [], "Smart water bottle with built-in UV-C water purification system."],
    ["Handheld Garment Steamer", 1699, 2299, "Nexa", ["Blue"], [], "Portable fabric steamer with quick heat-up for clothes crease removal."],
    ["Acoustic Noise Control Panels", 1299, 1799, "Urban", ["Grey"], [], "Set of 12 self-adhesive acoustic sound dampening wall panels."],
    ["Shoe Horn Long Handle", 299, 399, "Nova", [], [], "Stainless steel metal shoe horn for easy shoe wearing."]
  ],
  Sports: [
    ["FlexGrip Training Mat", 1399, 1899, "Pulse", ["Black", "Blue"], [], "Cushioned training mat for yoga, mobility and home workouts."],
    ["CoreLift Resistance Bands", 999, 1399, "Pulse", ["Multi"], [], "Progressive resistance band set for strength and mobility training."],
    ["Speed Jump Rope Adjustable", 349, 499, "Pulse", ["Black"], [], "Tangle-free steel cable speed jump rope for cardio workouts."],
    ["Sports Gym Duffel Bag", 1299, 1799, "Pulse", ["Grey", "Black"], [], "Gym bag with ventilated wet pocket and shoe compartment."],
    ["Stainless Steel Shaker Bottle", 899, 1199, "Pulse", ["Steel"], [], "Insulated shaker bottle with wire whisk ball for protein shakes."],
    ["Adjustable Hand Grip Strengthener", 299, 449, "Pulse", ["Orange"], [], "Forearm and wrist exercise gripper with adjustable resistance."],
    ["High-Density Foam Roller", 699, 999, "Pulse", ["Black"], [], "Foam roller for muscle soreness relief and trigger point massage."],
    ["Ankle Weights Adjustable Set", 799, 1099, "Pulse", ["Black"], [], "Ankle/wrist weight straps with iron sand fillings for jogging."],
    ["Running Waist Pack Belt", 399, 599, "Pulse", ["Green"], [], "Waterproof running belt pouch for phone, keys, and cards."],
    ["Sweat Wicking Sports Headband", 199, 299, "Pulse", ["Black"], [], "Elastic stretch hair band absorbing sweat for gym running."],
    ["Microfiber Gym Towel Set", 399, 549, "Pulse", ["Grey"], [], "Pack of 3 fast-drying highly absorbent microfiber sport towels."],
    ["Acupressure Massage Mat", 1499, 1999, "Pulse", ["Purple"], [], "Acupressure mat and pillow set for back pain relief and therapy."],
    ["Push-Up Bar Stand Handles", 499, 699, "Pulse", [], [], "Slip-resistant chrome steel push up bars for chest workouts."],
    ["Ab Roller Wheel Exercise", 599, 799, "Pulse", ["Yellow"], [], "Double-wheel ab training equipment with knee pad cushion."],
    ["Yoga Strap Cotton Loop", 249, 349, "Pulse", [], [], "Durable cotton stretch strap with metal D-ring buckle."],
    ["Pilates Resistance Ring", 699, 999, "Pulse", ["Blue"], [], "14-inch fitness magic circle ring for core inner thigh training."],
    ["Therapy Grip Exercise Ball", 199, 299, "Pulse", [], [], "Stress relief hand squeeze therapy ball for finger strength."],
    ["Running Compression Socks", 349, 499, "Pulse", ["White"], [], "Graduated compression socks for shin splints and running relief."],
    ["Waterproof Sports Armband", 299, 449, "Pulse", ["Black"], [], "Adjustable running arm band case holder for smartphones."],
    ["Agility Ladder Training Set", 899, 1299, "Pulse", [], [], "Agility workout set with ladder, cones, and resistance parachute."],
    ["Liquid Chalk Grip Boost", 399, 549, "Pulse", [], [], "Mess-free liquid chalk for grip support in rock climbing and lifting."],
    ["Kinesiology Recovery Tape", 299, 399, "Pulse", ["Beige"], [], "Elastic muscle support therapeutic sports tape roll."],
    ["Muscle Massage Roller Stick", 499, 699, "Pulse", [], [], "Handheld massage stick for IT band, calves, and quad relief."],
    ["Adjustable Kettlebell Weight", 2499, 3499, "Pulse", ["Black"], [], "Adjustable kettlebell weight shell that supports plates inside."],
    ["Weighted Training Vest", 1899, 2499, "Pulse", ["Black"], [], "10kg running training vest with reflective night straps."]
  ],
  Accessories: [
    ["Classic Aviator Sunglasses", 1299, 1799, "Nova", ["Gold"], [], "Retro-style polarized sunglasses offering 100% UV protection."],
    ["Minimalist Leather Watch", 2499, 3499, "Nova", ["Black", "Brown"], [], "Slim dress watch with genuine leather strap and Japanese quartz."],
    ["Silver Chain Necklace", 799, 999, "Luma", ["Silver"], [], "High-polished sterling silver curb link chain necklace."],
    ["Blue Light Blocking Glasses", 699, 999, "Nova", ["Clear"], [], "Anti-glare computer glasses protecting eyes from blue screens."],
    ["Canvas Baseball Cap", 399, 599, "Urban", ["Black", "Khaki"], [], "Adjustable low-profile washed cotton baseball dad hat."],
    ["Leather Key Fob Keychain", 299, 399, "Urban", ["Tan"], [], "Handcrafted genuine leather strap keychain with sturdy brass ring."],
    ["Beaded Bracelet Set", 349, 499, "Aster", [], [], "Set of 4 stackable natural stone beads elastic bracelets."],
    ["Knitted Winter Gloves", 249, 349, "Aster", ["Black"], [], "Thermal touchscreen friendly knit gloves with fleece cuffs."],
    ["Silk Neck Tie Premium", 799, 999, "Urban", ["Navy"], [], "Jacquard woven formal necktie made of 100% pure silk."],
    ["Brass Tie Clip Set", 399, 549, "Urban", ["Silver"], [], "Set of 3 classic tie bar clips for regular size neckties."],
    ["Cufflinks Classic Steel", 599, 799, "Urban", ["Silver"], [], "Polished round steel cufflinks for men's formal shirts."],
    ["Stainless Steel Ring", 299, 399, "Urban", ["Black"], [], "8mm black matte finished comfort fit wedding band ring."],
    ["Leather Wallet Bi-fold", 1199, 1699, "Urban", ["Brown"], [], "Classic slim bi-fold wallet in premium leather with coin pocket."],
    ["Wool Felt Fedora Hat", 1299, 1799, "Aster", ["Camel"], [], "Wide brim vintage jazz style fedora hat with belt buckle."],
    ["Suede Belt Handcrafted", 999, 1399, "Nova", ["Navy"], [], "Hand-finished real suede belt with polished silver buckle."],
    ["Travel Toiletry Bag Organizer", 699, 999, "Urban", ["Black"], [], "Waterproof canvas hanging shaving dopp kit travel case."],
    ["Canvas Tote Shoulder Bag", 499, 699, "Aster", ["Natural"], [], "Heavyweight blank cotton tote bag with sturdy shoulder straps."],
    ["Minimalist Hair Claw Clips", 199, 299, "Luma", ["Multi"], [], "Pack of 4 matte pastel color plastic strong hold hair clamps."],
    ["Silver Hoop Earrings", 699, 899, "Luma", ["Silver"], [], "Hypoallergenic sterling silver small classic sleeper hoop earrings."],
    ["Pendant Necklace Minimalist", 499, 699, "Luma", ["Gold"], [], "14K gold plated dainty coin disc initial pendant necklace."],
    ["Leather Wrap Wristband", 399, 499, "Nova", ["Brown"], [], "Casual multi-layer braided leather wrap bracelet for men."],
    ["Warm Knit Scarf", 699, 999, "Aster", ["Burgundy"], [], "Cozy soft winter neck wrap scarf with tassel detailing."],
    ["Cashmere Touch Shawl", 1199, 1599, "Aster", ["Ivory"], [], "Luxurious solid color pashmina wrap scarf for evening wear."],
    ["Waterproof Watch Case", 899, 1299, "Nova", ["Black"], [], "Tough EVA hard shell single watch storage travel organizer."],
    ["Sun Hat Wide Brim", 699, 999, "Aster", ["Beige"], [], "Foldable straw sun hat with UPF 50+ UV face protection."]
  ],
  Office: [
    ["Ergonomic Desk Chair Cush", 1499, 1999, "Nova", ["Black"], [], "Comfort memory foam seat cushion for desk chair spine relief."],
    ["Leather Desk Pad Protector", 899, 1299, "Urban", ["Brown"], [], "Large dual-sided leather desk blotter writing pad mousemat."],
    ["Dual Monitor Mount Arm", 3499, 4999, "Nexa", ["Black"], [], "Heavy-duty steel dual monitor gas spring desk arm stand."],
    ["Aluminum Laptop Stand", 1299, 1799, "Nova", ["Silver"], [], "Ergonomic multi-angle height adjustable cooling laptop holder."],
    ["Under-Desk Foot Rest", 999, 1399, "Nova", ["Black"], [], "Ergonomic teardrop foam footrest cushion under desk office."],
    ["Vertical Ergonomic Mouse", 1499, 1999, "Nexa", ["Black"], [], "Wireless rechargeable vertical mouse reducing wrist fatigue."],
    ["Wireless Charging Desk Pad", 1899, 2499, "Urban", ["Black"], [], "Desk organizer pad with integrated fast wireless charger."],
    ["Desk Organizer Drawer Tray", 499, 699, "Urban", ["Black"], [], "Multi-functional mesh metal desk drawer sorting storage tray."],
    ["Dry Erase Whiteboard", 899, 1299, "Urban", ["White"], [], "Magnetic wall hanging white board frame with dry erase pens."],
    ["Magnetic Cable Clips Organizer", 299, 399, "Urban", ["Black"], [], "Silicone cord holder organizer with magnetic cable ties."],
    ["Sticky Notes Holder Dispenser", 399, 499, "Urban", ["Clear"], [], "Acrylic memo pad sticky note desktop dispenser holder."],
    ["Gel Pen Set Fine Point", 299, 399, "Urban", ["Black"], [], "Pack of 12 retractable fine point smooth writing gel pens."],
    ["Mesh Wastebasket Trash Can", 349, 499, "Urban", ["Silver"], [], "Circular metal wire mesh rubbish bin waste paper basket."],
    ["Desk Fan USB Rechargeable", 699, 999, "Nexa", ["White"], [], "Quiet cooling small personal desk fan with speed levels."],
    ["Self-Inking Date Stamp", 449, 599, "Urban", ["Blue"], [], "Heavy duty automatic self inking date stamp for office."],
    ["Smart Document Scanner Bed", 4999, 6999, "Nexa", ["Grey"], [], "High-speed document scanner for digitizing invoices and notes."],
    ["Filing Box Foldable Organizer", 799, 1099, "Urban", ["Grey"], [], "Decorative linen fabric hanging file folder storage box."],
    ["Letter Opener Ergonomic", 199, 299, "Urban", ["Silver"], [], "Pack of 3 stainless steel letter envelope slitting knives."],
    ["Stapler and Tape Dispenser Set", 699, 899, "Urban", ["Gold"], [], "Clear acrylic and gold office desk stapler tape dispenser kit."],
    ["Privacy Screen Protector Filter", 1299, 1799, "Nova", [], [], "Anti-spy anti-glare screen filter for 14-inch laptops."],
    ["Laminator Machine Thermal", 1999, 2699, "Nexa", ["Black"], [], "Thermal hot laminating machine with trimmer pouches set."],
    ["Shredder Paper Cross-Cut", 2999, 3999, "Nexa", ["Black"], [], "High-security cross-cut paper and credit card shredder bin."],
    ["Adjustable Height Footrest", 899, 1199, "Nova", ["Grey"], [], "Plastic massage textured angle adjustable under desk foot stool."],
    ["Ergonomic Keyboard Wrist Rest", 499, 699, "Nova", ["Black"], [], "Memory foam keyboard and mouse wrist support cushion pad."],
    ["Desktop Bookshelf Expandable", 799, 1099, "Urban", ["Natural"], [], "Expanding desktop wood bookshelf organizer rack stand display."]
  ]
};

const rawProducts = [];
for (const [catName, items] of Object.entries(categoryProductsMap)) {
  for (const item of items) {
    const [name, price, compareAtPrice, brand, colors, sizes, desc] = item;
    rawProducts.push([
      name,
      catName,
      price,
      compareAtPrice,
      brand,
      colors,
      sizes,
      desc
    ]);
  }
}

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
