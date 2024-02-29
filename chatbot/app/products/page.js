import weaviate from 'weaviate-ts-client';
import React from "react";
import Menu from "../components/Menu"


  


const client = weaviate.client({
    scheme: 'http',
    host: `${process.env.WEAVIATE_SERVER}`,
  });
  
  

const page = async () => {

  


    let productsAry = await getAllProducts();



return(
<><Menu/>

    <div>
      <h1>Product List</h1>

       { productsAry.length >1 ?(
        <>
        
        <ul className='w-1/2'>
      {
        // @ts-ignore
        productsAry.map((product, index) => (
        <li key={index} className="mt-2">
          
          <span className="text-lg font-bold">{product.name}</span>
          <p>{product.itemDesc}</p>
        
        
        </li>
      ))}
    </ul>
        
        
        </>
        

       ) : (
      <>not</>
       )
       }
    </div>

    </>)
}
  export default page;



  const getAllProducts = async()=>{

  let  result = await client
    .graphql
    .get()
    .withClassName('Products')
    .withFields('name itemDesc  _additional { id }')
    .do();
  
  //console.log(JSON.stringify(result, null, 2));
 // console.log(result.data.Get.Products)
  return result.data.Get.Products

  
  }

