// // app/api/users/route.js
// import { NextResponse } from 'next/server'
// import { MongoClient, ObjectId } from 'mongodb'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/libs/auth'
// import bcrypt from 'bcryptjs'
// const client = new MongoClient(process.env.DATABASE_URL)
// async function getDB() {
//   await client.connect()
//   return client.db()
// }
// /* ================= AUTH CHECK ================= */
// async function checkAdmin() {
//   const session = await getServerSession(authOptions)
//   if (!session) {
//     return { error: 'Unauthorized', status: 401 }
//   }
//   if (session.user.role !== 'admin') {
//     return { error: 'Forbidden. Admin access required.', status: 403 }
//   }
//   return { session }
// }
// /* ================= GET ================= */
// export async function GET() {
//   try {
//     const auth = await checkAdmin()
//     if (auth.error) {
//       return NextResponse.json({ error: auth.error }, { status: auth.status })
//     }
//     const db = await getDB()
//     const users = await db
//       .collection('users')
//       .find({}, { projection: { password: 0 } })
//       .sort({ createdAt: -1 })
//       .toArray()
//     const formattedUsers = users.map(user => ({
//       id: user._id.toString(),
//       fullName: user.name || user.email.split('@')[0],
//       username: user.email.split('@')[0],
//       email: user.email,
//       contact: user.contact,
//       role: user.role || 'user',
//       status: user.isActive ? 'active' : 'inactive',
//       avatar: user.avatar || '',
//       createdAt: user.createdAt,
//       lastLogin: user.lastLogin,
//       isActive: user.isActive,
//       emailVerified: user.emailVerified
//     }))
//     return NextResponse.json(formattedUsers)
//   } catch (error) {
//     console.error('GET users error:', error)
//     return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
//   }
// }
// /* ================= POST (Create User) ================= */
// export async function POST(req) {
//   try {
//     const auth = await checkAdmin()
//     if (auth.error) {
//       return NextResponse.json({ error: auth.error }, { status: auth.status })
//     }
//     const body = await req.json()
//     const { name, email, password, role = 'user', contact, isActive = true } = body
//     if (!email || !password) {
//       return NextResponse.json(
//         { error: 'Email and password are required' },
//         { status: 400 }
//       )
//     }
//     const db = await getDB()
//     const usersCollection = db.collection('users')
//     const existingUser = await usersCollection.findOne({ email })
//     if (existingUser) {
//       return NextResponse.json(
//         { error: 'User already exists' },
//         { status: 409 }
//       )
//     }
//     const hashedPassword = await bcrypt.hash(password, 10)
//     const newUser = {
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       contact,
//       isActive,
//       emailVerified: false,
//       createdAt: new Date(),
//       lastLogin: null
//     }
//     const result = await usersCollection.insertOne(newUser)
//     return NextResponse.json(
//       { message: 'User created successfully', id: result.insertedId },
//       { status: 201 }
//     )
//   } catch (error) {
//     console.error('POST user error:', error)
//     return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
//   }
// }
// /* ================= PUT (Update User) ================= */
// export async function PUT(req) {
//   try {
//     const auth = await checkAdmin()
//     if (auth.error) {
//       return NextResponse.json({ error: auth.error }, { status: auth.status })
//     }
//     const body = await req.json()
//     const { id, name, role, contact, isActive, password } = body
//     if (!id) {
//       return NextResponse.json({ error: 'User ID required' }, { status: 400 })
//     }
//     const db = await getDB()
//     const updateData = {
//       ...(name && { name }),
//       ...(role && { role }),
//       ...(contact && { contact }),
//       ...(typeof isActive === 'boolean' && { isActive })
//     }
//     if (password) {
//       updateData.password = await bcrypt.hash(password, 10)
//     }
//     const result = await db.collection('users').updateOne(
//       { _id: new ObjectId(id) },
//       { $set: updateData }
//     )
//     if (result.matchedCount === 0) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 })
//     }
//     return NextResponse.json({ message: 'User updated successfully' })
//   } catch (error) {
//     console.error('PUT user error:', error)
//     return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
//   }
// }
// /* ================= DELETE ================= */
// export async function DELETE(req) {
//   try {
//     const auth = await checkAdmin()
//     if (auth.error) {
//       return NextResponse.json({ error: auth.error }, { status: auth.status })
//     }
//     const { searchParams } = new URL(req.url)
//     const id = searchParams.get('id')
//     if (!id) {
//       return NextResponse.json({ error: 'User ID required' }, { status: 400 })
//     }
//     const db = await getDB()
//     const result = await db.collection('users').deleteOne({
//       _id: new ObjectId(id)
//     })
//     if (result.deletedCount === 0) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 })
//     }
//     return NextResponse.json({ message: 'User deleted successfully' })
//   } catch (error) {
//     console.error('DELETE user error:', error)
//     return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
//   }
// }



