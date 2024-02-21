import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const https = require("https");
const axios = require('axios');
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
   //@ts-ignore comment
   // Get the image to send to he model and convert it to base64
  
  
   let imgBase64 = await downloadFile(postData.fileName)
 


  // const imageParts = [
  //   //fileToGenerativePart("image.jpg", "image/jpeg"),
  //   imgBase64,
  // ];

  const result = await model.generateContent([
    prompt,
    postData.name,
    [fileToGenerativePart("image.jpg", "image/jpeg")],
  ]);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  //delete image
  
  return NextResponse.json({ description: text });
}

const getImage = async (fileName: string) => {
  console.log("downloading image from GCS...")
  const path = "image.jpg"
  const mimeType = "image/jpeg"
  const file = fs.createWriteStream("image.jpg");
  const request = https.get(
    "https://storage.googleapis.com/hipster-ai-images/" + fileName,
    function (response: any) {
      response.pipe(file);
      console.log("downloading image complete...")
  })
   
};

async function downloadFile(fileName: string) {
  console.log("downloading image from GCS...")
  try {
    const response = await axios({
      url: "https://storage.googleapis.com/hipster-ai-images/" + fileName,
      method: 'GET',
      responseType: 'stream' // Important: stream the response
    });

    const writer = fs.createWriteStream("image.jpg");

    response.data.pipe(writer); // Pipe the data to the write stream
    console.log("Download Finished...")
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

  } catch (error) {
    console.error("Error downloading file:", error); 
  }
}




function fileToGenerativePart(path: string, mimeType: string) {
  console.log("Convert to base64...")
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}
