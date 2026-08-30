const { dataSource } = require("../db/data-source");

//取得所有技能
const getSkills = async (req, res, next) => {
  try {
    const skillRepo = dataSource.getRepository("Skill");
    const skills = await skillRepo.find();

    res.status(200).json({
      status: "success",
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

//新增技能
const createSkill = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    const skillRepo = dataSource.getRepository("Skill");
    const skillName = name.trim();

    const existingSkill = await skillRepo.findOne({
      where: { name: skillName },
    });

    if (existingSkill) {
      return res.status(409).json({
        status: "failed",
        message: "資料重複",
      });
    }

    const skill = await skillRepo.save({
      name: skillName,
    });

    res.status(200).json({
      status: "success",
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSkill = async (req, res, next) => {
  try {
    const { skillId } = req.params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(skillId)) {
      return res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
    }

    const skillRepo = dataSource.getRepository("Skill");
    const result = await skillRepo.delete({ id: skillId });

    if (result.affected === 0) {
      return res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
    }

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  createSkill,
  deleteSkill,
};