// app/api/users/route.js
import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import bcrypt from 'bcryptjs'

let client
async function getDB() {
  if (!client) {
    client = new MongoClient(process.env.DATABASE_URL)
    await client.connect()
  }
  return client.db()
}

/* ================= ENHANCED PERMISSION CHECK ================= */
async function checkPermission(requiredPermission) {
  const session = await getServerSession(authOptions)

  // Check authentication
  if (!session) {
    return { error: 'Unauthorized. Please login.', status: 401 }
  }

  const userRole = session.user?.role
  if (!userRole) {
    return { error: 'No role assigned to user', status: 403 }
  }

  // SPECIAL CASE: Admin role has ALL permissions
  if (userRole === 'admin') {
    return { success: true, session, role: { name: 'admin', permissions: [] } }
  }

  // For non-admin users, check database roles
  try {
    const db = await getDB()
    const role = await db.collection('roles').findOne({ name: userRole })

    if (!role) {
      return {
        error: `Role '${userRole}' not found. Please contact admin.`,
        status: 403
      }
    }

    // Check if user has required permission
    const hasPermission = role.permissions?.includes(requiredPermission)

    if (!hasPermission) {
      return {
        error: `Access denied. Required permission: ${requiredPermission}`,
        userRole,
        requiredPermission,
        status: 403
      }
    }

    return { success: true, session, role }
  } catch (error) {
    console.error('Permission check error:', error)
    return { error: 'Error checking permissions', status: 500 }
  }
}

/* ================= GET USERS ================= */
export async function GET() {
  try {
    // Check if user has permission
    const permissionCheck = await checkPermission('user-management-read')
    if (permissionCheck.error) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.status }
      )
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
      contact: user.contact || '',
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
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

