import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Asset from "@/models/Asset";
import { sendEmail } from "@/lib/mailer";

// Helper to generate a random account number (e.g., 10 digits)
function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

export async function POST(req: Request) {
  try {
    const { fullName, email, password, phone, address } = await req.json();

    if (!fullName || !email || !password || !phone || !address) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    // Generate unique account number
    let accountNumber;
    let accountExists = true;
    while (accountExists) {
      accountNumber = generateAccountNumber();
      accountExists = !!(await User.findOne({ accountNumber }));
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      fullName,
      email,
      passwordHash,
      accountNumber,
      phone,
      address,
    });

    // ✅ Top 20 stocks (static list for now)
    const topStocks = [
      { symbol: "AAPL", name: "Apple", sector: "Technology", market: "NASDAQ" },
      { symbol: "MSFT", name: "Microsoft", sector: "Technology", market: "NASDAQ" },
      { symbol: "GOOGL", name: "Alphabet", sector: "Technology", market: "NASDAQ" },
      { symbol: "AMZN", name: "Amazon", sector: "E-Commerce", market: "NASDAQ" },
      { symbol: "TSLA", name: "Tesla", sector: "Automotive", market: "NASDAQ" },
      { symbol: "META", name: "Meta Platforms", sector: "Technology", market: "NASDAQ" },
      { symbol: "NVDA", name: "NVIDIA", sector: "Semiconductors", market: "NASDAQ" },
      { symbol: "NFLX", name: "NCryptolix", sector: "Entertainment", market: "NASDAQ" },
      { symbol: "BABA", name: "Alibaba", sector: "E-Commerce", market: "NYSE" },
      { symbol: "DIS", name: "Disney", sector: "Entertainment", market: "NYSE" },
      { symbol: "PYPL", name: "PayPal", sector: "Fintech", market: "NASDAQ" },
      { symbol: "INTC", name: "Intel", sector: "Semiconductors", market: "NASDAQ" },
      { symbol: "AMD", name: "AMD", sector: "Semiconductors", market: "NASDAQ" },
      { symbol: "V", name: "Visa", sector: "Finance", market: "NYSE" },
      { symbol: "MA", name: "Mastercard", sector: "Finance", market: "NYSE" },
      { symbol: "JPM", name: "JPMorgan Chase", sector: "Banking", market: "NYSE" },
      { symbol: "BA", name: "Boeing", sector: "Aerospace", market: "NYSE" },
      { symbol: "WMT", name: "Walmart", sector: "Retail", market: "NYSE" },
      { symbol: "NKE", name: "Nike", sector: "Retail", market: "NYSE" },
      { symbol: "UBER", name: "Uber", sector: "Technology", market: "NYSE" },
    ];

    // ✅ Add BTC as default crypto
    const defaultCrypto = [
      { symbol: "BTC", name: "Bitcoin", sector: "Cryptocurrency", market: "Crypto" },
      { symbol: "ETH", name: "Ethereum", sector: "Cryptocurrency", market: "Crypto" },
      { symbol: "USDT", name: "Tether", sector: "Cryptocurrency", market: "Crypto" }
    ];

    // Build asset docs
    const assetsToCreate = [...topStocks, ...defaultCrypto].map((stock) => ({
      user: newUser._id,
      type: stock.market === "Crypto" ? "Crypto" : "Stock",
      symbol: stock.symbol,
      name: stock.name,
      quantity: 0,
      sector: stock.sector,
      market: stock.market,
    }));

    const createdAssets = await Asset.insertMany(assetsToCreate);
    newUser.assets = createdAssets.map((asset) => asset._id);
    await newUser.save();

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to Web3GlobalVault! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(150deg, #050607 0%, #0a0c0f 55%, #090b0e 100%); color: #e2e8f0; padding: 40px 20px; border-radius: 12px;">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #F5D78E; margin: 0; font-size: 28px;">Web3GlobalVault</h1>
              <p style="color: #94a3b8; margin: 5px 0 0 0;">Your Gateway to Wealth Management</p>
            </div>

            <div style="background: rgba(148, 163, 184, 0.1); border: 1px solid rgba(148, 163, 184, 0.3); padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #F5D78E; margin-top: 0;">Welcome, ${fullName}! 👋</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
                Thank you for joining Web3GlobalVault. We're thrilled to have you as part of our community. Your account has been successfully created and is ready to use.
              </p>

              <h3 style="color: #C9A84C; margin-top: 25px; margin-bottom: 15px;">Your Account Details:</h3>
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;"><strong>Account Number:</strong></td>
                  <td style="padding: 8px 0; color: #F5D78E; text-align: right; font-family: monospace;">${newUser.accountNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0; color: #cbd5e1; text-align: right;">${email}</td>
                </tr>
              </table>

              <h3 style="color: #C9A84C; margin-top: 25px; margin-bottom: 15px;">Getting Started:</h3>
              <ul style="color: #cbd5e1; line-height: 1.8;">
                <li>Explore our diverse portfolio of stocks and cryptocurrencies</li>
                <li>Make your first investment in just a few clicks</li>
                <li>Track your portfolio performance in real-time</li>
                <li>Earn passive income through referrals</li>
                <li>Manage your money transfers securely</li>
              </ul>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background: linear-gradient(90deg, #C9A84C 0%, #F5D78E 100%); color: #050607; padding: 12px 30px; border: none; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; cursor: pointer;">
                Go to Your Dashboard
              </a>
            </div>

            <div style="background: rgba(201, 168, 76, 0.1); border-left: 4px solid #C9A84C; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
              <p style="margin: 0; color: #cbd5e1; font-size: 14px;">
                <strong style="color: #F5D78E;">Security Tip:</strong> Never share your password or account details with anyone. Web3GlobalVault staff will never ask for your credentials via email.
              </p>
            </div>

            <div style="border-top: 1px solid rgba(148, 163, 184, 0.2); padding-top: 20px; text-align: center; font-size: 12px; color: #64748b;">
              <p>Questions? Visit our <a href="${process.env.NEXTAUTH_URL}/support" style="color: #F5D78E; text-decoration: none;">support center</a> or contact us at support@genesisbank.com</p>
              <p style="margin: 10px 0 0 0;">© 2026 Web3GlobalVault. All rights reserved.</p>
            </div>

          </div>
        `,
        text: `Welcome to Web3GlobalVault!

Hello ${fullName},

Thank you for joining Web3GlobalVault. Your account has been successfully created!

Your Account Number: ${newUser.accountNumber}

Getting Started:
- Explore stocks and cryptocurrencies
- Make your first investment
- Track your portfolio performance
- Earn passive income through referrals
- Manage money transfers securely

Visit your dashboard: ${process.env.NEXTAUTH_URL}/dashboard

Security Tip: Never share your password or account details with anyone.

Questions? Contact us at support@genesisbank.com

© 2026 Web3GlobalVault. All rights reserved.`,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json({ message: "Registration successful" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unexpected Error Occurred" }, { status: 500 });
  }
}
