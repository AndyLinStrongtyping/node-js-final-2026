const { dataSource } = require("../db/data-source");
const { MoreThan } = require("typeorm");

const getCoachList = async (req, res, next) => {
  try {
    const { per, page } = req.query;

    const perNumber = Number(per);
    const pageNumber = Number(page);

    const isInvalidPagination =
      typeof per !== "string" ||
      per.trim() === "" ||
      typeof page !== "string" ||
      page.trim() === "" ||
      !Number.isInteger(perNumber) ||
      !Number.isInteger(pageNumber) ||
      perNumber < 0 ||
      pageNumber < 0;

    if (isInvalidPagination) {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    const coachRepo = dataSource.getRepository("Coach");

    const coaches = await coachRepo.find({
      relations: {
        user: true,
      },
      take: perNumber,
      skip: Math.max(pageNumber - 1, 0) * perNumber,
      order: {
        createdAt: "ASC",
      },
    });

    return res.status(200).json({
      status: "success",
      data: coaches.map((coach) => ({
        id: coach.id,
        user_id: coach.user.id,
        name: coach.user.name,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getCoachDetail = async (req, res, next) => {
  try {
    const { coachId } = req.params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(coachId)) {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    const coachRepo = dataSource.getRepository("Coach");

    const coach = await coachRepo.findOne({
      where: {
        id: coachId,
      },
      relations: {
        user: true,
        skills: true,
      },
    });

    if (!coach) {
      return res.status(400).json({
        status: "failed",
        message: "找不到該教練",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        user: {
          name: coach.user.name,
          role: coach.user.role,
        },
        coach: {
          id: coach.id,
          user_id: coach.user.id,
          experience_years: coach.experience_years,
          description: coach.description,
          profile_image_url: coach.profile_image_url,
          created_at: coach.createdAt,
          updated_at: coach.updatedAt,
          skills: coach.skills.map((skill) => skill.name),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCoachCourses = async (req, res, next) => {
  try {
    const { coachId } = req.params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(coachId)) {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    const coachRepo = dataSource.getRepository("Coach");

    const coach = await coachRepo.findOne({
      where: {
        id: coachId,
      },
      relations: {
        user: true,
      },
    });

    if (!coach) {
      return res.status(400).json({
        status: "failed",
        message: "找不到該教練",
      });
    }

    const courseRepo = dataSource.getRepository("Course");

    const courses = await courseRepo.find({
      where: {
        user: {
          id: coach.user.id,
        },
        end_at: MoreThan(new Date()),
      },
      relations: {
        user: true,
        skill: true,
      },
      order: {
        start_at: "ASC",
      },
    });

    return res.status(200).json({
      status: "success",
      data: courses.map((course) => ({
        id: course.id,
        name: course.name,
        description: course.description,
        start_at: course.start_at,
        end_at: course.end_at,
        max_participants: course.max_participants,
        meeting_url: course.meeting_url,
        coach_name: course.user.name,
        skill_name: course.skill.name,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCoachList, getCoachDetail, getCoachCourses };
