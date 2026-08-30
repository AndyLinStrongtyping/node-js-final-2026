const { isValidPassword } = require("../utils/password");
const {
  registerUser,
  loginUser,
  updateUserName,
  changeUserPassword,
  purchaseCreditPackage,
  getCreditPackageHistoryForUser,
} = require("../services/auth-service");
const { getCourseSummaryForUser } = require("../services/booking-service");

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const isInvalidField =
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      name.trim() === "" ||
      email.trim() === "" ||
      password.trim() === "";

    if (isInvalidField) {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        status: "failed",
        message: "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字",
      });
    }

    const user = await registerUser({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    return res.status(201).json({
      status: "success",
      data: { user: { id: user.id, name: user.name } },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const isInvalidField =
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.trim() === "" ||
      password.trim() === "";

    if (isInvalidField) {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        status: "failed",
        message: "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字",
      });
    }

    const { token, user } = await loginUser({
      email: email.trim(),
      password,
    });

    return res.status(201).json({
      status: "success",
      data: { token, user: { name: user.name } },
    });
  } catch (error) {
    return next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      status: "success",
      data: {
        user: { name: req.user.name, email: req.user.email },
      },
    });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    const updatedUser = await updateUserName({
      user: req.user,
      name: name.trim(),
    });

    return res.status(200).json({
      status: "success",
      data: { user: { name: updatedUser.name } },
    });
  } catch (error) {
    return next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { password, new_password, confirm_new_password } = req.body;
    const isInvalidField =
      typeof password !== "string" ||
      typeof new_password !== "string" ||
      typeof confirm_new_password !== "string" ||
      password.trim() === "" ||
      new_password.trim() === "" ||
      confirm_new_password.trim() === "";

    if (isInvalidField) {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    if (
      !isValidPassword(password) ||
      !isValidPassword(new_password) ||
      !isValidPassword(confirm_new_password)
    ) {
      return res.status(400).json({
        status: "failed",
        message: "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字",
      });
    }

    if (new_password === password) {
      return res.status(400).json({
        status: "failed",
        message: "新密碼不能與舊密碼相同",
      });
    }

    if (new_password !== confirm_new_password) {
      return res.status(400).json({
        status: "failed",
        message: "新密碼與驗證新密碼不一致",
      });
    }

    await changeUserPassword({
      user: req.user,
      password,
      newPassword: new_password,
    });

    return res.status(200).json({ status: "success", data: null });
  } catch (error) {
    return next(error);
  }
};

const buyCreditPackage = async (req, res, next) => {
  try {
    const { creditPackageId } = req.params;

    if (!uuidRegex.test(creditPackageId)) {
      return res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
    }

    await purchaseCreditPackage({
      userId: req.user.id,
      creditPackageId,
    });

    return res.status(200).json({ status: "success", data: null });
  } catch (error) {
    return next(error);
  }
};

const getCreditPackageHistory = async (req, res, next) => {
  try {
    const records = await getCreditPackageHistoryForUser({
      userId: req.user.id,
    });

    return res.status(200).json({ status: "success", data: records });
  } catch (error) {
    return next(error);
  }
};

const getUserCourses = async (req, res, next) => {
  try {
    const data = await getCourseSummaryForUser({ userId: req.user.id });
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  signUp,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  buyCreditPackage,
  getCreditPackageHistory,
  getUserCourses,
};
