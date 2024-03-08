import { NextRequest, NextResponse } from "next/server";
const https = require("https");
import client from "@/app/lib/weaviate-client";

/* Function to add a new product */
export async function POST(request: NextRequest) {
  const postData = await request.json(); // get request body

  const productName = postData.productName;
  const productDesc = postData.productDesc;

  let itemDetails = {
    name: productName,
    description: productDesc,
  };

  let result = await client.data
    .creator()
    .withClassName("Products")
    .withProperties(itemDetails)
    .do()
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });

  return NextResponse.json({ status: "ok" });
}

/* Function to get a product */

export async function GET(request: NextRequest) {
  console.log("get product")
  const productId = request.nextUrl.searchParams.get("pid");

  let result = await client.data
    .getterById()
    .withClassName("Products")
    //@ts-ignore
    .withId(productId)
    .do()
    .catch((error) => {
      console.error("error1", error);
    });
  if (result) {
    return NextResponse.json(result.properties);
  } else {
    return NextResponse.json({});
  }
}

export async function DELETE(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("pid");

  let result = await client.data
    .deleter()
    .withClassName("Products") // Class of the object to be deleted
    //@ts-ignore
    .withId(productId)
    .do()
    .catch((error) => {
      console.error(error);
    });
  if (result) {
    return NextResponse.json(result.properties);
  } else {
    return NextResponse.json({ msg: "Item deleted." });
  }
}
