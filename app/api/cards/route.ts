import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";
import User from "@/models/User";

// Helper to generate card number
function generateCardNumber(): string {
  return "4" + Array(15)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10))
    .join("");
}

// Helper to generate CVV
function generateCVV(): string {
  return Array(3)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10))
    .join("");
}

// Helper to generate valid thru date
function generateValidThru(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 5);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${year}`;
}

// GET - Retrieve user's cards
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const cards = await Card.find({ user: user._id }).sort({ createdAt: -1 });

    return NextResponse.json({
      cards,
      totalCards: cards.length,
    });
  } catch (error) {
    console.error("Cards GET error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

// POST - Create/Apply for a new card
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { tierLevel = "BASIC", cardType = "VIRTUAL" } = body;

    // Tier-based limits
    const tierConfig: Record<string, any> = {
      BASIC: { dailyLimit: 5000, monthlyLimit: 50000, balance: 1000 },
      SILVER: { dailyLimit: 10000, monthlyLimit: 100000, balance: 5000 },
      GOLD: { dailyLimit: 25000, monthlyLimit: 250000, balance: 10000 },
      PLATINUM: { dailyLimit: 50000, monthlyLimit: 500000, balance: 25000 },
    };

    const config = tierConfig[tierLevel] || tierConfig.BASIC;

    const newCard = new Card({
      user: user._id,
      cardNumber: generateCardNumber(),
      cardHolder: user.fullName,
      cardType,
      tierLevel,
      validThru: generateValidThru(),
      cvv: generateCVV(),
      balance: config.balance,
      dailyLimit: config.dailyLimit,
      monthlyLimit: config.monthlyLimit,
      status: "ACTIVE",
      expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000),
    });

    await newCard.save();

    // Add card to user's cards array
    if (!user.cards.includes(newCard._id)) {
      user.cards.push(newCard._id);
      await user.save();
    }

    return NextResponse.json(
      {
        message: "Card created successfully",
        card: newCard,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Cards POST error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