/* ================= CREATE USER ================= */
export async function POST(req) {
  try {
    // Check permission
    const permissionCheck = await checkPermission('user-management-create')
    if (permissionCheck.error) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.status }
      )
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

    // Check existing user
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Validate role exists (skip for 'user' which is default)
    if (role !== 'user') {
      const roleExists = await db.collection('roles').findOne({ name: role })
      if (!roleExists) {
        return NextResponse.json(
          { error: `Role '${role}' does not exist` },
          { status: 400 }
        )
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      contact: contact || '',
      isActive,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      createdBy: permissionCheck.session.user.email
    }

    const result = await usersCollection.insertOne(newUser)

    return NextResponse.json(
      {
        message: 'User created successfully',
        id: result.insertedId,
        user: {
          id: result.insertedId,
          name,
          email,
          role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST user error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// Similar changes for PUT and DELETE...
/* ================= UPDATE USER ================= */
export async function PUT(req) {
  try {
    // Check if user has permission to update users
    const permissionCheck = await checkPermission('user-management-update')
    if (permissionCheck.error) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.status }
      )
    }

    // Get the user ID from the URL query parameters
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    // Also check if ID is in the body (for flexibility)
    const body = await req.json()
    const userId = id || body.id

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const db = await getDB()
    const usersCollection = db.collection('users')

    // Validate ObjectId
    let objectId
    try {
      objectId = new ObjectId(userId)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await usersCollection.findOne({ _id: objectId })
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent non-admin users from changing roles to admin
    const currentUserRole = permissionCheck.session.user.role
    const { name, email, role, contact, isActive, password } = body

    // Build update object (only include fields that are provided)
    const updateData = {}

    if (name !== undefined) updateData.name = name
    if (email !== undefined) {
      // Check if email is already taken by another user
      if (email !== existingUser.email) {
        const emailExists = await usersCollection.findOne({
          email,
          _id: { $ne: objectId }
        })
        if (emailExists) {
          return NextResponse.json(
            { error: 'Email already in use by another user' },
            { status: 409 }
          )
        }
      }
      updateData.email = email
    }

    if (contact !== undefined) updateData.contact = contact
    if (isActive !== undefined) updateData.isActive = isActive

    // Handle role changes with proper permissions
    if (role !== undefined && role !== existingUser.role) {
      // Only admins can change roles
      if (currentUserRole !== 'admin') {
        return NextResponse.json(
          { error: 'Only admins can change user roles' },
          { status: 403 }
        )
      }

      // Validate that the role exists
      const roleExists = await db.collection('roles').findOne({ name: role })
      if (!roleExists) {
        return NextResponse.json(
          { error: `Role '${role}' does not exist` },
          { status: 400 }
        )
      }

      // Prevent changing your own role if you're updating yourself
      if (existingUser.email === permissionCheck.session.user.email) {
        return NextResponse.json(
          { error: 'You cannot change your own role' },
          { status: 403 }
        )
      }

      updateData.role = role
    }

    // Handle password update
    if (password) {
      // Only allow password update if:
      // 1. User is updating their own password, OR
      // 2. User is an admin
      const isOwnAccount = existingUser.email === permissionCheck.session.user.email
      if (!isOwnAccount && currentUserRole !== 'admin') {
        return NextResponse.json(
          { error: 'You can only change your own password' },
          { status: 403 }
        )
      }

      // Add password validation here if needed
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        )
      }

      updateData.password = await bcrypt.hash(password, 10)
    }

    // Add timestamp
    updateData.updatedAt = new Date()
    updateData.updatedBy = permissionCheck.session.user.email

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update the user
    const result = await usersCollection.updateOne(
      { _id: objectId },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // Fetch the updated user (without password)
    const updatedUser = await usersCollection.findOne(
      { _id: objectId },
      { projection: { password: 0 } }
    )

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user: {
          id: updatedUser._id.toString(),
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          contact: updatedUser.contact,
          isActive: updatedUser.isActive,
          updatedAt: updatedUser.updatedAt
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('PUT user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
/* ================= DELETE USER ================= */
export async function DELETE(req) {
  try {
    // Check if user has permission to delete users
    const permissionCheck = await checkPermission('user-management-delete')
    if (permissionCheck.error) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: permissionCheck.status }
      )
    }

    // Get the user ID from the URL query parameters
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const db = await getDB()
    const usersCollection = db.collection('users')

    // Check if user exists
    let objectId
    try {
      objectId = new ObjectId(id)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    const user = await usersCollection.findOne({ _id: objectId })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deleting yourself
    const currentUserEmail = permissionCheck.session.user.email
    if (user.email === currentUserEmail) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 403 }
      )
    }

    // Prevent deleting admin users unless you're an admin
    if (user.role === 'admin' && permissionCheck.session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      )
    }

    // Delete the user
    const result = await usersCollection.deleteOne({ _id: objectId })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      )
    }

    // Optional: Also delete related data (sessions, etc.)
    // await db.collection('sessions').deleteMany({ userId: objectId })

    return NextResponse.json(
      {
        message: 'User deleted successfully',
        id: id
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE user error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
