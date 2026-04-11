import { NextResponse } from "next/server";
import { PermissionRequest, Users } from "@/db/Model";
import connectToDatabase from "@/db/db";
import mongoose from "mongoose";
import WorkSpaces from "@/db/Model";
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("userId");
    if (!id) {
      return NextResponse.json({ message: "No id Found" }, { status: 500 });
    }

    const allRequest = await PermissionRequest.find({
      ownerId: new mongoose.Types.ObjectId(id),
      status: "pending",
    })
      .populate({
        path: "workspaceId",
        model: WorkSpaces,
        select: "name",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(allRequest);
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
    throw new Error("Unidentified Error");
  }
}
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const requestDetails = await PermissionRequest.create({
      requester: {
        id: body.requester,
        name: body.user.email.split("@")[0],
        email: body.user.email,
      },
      ownerId: body.ownerId,
      workspaceId: body.workspaceId,
      documentId: body.documentId,
      documentTitle: body.documentTitle,
      requestAccess: body.accessType,
      message: body.message,
    });
    if (!requestDetails) {
      return NextResponse.json(
        { message: "Error in creating request" },
        { status: 500 },
      );
    }
    return NextResponse.json({
      id: requestDetails._id,
    });
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
    throw new Error("Unidentified Error");
  }
}
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requesterId = searchParams.get("requesterId");
    const docId = searchParams.get("docId");
    const id = searchParams.get("id");
    const updatedUser = await Users.findByIdAndUpdate(
      requesterId,
      {
        $addToSet: { editableDocuments: docId },
      },
      { new: true },
    );
    const requestedUser = await PermissionRequest.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true },
    );

    return NextResponse.json(updatedUser);
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
    throw new Error("Unidentified Error");
  }
}
