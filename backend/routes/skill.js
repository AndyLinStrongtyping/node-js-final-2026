const express = require("express");
const { getSkills, createSkill, deleteSkill } = require("../controllers/skill");

const router = express.Router();

router.get("/", getSkills);
router.post("/", createSkill);
router.delete("/:skillId", deleteSkill);

module.exports = router;