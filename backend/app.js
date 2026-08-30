const express = require("express");
const cors = require("cors");
const skillRouter = require("./routes/skill");
const creditPackageRouter = require("./routes/credit-package");
const userRouter = require("./routes/users");
const adminCoachesRouter = require("./routes/admin-coaches");
const publicCoachesRouter = require("./routes/public-coaches");
const publicCoursesRouter = require("./routes/public-courses");
const { dataSource } = require("./db/data-source");
const { errorHandler } = require("./middlewares/error-handler");


const app = express();

app.use(cors());
app.use(express.json());


app.get("/healthcheck", async (req, res) => {
  if (!dataSource.isInitialized) {
    return res.status(503).send("NOT_READY");
  }

  try {
    await dataSource.query("SELECT 1");
    return res.status(200).send("OK");
  } catch (error) {
    return res.status(503).send("NOT_READY");
  }
});

app.use('/api/coaches/skill', skillRouter);
app.use("/api/credit-package", creditPackageRouter);
app.use("/api/users", userRouter);
app.use("/api/admin/coaches", adminCoachesRouter);
app.use("/api/coaches", publicCoachesRouter);
app.use("/api/courses", publicCoursesRouter);



app.use((req, res) => {
  res.status(404).json({ status: "failed", message: "無此路由" });
});

app.use(errorHandler);

module.exports = app;
