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

    // ══════════════════════════════════════════════════════════
    // VALIDATION: User can only have ONE active/pending card
    // Exception: Previous card must be BLOCKED or FROZEN
    // ══════════════════════════════════════════════════════════
    const existingCards = await Card.find({ user: user._id });
    
    for (const card of existingCards) {
      // Allow only if card is BLOCKED or INACTIVE
      if (card.status === "ACTIVE" || card.status === "PENDING") {
        return NextResponse.json(
          {
            message: "You already have an active or pending card. Please block or delete it first.",
            existingCard: {
              _id: card._id,
              tierLevel: card.tierLevel,
              status: card.status,
              requestStatus: card.requestStatus,
            },
          },
          { status: 409 }
        );
      }
      
      // Check if there's a pending payment
      if (["DRAFT", "PAYMENT_PENDING"].includes(card.requestStatus)) {
        return NextResponse.json(
          {
            message: "You have a pending card application. Complete or cancel it first.",
            pendingCard: {
              _id: card._id,
              requestStatus: card.requestStatus,
            },
          },
          { status: 409 }
        );
      }
    }

    // Tier-based limits and fees
    const tierConfig: Record<string, any> = {
      BASIC: { dailyLimit: 5000, monthlyLimit: 50000, balance: 1000, paymentFee: 0 },
      SILVER: { dailyLimit: 10000, monthlyLimit: 100000, balance: 5000, paymentFee: 5 },
      GOLD: { dailyLimit: 25000, monthlyLimit: 250000, balance: 10000, paymentFee: 15 },
      PLATINUM: { dailyLimit: 50000, monthlyLimit: 500000, balance: 25000, paymentFee: 30 },
    };

    const config = tierConfig[tierLevel] || tierConfig.BASIC;

    // Create card in DRAFT status (not yet submitted)
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
      status: "PENDING",
      requestStatus: "DRAFT", // Start in DRAFT, not submitted yet
      paymentVerificationStatus: "PENDING_APPROVAL",
      paymentMethod: "USDT",
      paymentAmount: config.paymentFee,
      paymentCurrency: "USDT",
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
        message: "Card draft created. Proceed to payment request.",
        card: {
          _id: newCard._id,
          cardNumber: newCard.cardNumber,
          tierLevel: newCard.tierLevel,
          cardType: newCard.cardType,
          status: newCard.status,
          requestStatus: newCard.requestStatus,
          paymentAmount: newCard.paymentAmount,
        },
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
