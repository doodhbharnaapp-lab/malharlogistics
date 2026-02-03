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
   Helpers
=========================== */
function normalizeDocuments(documents = []) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return documents.map(doc => {
        const expiry = new Date(doc.expiryDate)
        expiry.setHours(0, 0, 0, 0)
        return {
            documentType: doc.documentType,
            expiryDate: expiry,
            isExpired: expiry < today
        }
    })
}
/* ===========================   GET =========================== */
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const db = await getDB()
        /* ===== SINGLE VEHICLE ===== */
        if (id) {
            const vehicle = await db.collection('marketvehicles').findOne({
                _id: new ObjectId(id),
                isDeleted: { $ne: true }
            })
            return NextResponse.json({ success: true, data: vehicle })
        }
        /* ===== VEHICLE LIST ===== */
        const vehicles = await db.collection('marketvehicles')
            .find({ isDeleted: { $ne: true } })
            .sort({ createdAt: -1 })
            .toArray()
        return NextResponse.json({ success: true, data: vehicles })
    } catch (err) {
        console.error('GET vehicles error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
/* ===========================
   POST – Create Vehicle
=========================== */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['admin', 'manager'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const data = await req.json()
        const db = await getDB()
        if (!data.vehicleNo || !data.vehicleModel) {
            return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
        }
        const exists = await db.collection('marketvehicles').findOne({
            vehicleNo: data.vehicleNo,
            isDeleted: { $ne: true }
        })
        if (exists) {
            return NextResponse.json({ error: 'Vehicle already exists' }, { status: 400 })
        }
        const vehicle = {
            vehicleNo: data.vehicleNo,
            model: data.vehicleModel,
            // OWNER – normalized (NO dropdown)
            ownerName: data.ownerName || '',
            ownerMobile: data.ownerMobile || '',
            // DRIVER – dropdown only
            driverName: data.driverName || '',
            driverMobile: data.driverMobile || '',
            bankName: data.bankName,
            accountNo: data.accountNo,
            ifscCode: data.ifscCode,
            accountHolderName: data.accountHolderName,
            documents: normalizeDocuments(data.documents),
            isActive: data.isActive ?? true,
            isMarket: data.isMarket ?? true,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        const result = await db.collection('marketvehicles').insertOne(vehicle)
        return NextResponse.json({ success: true, id: result.insertedId })
    } catch (err) {
        console.error('POST vehicle error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
/* ===========================
   PUT – Update Vehicle
=========================== */
// export async function PUT(req) {
//     try {
//         const session = await getServerSession(authOptions)
//         if (!session || !['admin', 'manager'].includes(session.user.role)) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//         }
//         const data = await req.json()
//         if (!data.id) {
//             return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 })
//         }
//         const db = await getDB()
//         const update = {
//             vehicleNo: data.vehicleNo,
//             model: data.vehicleModel,
//             ownerName: data.ownerName || '',
//             ownerMobile: data.ownerMobile || '',
//             driverName: data.driverName || '',
//             driverMobile: data.driverMobile || '',
//             bankName: data.bankName,
//             accountNo: data.accountNo,
//             ifscCode: data.ifscCode,
//             accountHolderName: data.accountHolderName,
//             documents: normalizeDocuments(data.documents),
//             isActive: data.isActive ?? true,
//             isMarket: data.isMarket ?? true,
//             updatedAt: new Date()
//         }
//         await db.collection('marketvehicles').updateOne(
//             { _id: new ObjectId(data.id) },
//             { $set: update }
//         )
//         return NextResponse.json({ success: true })
//     } catch (err) {
//         console.error('PUT vehicle error:', err)
//         return NextResponse.json({ error: 'Server error' }, { status: 500 })
//     }
// }
/* ===========================
   PUT – Update Vehicle (Partial updates allowed)
=========================== */
export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['admin', 'manager'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const data = await req.json()
        if (!data.id) {
            return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 })
        }
        const db = await getDB()
        // Get existing vehicle to merge with updates
        const existing = await db.collection('marketvehicles').findOne({
            _id: new ObjectId(data.id)
        })
        if (!existing) {
            return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
        }
        // Prepare update object with only provided fields
        const update = {
            updatedAt: new Date()
        }
        // Only update fields that are provided in the request
        if (data.vehicleNo !== undefined) update.vehicleNo = data.vehicleNo
        // FIX: Check for both model and vehicleModel
        if (data.model !== undefined) {
            update.model = data.model
        } else if (data.vehicleModel !== undefined) {
            update.model = data.vehicleModel
        }
        if (data.ownerName !== undefined) update.ownerName = data.ownerName || ''
        if (data.ownerMobile !== undefined) update.ownerMobile = data.ownerMobile || ''
        if (data.driverName !== undefined) update.driverName = data.driverName || ''
        if (data.driverMobile !== undefined) update.driverMobile = data.driverMobile || ''
        if (data.bankName !== undefined) update.bankName = data.bankName
        if (data.accountNo !== undefined) update.accountNo = data.accountNo
        if (data.ifscCode !== undefined) update.ifscCode = data.ifscCode
        if (data.accountHolderName !== undefined) update.accountHolderName = data.accountHolderName
        if (data.isActive !== undefined) update.isActive = data.isActive
        if (data.isMarket !== undefined) update.isMarket = data.isMarket
        // Handle documents if provided
        if (data.documents !== undefined) {
            update.documents = normalizeDocuments(data.documents)
        }
        await db.collection('marketvehicles').updateOne(
            { _id: new ObjectId(data.id) },
            { $set: update }
        )
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('PUT vehicle error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
/* ===========================
   DELETE – Soft Delete
=========================== */
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) {
            return NextResponse.json(
                { error: 'Vehicle ID is required' },
                { status: 400 }
            )
        }
        const db = await getDB()
        const result = await db.collection('marketvehicles').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    isDeleted: true,
                    updatedAt: new Date()
                }
            }
        )
        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Vehicle not found' },
                { status: 404 }
            )
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
// New function to get active vehicle count
export async function getMarketActiveVehicleCount() {
    const db = await getDB()
    const count = await db.collection('marketvehicles').countDocuments({ isActive: true })
    return count
}
