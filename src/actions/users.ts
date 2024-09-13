"use server";

import { createUser, getUserByWalletAddress } from "../db/queries/users";
import { ActionState } from "../types/action-types";
import { revalidatePath } from "next/cache";

export async function createUserAction(walletAddress: string): Promise<ActionState> {
  try {
    const existingUser = await getUserByWalletAddress(walletAddress);
    if (existingUser) {
      return { status: "success", message: "User already exists", data: existingUser };
    }
    const newUser = await createUser({ walletAddress });
    revalidatePath("/profile");
    return { status: "success", message: "User created successfully", data: newUser };
  } catch (error) {
    return { status: "error", message: "Failed to create user" };
  }
}