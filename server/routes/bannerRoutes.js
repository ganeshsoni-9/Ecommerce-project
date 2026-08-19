const express = require("express");

const router = express.Router();

const bannerController = require("../controllers/bannerController");

const { protect } = require("../middleware/authMiddleware");
const roles = require("../middleware/adminMiddleware");

// ======================================================
// PUBLIC ROUTES
// ======================================================

// Get active banners
router.get("/", bannerController.list);

// Get single banner
router.get("/:id", bannerController.getById);

// ======================================================
// ADMIN ROUTES
// ======================================================

// Create banner
router.post(
  "/",
  protect,
  roles("ADMIN"),
  bannerController.create
);

// Update banner
router.put(
  "/:id",
  protect,
  roles("ADMIN"),
  bannerController.update
);

// Delete/deactivate banner
router.delete(
  "/:id",
  protect,
  roles("ADMIN"),
  bannerController.remove
);

module.exports = router;
