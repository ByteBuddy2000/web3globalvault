import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";

// ─── Type Extensions ───────────────────────────────────────────────────────────

declare module "next-auth" {
  interface User extends NextAuthUser {
    id: string;
    email: string;
    fullName?: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    role: string;
  }
}

// ─── Auth Options ─────────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.error("[Auth] Missing credentials: email or password");
          throw new Error("Email and password are required");
        }

        try {
          const normalizedEmail = credentials.email.toLowerCase().trim();
          await connectDB();

          const user = await User.findOne({ email: normalizedEmail });

          if (!user) {
            console.error("[Auth] User not found in database:", normalizedEmail);
            return null;
          }

          if (!user.passwordHash) {
            console.error("[Auth] User has no passwordHash");
            return null;
          }

          console.log("[Auth] Comparing passwords...");
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );
          console.log("[Auth] Password valid:", isValidPassword);

          if (!isValidPassword) {
            console.error("[Auth] Invalid password for user:", normalizedEmail);
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            fullName: user.fullName,
            role: user.role || "user",
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      console.log("[JWT] Callback - user:", user ? "exists" : "none");
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.fullName;
        token.role = user.role;
        console.log("[JWT] Token created for user:", user.email);
      }
      return token;
    },

    async session({ session, token }): Promise<Session> {
      console.log("[Session] Callback - token role:", token.role);
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
      }
      return session;
    },

    async redirect({ url, baseUrl }): Promise<string> {
      // Redirect to the same origin if URL is relative
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
};