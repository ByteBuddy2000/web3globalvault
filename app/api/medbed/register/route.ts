import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { sendEmail } from "@/lib/mailer";
import MedbedRegistration from "@/models/MedbedRegistration";

const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL || "support@web3globalvaultbank.com";

const RECEIVER_ADDRESS =
  process.env.NEXT_PUBLIC_XRP_RECEIVER_ADDRESS ||
  "rp5PMThCE9t";

const MEDBED_USD_PRICE = 10000;

function generateRegistrationId() {
  return `MED-${Date.now()
    .toString(36)
    .toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

async function getCurrentXrpAmount() {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch XRP price.");
  }

  const data = await response.json();

  const xrpPrice = data?.ripple?.usd;

  if (!xrpPrice || xrpPrice <= 0) {
    throw new Error("Invalid XRP price received.");
  }

  const amountXrp = Number(
    (MEDBED_USD_PRICE / xrpPrice).toFixed(6)
  );

  return {
    amountXrp,
    xrpPrice,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, address, color } =
      await request.json();

    if (!name || !phone || !email || !address || !color) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const registrationId = generateRegistrationId();

    // Fetch live XRP price and calculate amount
    const { amountXrp, xrpPrice } =
      await getCurrentXrpAmount();

    const registration =
      await MedbedRegistration.create({
        name,
        phone,
        email,
        address,
        color,
        registrationId,
        usdAmount: MEDBED_USD_PRICE,
        xrpPrice,
        amountXrp,
        receiverAddress: RECEIVER_ADDRESS,
      });

    try {
      await sendEmail({
        to: SUPPORT_EMAIL,
        subject: `New Medbed Registration: ${registrationId}`,
        text: `
New Medbed Registration

Registration ID: ${registrationId}

Name: ${name}
Email: ${email}
Phone: ${phone}
Address: ${address}
Bed Color: ${color}

USD Amount: $${MEDBED_USD_PRICE}
Current XRP Price: $${xrpPrice}
Amount to Pay: ${amountXrp} XRP

Receiver Address:
${RECEIVER_ADDRESS}
`,
        html: `
<h2>New Medbed Registration</h2>

<p><strong>Registration ID:</strong> ${registrationId}</p>

<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>Address:</strong> ${address}</p>
<p><strong>Bed Color:</strong> ${color}</p>

<hr>

<p><strong>USD Amount:</strong> $${MEDBED_USD_PRICE}</p>
<p><strong>Current XRP Price:</strong> $${xrpPrice}</p>
<p><strong>Amount to Pay:</strong> ${amountXrp} XRP</p>

<p><strong>Receiver Address:</strong><br>${RECEIVER_ADDRESS}</p>
`,
      });
    } catch (emailError) {
      console.warn(
        "Unable to send medbed support notification:",
        emailError
      );
    }

    return NextResponse.json(
      {
        success: true,
        registrationId: registration.registrationId,
        amountXrp: registration.amountXrp,
        receiverAddress: registration.receiverAddress,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Medbed registration error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}