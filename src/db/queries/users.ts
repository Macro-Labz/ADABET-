
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, NewUser } from "../schema/users";

export const createUser = async (data: NewUser) => {
  const [newUser] = await db.insert(users).values(data).returning();
  return newUser;
};

export const getUserByWalletAddress = async (walletAddress: string) => {
  return db.query.users.findFirst({
    where: eq(users.walletAddress, walletAddress),
  });
};