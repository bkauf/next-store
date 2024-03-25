import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const path = join("/", "tmp", file.name);

  async function runSequentially(path: any, buffer: any) {
    const result1 = await writeFile(path, buffer);
    console.log("File written to", path);
    const result2 = await uploadToGCS(path, result1);
    console.log("Processing complete");


  }

  try {
    await runSequentially(path, buffer);
    console.log("File uploaded complete")
    // return NextResponse.json({
    //     link:
    //       "https://storage.googleapis.com/" +
    //       process.env.GCS_BUCKET +
    //       "/" +
    //       file.name,
    //   })
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  } 

  
}

const uploadToGCS = async (filePath: any, result1: any) => {
  const { Storage } = require("@google-cloud/storage");
  const storage = new Storage();
  console.log("Uploading file to GCS...")

  let result = await storage
    .bucket(process.env.GCS_BUCKET)
    .upload(filePath)
    .catch(console.error)
    .then(() => {
      console.log("File uploaded to GCS");
      return result1;
    });
    return result
};
