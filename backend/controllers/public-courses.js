const { dataSource } = require("../db/data-source");
const { MoreThan, LessThanOrEqual } = require("typeorm");
const {
  bookCourseForUser,
  cancelCourseBookingForUser,
} = require("../services/booking-service");

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getOngoingCourses = async (req, res, next) => {
  try {
    const now = new Date();
    const courses = await dataSource.getRepository("Course").find({
      where: {
        start_at: LessThanOrEqual(now),
        end_at: MoreThan(now),
      },
      relations: { user: true, skill: true },
      order: { start_at: "ASC" },
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
        coach_name: course.user.name,
        skill_name: course.skill.name,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const bookCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!uuidRegex.test(courseId)) {
      return res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
    }

    await bookCourseForUser({ courseId, userId: req.user.id });
    return res.status(201).json({ status: "success", data: null });
  } catch (error) {
    return next(error);
  }
};

const cancelCourseBooking = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!uuidRegex.test(courseId)) {
      return res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
    }

    await cancelCourseBookingForUser({ courseId, userId: req.user.id });
    return res.status(200).json({ status: "success", data: null });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getOngoingCourses, bookCourse, cancelCourseBooking };
