const { ApiError } = require("../utils/api-error");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: "failed",
      message: err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    status: "failed",
    message: "伺服器錯誤",
  });
};

module.exports = { errorHandler };
