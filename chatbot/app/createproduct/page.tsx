"use client";
import React, { useState } from "react";
import axios from "axios";

const page = () => {
  const [file, setFile] = useState<File | undefined>();
  const [image, setImage] = useState();
  const [name, setName] = useState("");
  const [product, setProduct] = useState("");
  const [productDesc, setproductDesc] = useState("");

  function handleChange(e: React.FormEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement & {
      files: FileList;
    };
    setFile(target.files[0]);
  }

  function uploadImage(e: React.SyntheticEvent) {
    e.preventDefault();

    const url = "api/upload";
    const formData = new FormData();
    // @ts-ignore comment
    formData.append("file", file);
    // @ts-ignore comment
    formData.append("fileName", file.name);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    axios.post(url, formData, config).then((response) => {
      console.log("uploaded", response.data.fileName);
      setImage(response.data.fileName);
    });
  }

  function generateDesc() {
    const data = {
      name: name,
      fileName: image,
    };
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post("/api/gemini", data, { headers })
      .then((response) => {
        console.log(response.data); // Contains the response from the server
        setproductDesc(response.data.description);
      })
      .catch((error) => {
        console.error(error);
      });
  }
  function createProduct() {
    axios
      .post("/api/weaviate", {
        productName: name,
        productDesc: productDesc,
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const getProduct = async (productId : any) => {
  
    axios
      .get("/api/weaviate?pid=" + productId)
      .then((response) => {
        // Handle successful response
        console.log("Response data:", response.data);
        setProduct(response.data);
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
    <div className="pl-5">
      <h1 className="text-2xl">Product Page</h1>
      <div className="flex flex-col justify-between p-4 leading-normal">
        <form onSubmit={uploadImage}>
          <ul>
            <li>
              Name:{" "}
              <input
                className="bg-gray-100 p-1"
                onChange={(event) => setName(event.target.value)}
              />
            </li>
            <li>
              Image:{" "}
              <input
                type="file"
                className="w-64"
                name="file"
                onChange={handleChange}
              />
              <button
                type="submit"
                className="bg-green-500 text-white hover:bg-grey-300 ld py-2 px-4 rounded"
              >
                Upload
              </button>
            </li>
          </ul>
          {image ? (
            <img
              className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
              src={`https://storage.mtls.cloud.google.com/hipster-ai-images/${image}`}
              alt="filename"
            />
          ) : null}
        </form>

        <div className="w-96 mt-2">
          <button
            type="submit"
            onClick={generateDesc}
            className="bg-indigo-500 text-white mb-2 mt-3 hover:bg-grey-300 ld py-2 px-4 rounded"
          >
            Generate Product Description
          </button>

          <textarea
            value={productDesc}
            onChange={(event) => setproductDesc(event.target.value)}
            name="description"
            className="block p-2.5 w-full 
                text-gray-900 bg-gray-50 
                rounded-lg border border-gray-300 
                focus:ring-blue-500 
                focus:border-blue-500 
               "
            placeholder="Write your item description..."
            // @ts-ignore comment
            rows="6"
          ></textarea>
          <button
            type="submit"
            onClick={createProduct}
            className="bg-blue-500 text-white mb-2 mt-3 hover:bg-grey-300 ld py-2 px-4 rounded"
          >
            Create Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default page;
