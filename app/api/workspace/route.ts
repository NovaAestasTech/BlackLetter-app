import { NextResponse } from "next/server";
import connectToDatabase from "@/db/db";
import WorkSpaces, { Users } from "@/db/Model";
import mongoose from "mongoose";
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 },
      );
    }
    await WorkSpaces.findByIdAndDelete(id);
    return NextResponse.json(
      {
        message: "Deleted Workspace",
      },
      {
        status: 200,
      },
    );
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
    throw new Error("Unidentified Error");
  }
}
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const userMail = searchParams.get("userMail");

    const workspaces = await WorkSpaces.find({
      $or: [{ owner: userId }, { "members.email": userMail }],
    });

    return NextResponse.json(workspaces, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { workspaces: workspaceData, user } = await request.json();

    if (!user?.id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const newWorkspace = await WorkSpaces.create(workspaceData);

    const updatedUser = await Users.findByIdAndUpdate(
      user.id,
      { $addToSet: { workspaces: newWorkspace._id } },
      { new: true },
    );

    return NextResponse.json(updatedUser, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 },
    );
  }
}
