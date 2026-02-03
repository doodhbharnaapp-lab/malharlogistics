// app/api/users/route.js
import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import bcrypt from 'bcryptjs'
const client = new MongoClient(process.env.DATABASE_URL)
async function getDB() {
  await client.connect()
  return client.db()
}
/* ================= AUTH CHECK ================= */
async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return { error: 'Unauthorized', status: 401 }
  }
  if (session.user.role !== 'admin') {
    return { error: 'Forbidden. Admin access required.', status: 403 }
  }
  return { session }
}
/* ================= GET ================= */
export async function GET() {
  try {
    const auth = await checkAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const db = await getDB()
    const users = await db
      .collection('users')
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray()
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      fullName: user.name || user.email.split('@')[0],
      username: user.email.split('@')[0],
      email: user.email,
      contact: user.contact,
      role: user.role || 'user',
      status: user.isActive ? 'active' : 'inactive',
      avatar: user.avatar || '',
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      isActive: user.isActive,
      emailVerified: user.emailVerified
    }))
    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('GET users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
/* ================= POST (Create User) ================= */
export async function POST(req) {
  try {
    const auth = await checkAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const body = await req.json()
    const { name, email, password, role = 'user', contact, isActive = true } = body
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    const db = await getDB()
    const usersCollection = db.collection('users')
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      contact,
      isActive,
      emailVerified: false,
      createdAt: new Date(),
      lastLogin: null
    }
    const result = await usersCollection.insertOne(newUser)
    return NextResponse.json(
      { message: 'User created successfully', id: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST user error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
/* ================= PUT (Update User) ================= */
export async function PUT(req) {
  try {
    const auth = await checkAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const body = await req.json()
    const { id, name, role, contact, isActive, password } = body
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    const db = await getDB()
    const updateData = {
      ...(name && { name }),
      ...(role && { role }),
      ...(contact && { contact }),
      ...(typeof isActive === 'boolean' && { isActive })
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('PUT user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
/* ================= DELETE ================= */
export async function DELETE(req) {
  try {
    const auth = await checkAdmin()
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    const db = await getDB()
    const result = await db.collection('users').deleteOne({
      _id: new ObjectId(id)
    })
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('DELETE user error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
