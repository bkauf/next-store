"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface ProductObj {
  description: String;
  name: String;
  filename: String;
  id: String;
}

const Product = ({ productObj }: { productObj: ProductObj }) => {
  const [file, setFile] = useState<File | undefined>();
  const [filename, setFilename] = useState("");
  const [product, setProduct] = useState({});
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  useEffect(() => {
    //@ts-ignore
    setName(productObj.name);
    //@ts-ignore
    setDescription(productObj.description);
  }, [productObj]);

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
      setFilename(response.data.fileName);
    });
  }

  function generateDesc() {
    const data = {
      name: name,
      fileName: filename,
    };
    const headers = {
      "Content-Type": "application/json",
    };
    axios
      .post("/api/gemini", data, { headers })
      .then((response) => {
        console.log(response.data); // Contains the response from the server
        setDescription(response.data.description);
      })
      .catch((error) => {
        console.error(error);
      });
  }
  function createProduct() {
    axios
      .post("/api/weaviate", {
        name: name,
        description: description,
        filename: filename
      })
      .then(function (response) {
        console.log(response);
        window.location.href = "/";
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  const deleteProduct = () => {
    axios
      .delete("/api/weaviate?pid=" + productObj.id)
      .then((response) => {
        // Handle successful response
        console.log("Response data:", response.data);

        window.location.href = "/";
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
                //@ts-ignore
                onChange={(event) => setName(event.target.value)}
                //@ts-ignore
                value={name}
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
          {filename ? (
            <img
              className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
              src={`https://storage.mtls.cloud.google.com/${process.env.NEXT_PUBLIC_GCS_BUCKET}/${filename}`}
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
            // @ts-ignore comment

            value={description}
            //@ts-ignore
            onChange={(event) => setDescription(event.target.value)}
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
      <button
        type="submit"
        onClick={deleteProduct}
        className="bg-red-500 text-white mb-2 mt-3 hover:bg-grey-300 py-2 px-4 rounded"
      >
        Delete Product
      </button>
    </div>
  );
};

export default Product;
