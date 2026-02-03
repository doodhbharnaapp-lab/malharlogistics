import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
const TRIPS_COLLECTION = 'markettrips'
const ADVANCES_COLLECTION = 'marketadvances'
const client = new MongoClient(process.env.DATABASE_URL)
async function getDB() {
    await client.connect()
    return client.db()
}
/* ================= GET ADVANCES ================= */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const tripId = searchParams.get('tripId')
        const vehicleNo = searchParams.get('vehicleNo')
        const dateFrom = searchParams.get('dateFrom')
        const dateTo = searchParams.get('dateTo')
        const db = await getDB()
        let query = { isDeleted: { $ne: true } }
        // Filter by tripId
        if (tripId && ObjectId.isValid(tripId)) {
            query.tripId = new ObjectId(tripId)
        }
        // Filter by vehicleNo
        if (vehicleNo) {
            query.vehicleNo = vehicleNo.trim()
        }
        // Filter by date range
        if (dateFrom || dateTo) {
            query.date = {}
            if (dateFrom) query.date.$gte = dateFrom
            if (dateTo) query.date.$lte = dateTo
        }
        // Fetch advances
        const advances = await db
            .collection(ADVANCES_COLLECTION)
            .find(query)
            .sort({ date: -1, createdAt: -1 })
            .toArray()
        // If tripId provided, get trip details too
        let tripDetails = null
        if (tripId && ObjectId.isValid(tripId)) {
            tripDetails = await db.collection(TRIPS_COLLECTION).findOne({
                _id: new ObjectId(tripId),
                isDeleted: { $ne: true }
            })
        }
        // Calculate total amount
        const totalAmount = advances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
        return NextResponse.json({
            success: true,
            data: advances,
            count: advances.length,
            totalAmount: totalAmount,
            tripDetails: tripDetails ? {
                vehicleNo: tripDetails.vehicleNo,
                driverName: tripDetails.driverName,
                fromLocation: tripDetails.fromLocation,
                toLocation: tripDetails.toLocation,
                dieselLtr: tripDetails.dieselLtr,
                dieselRate: tripDetails.dieselRate,
                totalDieselAmount: tripDetails.totalDieselAmount,
                totalAdvanceAmount: tripDetails.totalAdvanceAmount || 0
            } : null
        })
    } catch (error) {
        console.error('GET advances error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Failed to fetch advances'
            },
            { status: 500 }
        )
    }
}
/* ================= CREATE ADVANCE ================= */
export async function POST(req) {
    try {
        const {
            tripId,
            vehicleNo,
            advanceType,
            amount,
            remark,
            paymentMode = 'cash',
            date,
            status = 'paid',
            createdBy = 'system'
        } = await req.json()
        // Validate required fields
        if (!tripId || !vehicleNo || !advanceType || !amount) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Trip ID, Vehicle No, Advance Type and Amount are required'
                },
                { status: 400 }
            )
        }
        if (!ObjectId.isValid(tripId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid Trip ID' },
                { status: 400 }
            )
        }
        if (isNaN(amount) || parseFloat(amount) <= 0) {
            return NextResponse.json(
                { success: false, error: 'Valid amount is required' },
                { status: 400 }
            )
        }
        const db = await getDB()
        // Check if trip exists
        const trip = await db.collection(TRIPS_COLLECTION).findOne({
            _id: new ObjectId(tripId),
            isDeleted: { $ne: true }
        })
        if (!trip) {
            return NextResponse.json(
                { success: false, error: 'Trip not found' },
                { status: 404 }
            )
        }
        // Check if vehicle number matches
        if (trip.vehicleNo !== vehicleNo) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Vehicle number does not match trip record'
                },
                { status: 400 }
            )
        }
        // Generate advance ID (optional, can use _id instead)
        const advanceCount = await db.collection(ADVANCES_COLLECTION).countDocuments({
            tripId: new ObjectId(tripId)
        })
        const advanceId = `ADV${(advanceCount + 1).toString().padStart(3, '0')}`
        // Create advance document
        const advanceData = {
            advanceId: advanceId,
            tripId: new ObjectId(tripId),
            vehicleNo: vehicleNo.trim(),
            advanceType: advanceType.trim(),
            amount: parseFloat(amount),
            remark: remark?.trim() || '',
            paymentMode: paymentMode,
            date: date || new Date().toISOString().split('T')[0],
            status: status,
            createdBy: createdBy,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        // Insert into advances collection
        const result = await db.collection(ADVANCES_COLLECTION).insertOne(advanceData)
        // Calculate total advance for this trip
        const tripAdvances = await db.collection(ADVANCES_COLLECTION).find({
            tripId: new ObjectId(tripId),
            isDeleted: { $ne: true }
        }).toArray()
        const totalAdvancePaid = tripAdvances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
        // Update trip's totalAdvanceAmount
        await db.collection(TRIPS_COLLECTION).updateOne(
            { _id: new ObjectId(tripId) },
            {
                $set: {
                    totalAdvanceAmount: totalAdvancePaid,
                    updatedAt: new Date()
                }
            }
        )
        return NextResponse.json({
            success: true,
            message: 'Advance created successfully',
            data: {
                ...advanceData,
                _id: result.insertedId
            },
            totalAdvancePaid: totalAdvancePaid
        }, { status: 201 })
    } catch (error) {
        console.error('POST advance error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Failed to create advance'
            },
            { status: 500 }
        )
    }
}
/* ================= UPDATE ADVANCE ================= */
export async function PUT(req) {
    try {
        const {
            advanceId, // MongoDB _id of the advance
            advanceType,
            amount,
            remark,
            paymentMode,
            date,
            status
        } = await req.json()
        // Validate required fields
        if (!advanceId) {
            return NextResponse.json(
                { success: false, error: 'Advance ID is required' },
                { status: 400 }
            )
        }
        if (!ObjectId.isValid(advanceId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid Advance ID' },
                { status: 400 }
            )
        }
        const db = await getDB()
        // Check if advance exists
        const advance = await db.collection(ADVANCES_COLLECTION).findOne({
            _id: new ObjectId(advanceId),
            isDeleted: { $ne: true }
        })
        if (!advance) {
            return NextResponse.json(
                { success: false, error: 'Advance not found' },
                { status: 404 }
            )
        }
        // Prepare update fields
        const updateData = {
            updatedAt: new Date()
        }
        if (advanceType !== undefined) updateData.advanceType = advanceType.trim()
        if (amount !== undefined) updateData.amount = parseFloat(amount)
        if (remark !== undefined) updateData.remark = remark.trim()
        if (paymentMode !== undefined) updateData.paymentMode = paymentMode
        if (date !== undefined) updateData.date = date
        if (status !== undefined) updateData.status = status
        // Update advance
        const result = await db.collection(ADVANCES_COLLECTION).updateOne(
            { _id: new ObjectId(advanceId) },
            { $set: updateData }
        )
        if (result.modifiedCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Failed to update advance' },
                { status: 500 }
            )
        }
        // Recalculate total advance for the trip
        const tripAdvances = await db.collection(ADVANCES_COLLECTION).find({
            tripId: advance.tripId,
            isDeleted: { $ne: true }
        }).toArray()
        const totalAdvancePaid = tripAdvances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
        // Update trip's totalAdvanceAmount
        await db.collection(TRIPS_COLLECTION).updateOne(
            { _id: advance.tripId },
            {
                $set: {
                    totalAdvanceAmount: totalAdvancePaid,
                    updatedAt: new Date()
                }
            }
        )
        return NextResponse.json({
            success: true,
            message: 'Advance updated successfully',
            totalAdvancePaid: totalAdvancePaid
        })
    } catch (error) {
        console.error('PUT advance error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Failed to update advance'
            },
            { status: 500 }
        )
    }
}
/* ================= DELETE ADVANCE (SOFT DELETE) ================= */
export async function DELETE(req) {
    try {
        const { advanceId } = await req.json()
        if (!advanceId) {
            return NextResponse.json(
                { success: false, error: 'Advance ID is required' },
                { status: 400 }
            )
        }
        if (!ObjectId.isValid(advanceId)) {
            return NextResponse.json(
                { success: false, message: 'Invalid Advance ID' },
                { status: 400 }
            )
        }
        const db = await getDB()
        // Get advance details before deleting
        const advance = await db.collection(ADVANCES_COLLECTION).findOne({
            _id: new ObjectId(advanceId)
        })
        if (!advance) {
            return NextResponse.json(
                { success: false, error: 'Advance not found' },
                { status: 404 }
            )
        }
        // Soft delete
        const result = await db.collection(ADVANCES_COLLECTION).updateOne(
            { _id: new ObjectId(advanceId) },
            {
                $set: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    updatedAt: new Date()
                }
            }
        )
        if (result.modifiedCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Failed to delete advance' },
                { status: 500 }
            )
        }
        // Recalculate total advance for the trip
        const tripAdvances = await db.collection(ADVANCES_COLLECTION).find({
            tripId: advance.tripId,
            isDeleted: { $ne: true }
        }).toArray()
        const totalAdvancePaid = tripAdvances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
        // Update trip's totalAdvanceAmount
        await db.collection(TRIPS_COLLECTION).updateOne(
            { _id: advance.tripId },
            {
                $set: {
                    totalAdvanceAmount: totalAdvancePaid,
                    updatedAt: new Date()
                }
            }
        )
        return NextResponse.json({
            success: true,
            message: 'Advance deleted successfully',
            totalAdvancePaid: totalAdvancePaid
        })
    } catch (error) {
        console.error('DELETE advance error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Failed to delete advance'
            },
            { status: 500 }
        )
    }
}
