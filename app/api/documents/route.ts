import { NextResponse } from "next/server";
import { Documents, Users } from "@/db/Model";
import WorkSpaces from "@/db/Model";
import connectToDatabase from "@/db/db";
import mongoose from "mongoose";
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, doc } = body;
    if (!id) {
      throw new Error("Id is not present");
    }
    const newDoc = await Documents.create({
      ...doc,
    });
    await WorkSpaces.findByIdAndUpdate(id, {
      $push: { documents: newDoc._id },
      $set: { lastModified: new Date() },
    });
    return NextResponse.json({ message: "Added" }, { status: 200 });
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
    const id = searchParams.get("id");
    const userMail = searchParams.get("userMail");
    const userId = searchParams.get("userId");

    if (!id) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 },
      );
    }

    // Populate documents so the UI can list them
    const workspace = await WorkSpaces.findById(id).populate("documents");

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }
    if (!userId) {
      return NextResponse.json({ message: "User Not found" }, { status: 500 });
    }
    const UserDetails = await Users.findById({
      _id: new mongoose.Types.ObjectId(userId),
    });

    let globalRole = "viewer";
    if (workspace.owner.toString() === userId) {
      globalRole = "owner";
    } else {
      const member = workspace.members.find((m: any) => m.email === userMail);
      if (member) globalRole = member.role;
    }

    // Return the workspace + the current user's role
    return NextResponse.json(
      {
        ...workspace._doc,
        currentUserRole: globalRole,
        editableDoc: UserDetails.editableDocuments,
      },
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
