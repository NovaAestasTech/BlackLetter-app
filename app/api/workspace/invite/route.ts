import { NextResponse } from "next/server";
import WorkSpaces from "@/db/Model";
import connectToDatabase from "@/db/db";
import { Users } from "@/db/Model";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { email, role, workspace_id, inviterId, editableDocIds } =
      await req.json();

    if (!email || !workspace_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const lowerEmail = email.toLowerCase().trim();

    const updateWorkspace = await WorkSpaces.findOneAndUpdate(
      {
        _id: workspace_id,
        owner: inviterId,
        "members.email": { $ne: lowerEmail },
      },
      {
        $push: {
          members: {
            email: lowerEmail,
            role: role || "member",
            joinedAt: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!updateWorkspace) {
      return NextResponse.json(
        { error: "Workspace not found or member already exists" },
        { status: 404 },
      );
    }

    const updatedUser = await Users.findOneAndUpdate(
      { Email: lowerEmail },
      {
        $addToSet: {
          workspaces: workspace_id,
          editableDocuments: { $each: editableDocIds || [] },
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "Workspace updated, but user account not found in system." },
        { status: 200 },
      );
    }

    return NextResponse.json({
      message: "Permissions granted successfully",
      members: updateWorkspace.members,
    });
  } catch (e) {
    console.error("Invite Error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
