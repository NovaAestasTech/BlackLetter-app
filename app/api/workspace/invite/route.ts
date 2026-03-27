import { NextResponse } from "next/server";
import WorkSpaces from "@/db/Model";
import connectToDatabase from "@/db/db";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, role, workspace_id, user } = await req.json();

    const updateWorkspace = await WorkSpaces.findByIdAndUpdate(
      { _id: workspace_id, owner: user.id, "members.email": { $ne: email } },
      {
        $push: {
          members: {
            email: email.toLowerCase(),
            role,
          },
        },
      },
      { new: true },
    );
    if (!updateWorkspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      message: "Invitation sent successfully",
      members: updateWorkspace.members,
    });
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
    throw new Error("Unidentifed Error");
  }
}
