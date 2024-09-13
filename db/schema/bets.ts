
import { pgTable, uuid, integer, timestamp, text } from "drizzle-orm/pg-core";
import { users } from "./users";
import { predictions } from "./predictions";

export const bets = pgTable("bets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  predictionId: uuid("prediction_id").references(() => predictions.id).notNull(),
  amount: integer("amount").notNull(),
  type: text("type", { enum: ["yes", "no"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Bet = typeof bets.$inferSelect;
export type NewBet = typeof bets.$inferInsert;