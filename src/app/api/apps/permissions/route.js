import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
/* ===========================
   Mongo Connection
=========================== */
const client = new MongoClient(process.env.DATABASE_URL)
async function getDB() {
  await client.connect()
  return client.db()
}
/* ===========================
   GET – Permissions / Roles
=========================== */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const db = await getDB()
    /* ===== PERMISSION LIST ===== */
    if (!action || action === 'permissions') {
      const permissions = await db.collection('permissions')
        .find({ isActive: true })
        .sort({ module: 1, name: 1 })
        .toArray()
      return NextResponse.json({ success: true, data: permissions })
    }
    /* ===== ROLE + PERMISSIONS ===== */
    if (action === 'roles') {
      const roles = await db.collection('roles').aggregate([
        {
          $lookup: {
            from: 'permissions',
            localField: 'permissions',
            foreignField: '_id',
            as: 'permissionDetails'
          }
        },
        {
          $project: {
            name: 1,
            permissionDetails: {
              _id: 1,
              key: 1,
              name: 1,
              module: 1
            }
          }
        }
      ]).toArray()
      return NextResponse.json({ success: true, data: roles })
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('GET permissions error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
/* ===========================
   POST – Create Permission
=========================== */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const data = await req.json()
    if (!data.key || !data.name || !data.module) {
      return NextResponse.json(
        { error: 'Key, name and module required' },
        { status: 400 }
      )
    }
    const db = await getDB()
    const permissions = db.collection('permissions')
    const exists = await permissions.findOne({ key: data.key })
    if (exists) {
      return NextResponse.json(
        { error: 'Permission already exists' },
        { status: 400 }
      )
    }
    const permission = {
      key: data.key,
      name: data.name,
      module: data.module,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const result = await permissions.insertOne(permission)
    return NextResponse.json({
      success: true,
      id: result.insertedId.toString()
    })
  } catch (error) {
    console.error('POST permission error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
/* ===========================
   PUT – Assign Permissions
=========================== */
export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const data = await req.json()
    if (!data.roleId || !Array.isArray(data.permissionIds)) {
      return NextResponse.json(
        { error: 'Role and permissions required' },
        { status: 400 }
      )
    }
    const db = await getDB()
    await db.collection('roles').updateOne(
      { _id: new ObjectId(data.roleId) },
      {
        $set: {
          permissions: data.permissionIds.map(id => new ObjectId(id)),
          updatedAt: new Date()
        }
      }
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT role permission error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
/* ===========================
   DELETE – Disable Permission
=========================== */
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: 'Permission id required' },
        { status: 400 }
      )
    }
    const db = await getDB()
    await db.collection('permissions').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE permission error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
