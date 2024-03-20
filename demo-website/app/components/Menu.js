import React from 'react'
import Link from "next/link";
const Menu = () => {
  return (
    <div className="mb-2">
      <Link href="/product" ><span className="font-bold text-blue-600">Create Product</span> </Link> |
      <Link href="/" ><span className="font-bold text-blue-600"> View Products</span> </Link>
    </div>
  )
}

export default Menu
