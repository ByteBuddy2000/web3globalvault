import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  await connectDB();

  const session = await getServerSession(authOptions);

  const notifications = await Notification.find({
    user: session?.user?.id,
  }).sort({ createdAt: -1 });

  return NextResponse.json(notifications);
}