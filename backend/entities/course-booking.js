const { EntitySchema } = require("typeorm");

const CourseBooking = new EntitySchema({
  name: "CourseBooking",
  tableName: "course_bookings",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    cancelled_at: {
      type: "timestamp",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id",
      },
      nullable: false,
      onDelete: "CASCADE",
    },
    course: {
      type: "many-to-one",
      target: "Course",
      joinColumn: {
        name: "course_id",
        referencedColumnName: "id",
      },
      nullable: false,
      onDelete: "CASCADE",
    },
  },
});

module.exports = { CourseBooking };
