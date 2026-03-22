export const runtime = "nodejs";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import pdf from "pdf-parse";

const s3 = new S3Client({
  forcePathStyle: true,
  region: "us-east-1",
  endpoint: process.env.end_point!,
  credentials: {
    accessKeyId: process.env.accessKeyId!,
    secretAccessKey: process.env.secretAccessKey!,
  },
});
export async function getPdfData(bucketName: string, filename: string) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: filename,
  });

  try {
    const response = await s3.send(command);
    const streamToBuffer = async (stream: any): Promise<Buffer> => {
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    };
    const buffer = await streamToBuffer(response.Body);
    const data = await pdf(buffer);

    return {
      text: data.text,
    };
  } catch (err) {
    console.error("Error fetching files:", err);
  }
}
