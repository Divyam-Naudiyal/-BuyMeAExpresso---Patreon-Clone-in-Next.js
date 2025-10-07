// app/[username]/page.js
import React from 'react'
import PaymentPage from '@/components/PaymentPage'
import { notFound } from "next/navigation"
import connectDb from '@/db/connectDb'
import User from '@/models/User'

const Username = async ({ params }) => {
  // Await the params first
  const { username } = await params

  // If the username is not present in the database, show a 404 page
  const checkUser = async () => {
    await connectDb()
    let u = await User.findOne({ username: username })
    if (!u) {
      return notFound()
    }
    return u
  }
  
  await checkUser()

  return (
    <>
      <PaymentPage username={username} />
    </>
  )
}

export default Username
 
export async function generateMetadata({ params }) {
  const { username } = await params
  return {
    title: `Support ${username} - Get Me A Expresso`,
  }
}