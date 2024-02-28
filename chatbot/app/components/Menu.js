import React from 'react'
import Link from "next/link";
const Menu = () => {
  return (
    <div>
      <Link href="/createproduct" > Create Product </Link> |
      <Link href="/products" > View Products </Link>
    </div>
  )
}

export default Menu
