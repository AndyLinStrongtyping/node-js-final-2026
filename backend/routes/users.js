const express = require("express");
const {
  signUp,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  buyCreditPackage,
  getCreditPackageHistory,
  getUserCourses,
} = require("../controllers/users");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.put("/password", auth, updatePassword);
router.get("/credit-package", auth, getCreditPackageHistory);
router.get("/courses", auth, getUserCourses);

module.exports = router;