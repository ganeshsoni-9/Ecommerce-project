const router = require("express").Router();
const controller = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", controller.list);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", controller.markAsRead);
router.delete("/:id", controller.remove);

module.exports = router;
