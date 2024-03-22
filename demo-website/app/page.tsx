"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

interface Product {
  description: String;
  name: String;
  filename: String;
  id: String;
  link: String;
  _additional: {
    id: String;
  };
}

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
        {productsAry.length >= 1 ? (
          <>
            <h1>Product List ({productsAry.length})</h1>
            <div className="grid grid-flow-row-dense grid-cols-3 p-2 ml-2 mr-2">
              {productsAry.map((product: Product, index) => (
                <div
                  key={index}
                  className="m-2 p-1 hover:border-gray-500 hover:border"
                >
                  <Link
                    href={
                      // @ts-ignore
                      "/product/?id=" + product._additional.id
                    }
                  >
                    <span className="text-lg font-bold">
                      {
                        // @ts-ignore
                        product.title
                      }
                    </span>
                    <span>
                   
                        <img
                          className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
                          src={`${product.link}`}
                          alt="filename"
                        />
                     
                    </span>

                   
                    <p>
                      {
                        // @ts-ignore
                        product.description
                          ? product.description.length > 90
                            ? product.description.substring(0, 90) + "..."
                            : product.description
                          : null
                      }
                      ...
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};
export default page;
