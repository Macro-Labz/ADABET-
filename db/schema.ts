import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  walletAddress: text('wallet_address').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Add other table definitions as needed