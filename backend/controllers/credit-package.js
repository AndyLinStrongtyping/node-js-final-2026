const { dataSource } = require("../db/data-source");


const getCreditPackages = async (req, res, next) => {
  try {
    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    const creditPackages = await creditPackageRepo.find();

    res.status(200).json({
      status: "success",
      data: creditPackages,
    });
  } catch (error) {
    next(error);
  }
};


const createCreditPackage = async (req, res, next) => {
  try {
    const { name, credit_amount, price } = req.body;

    const isInvalidName =
      typeof name !== "string" || name.trim() === "";

    const isInvalidCreditAmount =
      !Number.isInteger(credit_amount) || credit_amount < 0;

    const isInvalidPrice =
      !Number.isInteger(price) || price < 0;

    if (isInvalidName || isInvalidCreditAmount || isInvalidPrice) {
      return res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
    }

    const creditPackageRepo =
      dataSource.getRepository("CreditPackage");

    const packageName = name.trim();

    const existingPackage = await creditPackageRepo.findOne({
      where: { name: packageName },
    });

    if (existingPackage) {
      return res.status(409).json({
        status: "failed",
        message: "資料重複",
      });
    }

    const creditPackage = await creditPackageRepo.save({
      name: packageName,
      credit_amount,
      price,
    });

    return res.status(200).json({
      status: "success",
      data: creditPackage,
    });
  } catch (error) {
    next(error);
  }
};


const deleteCreditPackage = async (req, res, next) => {
  try {
    const { packageId } = req.params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(packageId)) {
      return res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
    }

    const creditPackageRepo = dataSource.getRepository("CreditPackage");
    const result = await creditPackageRepo.delete({ id: packageId });

    if (result.affected === 0) {
      return res.status(400).json({
        status: "failed",
        message: "ID錯誤",
      });
    }

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  getCreditPackages,
  createCreditPackage,
  deleteCreditPackage,
};