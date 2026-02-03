// app/api/apps/trips/route.js
import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
const TRIPS_COLLECTION = 'markettrips'
const client = new MongoClient(process.env.DATABASE_URL)
async function getDB() {
    await client.connect()
    return client.db()
}
/* ================= MAIN GET - Handles both ALL and SINGLE ================= */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        // If ID provided, return single trip
        if (id) {
            if (!ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: 'Invalid ID' },
                    { status: 400 }
                )
            }
            const db = await getDB()
            const trip = await db.collection(TRIPS_COLLECTION).findOne({
                _id: new ObjectId(id),
                isDeleted: { $ne: true }
            })
            if (!trip) {
                return NextResponse.json(
                    { success: false, message: 'Trip not found' },
                    { status: 404 }
                )
            }
            return NextResponse.json(
                { success: true, data: trip },
                { status: 200 }
            )
        }
        // Otherwise return all trips
        const db = await getDB()
        const trips = await db
            .collection(TRIPS_COLLECTION)
            .find({ isDeleted: { $ne: true } })
            .sort({ tripDate: -1 })
            .toArray()
        return NextResponse.json({
            success: true,
            data: trips,
            count: trips.length
        })
    } catch (error) {
        console.error('GET trips error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Failed to fetch trips'
            },
            { status: 500 }
        )
    }
}
/* ================= POST - CREATE TRIP ================= */
export async function POST(req) {
    try {
        const {
            vehicleNo,
            driverName,
            vehicleType,
            driverMobile,
            fromLocation,
            lhsNo,
            toLocation,
            tripType,
            dieselLtr,
            ifscCode,
            dieselRate,
            accountNo,
            totalDieselAmount,
            bankName,
            advanceAmount,
            accountHolderName,
            totalAdvanceAmount,
            tripStatus,
            tripDate
        } = await req.json()
        // Validate required fields
        if (!vehicleNo || !driverName || !fromLocation || !toLocation) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Vehicle No, Driver Name, From Location and To Location are required'
                },
                { status: 400 }
            )
        }
        const db = await getDB()
        // Calculate total diesel amount if not provided
        let calculatedDieselAmount = totalDieselAmount
        if (!calculatedDieselAmount && dieselLtr && dieselRate) {
            calculatedDieselAmount = (parseFloat(dieselLtr) * parseFloat(dieselRate)).toFixed(2)
        }
        const payload = {
            vehicleNo: vehicleNo.trim(),
            driverName: driverName.trim(),
            vehicleType: vehicleType || '',
            driverMobile: driverMobile || '',
            fromLocation: fromLocation.trim(),
            lhsNo: lhsNo || '',
            toLocation: toLocation.trim(),
            tripType: tripType || 'Regular',
            dieselLtr: Number(dieselLtr) || 0,
            ifscCode: ifscCode || '',
            dieselRate: Number(dieselRate) || 0,
            accountNo: accountNo || '',
            totalDieselAmount: Number(calculatedDieselAmount) || 0,
            bankName: bankName || '',
            advanceAmount: Number(advanceAmount) || 0,
            accountHolderName: accountHolderName || driverName.trim(),
            totalAdvanceAmount: Number(totalAdvanceAmount) || Number(advanceAmount) || 0,
            tripStatus: tripStatus || 'active',
            tripDate: tripDate || new Date().toISOString().split('T')[0],
            routeCode: '',
            distanceKm: 0,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        // Check if trip already exists for the same vehicle and date
        const existingTrip = await db.collection(TRIPS_COLLECTION).findOne({
            vehicleNo: vehicleNo.trim(),
            tripDate: payload.tripDate,
            isDeleted: { $ne: true }
        })
        if (existingTrip) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Trip already exists for this vehicle on the selected date',
                    field: 'vehicleNo'
                },
                { status: 409 }
            )
        }
        const result = await db.collection(TRIPS_COLLECTION).insertOne(payload)
        return NextResponse.json(
            {
                success: true,
                message: 'Trip created successfully',
                data: {
                    _id: result.insertedId,
                    ...payload
                }
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('POST trip error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Failed to create trip'
            },
            { status: 500 }
        )
    }
}
/* ================= PUT - UPDATE TRIP ================= */
export async function PUT(req) {
    try {
        const {
            id,
            vehicleNo,
            driverName,
            vehicleType,
            driverMobile,
            fromLocation,
            lhsNo,
            toLocation,
            tripType,
            dieselLtr,
            ifscCode,
            dieselRate,
            accountNo,
            totalDieselAmount,
            bankName,
            advanceAmount,
            accountHolderName,
            totalAdvanceAmount,
            tripStatus,
            tripDate
        } = await req.json()
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            )
        }
        const db = await getDB()
        // Check if trip exists
        const existingTrip = await db.collection(TRIPS_COLLECTION).findOne({
            _id: new ObjectId(id),
            isDeleted: { $ne: true }
        })
        if (!existingTrip) {
            return NextResponse.json(
                { success: false, error: 'Trip not found' },
                { status: 404 }
            )
        }
        // Calculate total diesel amount
        let calculatedDieselAmount = totalDieselAmount
        if (!calculatedDieselAmount) {
            const finalDieselLtr = dieselLtr !== undefined ? dieselLtr : existingTrip.dieselLtr
            const finalDieselRate = dieselRate !== undefined ? dieselRate : existingTrip.dieselRate
            if (finalDieselLtr && finalDieselRate) {
                calculatedDieselAmount = (parseFloat(finalDieselLtr) * parseFloat(finalDieselRate)).toFixed(2)
            }
        }
        // Prepare update data
        const updateData = {
            ...(vehicleNo !== undefined && { vehicleNo: vehicleNo.trim() }),
            ...(driverName !== undefined && { driverName: driverName.trim() }),
            ...(vehicleType !== undefined && { vehicleType: vehicleType.trim() }),
            ...(driverMobile !== undefined && { driverMobile: driverMobile.trim() }),
            ...(fromLocation !== undefined && { fromLocation: fromLocation.trim() }),
            ...(lhsNo !== undefined && { lhsNo: lhsNo.trim() }),
            ...(toLocation !== undefined && { toLocation: toLocation.trim() }),
            ...(tripType !== undefined && { tripType: tripType.trim() }),
            ...(dieselLtr !== undefined && { dieselLtr: Number(dieselLtr) }),
            ...(ifscCode !== undefined && { ifscCode: ifscCode.trim() }),
            ...(dieselRate !== undefined && { dieselRate: Number(dieselRate) }),
            ...(accountNo !== undefined && { accountNo: accountNo.trim() }),
            ...(totalDieselAmount !== undefined && { totalDieselAmount: Number(totalDieselAmount) }),
            ...(bankName !== undefined && { bankName: bankName.trim() }),
            ...(advanceAmount !== undefined && { advanceAmount: Number(advanceAmount) }),
            ...(accountHolderName !== undefined && { accountHolderName: accountHolderName.trim() }),
            ...(totalAdvanceAmount !== undefined && { totalAdvanceAmount: Number(totalAdvanceAmount) }),
            ...(tripStatus !== undefined && { tripStatus: tripStatus.trim() }),
            ...(tripDate !== undefined && { tripDate: tripDate }),
            ...(calculatedDieselAmount !== undefined && { totalDieselAmount: Number(calculatedDieselAmount) }),
            updatedAt: new Date()
        }
        // Check for duplicate trip (if vehicleNo or tripDate changed)
        if (vehicleNo || tripDate) {
            const checkVehicleNo = vehicleNo || existingTrip.vehicleNo
            const checkTripDate = tripDate || existingTrip.tripDate
            const duplicateTrip = await db.collection(TRIPS_COLLECTION).findOne({
                vehicleNo: checkVehicleNo,
                tripDate: checkTripDate,
                _id: { $ne: new ObjectId(id) },
                isDeleted: { $ne: true }
            })
            if (duplicateTrip) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Another trip already exists for this vehicle on the selected date',
                        field: 'vehicleNo'
                    },
                    { status: 409 }
                )
            }
        }
        const result = await db.collection(TRIPS_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        )
        if (result.matchedCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Trip not found' },
                { status: 404 }
            )
        }
        return NextResponse.json({
            success: true,
            message: 'Trip updated successfully',
            data: {
                _id: id,
                ...updateData
            }
        })
    } catch (error) {
        console.error('PUT trip error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Failed to update trip'
            },
            { status: 500 }
        )
    }
}
/* ================= DELETE TRIP (SOFT DELETE) ================= */
export async function DELETE(req) {
    try {
        const { id } = await req.json()
        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            )
        }
        const db = await getDB()
        // Check if trip exists
        const existingTrip = await db.collection(TRIPS_COLLECTION).findOne({
            _id: new ObjectId(id),
            isDeleted: { $ne: true }
        })
        if (!existingTrip) {
            return NextResponse.json(
                { success: false, error: 'Trip not found' },
                { status: 404 }
            )
        }
        // Soft delete
        const result = await db.collection(TRIPS_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    updatedAt: new Date()
                }
            }
        )
        if (result.matchedCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Trip not found' },
                { status: 404 }
            )
        }
        return NextResponse.json({
            success: true,
            message: 'Trip deleted successfully'
        })
    } catch (error) {
        console.error('DELETE trip error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Failed to delete trip'
            },
            { status: 500 }
        )
    }
}
