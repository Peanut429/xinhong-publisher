import { bigint, boolean, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

export const botTasks = pgTable("bot_tasks", {
  id: varchar().primaryKey().notNull(),
  accountId: varchar("account_id").notNull(),
  platform: varchar().notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  reportId: varchar("report_id").notNull(),
  title: varchar("title").default("").notNull(),
  images: jsonb("images").default([]).notNull(),
  content: varchar("content").default("").notNull(),
  ext: jsonb("ext").default({}).notNull(),
  status: boolean("status").default(false).notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  createTimestamp: bigint("create_timestamp", { mode: "number" })
    .default(0)
    .notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  updateTimestamp: bigint("update_timestamp", { mode: "number" })
    .default(0)
    .notNull(),
  topic: jsonb("topic").default([]).notNull(),
  hotspotName: varchar("hotspot_name").default("").notNull(),
  model: varchar("model").default("").notNull(),
});
