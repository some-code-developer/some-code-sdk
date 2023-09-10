const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Connections", // Will use table name `post` as default behavior.
  tableName: "connections", // Optional: Provide `tableName` property to override the default behavior for table name.
  columns: {
    id: { primary: true, type: "varchar" },
    enabled: { type: Boolean, default: true },
    name: { type: "varchar", nullable: true },
    description: { type: "varchar", nullable: true },
    version: { type: "varchar", nullable: true },
    definition: { type: "text", nullable: false },
    created_at: { type: Date, createDate: true },
    created_by: { type: "varchar", nullable: false, default: "John Smith" },
    updated_at: { type: Date, updateDate: true },
    updated_by: { type: "varchar", nullable: false, default: "John Smith" },
  },
});
