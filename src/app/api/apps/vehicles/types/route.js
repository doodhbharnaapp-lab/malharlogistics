import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
const client = new MongoClient(process.env.DATABASE_URL)
async function getDB() {
    await client.connect()
    return client.db()
}
/* ===========================
   GET – Fetch all vehicle types
=========================== */
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const db = await getDB()
        const data = await db
            .collection('vehicleTypes')
            .find({ isActive: true })
            .sort({ srno: 1 })
            .toArray()
        return NextResponse.json({
            success: true,
            data: data.map(item => ({
                id: item._id.toString(),
                srno: item.srno,
                type: item.type,
                isActive: item.isActive, // ✅ ADD THIS,

            }))
        })
    } catch (error) {
        console.error('GET error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
/* ===========================
   POST – Create new type
=========================== */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { srno, type } = await req.json()
        if (!srno || !type) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }
        const db = await getDB()
        const result = await db.collection('vehicleTypes').insertOne({
            srno,
            type,
            isActive: true,
            createdAt: new Date()
        })
        return NextResponse.json({
            success: true,
            id: result.insertedId.toString(),
            result: result.json,
        })
    } catch (error) {
        console.error('POST error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
/* ===========================
   PUT – Update type
=========================== */
export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { id, srno, type,  // 👈 IMPORTANT
        } = await req.json()
        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }
        const db = await getDB()
        await db.collection('vehicleTypes').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    srno,
                    type,

                    isActive, // ✅ ADD THIS

                }
            }
        )
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('PUT error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
/* ===========================
   DELETE – Soft delete type
=========================== */
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { id } = await req.json()
        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }
        const db = await getDB()
        await db.collection('vehicleTypes').updateOne(
            { _id: new ObjectId(id) },
            { $set: { isActive: false } }
        )
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
