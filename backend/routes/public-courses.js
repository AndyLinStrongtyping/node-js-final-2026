const express = require("express");
const {
  getOngoingCourses,
  bookCourse,
  cancelCourseBooking,
} = require("../controllers/public-courses");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.get("/", getOngoingCourses);
router.post("/:courseId", auth, bookCourse);
router.delete("/:courseId", auth, cancelCourseBooking);

module.exports = router;
