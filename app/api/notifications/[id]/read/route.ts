import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  await Notification.findByIdAndUpdate(params.id, {
    isRead: true,
  });

  return NextResponse.json({ success: true });
}