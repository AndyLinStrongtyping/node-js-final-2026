require("dotenv").config();
const { Skill } = require("../entities/skill");
const { CreditPackage } = require("../entities/credit-package");
const { User } = require("../entities/user");
const { Coach } = require("../entities/coach");
const { Course } = require("../entities/course");
const { UserCreditPackage } = require("../entities/user-credit-package");
const { CourseBooking } = require("../entities/course-booking");

const { DataSource } = require("typeorm");

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  ssl: process.env.DB_ENABLE_SSL === "true",
  entities: [
    Skill,
    CreditPackage,
    User,
    Coach,
    Course,
    UserCreditPackage,
    CourseBooking,
  ],
});

module.exports = { dataSource };
