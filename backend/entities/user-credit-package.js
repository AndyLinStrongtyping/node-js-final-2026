const { EntitySchema } = require("typeorm");

const UserCreditPackage = new EntitySchema({
  name: "UserCreditPackage",
  tableName: "user_credit_packages",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    purchased_credits: {
      type: "int",
      nullable: false,
    },
    price_paid: {
      type: "int",
      nullable: false,
    },
    purchase_at: {
      type: "timestamp",
      nullable: false,
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
    creditPackage: {
      type: "many-to-one",
      target: "CreditPackage",
      joinColumn: {
        name: "credit_package_id",
        referencedColumnName: "id",
      },
      nullable: false,
      onDelete: "CASCADE",
    },
  },
});

module.exports = { UserCreditPackage };
