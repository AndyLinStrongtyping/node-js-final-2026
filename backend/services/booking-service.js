const { dataSource } = require("../db/data-source");
const { IsNull } = require("typeorm");
const { ApiError } = require("../utils/api-error");

const bookCourseForUser = async ({ courseId, userId }) => {
  return dataSource.transaction(async (manager) => {
    await manager.getRepository("User").findOne({
      where: { id: userId },
      lock: { mode: "pessimistic_write" },
    });

    const course = await manager.getRepository("Course").findOne({
      where: { id: courseId },
      lock: { mode: "pessimistic_write" },
    });

    if (!course) {
      throw new ApiError(400, "ID錯誤");
    }

    const bookingRepo = manager.getRepository("CourseBooking");
    const existingBooking = await bookingRepo.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
      },
    });

    if (existingBooking) {
      throw new ApiError(400, "已經報名過此課程");
    }

    const totalPurchasedCredits = await manager
      .getRepository("UserCreditPackage")
      .createQueryBuilder("purchase")
      .select("SUM(purchase.purchased_credits)", "total")
      .where("purchase.user_id = :userId", { userId })
      .getRawOne();

    const activeBookingsCount = await bookingRepo
      .createQueryBuilder("booking")
      .where("booking.user_id = :userId", { userId })
      .andWhere("booking.cancelled_at IS NULL")
      .getCount();

    const creditRemain =
      (Number(totalPurchasedCredits?.total || 0) || 0) - activeBookingsCount;

    if (creditRemain <= 0) {
      throw new ApiError(400, "已無可使用堂數");
    }

    const validBookingsCount = await bookingRepo
      .createQueryBuilder("booking")
      .where("booking.course_id = :courseId", { courseId })
      .andWhere("booking.cancelled_at IS NULL")
      .getCount();

    if (validBookingsCount >= course.max_participants) {
      throw new ApiError(400, "已達最大參加人數，無法參加");
    }

    await bookingRepo.save({
      user: { id: userId },
      course: { id: courseId },
      cancelled_at: null,
    });
  });
};

const cancelCourseBookingForUser = async ({ courseId, userId }) => {
  const bookingRepo = dataSource.getRepository("CourseBooking");
  const booking = await bookingRepo.findOne({
    where: {
      user: { id: userId },
      course: { id: courseId },
      cancelled_at: IsNull(),
    },
  });

  if (!booking) {
    throw new ApiError(400, "ID錯誤");
  }

  booking.cancelled_at = new Date();
  await bookingRepo.save(booking);
};

const getCourseSummaryForUser = async ({ userId }) => {
  const bookingRepo = dataSource.getRepository("CourseBooking");
  const bookings = await bookingRepo.find({
    where: { user: { id: userId } },
    relations: { course: { user: true } },
    order: { course: { start_at: "ASC" } },
  });

  const totalPurchasedCredits = await dataSource
    .getRepository("UserCreditPackage")
    .createQueryBuilder("purchase")
    .select("SUM(purchase.purchased_credits)", "total")
    .where("purchase.user_id = :userId", { userId })
    .getRawOne();

  const usedCredits = await bookingRepo
    .createQueryBuilder("booking")
    .leftJoin("booking.course", "course")
    .where("booking.user_id = :userId", { userId })
    .andWhere("booking.cancelled_at IS NULL")
    .getCount();

  const creditRemain =
    (Number(totalPurchasedCredits?.total || 0) || 0) - usedCredits;

  return {
    credit_remain: creditRemain,
    credit_usage: usedCredits,
    course_booking: bookings.map((booking) => ({
      course_id: booking.course.id,
      name: booking.course.name,
      start_at: booking.course.start_at,
      end_at: booking.course.end_at,
      meeting_url: booking.course.meeting_url,
      coach_name: booking.course.user.name,
      cancelled_at: booking.cancelled_at,
    })),
  };
};

module.exports = {
  bookCourseForUser,
  cancelCourseBookingForUser,
  getCourseSummaryForUser,
};
