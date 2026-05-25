import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcrypt";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// ─── Extend next-auth types ───────────────────────────────────────────────────

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    role?: string;
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.passwordHash) throw new Error("Invalid credentials");

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) throw new Error("Invalid credentials");

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role ?? "user",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }): Promise<Session> {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
      };
      return session;
    },

    async redirect({ url, baseUrl }): Promise<string> {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  pages: {
    signIn: "/signin",
    
  },

  secret: process.env.NEXTAUTH_SECRET,
};