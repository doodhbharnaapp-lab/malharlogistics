// // app/api/apps/trips/route.js
// import { NextResponse } from 'next/server'
// import { MongoClient, ObjectId } from 'mongodb'
// const TRIPS_COLLECTION = 'trips'
// const TRIP_STATUS_HISTORY_COLLECTION = 'trip_status_history'
// const client = new MongoClient(process.env.DATABASE_URL)
// async function getDB() {
//     await client.connect()
//     return client.db()
// }
// /* ================= STATUS CHANGE HELPER ================= */
// async function recordStatusChange(db, tripId, oldStatus, newStatus, remarks, changedBy = 'system') {
//     if (!remarks || !remarks.trim()) {
//         return { success: false, error: 'Remarks are required for status change' }
//     }
//     const statusChangeRecord = {
//         tripId: new ObjectId(tripId),
//         oldStatus,
//         newStatus,
//         remarks: remarks.trim(),
//         changedBy,
//         changedAt: new Date(),
//         createdAt: new Date()
//     }
//     try {
//         await db.collection(TRIP_STATUS_HISTORY_COLLECTION).insertOne(statusChangeRecord)
//         return { success: true, data: statusChangeRecord }
//     } catch (error) {
//         console.error('Error recording status change:', error)
//         return { success: false, error: error.message }
//     }
// }
// /* ================= GET STATUS HISTORY ================= */
// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url)
//         const id = searchParams.get('id')
//         const getHistory = searchParams.get('history') === 'true'
//         // Get status history for a specific trip
//         if (getHistory && id) {
//             if (!ObjectId.isValid(id)) {
//                 return NextResponse.json(
//                     { success: false, message: 'Invalid ID' },
//                     { status: 400 }
//                 )
//             }
//             const db = await getDB()
//             const history = await db
//                 .collection(TRIP_STATUS_HISTORY_COLLECTION)
//                 .find({ tripId: new ObjectId(id) })
//                 .sort({ changedAt: -1 })
//                 .toArray()
//             return NextResponse.json({
//                 success: true,
//                 data: history,
//                 count: history.length
//             })
//         }
//         // If ID provided, return single trip with status history
//         if (id) {
//             if (!ObjectId.isValid(id)) {
//                 return NextResponse.json(
//                     { success: false, message: 'Invalid ID' },
//                     { status: 400 }
//                 )
//             }
//             const db = await getDB()
//             const trip = await db.collection(TRIPS_COLLECTION).findOne({
//                 _id: new ObjectId(id),
//                 isDeleted: { $ne: true }
//             })
//             if (!trip) {
//                 return NextResponse.json(
//                     { success: false, message: 'Trip not found' },
//                     { status: 404 }
//                 )
//             }
//             // Get status history if requested
//             if (searchParams.get('withHistory') === 'true') {
//                 const history = await db
//                     .collection(TRIP_STATUS_HISTORY_COLLECTION)
//                     .find({ tripId: new ObjectId(id) })
//                     .sort({ changedAt: -1 })
//                     .toArray()
//                 return NextResponse.json(
//                     {
//                         success: true,
//                         data: {
//                             ...trip,
//                             statusHistory: history
//                         }
//                     },
//                     { status: 200 }
//                 )
//             }
//             return NextResponse.json(
//                 { success: true, data: trip },
//                 { status: 200 }
//             )
//         }
//         // Otherwise return all trips
//         const db = await getDB()
//         const trips = await db
//             .collection(TRIPS_COLLECTION)
//             .find({ isDeleted: { $ne: true } })
//             .sort({ tripDate: -1, createdAt: -1 })
//             .toArray()
//         return NextResponse.json({
//             success: true,
//             data: trips,
//             count: trips.length
//         })
//     } catch (error) {
//         console.error('GET trips error:', error)
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: error.message,
//                 message: 'Failed to fetch trips'
//             },
//             { status: 500 }
//         )
//     }
// }
// /* ================= POST - CREATE TRIP ================= */
// export async function POST(req) {
//     try {
//         const {
//             vehicleNo,
//             driverName,
//             vehicleType,
//             driverMobile,
//             fromLocation,
//             lhsNo,
//             toLocation,
//             tripType,
//             dieselLtr,
//             ifscCode,
//             dieselRate,
//             accountNo,
//             totalDieselAmount,
//             bankName,
//             advanceAmount,
//             accountHolderName,
//             totalAdvanceAmount,
//             tripStatus,
//             tripDate,
//             initialRemarks,
//             routeCode,
//             distanceKm,
//             selectedRoute
//         } = await req.json()
//         // Validate required fields
//         if (!vehicleNo || !driverName || !fromLocation || !toLocation) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: 'Vehicle No, Driver Name, From Location and To Location are required'
//                 },
//                 { status: 400 }
//             )
//         }
//         const db = await getDB()
//         // Calculate total diesel amount if not provided
//         let calculatedDieselAmount = totalDieselAmount
//         if (!calculatedDieselAmount && dieselLtr && dieselRate) {
//             calculatedDieselAmount = (parseFloat(dieselLtr) * parseFloat(dieselRate)).toFixed(2)
//         }
//         // Get routeCode from either direct field or selectedRoute object
//         const finalRouteCode = routeCode || (selectedRoute?.routeCode) || '';
//         const finalDistanceKm = distanceKm || (selectedRoute?.distanceKm) || 0;
//         // Check 1: Check if trip already exists for the same vehicle and date (active or not)
//         const existingTripOnDate = await db.collection(TRIPS_COLLECTION).findOne({
//             vehicleNo: vehicleNo.trim(),
//             tripDate: tripDate || new Date().toISOString().split('T')[0],
//             isDeleted: { $ne: true }
//         })
//         if (existingTripOnDate) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: 'Trip already exists for this vehicle on the selected date',
//                     field: 'vehicleNo'
//                 },
//                 { status: 409 }
//             )
//         }
//         // Check 2: Count ONLY ACTIVE trips for this vehicle (not closed/cancelled)
//         const activeTripsForVehicle = await db.collection(TRIPS_COLLECTION).countDocuments({
//             vehicleNo: vehicleNo.trim(),
//             tripStatus: 'active',  // Only count active trips
//             isDeleted: { $ne: true }
//         })
//         if (activeTripsForVehicle >= 2) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: `Vehicle ${vehicleNo} already has ${activeTripsForVehicle} active trips. Maximum 2 active trips allowed.`,
//                     field: 'vehicleNo'
//                 },
//                 { status: 409 }
//             )
//         }
//         const payload = {
//             vehicleNo: vehicleNo.trim(),
//             driverName: driverName.trim(),
//             vehicleType: vehicleType || '',
//             driverMobile: driverMobile || '',
//             fromLocation: fromLocation.trim(),
//             lhsNo: lhsNo || '',
//             toLocation: toLocation.trim(),
//             tripType: tripType || 'Regular',
//             dieselLtr: Number(dieselLtr) || 0,
//             ifscCode: ifscCode || '',
//             dieselRate: Number(dieselRate) || 0,
//             accountNo: accountNo || '',
//             totalDieselAmount: Number(calculatedDieselAmount) || 0,
//             bankName: bankName || '',
//             advanceAmount: Number(advanceAmount) || 0,
//             accountHolderName: accountHolderName || driverName.trim(),
//             totalAdvanceAmount: (Number(advanceAmount) || 0) + (Number(calculatedDieselAmount) || 0),
//             tripStatus: tripStatus || 'active',
//             tripDate: tripDate || new Date().toISOString().split('T')[0],
//             statusRemarks: initialRemarks || '',
//             routeCode: finalRouteCode,
//             distanceKm: finalDistanceKm,
//             isDeleted: false,
//             createdAt: new Date(),
//             updatedAt: new Date()
//         }
//         const result = await db.collection(TRIPS_COLLECTION).insertOne(payload)
//         // Record initial status change if remarks provided
//         if (initialRemarks && initialRemarks.trim()) {
//             await recordStatusChange(
//                 db,
//                 result.insertedId,
//                 '',
//                 payload.tripStatus,
//                 initialRemarks.trim(),
//                 'system'
//             )
//         }
//         return NextResponse.json(
//             {
//                 success: true,
//                 message: 'Trip created successfully',
//                 data: {
//                     _id: result.insertedId,
//                     ...payload
//                 }
//             },
//             { status: 201 }
//         )
//     } catch (error) {
//         console.error('POST trip error:', error)
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: error.message,
//                 message: 'Failed to create trip'
//             },
//             { status: 500 }
//         )
//     }
// }
// /* ================= PUT - UPDATE TRIP ================= */
// export async function PUT(req) {
//     try {
//         const {
//             id,
//             vehicleNo,
//             driverName,
//             vehicleType,
//             driverMobile,
//             fromLocation,
//             lhsNo,
//             toLocation,
//             tripType,
//             dieselLtr,
//             ifscCode,
//             dieselRate,
//             accountNo,
//             totalDieselAmount,
//             bankName,
//             advanceAmount,
//             accountHolderName,
//             totalAdvanceAmount,
//             tripStatus,
//             tripDate,
//             statusRemarks,
//             statusChangedAt,
//             routeCode,
//             distanceKm,
//             selectedRoute
//         } = await req.json()
//         if (!id) {
//             return NextResponse.json(
//                 { success: false, error: 'ID is required' },
//                 { status: 400 }
//             )
//         }
//         const db = await getDB()
//         // Check if trip exists
//         const existingTrip = await db.collection(TRIPS_COLLECTION).findOne({
//             _id: new ObjectId(id),
//             isDeleted: { $ne: true }
//         })
//         if (!existingTrip) {
//             return NextResponse.json(
//                 { success: false, error: 'Trip not found' },
//                 { status: 404 }
//             )
//         }
//         // Calculate total diesel amount
//         let calculatedDieselAmount = totalDieselAmount
//         if (!calculatedDieselAmount) {
//             const finalDieselLtr = dieselLtr !== undefined ? dieselLtr : existingTrip.dieselLtr
//             const finalDieselRate = dieselRate !== undefined ? dieselRate : existingTrip.dieselRate
//             if (finalDieselLtr && finalDieselRate) {
//                 calculatedDieselAmount = (parseFloat(finalDieselLtr) * parseFloat(finalDieselRate)).toFixed(2)
//             }
//         }
//         // Determine if status is changing
//         const isStatusChanging = tripStatus !== undefined && tripStatus !== existingTrip.tripStatus
//         // Validate remarks if status is changing
//         if (isStatusChanging) {
//             if (!statusRemarks || !statusRemarks.trim()) {
//                 return NextResponse.json(
//                     {
//                         success: false,
//                         error: 'Remarks are required when changing trip status',
//                         field: 'statusRemarks'
//                     },
//                     { status: 400 }
//                 )
//             }
//         }
//         // Get final routeCode from either direct field or selectedRoute object
//         let finalRouteCode = existingTrip.routeCode;
//         let finalDistanceKm = existingTrip.distanceKm;
//         if (routeCode !== undefined) {
//             finalRouteCode = routeCode;
//         } else if (selectedRoute?.routeCode) {
//             finalRouteCode = selectedRoute.routeCode;
//         }
//         if (distanceKm !== undefined) {
//             finalDistanceKm = distanceKm;
//         } else if (selectedRoute?.distanceKm) {
//             finalDistanceKm = selectedRoute.distanceKm;
//         }
//         // Prepare update data
//         const updateData = {
//             ...(vehicleNo !== undefined && { vehicleNo: vehicleNo.trim() }),
//             ...(driverName !== undefined && { driverName: driverName.trim() }),
//             ...(vehicleType !== undefined && { vehicleType: vehicleType.trim() }),
//             ...(driverMobile !== undefined && { driverMobile: driverMobile.trim() }),
//             ...(fromLocation !== undefined && { fromLocation: fromLocation.trim() }),
//             ...(lhsNo !== undefined && { lhsNo: lhsNo.trim() }),
//             ...(toLocation !== undefined && { toLocation: toLocation.trim() }),
//             ...(tripType !== undefined && { tripType: tripType.trim() }),
//             ...(dieselLtr !== undefined && { dieselLtr: Number(dieselLtr) }),
//             ...(ifscCode !== undefined && { ifscCode: ifscCode.trim() }),
//             ...(dieselRate !== undefined && { dieselRate: Number(dieselRate) }),
//             ...(accountNo !== undefined && { accountNo: accountNo.trim() }),
//             ...(totalDieselAmount !== undefined && { totalDieselAmount: Number(totalDieselAmount) }),
//             ...(bankName !== undefined && { bankName: bankName.trim() }),
//             ...(advanceAmount !== undefined && { advanceAmount: Number(advanceAmount) }),
//             ...(accountHolderName !== undefined && { accountHolderName: accountHolderName.trim() }),
//             ...(totalAdvanceAmount !== undefined && { totalAdvanceAmount: Number(totalAdvanceAmount) }),
//             ...(tripStatus !== undefined && { tripStatus: tripStatus.trim() }),
//             ...(tripDate !== undefined && { tripDate: tripDate }),
//             ...(statusRemarks !== undefined && { statusRemarks: statusRemarks.trim() }),
//             ...(calculatedDieselAmount !== undefined && { totalDieselAmount: Number(calculatedDieselAmount) }),
//             ...(routeCode !== undefined && { routeCode: finalRouteCode }),
//             ...(distanceKm !== undefined && { distanceKm: Number(finalDistanceKm) }),
//             updatedAt: new Date()
//         }
//         // Check for duplicate trip (if vehicleNo or tripDate changed)
//         if (vehicleNo || tripDate) {
//             const checkVehicleNo = vehicleNo || existingTrip.vehicleNo
//             const checkTripDate = tripDate || existingTrip.tripDate
//             // Check 1: No duplicate on same date
//             const duplicateTrip = await db.collection(TRIPS_COLLECTION).findOne({
//                 vehicleNo: checkVehicleNo,
//                 tripDate: checkTripDate,
//                 _id: { $ne: new ObjectId(id) },
//                 isDeleted: { $ne: true }
//             })
//             if (duplicateTrip) {
//                 return NextResponse.json(
//                     {
//                         success: false,
//                         error: 'Another trip already exists for this vehicle on the selected date',
//                         field: 'vehicleNo'
//                     },
//                     { status: 409 }
//                 )
//             }
//             // Check 2: If vehicle is being changed, ensure it doesn't exceed 2 trips
//             if (vehicleNo && vehicleNo !== existingTrip.vehicleNo) {
//                 const totalTripsForNewVehicle = await db.collection(TRIPS_COLLECTION).countDocuments({
//                     vehicleNo: vehicleNo.trim(),
//                     _id: { $ne: new ObjectId(id) },
//                     isDeleted: { $ne: true }
//                 })
//                 if (totalTripsForNewVehicle >= 2) {
//                     return NextResponse.json(
//                         {
//                             success: false,
//                             error: `Vehicle ${vehicleNo} already has ${totalTripsForNewVehicle} trips. Maximum 2 trips allowed.`,
//                             field: 'vehicleNo'
//                         },
//                         { status: 409 }
//                     )
//                 }
//             }
//         }
//         // Record status change if status is being updated
//         if (isStatusChanging) {
//             const statusChangeResult = await recordStatusChange(
//                 db,
//                 id,
//                 existingTrip.tripStatus,
//                 tripStatus,
//                 statusRemarks.trim(),
//                 'user'
//             )
//             if (!statusChangeResult.success) {
//                 return NextResponse.json(
//                     {
//                         success: false,
//                         error: statusChangeResult.error || 'Failed to record status change'
//                     },
//                     { status: 500 }
//                 )
//             }
//             // Also update statusChangedAt if provided
//             if (statusChangedAt) {
//                 updateData.statusChangedAt = new Date(statusChangedAt)
//             } else {
//                 updateData.statusChangedAt = new Date()
//             }
//         }
//         const result = await db.collection(TRIPS_COLLECTION).updateOne(
//             { _id: new ObjectId(id) },
//             { $set: updateData }
//         )
//         if (result.matchedCount === 0) {
//             return NextResponse.json(
//                 { success: false, error: 'Trip not found' },
//                 { status: 404 }
//             )
//         }
//         return NextResponse.json({
//             success: true,
//             message: 'Trip updated successfully',
//             data: {
//                 _id: id,
//                 ...updateData
//             }
//         })
//     } catch (error) {
//         console.error('PUT trip error:', error)
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: error.message,
//                 message: 'Failed to update trip'
//             },
//             { status: 500 }
//         )
//     }
// }
// /* ================= PATCH - UPDATE TRIP STATUS ONLY (with remarks) ================= */
// export async function PATCH(req) {
//     try {
//         const {
//             id,
//             tripStatus,
//             statusRemarks,
//             statusChangedAt,
//             changedBy
//         } = await req.json()
//         if (!id) {
//             return NextResponse.json(
//                 { success: false, error: 'ID is required' },
//                 { status: 400 }
//             )
//         }
//         if (!tripStatus) {
//             return NextResponse.json(
//                 { success: false, error: 'Trip status is required' },
//                 { status: 400 }
//             )
//         }
//         if (!statusRemarks || !statusRemarks.trim()) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: 'Remarks are required for status change',
//                     field: 'statusRemarks'
//                 },
//                 { status: 400 }
//             )
//         }
//         const db = await getDB()
//         // Check if trip exists
//         const existingTrip = await db.collection(TRIPS_COLLECTION).findOne({
//             _id: new ObjectId(id),
//             isDeleted: { $ne: true }
//         })
//         if (!existingTrip) {
//             return NextResponse.json(
//                 { success: false, error: 'Trip not found' },
//                 { status: 404 }
//             )
//         }
//         // Record status change
//         const statusChangeResult = await recordStatusChange(
//             db,
//             id,
//             existingTrip.tripStatus,
//             tripStatus,
//             statusRemarks.trim(),
//             changedBy || 'user'
//         )
//         if (!statusChangeResult.success) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: statusChangeResult.error || 'Failed to record status change'
//                 },
//                 { status: 500 }
//             )
//         }
//         // Update trip status
//         const updateData = {
//             tripStatus: tripStatus.trim(),
//             statusRemarks: statusRemarks.trim(),
//             statusChangedAt: statusChangedAt ? new Date(statusChangedAt) : new Date(),
//             updatedAt: new Date()
//         }
//         const result = await db.collection(TRIPS_COLLECTION).updateOne(
//             { _id: new ObjectId(id) },
//             { $set: updateData }
//         )
//         if (result.matchedCount === 0) {
//             return NextResponse.json(
//                 { success: false, error: 'Trip not found' },
//                 { status: 404 }
//             )
//         }
//         // Get updated trip
//         const updatedTrip = await db.collection(TRIPS_COLLECTION).findOne({
//             _id: new ObjectId(id)
//         })
//         return NextResponse.json({
//             success: true,
//             message: 'Trip status updated successfully',
//             data: updatedTrip,
//             statusChange: statusChangeResult.data
//         })
//     } catch (error) {
//         console.error('PATCH trip error:', error)
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: error.message,
//                 message: 'Failed to update trip status'
//             },
//             { status: 500 }
//         )
//     }
// }
// /* ================= DELETE TRIP (SOFT DELETE) ================= */
// export async function DELETE(req) {
//     try {
//         const { id } = await req.json()
//         if (!id) {
//             return NextResponse.json(
//                 { success: false, error: 'ID is required' },
//                 { status: 400 }
//             )
//         }
//         // Optional: Validate delete remarks
//         const db = await getDB()
//         // Check if trip exists
//         const existingTrip = await db.collection(TRIPS_COLLECTION).findOne({
//             _id: new ObjectId(id),
//             isDeleted: { $ne: true }
//         })
//         if (!existingTrip) {
//             return NextResponse.json(
//                 { success: false, error: 'Trip not found' },
//                 { status: 404 }
//             )
//         }
//         // Record delete action in status history
//         await recordStatusChange(
//             db,
//             id,
//             existingTrip.tripStatus,
//             'deleted',
//             'system'
//         )
//         // Soft delete
//         const result = await db.collection(TRIPS_COLLECTION).updateOne(
//             { _id: new ObjectId(id) },
//             {
//                 $set: {
//                     isDeleted: true,
//                     deletedAt: new Date(),
//                     updatedAt: new Date()
//                 }
//             }
//         )
//         if (result.matchedCount === 0) {
//             return NextResponse.json(
//                 { success: false, error: 'Trip not found' },
//                 { status: 404 }
//             )
//         }
//         return NextResponse.json({
//             success: true,
//             message: 'Trip deleted successfully'
//         })
//     } catch (error) {
//         console.error('DELETE trip error:', error)
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: error.message,
//                 message: 'Failed to delete trip'
//             },
//             { status: 500 }
//         )
//     }
// }

