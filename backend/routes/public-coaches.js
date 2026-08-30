const express = require("express");
const {
  getCoachList,
  getCoachDetail,
  getCoachCourses,
} = require("../controllers/public-coaches");

const router = express.Router();

router.get("/", getCoachList);
router.get("/:coachId/courses", getCoachCourses);
router.get("/:coachId", getCoachDetail);

module.exports = router;
