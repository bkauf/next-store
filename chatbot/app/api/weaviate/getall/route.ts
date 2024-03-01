import { NextRequest, NextResponse } from "next/server";
const https = require("https");
import client from "@/app/lib/weaviate-client";




/* Function to get all products */

export async function GET(request: NextRequest) {

  let result = await client.graphql
  .get()
  .withClassName("Products")
  .withFields("name itemDesc  _additional { id }")
  .do();

  console.log(result.data.Get.Products);


  if (result) {
    return NextResponse.json(result.data.Get.Products);
  } else {
    return NextResponse.json({});
  }
}