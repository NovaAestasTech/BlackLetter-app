import { NextResponse } from "next/server";
import connectToDatabase from "@/db/db";
import { Users } from "@/db/Model";
import bcrypt from "bcrypt";
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { message: "Enter email and password" },
        { status: 500 },
      );
    }
    const existingUser = await Users.findOne({ Email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: "Already exist with this email" },
        { status: 500 },
      );
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await Users.create({
      Email: email.toLowerCase(),
      Password: hashPassword,
      workspaces: [],
    });
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: { email: newUser.email, id: newUser._id },
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
    throw new Error("Unidentified Error");
  }
}
