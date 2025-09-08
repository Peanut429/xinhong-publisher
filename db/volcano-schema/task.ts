import { bigint, integer, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

export const volcanoTasks = pgTable("task", {
  taskId: varchar("task_id").primaryKey().notNull(),
  createTimestamp: bigint("create_timestamp", { mode: "number" }).notNull(),
  type: varchar("type").notNull(),
  describe: varchar("describe").default("").notNull(),
  status: varchar("status").notNull(),
  serviceParam: jsonb("service_param").notNull(),
  userId: varchar("user_id").notNull(),
  executionId: varchar("execution_id").default("").notNull(),
  results: jsonb("results").$type<string[]>().default([]).notNull(),
  queuePosition: integer("queue_position").default(0).notNull(),
  timer: jsonb("timer").notNull(),
  taskGroupId: varchar("task_group_id").notNull(),
});

export type VolcanoTask = typeof volcanoTasks.$inferSelect;
export type NewVolcanoTask = typeof volcanoTasks.$inferInsert;
