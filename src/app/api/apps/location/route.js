import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
const COLLECTION = 'locations'
const client = new MongoClient(process.env.DATABASE_URL)
async function getDB() {
    await client.connect()
    return client.db()
}
/* ================= GET ================= */
export async function GET() {
    try {
        const db = await getDB()
        const locations = await db
            .collection(COLLECTION)
            .find({ isDeleted: { $ne: true } })
            .sort({ srno: 1 })
            .toArray()
        return NextResponse.json({ data: locations })
    } catch (error) {
        console.error('GET error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
/* ================= POST ================= */
export async function POST(req) {
    try {
        const { srno, locationName, isActive } = await req.json()
        if (!locationName) {
            return NextResponse.json(
                { error: 'Location name is required' },
                { status: 400 }
            )
        }
        const db = await getDB()
        await db.collection(COLLECTION).insertOne({
            srno: Number(srno),
            locationName,
            isActive: Boolean(isActive),
            isDeleted: false,
            createdAt: new Date()
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('POST error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
/* ================= PUT ================= */
export async function PUT(req) {
    try {
        const { id, locationName, isActive } = await req.json()
        if (!id) {
            return NextResponse.json(
                { error: 'ID is required' },
                { status: 400 }
            )
        }
        const db = await getDB()
        await db.collection(COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    locationName,
                    isActive: Boolean(isActive),
                    updatedAt: new Date()
                }
            }
        )
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('PUT error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
/* ================= DELETE (SOFT) ================= */
export async function DELETE(req) {
    try {
        const { id } = await req.json()
        if (!id) {
            return NextResponse.json(
                { error: 'ID is required' },
                { status: 400 }
            )
        }
        const db = await getDB()
        await db.collection(COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    isDeleted: true,
                    updatedAt: new Date()
                }
            }
        )
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
