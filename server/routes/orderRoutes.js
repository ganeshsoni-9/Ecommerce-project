const r = require("express").Router();
const c = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const roles = require("../middleware/adminMiddleware");

r.use(protect);
r.post("/", c.create);
r.get("/mine", c.mine);
r.get("/:id", c.get);

// User cancellation (support both PATCH and PUT)
r.patch("/:id/cancel", c.cancel);
r.put("/:id/cancel", c.cancel);

// Admin orders (support both PATCH and PUT, and explicit status/shipping endpoints)
r.get("/admin/all", roles("ADMIN", "MANAGER"), c.adminList);
r.patch("/admin/:id", roles("ADMIN", "MANAGER"), c.updateStatus);
r.put("/admin/:id/status", roles("ADMIN", "MANAGER"), c.updateStatus);
r.put("/admin/:id/shipping", roles("ADMIN", "MANAGER"), c.updateStatus);

module.exports = r;