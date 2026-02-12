import { NextResponse } from "next/server";
import { Documents } from "@/db/Model";
import WorkSpaces from "@/db/Model";
import connectToDatabase from "@/db/db";
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
    if (!id) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 },
      );
    }
    const workspace = await WorkSpaces.findById(id).populate("documents");
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(workspace, { status: 200 });
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
    throw new Error("Unidentified error");
  }
}
