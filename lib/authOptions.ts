// auth.ts
import NextAuth, { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import User from "@/models/User";
import bcrypt from "bcrypt";
import connectDB  from "@/lib/mongodb";

// ─── Extend next-auth types ───────────────────────────────────────────────────

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    username?: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      username?: string;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    username?: string;
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
      async authorize(credentials): Promise<NextAuthUser | null> {
        await connectDB();

        const { email, password } = credentials ?? {};
        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        const user = await User.findOne({ email });
        if (!user || !user.passwordHash) throw new Error("Invalid credentials");

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) throw new Error("Invalid credentials");

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
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
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }): Promise<Session> {
      session.user = {
        id: token.id,
        email: token.email,
        username: token.username,
        role: token.role,
      };
      return session;
    },

    async redirect({ url, baseUrl }): Promise<string> {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },

  pages: {
    signIn: "/login",
    error: "/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);