const {
  promoteUserToCoach,
  getCoachProfileForUser,
  updateCoachProfileForUser,
  createCourseForCoach,
  getCourseForOwner,
  updateCourseForOwner,
  listCoursesForCoach,
  getMonthlyRevenueForCoach,
} = require("../services/coach-service");

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const courseInputIsInvalid = ({
  skill_id,
  name,
  description,
  start_at,
  end_at,
  max_participants,
  meeting_url,
}) =>
  typeof skill_id !== "string" ||
  !uuidRegex.test(skill_id) ||
  typeof name !== "string" ||
  name.trim() === "" ||
  typeof description !== "string" ||
  description.trim() === "" ||
  typeof start_at !== "string" ||
  start_at.trim() === "" ||
  typeof end_at !== "string" ||
  end_at.trim() === "" ||
  !Number.isInteger(max_participants) ||
  max_participants < 0 ||
  typeof meeting_url !== "string" ||
  meeting_url.trim() === "" ||
  !meeting_url.startsWith("https");

const upgradeCoach = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { experience_years, description, profile_image_url } = req.body;
    const isInvalidExperienceYears =
      !Number.isInteger(experience_years) || experience_years < 0;
    const isInvalidDescription =
      typeof description !== "string" || description.trim() === "";
    const isInvalidProfileImageUrl =
      profile_image_url !== undefined &&
      (typeof profile_image_url !== "string" ||
        (profile_image_url !== "" && !profile_image_url.startsWith("https")));

    if (
      isInvalidExperienceYears ||
      isInvalidDescription ||
      isInvalidProfileImageUrl
    ) {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        status: "failed",
        message: "使用者不存在",
      });
    }

    const profileImageUrl =
      profile_image_url === undefined || profile_image_url === ""
        ? null
        : profile_image_url;
    const { updatedUser, coach } = await promoteUserToCoach({
      userId,
      experienceYears: experience_years,
      description: description.trim(),
      profileImageUrl,
    });

    return res.status(201).json({
      status: "success",
      data: {
        user: { name: updatedUser.name, role: updatedUser.role },
        coach: {
          id: coach.id,
          user_id: updatedUser.id,
          experience_years: coach.experience_years,
          description: coach.description,
          profile_image_url: coach.profile_image_url,
          created_at: coach.createdAt,
          updated_at: coach.updatedAt,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getMyCoach = async (req, res, next) => {
  try {
    const coach = await getCoachProfileForUser({ userId: req.user.id });
    return res.status(200).json({
      status: "success",
      data: {
        id: coach.id,
        experience_years: coach.experience_years,
        description: coach.description,
        profile_image_url: coach.profile_image_url,
        skill_ids: coach.skills.map((skill) => skill.id),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updateMyCoach = async (req, res, next) => {
  try {
    const { experience_years, description, profile_image_url, skill_ids } =
      req.body;
    const isInvalidExperienceYears =
      !Number.isInteger(experience_years) || experience_years < 0;
    const isInvalidDescription =
      typeof description !== "string" || description.trim() === "";
    const isInvalidProfileImageUrl =
      typeof profile_image_url !== "string" ||
      profile_image_url.trim() === "" ||
      !profile_image_url.startsWith("https");
    const isInvalidSkillIds =
      !Array.isArray(skill_ids) ||
      skill_ids.length === 0 ||
      skill_ids.some(
        (skillId) => typeof skillId !== "string" || !uuidRegex.test(skillId),
      );

    if (
      isInvalidExperienceYears ||
      isInvalidDescription ||
      isInvalidProfileImageUrl ||
      isInvalidSkillIds
    ) {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    const updatedCoach = await updateCoachProfileForUser({
      userId: req.user.id,
      experienceYears: experience_years,
      description: description.trim(),
      profileImageUrl: profile_image_url,
      skillIds: skill_ids,
    });

    return res.status(200).json({
      status: "success",
      data: {
        id: updatedCoach.id,
        experience_years: updatedCoach.experience_years,
        description: updatedCoach.description,
        profile_image_url: updatedCoach.profile_image_url,
        skill_ids: updatedCoach.skills.map((skill) => skill.id),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    if (courseInputIsInvalid(req.body)) {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;
    const { course, skill } = await createCourseForCoach({
      user: req.user,
      skillId: skill_id,
      name: name.trim(),
      description: description.trim(),
      startAt: start_at,
      endAt: end_at,
      maxParticipants: max_participants,
      meetingUrl: meeting_url.trim(),
    });

    return res.status(201).json({
      status: "success",
      data: {
        course: {
          id: course.id,
          user_id: req.user.id,
          skill_id: skill.id,
          name: course.name,
          description: course.description,
          start_at: course.start_at,
          end_at: course.end_at,
          max_participants: course.max_participants,
          meeting_url: course.meeting_url,
          created_at: course.createdAt,
          updated_at: course.updatedAt,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!uuidRegex.test(courseId)) {
      return res.status(400).json({
        status: "failed",
        message: "課程不存在",
      });
    }

    const course = await getCourseForOwner({
      courseId,
      userId: req.user.id,
    });

    return res.status(200).json({
      status: "success",
      data: {
        id: course.id,
        name: course.name,
        description: course.description,
        start_at: course.start_at,
        end_at: course.end_at,
        max_participants: course.max_participants,
        skill_name: course.skill.name,
        skill_id: course.skill.id,
        meeting_url: course.meeting_url,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (courseInputIsInvalid(req.body)) {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    if (!uuidRegex.test(courseId)) {
      return res.status(400).json({
        status: "failed",
        message: "課程不存在",
      });
    }

    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;
    const { updatedCourse, skill } = await updateCourseForOwner({
      courseId,
      userId: req.user.id,
      skillId: skill_id,
      name: name.trim(),
      description: description.trim(),
      startAt: start_at,
      endAt: end_at,
      maxParticipants: max_participants,
      meetingUrl: meeting_url.trim(),
    });

    return res.status(200).json({
      status: "success",
      data: {
        course: {
          id: updatedCourse.id,
          user_id: req.user.id,
          skill_id: skill.id,
          name: updatedCourse.name,
          description: updatedCourse.description,
          start_at: updatedCourse.start_at,
          end_at: updatedCourse.end_at,
          max_participants: updatedCourse.max_participants,
          meeting_url: updatedCourse.meeting_url,
          created_at: updatedCourse.createdAt,
          updated_at: updatedCourse.updatedAt,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getMyCourses = async (req, res, next) => {
  try {
    const data = await listCoursesForCoach({ userId: req.user.id });
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    return next(error);
  }
};

const getMonthlyRevenue = async (req, res, next) => {
  try {
    const { month } = req.query;
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];

    if (typeof month !== "string" || !monthNames.includes(month)) {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    const total = await getMonthlyRevenueForCoach({
      userId: req.user.id,
      month,
    });

    return res.status(200).json({ status: "success", data: { total } });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  upgradeCoach,
  getMyCoach,
  updateMyCoach,
  createCourse,
  getCourse,
  updateCourse,
  getMyCourses,
  getMonthlyRevenue,
};
