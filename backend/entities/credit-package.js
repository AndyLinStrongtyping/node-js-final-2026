const { EntitySchema } = require("typeorm");

const CreditPackage = new EntitySchema({
  name: "CreditPackage",
  tableName: "credit_packages",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    name: {
      type: "varchar",
      unique: true,
      nullable: false,
    },
    credit_amount: {
      type: "int",
      nullable: false,
    },
    price: {
      type: "int",
      nullable: false,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
  },
});

module.exports = { CreditPackage };
