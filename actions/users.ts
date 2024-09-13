"use server";

import { db } from '../db/db';
import { users } from '../db/schema';

export async function createUserAction(walletAddress: string) {
  try {
    const result = await db.insert(users).values({ walletAddress }).onConflictDoNothing().returning();
    return { status: 'success', message: 'User created or already exists', user: result[0] };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}