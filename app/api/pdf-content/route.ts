import { NextResponse, NextRequest } from "next/server";
import { getPdfData } from "@/buckets/buckets";
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get("filename");
    if (!filename) {
      return NextResponse.json(
        { error: "Filename parameter is required" },
        { status: 400 },
      );
    }
    const data = await getPdfData(process.env.name!, filename);
    if (!data) {
      return NextResponse.json(
        { message: "No such file is present" },
        { status: 500 },
      );
    }
    return NextResponse.json({
      text: data.text,
      name: filename,
      description: data.text.substring(0, 150).replace(/\n/g, " ") + "...",
    });
  } catch (e) {
    return NextResponse.json({ message: "Fetching Failed" }, { status: 500 });
  }
}
