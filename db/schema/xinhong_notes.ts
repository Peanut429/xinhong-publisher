import { bigint, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

export const xinhongNotes = pgTable("xinhong_notes", {
  id: varchar("id").primaryKey().notNull(),
  title: varchar("title").notNull().default(""),
  content: varchar("content").notNull().default(""),
  tags: jsonb("tags").notNull().default([]),
  createTimestamp: bigint("create_timestamp", { mode: "number" })
    .notNull()
    .default(0),
  author: varchar("author").notNull().default(""),
  authorAccount: varchar("author_account").notNull().default(""),
  authorHomepage: varchar("author_homepage").notNull().default(""),
  noteClassification: varchar("note_classification").notNull().default(""),
});

export type XinhongNote = typeof xinhongNotes.$inferSelect;
export type NewXinhongNote = typeof xinhongNotes.$inferInsert;
