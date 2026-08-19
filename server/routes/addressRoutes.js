const express = require("express");

const router = express.Router();

const addressController = require("../controllers/addressController");

const { protect } = require("../middleware/authMiddleware");

// ======================================================
// ADDRESS ROUTES
// ======================================================

// Get logged-in user's addresses
router.get(
  "/",
  protect,
  addressController.list
);

// Get one address
router.get(
  "/:id",
  protect,
  addressController.getById
);

// Add address
router.post(
  "/",
  protect,
  addressController.create
);

// Update address
router.put(
  "/:id",
  protect,
  addressController.update
);

// Set default address
router.patch(
  "/:id/default",
  protect,
  addressController.setDefault
);

// Delete address
router.delete(
  "/:id",
  protect,
  addressController.remove
);

module.exports = router;