// app/api/apps/trips/route.js
import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import { PERMISSIONS } from '@/libs/permissions'
import { checkPermission, checkAnyPermission } from '@/utils/checkPermission'

const TRIPS_COLLECTION = 'trips'
const TRIP_STATUS_HISTORY_COLLECTION = 'trip_status_history'

const client = new MongoClient(process.env.DATABASE_URL)
async function getDB() {
    await client.connect()
    return client.db()
}

/* ================= STATUS CHANGE HELPER ================= */
async function recordStatusChange(db, tripId, oldStatus, newStatus, remarks, changedBy = 'system') {
    if (!remarks || !remarks.trim()) {
        return { success: false, error: 'Remarks are required for status change' }
    }
    const statusChangeRecord = {
        tripId: new ObjectId(tripId),
        oldStatus,
        newStatus,
        remarks: remarks.trim(),
        changedBy,
        changedAt: new Date(),
        createdAt: new Date()
    }
    try {
        await db.collection(TRIP_STATUS_HISTORY_COLLECTION).insertOne(statusChangeRecord)
        return { success: true, data: statusChangeRecord }
    } catch (error) {
        console.error('Error recording status change:', error)
        return { success: false, error: error.message }
    }
}

/* ================= GET STATUS HISTORY ================= */
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // ✅ CHECK PERMISSION - trips:read
        const hasPermission = await checkAnyPermission([
            PERMISSIONS.trips.READ,
            PERMISSIONS.trips.CREATE,
            PERMISSIONS.trips.WRITE
        ])(async () => true)(request)

        if (!hasPermission && session.user.role !== 'admin') {
            return NextResponse.json({
                error: 'Forbidden',
                message: 'You need trips:read permission'
            }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const getHistory = searchParams.get('history') === 'true'

        // Get status history for a specific trip
        if (getHistory && id) {
            if (!ObjectId.isValid(id)) {
                return NextResponse.json(
                    { success: false, message: 'Invalid ID' },
                    { status: 400 }
                )
            }
            const db = await getDB()
            const history = await db
                .collection(TRIP_STATUS_HISTORY_COLLECTION)
                .find({ tripId: new ObjectId(id) })
                .sort({ changedAt: -1 })
                .toArray()

            return NextResponse.json({
                success: true,
                data: history,
                count: history.length
            })
        }

        // If ID provided, return single trip with status history
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

            // Get status history if requested
            if (searchParams.get('withHistory') === 'true') {
                const history = await db
                    .collection(TRIP_STATUS_HISTORY_COLLECTION)
                    .find({ tripId: new ObjectId(id) })
                    .sort({ changedAt: -1 })
                    .toArray()

                return NextResponse.json(
                    {
                        success: true,
                        data: {
                            ...trip,
                            statusHistory: history
                        }
                    },
                    { status: 200 }
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
            .sort({ tripDate: -1, createdAt: -1 })
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
export const POST = checkPermission(PERMISSIONS.trips.CREATE)(
    async function POST(req) {
        try {
            const session = await getServerSession(authOptions)
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
                tripDate,
                initialRemarks,
                routeCode,
                distanceKm,
                selectedRoute
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

            // Get routeCode from either direct field or selectedRoute object
            const finalRouteCode = routeCode || (selectedRoute?.routeCode) || '';
            const finalDistanceKm = distanceKm || (selectedRoute?.distanceKm) || 0;

            // Check 1: Check if trip already exists for the same vehicle and date (active or not)
            const existingTripOnDate = await db.collection(TRIPS_COLLECTION).findOne({
                vehicleNo: vehicleNo.trim(),
                tripDate: tripDate || new Date().toISOString().split('T')[0],
                isDeleted: { $ne: true }
            })

            if (existingTripOnDate) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Trip already exists for this vehicle on the selected date',
                        field: 'vehicleNo'
                    },
                    { status: 409 }
                )
            }

            // Check 2: Count ONLY ACTIVE trips for this vehicle (not closed/cancelled)
            const activeTripsForVehicle = await db.collection(TRIPS_COLLECTION).countDocuments({
                vehicleNo: vehicleNo.trim(),
                tripStatus: 'active',  // Only count active trips
                isDeleted: { $ne: true }
            })

            if (activeTripsForVehicle >= 2) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Vehicle ${vehicleNo} already has ${activeTripsForVehicle} active trips. Maximum 2 active trips allowed.`,
                        field: 'vehicleNo'
                    },
                    { status: 409 }
                )
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
                totalAdvanceAmount: (Number(advanceAmount) || 0) + (Number(calculatedDieselAmount) || 0),
                tripStatus: tripStatus || 'active',
                tripDate: tripDate || new Date().toISOString().split('T')[0],
                statusRemarks: initialRemarks || '',
                routeCode: finalRouteCode,
                distanceKm: finalDistanceKm,
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: session.user.id
            }

            const result = await db.collection(TRIPS_COLLECTION).insertOne(payload)

            // Record initial status change if remarks provided
            if (initialRemarks && initialRemarks.trim()) {
                await recordStatusChange(
                    db,
                    result.insertedId,
                    '',
                    payload.tripStatus,
                    initialRemarks.trim(),
                    'system'
                )
            }

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
)

/* ================= PUT - UPDATE TRIP ================= */
export const PUT = checkPermission(PERMISSIONS.trips.WRITE)(
    async function PUT(req) {
        try {
            const session = await getServerSession(authOptions)
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
                tripDate,
                statusRemarks,
                statusChangedAt,
                routeCode,
                distanceKm,
                selectedRoute,
                ids,
                updateData
            } = await req.json()

            const db = await getDB()

            // ✅ CHECK FOR BULK OPERATION
            if (ids && Array.isArray(ids) && ids.length > 0) {
                // Check bulk permission
                if (session.user.role !== 'admin') {
                    const hasBulkPermission = await checkAnyPermission([
                        PERMISSIONS.trips.BULK_UPDATE
                    ])(async () => true)(req)

                    if (!hasBulkPermission) {
                        return NextResponse.json({
                            error: 'Forbidden',
                            message: 'You need trips:bulk-update permission for bulk operations'
                        }, { status: 403 })
                    }
                }

                const objectIds = ids.map(id => new ObjectId(id))
                const result = await db.collection(TRIPS_COLLECTION).updateMany(
                    { _id: { $in: objectIds } },
                    {
                        $set: {
                            ...updateData,
                            updatedAt: new Date(),
                            updatedBy: session.user.id
                        }
                    }
                )

                return NextResponse.json({
                    success: true,
                    message: `${result.modifiedCount} trips updated successfully`
                })
            }

            // SINGLE TRIP UPDATE
            if (!id) {
                return NextResponse.json(
                    { success: false, error: 'ID is required' },
                    { status: 400 }
                )
            }

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

            // Determine if status is changing
            const isStatusChanging = tripStatus !== undefined && tripStatus !== existingTrip.tripStatus

            // Validate remarks if status is changing
            if (isStatusChanging) {
                if (!statusRemarks || !statusRemarks.trim()) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: 'Remarks are required when changing trip status',
                            field: 'statusRemarks'
                        },
                        { status: 400 }
                    )
                }
            }

            // Get final routeCode from either direct field or selectedRoute object
            let finalRouteCode = existingTrip.routeCode;
            let finalDistanceKm = existingTrip.distanceKm;
            if (routeCode !== undefined) {
                finalRouteCode = routeCode;
            } else if (selectedRoute?.routeCode) {
                finalRouteCode = selectedRoute.routeCode;
            }
            if (distanceKm !== undefined) {
                finalDistanceKm = distanceKm;
            } else if (selectedRoute?.distanceKm) {
                finalDistanceKm = selectedRoute.distanceKm;
            }

            // Prepare update data
            const updateFields = {
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
                ...(statusRemarks !== undefined && { statusRemarks: statusRemarks.trim() }),
                ...(calculatedDieselAmount !== undefined && { totalDieselAmount: Number(calculatedDieselAmount) }),
                ...(routeCode !== undefined && { routeCode: finalRouteCode }),
                ...(distanceKm !== undefined && { distanceKm: Number(finalDistanceKm) }),
                updatedAt: new Date(),
                updatedBy: session.user.id
            }

            // Check for duplicate trip (if vehicleNo or tripDate changed)
            if (vehicleNo || tripDate) {
                const checkVehicleNo = vehicleNo || existingTrip.vehicleNo
                const checkTripDate = tripDate || existingTrip.tripDate

                // Check 1: No duplicate on same date
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

                // Check 2: If vehicle is being changed, ensure it doesn't exceed 2 trips
                if (vehicleNo && vehicleNo !== existingTrip.vehicleNo) {
                    const totalTripsForNewVehicle = await db.collection(TRIPS_COLLECTION).countDocuments({
                        vehicleNo: vehicleNo.trim(),
                        _id: { $ne: new ObjectId(id) },
                        isDeleted: { $ne: true }
                    })

                    if (totalTripsForNewVehicle >= 2) {
                        return NextResponse.json(
                            {
                                success: false,
                                error: `Vehicle ${vehicleNo} already has ${totalTripsForNewVehicle} trips. Maximum 2 trips allowed.`,
                                field: 'vehicleNo'
                            },
                            { status: 409 }
                        )
                    }
                }
            }

            // Record status change if status is being updated
            if (isStatusChanging) {
                const statusChangeResult = await recordStatusChange(
                    db,
                    id,
                    existingTrip.tripStatus,
                    tripStatus,
                    statusRemarks.trim(),
                    'user'
                )

                if (!statusChangeResult.success) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: statusChangeResult.error || 'Failed to record status change'
                        },
                        { status: 500 }
                    )
                }

                // Also update statusChangedAt if provided
                if (statusChangedAt) {
                    updateFields.statusChangedAt = new Date(statusChangedAt)
                } else {
                    updateFields.statusChangedAt = new Date()
                }
            }

            const result = await db.collection(TRIPS_COLLECTION).updateOne(
                { _id: new ObjectId(id) },
                { $set: updateFields }
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
                    ...updateFields
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
)

/* ================= PATCH - UPDATE TRIP STATUS ONLY (with remarks) ================= */
export const PATCH = checkPermission(PERMISSIONS.trips.WRITE)(
    async function PATCH(req) {
        try {
            const session = await getServerSession(authOptions)
            const {
                id,
                tripStatus,
                statusRemarks,
                statusChangedAt,
                changedBy
            } = await req.json()

            if (!id) {
                return NextResponse.json(
                    { success: false, error: 'ID is required' },
                    { status: 400 }
                )
            }

            if (!tripStatus) {
                return NextResponse.json(
                    { success: false, error: 'Trip status is required' },
                    { status: 400 }
                )
            }

            if (!statusRemarks || !statusRemarks.trim()) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Remarks are required for status change',
                        field: 'statusRemarks'
                    },
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

            // Record status change
            const statusChangeResult = await recordStatusChange(
                db,
                id,
                existingTrip.tripStatus,
                tripStatus,
                statusRemarks.trim(),
                changedBy || session.user.id
            )

            if (!statusChangeResult.success) {
                return NextResponse.json(
                    {
                        success: false,
                        error: statusChangeResult.error || 'Failed to record status change'
                    },
                    { status: 500 }
                )
            }

            // Update trip status
            const updateData = {
                tripStatus: tripStatus.trim(),
                statusRemarks: statusRemarks.trim(),
                statusChangedAt: statusChangedAt ? new Date(statusChangedAt) : new Date(),
                updatedAt: new Date(),
                updatedBy: session.user.id
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

            // Get updated trip
            const updatedTrip = await db.collection(TRIPS_COLLECTION).findOne({
                _id: new ObjectId(id)
            })

            return NextResponse.json({
                success: true,
                message: 'Trip status updated successfully',
                data: updatedTrip,
                statusChange: statusChangeResult.data
            })
        } catch (error) {
            console.error('PATCH trip error:', error)
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                    message: 'Failed to update trip status'
                },
                { status: 500 }
            )
        }
    }
)

/* ================= DELETE TRIP (SOFT DELETE) ================= */
export const DELETE = checkPermission(PERMISSIONS.trips.DELETE)(
    async function DELETE(req) {
        try {
            const session = await getServerSession(authOptions)
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

            // Record delete action in status history
            await recordStatusChange(
                db,
                id,
                existingTrip.tripStatus,
                'deleted',
                'Trip deleted by user',
                session.user.id
            )

            // Soft delete
            const result = await db.collection(TRIPS_COLLECTION).updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        isDeleted: true,
                        deletedAt: new Date(),
                        updatedAt: new Date(),
                        deletedBy: session.user.id
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
)

/* ================= BULK DELETE TRIPS ================= */
export const POST_BULK_DELETE = checkPermission(PERMISSIONS.trips.BULK_DELETE)(
    async function POST_BULK_DELETE(req) {
        try {
            const session = await getServerSession(authOptions)
            const { ids } = await req.json()

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return NextResponse.json(
                    { success: false, error: 'Trip IDs are required' },
                    { status: 400 }
                )
            }

            const db = await getDB()
            const objectIds = ids.map(id => new ObjectId(id))

            const result = await db.collection(TRIPS_COLLECTION).updateMany(
                { _id: { $in: objectIds } },
                {
                    $set: {
                        isDeleted: true,
                        deletedAt: new Date(),
                        updatedAt: new Date(),
                        deletedBy: session.user.id
                    }
                }
            )

            return NextResponse.json({
                success: true,
                message: `${result.modifiedCount} trips deleted successfully`
            })
        } catch (error) {
            console.error('Bulk delete error:', error)
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                    message: 'Failed to delete trips'
                },
                { status: 500 }
            )
        }
    }
)

/* ================= BULK STATUS UPDATE ================= */
export const POST_BULK_STATUS = checkPermission(PERMISSIONS.trips.BULK_STATUS)(
    async function POST_BULK_STATUS(req) {
        try {
            const session = await getServerSession(authOptions)
            const { ids, tripStatus, statusRemarks } = await req.json()

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return NextResponse.json(
                    { success: false, error: 'Trip IDs are required' },
                    { status: 400 }
                )
            }

            if (!tripStatus) {
                return NextResponse.json(
                    { success: false, error: 'Trip status is required' },
                    { status: 400 }
                )
            }

            if (!statusRemarks || !statusRemarks.trim()) {
                return NextResponse.json(
                    { success: false, error: 'Remarks are required for status change' },
                    { status: 400 }
                )
            }

            const db = await getDB()
            const objectIds = ids.map(id => new ObjectId(id))

            // Get all trips to record status changes
            const trips = await db.collection(TRIPS_COLLECTION)
                .find({ _id: { $in: objectIds } })
                .toArray()

            // Record status changes for each trip
            for (const trip of trips) {
                await recordStatusChange(
                    db,
                    trip._id,
                    trip.tripStatus,
                    tripStatus,
                    statusRemarks.trim(),
                    session.user.id
                )
            }

            // Update all trips
            const result = await db.collection(TRIPS_COLLECTION).updateMany(
                { _id: { $in: objectIds } },
                {
                    $set: {
                        tripStatus: tripStatus.trim(),
                        statusRemarks: statusRemarks.trim(),
                        statusChangedAt: new Date(),
                        updatedAt: new Date(),
                        updatedBy: session.user.id
                    }
                }
            )

            return NextResponse.json({
                success: true,
                message: `${result.modifiedCount} trips status updated successfully`
            })
        } catch (error) {
            console.error('Bulk status error:', error)
            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                    message: 'Failed to update trip status'
                },
                { status: 500 }
            )
        }
    }
)
