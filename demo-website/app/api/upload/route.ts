import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";


export async function POST(request: NextRequest) {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if(!file){
        return NextResponse.json({success: false})
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const path = join('/', 'tmp', file.name)
    await writeFile(path, buffer)


   await uploadToGCS(path)
    console.log(path)
    return NextResponse.json({link: "https://storage.googleapis.com/"+process.env.GCS_BUCKET+"/"+file.name})

}


const uploadToGCS = async (filePath: any)=> {

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

    await storage.bucket(process.env.GCS_BUCKET).upload(filePath).catch(console.error);
 
}