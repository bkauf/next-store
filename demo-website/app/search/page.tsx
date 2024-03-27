"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

const page = () => {
  useEffect(() => {
    // if (productId) {
    //   getProduct(productId);
    // }
  }, []);

  const productSearch = async () => {
    axios
      .get("/api/weaviate/search")
      .then((response) => {
        // Handle successful response
        console.log("Response data:", response.data);
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
      <h1>Search</h1>

      <form>
        <div className="relative inline-block text-left">
         
          <ul>
            <li>
             <label>Search Term: 
              </label> <input className="bg-gray-100 w-96 m-2 p-1" />
            </li><li>
            <label>Choose a Category:</label>
          <select id="cars" name="cars" className="w-24">
            <option value="volvo">Volvo</option>
            <option value="saab">Saab</option>
            <option value="fiat">Fiat</option>
            <option value="audi">Audi</option>
          </select>


            </li>
          </ul>
        
        </div>
      </form>
    </>
  );
};
export default page;
