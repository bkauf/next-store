"use client";
import React, { useState } from "react";
import axios from "axios";
import weaviate from 'weaviate-ts-client';

const client = weaviate.client({
  scheme: 'http',
  host: 'http://34.68.107.174/',
});




const page = () => {
  const [file, setFile] = useState<File | undefined>();
  const [image, setImage] = useState();
  const [name, setName] = useState("");
  const [itemDesc, setItemDesc] = useState("");

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
        setItemDesc(response.data.description)
      })
      .catch((error) => {
        console.error(error);
      });
  }

  const createProduct = async()=>{

    let itemDetails =
      {
          name: name,
          itemDesc: itemDesc,
     }

  let   result = await client.data
  .creator()
  .withClassName('products')
  .withProperties(itemDetails)
  .do();

console.log(JSON.stringify(result, null, 2)); 
     



  }
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
            value={itemDesc}
            onChange={(event) => setItemDesc(event.target.value)}

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
          >Create Product</button>

        </div>
      </div>
    </div>
  );
};

export default page;
