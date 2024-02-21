import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const https = require("https");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface PostData {
  name: string;
  fileName: string;
}

export async function POST(request: Request) {
  const postData = await request.json(); // get request body

  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  console.log(postData);
  const prompt =
    "Write a short product description for the item in this image?";
  // @ts-ignore comment
  await getImage(postData.fileName);
  const imageParts = [
    // fileToGenerativePart("image1.png", "image/png"),
    fileToGenerativePart("image.jpg", "image/jpeg"),
  ];

  const result = await model.generateContent([
    prompt,
    postData.name,
    ...imageParts,
  ]);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return NextResponse.json({ description: text });
}

const getImage = async (fileName: string) => {
  const file = fs.createWriteStream("image.jpg");
  const request = https.get(
    "https://storage.googleapis.com/hipster-ai-images/" + fileName,
    function (response: any) {
      response.pipe(file);
    }
  );
};

function fileToGenerativePart(path: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}
