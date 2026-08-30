const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { dataSource } = require("../db/data-source");
const { ApiError } = require("../utils/api-error");

const registerUser = async ({ name, email, password }) => {
  const userRepo = dataSource.getRepository("User");
  const existingUser = await userRepo.findOne({ where: { email } });

  if (existingUser) {
    throw new ApiError(409, "Email 已被使用");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return userRepo.save({
    name,
    email,
    password: hashedPassword,
    role: "USER",
  });
};

const loginUser = async ({ email, password }) => {
  const userRepo = dataSource.getRepository("User");
  const user = await userRepo.findOne({ where: { email } });
  const isMatch = user && (await bcrypt.compare(password, user.password));

  if (!isMatch) {
    throw new ApiError(400, "使用者不存在或密碼輸入錯誤");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_DAY },
  );

  return { token, user };
};

const updateUserName = async ({ user, name }) => {
  if (name === user.name) {
    throw new ApiError(400, "使用者名稱未變更");
  }

  return dataSource.getRepository("User").save({ ...user, name });
};

const changeUserPassword = async ({ user, password, newPassword }) => {
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(400, "密碼輸入錯誤");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  return dataSource
    .getRepository("User")
    .save({ ...user, password: hashedPassword });
};

const purchaseCreditPackage = async ({ userId, creditPackageId }) => {
  const packageRepo = dataSource.getRepository("CreditPackage");
  const creditPackage = await packageRepo.findOne({
    where: { id: creditPackageId },
  });

  if (!creditPackage) {
    throw new ApiError(400, "ID錯誤");
  }

  return dataSource.getRepository("UserCreditPackage").save({
    user: { id: userId },
    creditPackage: { id: creditPackage.id },
    purchased_credits: creditPackage.credit_amount,
    price_paid: creditPackage.price,
    purchase_at: new Date(),
  });
};

const getCreditPackageHistoryForUser = async ({ userId }) => {
  const records = await dataSource.getRepository("UserCreditPackage").find({
    where: { user: { id: userId } },
    relations: { creditPackage: true },
    order: { purchase_at: "DESC" },
  });

  return records.map((record) => ({
    name: record.creditPackage.name,
    purchased_credits: record.purchased_credits,
    price_paid: record.price_paid,
    purchase_at: record.purchase_at,
  }));
};

module.exports = {
  registerUser,
  loginUser,
  updateUserName,
  changeUserPassword,
  purchaseCreditPackage,
  getCreditPackageHistoryForUser,
};
