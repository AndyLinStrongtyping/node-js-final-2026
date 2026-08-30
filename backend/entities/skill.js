const { EntitySchema } = require("typeorm");

const Skill = new EntitySchema({
  name: "Skill",
  tableName: "skills",
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
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
  },
});

module.exports = { Skill };
