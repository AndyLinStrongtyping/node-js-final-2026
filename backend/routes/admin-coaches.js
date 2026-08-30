const express = require("express");
const {
  upgradeCoach,
  getMyCoach,
  updateMyCoach,
  createCourse,
  getCourse,
  updateCourse,
  getMyCourses,
  getMonthlyRevenue
} = require("../controllers/admin-coaches");
const { auth, isCoach } = require("../middlewares/auth");

const router = express.Router();

router.get("/", auth, isCoach, getMyCoach);
router.post("/courses", auth, isCoach, createCourse);
router.get("/courses/:courseId", auth, getCourse);
router.put("/courses/:courseId", auth, updateCourse);
router.get("/courses", auth, isCoach, getMyCourses);
router.get("/revenue", auth, isCoach, getMonthlyRevenue);
router.post("/:userId", upgradeCoach);
router.put("/", auth, isCoach, updateMyCoach);


module.exports = router;
