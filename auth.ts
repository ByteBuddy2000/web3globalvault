import { getServerSession } from "next-auth";
import { authOptions } from "./lib/authOptions";

export async function getUserSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export function isAdmin(session: any) {
  return session?.user?.role === "admin";
}