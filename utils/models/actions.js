const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Actions", // Will use table name `Actions` as default behavior.
  tableName: "actions", // Optional: Provide `tableName` property to override the default behavior for table name.
  columns: {
    id: { primary: true, type: "varchar" },
    enabled: { type: Boolean, default: true },
    name: { type: "varchar", nullable: false },
    description: { type: "varchar", nullable: false },
    version: { type: "varchar", nullable: false },
    action_type: { type: "varchar", nullable: false },
    definition: { type: "text", nullable: false },
    tags: { type: "varchar", nullable: true },
    created_at: { type: Date, createDate: true },
    created_by: { type: "varchar", nullable: false, default: "John Smith" },
    updated_at: { type: Date, updateDate: true },
    updated_by: { type: "varchar", nullable: false, default: "John Smith" },
  },
});
