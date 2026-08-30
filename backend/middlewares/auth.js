const jwt = require("jsonwebtoken");
const { dataSource } = require("../db/data-source");

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const [type, token] = (authHeader || "").trim().split(/\s+/);

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      status: "failed",
      message: "請先登入",
    });
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "failed",
        message: "Token 已過期",
      });
    }

    return res.status(401).json({
      status: "failed",
      message: "無效的 token",
    });
  }

  try {
    const userRepo = dataSource.getRepository("User");
    const user = await userRepo.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "無效的 token",
      });
    }

    req.user = user;

    return next();
  } catch (error) {
    return next(error);
  }
};

const isCoach = (req, res, next) => {
  if (req.user.role !== "COACH") {
    return res.status(401).json({
      status: "failed",
      message: "使用者尚未成為教練",
    });
  }

  return next();
};

module.exports = { auth, isCoach };