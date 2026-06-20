import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  await connectDB();

  const { id } = context.params;

  await Notification.findByIdAndUpdate(id, {
    isRead: true,
  });

  return NextResponse.json({ success: true });
}