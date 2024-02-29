import weaviate from 'weaviate-ts-client';
import React, { useState } from "react";





const page = async () => {



  const newProduct = async()=>{


  }



    const response = await client.schema
    .getter()
    .do();
  console.log(JSON.stringify(response, null, 2));
  readDatabase();
return (


    <div><h1>Weaviate</h1></div>
)
}

export default page;


const client = weaviate.client({
    scheme: 'http',
    host: `${process.env.WEAVIATE_SERVER}`,
  });
  



const getItem = async ({itemID}: {itemID: string}) =>{

  let  result = await client.data
    .getterById()
    .withClassName('JeopardyQuestion')
    .withId('00ff6900-e64f-5d94-90db-c8cfa3fc851b')
    .do();
  
  console.log(JSON.stringify(result, null, 2));

}

const insertItem = async ({item}: {item: object}) =>{

    let newProduct = await client.data
  .creator()
  .withClassName('JeopardyQuestion')
  .withProperties({item})
  .do();

//   .withProperties({
//     question: 'This vector DB is OSS and supports automatic property type inference on import',
//     answer: 'Weaviate',  // schema properties can be omitted
//     newProperty: 123,  // will be automatically added as a number property
//   })
console.log(JSON.stringify(newProduct, null, 2));  // the returned value is the object
}

const readDatabase = async() =>{

// STEP 1 - Prepare a helper function to iterate through data in batches

    const query = client.graphql.get()
      .withClassName("JeopardyQuestion")
      .withFields('title description _additional { id }')
      .withLimit(10);
      console.log("query")
      console.log(query)
      return 
    
  }


const productClassObj = {
  
    "class": "JeopardyQuestion",
    "properties": [
        {
            "name": "category",
            "dataType": ["text"],
        },
        {
            "name": "title",
            "dataType": ["text"],
        },
       
    ],
}