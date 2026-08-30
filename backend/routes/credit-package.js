const express = require("express");
const {
  getCreditPackages,
  createCreditPackage,
  deleteCreditPackage,
} = require("../controllers/credit-package");
const { buyCreditPackage } = require("../controllers/users");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.get("/", getCreditPackages);
router.post("/", createCreditPackage);
router.post("/:creditPackageId", auth, buyCreditPackage);
router.delete("/:packageId", deleteCreditPackage);

module.exports = router;