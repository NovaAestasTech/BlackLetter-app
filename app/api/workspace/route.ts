import { NextResponse } from "next/server";
import connectToDatabase from "@/db/db";
import WorkSpaces from "@/db/Model";
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
export async function GET() {
  try {
    await connectToDatabase();
    const workspaces = await WorkSpaces.find({});
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
    const data = await request.json();
    const workspace = await WorkSpaces.create(data);
    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 },
    );
  }
}
