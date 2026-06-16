import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST() {
  await connectDB();

  const session = await getServerSession(authOptions);

  await Notification.updateMany(
    { user: session?.user?.id, isRead: false },
    { $set: { isRead: true } }
  );

  return NextResponse.json({ success: true });
}