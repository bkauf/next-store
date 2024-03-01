"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

const page = () => {
  const [productsAry, setproductsAry] = useState([]);

  useEffect(() => {
    getAllProducts();
  }, []);

  const getAllProducts = async () => {
    axios
      .get("/api/weaviate/getall")

      .then((response) => {
        // Handle successful response

        console.log("Response data:", response.data);

        setproductsAry(response.data);
      })
      .catch((error) => {
        // Handle error
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error status:", error.response.status);
          console.error("Error data:", error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error:", error.message);
        }
      });
  };
  return (
    <>
      <div>
        <h1>Product List</h1>

        {productsAry.length > 1 ? (
          <>
            <ul className="w-1/2">
              {
                // @ts-ignore
                productsAry.map((product, index) => (
                  <li key={index} className="mt-2">
                    <Link href={"/product/?id=" + product._additional.id}>
                      <span className="text-lg font-bold">{product.name}</span>
                      <p>{product.productDesc}</p>
                    </Link>
                  </li>
                ))
              }
            </ul>
          </>
        ) : (
          <>not</>
        )}
      </div>
    </>
  );
};
export default page;
