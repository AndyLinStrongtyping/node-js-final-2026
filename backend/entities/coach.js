const { EntitySchema } = require("typeorm");

const Coach = new EntitySchema({
  name: "Coach",
  tableName: "coaches",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    experience_years: {
      type: "int",
      nullable: false,
    },
    description: {
      type: "text",
      nullable: false,
    },
    profile_image_url: {
      type: "varchar",
      nullable: true,
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
      type: "one-to-one",
      target: "User",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id",
      },
      nullable: false,
      inverseSide: "coach",
    },
    skills: {
      type: "many-to-many",
      target: "Skill",
      joinTable: {
        name: "coach_skills",
        joinColumn: {
          name: "coach_id",
          referencedColumnName: "id",
        },
        inverseJoinColumn: {
          name: "skill_id",
          referencedColumnName: "id",
        },
      },
      nullable: true,
    },
  },
});

module.exports = { Coach };
