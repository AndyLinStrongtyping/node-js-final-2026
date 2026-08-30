const { dataSource } = require("../db/data-source");
const { In } = require("typeorm");
const { ApiError } = require("../utils/api-error");

const promoteUserToCoach = async ({
  userId,
  experienceYears,
  description,
  profileImageUrl,
}) => {
  const userRepo = dataSource.getRepository("User");
  const user = await userRepo.findOne({ where: { id: userId } });

  if (!user) {
    throw new ApiError(400, "使用者不存在");
  }

  if (user.role === "COACH") {
    throw new ApiError(409, "使用者已經是教練");
  }

  return dataSource.transaction(async (manager) => {
    const transactionUserRepo = manager.getRepository("User");
    const coachRepo = manager.getRepository("Coach");

    const updatedUser = await transactionUserRepo.save({
      ...user,
      role: "COACH",
    });

    const coach = await coachRepo.save({
      user: updatedUser,
      experience_years: experienceYears,
      description,
      profile_image_url: profileImageUrl,
    });

    return { updatedUser, coach };
  });
};

const getCoachProfileForUser = async ({ userId }) => {
  const coach = await dataSource.getRepository("Coach").findOne({
    where: { user: { id: userId } },
    relations: { skills: true },
  });

  if (!coach) {
    throw new ApiError(400, "找不到教練資料");
  }

  return coach;
};

const updateCoachProfileForUser = async ({
  userId,
  experienceYears,
  description,
  profileImageUrl,
  skillIds,
}) => {
  const coach = await getCoachProfileForUser({ userId });
  const skillRepo = dataSource.getRepository("Skill");
  const skills = await skillRepo.find({ where: { id: In(skillIds) } });

  if (skills.length !== skillIds.length) {
    throw new ApiError(400, "欄位未填寫正確");
  }

  coach.experience_years = experienceYears;
  coach.description = description;
  coach.profile_image_url = profileImageUrl;
  coach.skills = skills;

  return dataSource.getRepository("Coach").save(coach);
};

const createCourseForCoach = async ({
  user,
  skillId,
  name,
  description,
  startAt,
  endAt,
  maxParticipants,
  meetingUrl,
}) => {
  const skill = await dataSource.getRepository("Skill").findOne({
    where: { id: skillId },
  });

  if (!skill) {
    throw new ApiError(400, "欄位未填寫正確");
  }

  const course = await dataSource.getRepository("Course").save({
    user,
    skill,
    name,
    description,
    start_at: startAt,
    end_at: endAt,
    max_participants: maxParticipants,
    meeting_url: meetingUrl,
  });

  return { course, skill };
};

const getCourseForOwner = async ({ courseId, userId }) => {
  const course = await dataSource.getRepository("Course").findOne({
    where: { id: courseId, user: { id: userId } },
    relations: { skill: true },
  });

  if (!course) {
    throw new ApiError(400, "課程不存在");
  }

  return course;
};

const updateCourseForOwner = async ({
  courseId,
  userId,
  skillId,
  name,
  description,
  startAt,
  endAt,
  maxParticipants,
  meetingUrl,
}) => {
  const course = await dataSource.getRepository("Course").findOne({
    where: { id: courseId, user: { id: userId } },
  });

  if (!course) {
    throw new ApiError(400, "課程不存在");
  }

  const skill = await dataSource.getRepository("Skill").findOne({
    where: { id: skillId },
  });

  if (!skill) {
    throw new ApiError(400, "欄位未填寫正確");
  }

  course.skill = skill;
  course.name = name;
  course.description = description;
  course.start_at = startAt;
  course.end_at = endAt;
  course.max_participants = maxParticipants;
  course.meeting_url = meetingUrl;

  const updatedCourse = await dataSource.getRepository("Course").save(course);
  return { updatedCourse, skill };
};

const listCoursesForCoach = async ({ userId }) => {
  const courses = await dataSource.getRepository("Course").find({
    where: { user: { id: userId } },
    order: { start_at: "ASC" },
  });

  const now = new Date();

  return courses.map((course) => {
    const startAt = new Date(course.start_at);
    const endAt = new Date(course.end_at);
    let status;

    if (now < startAt) {
      status = "尚未開始";
    } else if (now >= endAt) {
      status = "已結束";
    } else {
      status = "進行中";
    }

    return {
      id: course.id,
      name: course.name,
      status,
      start_at: course.start_at,
      end_at: course.end_at,
      max_participants: course.max_participants,
      meeting_url: course.meeting_url,
      participants: 0,
    };
  });
};

const getMonthlyRevenueForCoach = async ({ userId, month }) => {
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

  const monthIndex = monthNames.indexOf(month);
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, monthIndex, 1);
  const endDate = new Date(currentYear, monthIndex + 1, 1);
  const bookingRepo = dataSource.getRepository("CourseBooking");

  const bookings = await bookingRepo
    .createQueryBuilder("booking")
    .innerJoin("booking.course", "course")
    .select("booking.user_id", "user_id")
    .where("course.user_id = :coachId", { coachId: userId })
    .andWhere("booking.cancelled_at IS NULL")
    .andWhere('booking."createdAt" >= :startDate', { startDate })
    .andWhere('booking."createdAt" < :endDate', { endDate })
    .getRawMany();

  const participants = new Set(bookings.map((booking) => booking.user_id)).size;
  const courseCount = bookings.length;
  const creditPackages = await dataSource
    .getRepository("CreditPackage")
    .find();

  const { totalPrice, totalCredits } = creditPackages.reduce(
    (total, creditPackage) => ({
      totalPrice: total.totalPrice + Number(creditPackage.price),
      totalCredits: total.totalCredits + Number(creditPackage.credit_amount),
    }),
    { totalPrice: 0, totalCredits: 0 },
  );

  const perCreditPrice = totalCredits === 0 ? 0 : totalPrice / totalCredits;

  return {
    revenue: Math.floor(courseCount * perCreditPrice),
    participants,
    course_count: courseCount,
  };
};

module.exports = {
  promoteUserToCoach,
  getCoachProfileForUser,
  updateCoachProfileForUser,
  createCourseForCoach,
  getCourseForOwner,
  updateCourseForOwner,
  listCoursesForCoach,
  getMonthlyRevenueForCoach,
};
