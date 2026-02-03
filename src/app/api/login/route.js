// Next Imports
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { MongoClient } from 'mongodb'
// Use your DATABASE_URL from .env.local
const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('Please add DATABASE_URL to your .env.local file')
}
// Connection cache for development
let client
let clientPromise
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(DATABASE_URL)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(DATABASE_URL)
  clientPromise = client.connect()
}
export async function POST(req) {
  try {
    // Vars
    const { email, password } = await req.json()
    console.log('Login attempt for:', email)
    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: ['Email and password are required']
        },
        {
          status: 400,
          statusText: 'Bad Request'
        }
      )
    }
    // Connect to MongoDB
    const client = new MongoClient(process.env.DATABASE_URL);
    await client.connect();
    const db = client.db(); // uses "srtransport"
    const usersCollection = db.collection('users');
    // Find user by email
    const user = await usersCollection.findOne({
      email: email.toLowerCase().trim(),
      isActive: true // Only allow active users to login
    })
    console.log('User found:', user ? 'Yes' : 'No')
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: ['Email or Password is invalid']
        },
        {
          status: 401,
          statusText: 'Unauthorized Access'
        }
      )
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: ['Email or Password is invalid']
        },
        {
          status: 401,
          statusText: 'Unauthorized Access'
        }
      )
    }
    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    )
    // Remove password from response
    const { password: _, ...filteredUserData } = user
    // Format response similar to your mock data
    const response = {
      success: true,
      ...filteredUserData,
      id: user._id.toString() // Convert ObjectId to string
    }
    console.log('Login successful for:', user.email)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: ['Login failed. Please try again.'],
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      {
        status: 500,
        statusText: 'Internal Server Error'
      }
    )
  }
}
// Optional: Add other HTTP methods
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: ['Method not allowed. Use POST for login.']
    },
    {
      status: 405,
      statusText: 'Method Not Allowed'
    }
  )
}
