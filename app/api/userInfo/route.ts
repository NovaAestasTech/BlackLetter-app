import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Users } from "@/db/Model";
import connectToDatabase from "@/db/db";
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    if (!owner) {
      return NextResponse.json(
        { message: "No owner is provided" },
        { status: 500 },
      );
    }
    const owner_id = new mongoose.Types.ObjectId(owner);
    const userData = await Users.findById({ _id: owner_id });
    return NextResponse.json(
      {
        Email: userData.Email,
        id: userData._id,
      },
      { status: 200 },
    );
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
    throw new Error("Unidentified Error");
  }
}
