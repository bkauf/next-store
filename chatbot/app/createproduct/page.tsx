"use client";
import axios from "axios";
import React from "react";
import Product from "@/app/components/Product";

interface ProductObj {
  description: String;
  name: String;
  url: String;
  id: String;
}

const page = () => {
  let blank = { description: "", name: "", url: "", id: "" };

  return (
    <>
      <Product productObj={blank} />
    </>
  );
};
export default page;
