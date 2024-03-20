import { NextRequest, NextResponse } from "next/server";
const https = require("https");
import client from "@/app/lib/weaviate-client";
export const dynamic = 'force-dynamic'



/* Function to get all products */

export async function GET(request: NextRequest) {
  let result = await client.graphql
  .get()
  .withClassName("Products")
  .withFields("name description filename  _additional { id }")
  .withLimit(50)
  .do();

  console.log(result.data.Get.Products);


  if (result) {
    return NextResponse.json(result.data.Get.Products);
  } else {
    return NextResponse.json({});
  }
}