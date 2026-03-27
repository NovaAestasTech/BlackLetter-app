import NextAuth, { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectToDatabase from "@/db/db";
import { Users } from "@/db/Model";
import WorkSpaces from "@/db/Model";
import bcrypt from "bcrypt";
export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }
        await connectToDatabase();
        const user = await Users.findOne({
          Email: credentials.email.toLowerCase(),
        });
        if (!user) {
          throw new Error("No user found with this email");
        }
        const isValid = await bcrypt.compare(
          credentials.password,
          user.Password,
        );
        if (!isValid) {
          throw new Error("Incorrect password");
        }
        return {
          id: user._id.toString(),
          email: user.Email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
    async signIn(params) {
      if (!params.user.email || !params.user.id) return true;
      try {
        await connectToDatabase();
        const pendingWorkspaces = await WorkSpaces.find({
          "members.email": params.user.email.toLowerCase(),
          "members.status": "pending",
        });
        if (pendingWorkspaces.length > 0) {
          const workspaceIds = pendingWorkspaces.map((ws) => ws._id);
          await WorkSpaces.updateMany(
            {
              "members.email": params.user.email.toLowerCase(),
              "members.status": "pending",
            },
            {
              $set: {
                "members.$.userId": params.user.id,
                "members.$.status": "active",
              },
            },
          );
          await Users.findByIdAndUpdate(params.user.id, {
            $addToSet: { workspaces: { $each: workspaceIds } },
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error("Unidentified Error");
      }
      return true;
    },
  },

  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
