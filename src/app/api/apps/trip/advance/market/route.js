// import { NextResponse } from 'next/server'
// import { MongoClient, ObjectId } from 'mongodb'
// const TRIPS_COLLECTION = 'markettrips'
// const ADVANCES_COLLECTION = 'marketadvances'
// const client = new MongoClient(process.env.DATABASE_URL)
// async function getDB() {
//     await client.connect()
//     return client.db()
// }
// /* ================= GET ADVANCES ================= */
// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url)
//         const tripId = searchParams.get('tripId')
//         const vehicleNo = searchParams.get('vehicleNo')
//         const dateFrom = searchParams.get('dateFrom')
//         const dateTo = searchParams.get('dateTo')
//         const db = await getDB()
//         let query = { isDeleted: { $ne: true } }
//         // Filter by tripId
//         if (tripId && ObjectId.isValid(tripId)) {
//             query.tripId = new ObjectId(tripId)
//         }
//         // Filter by vehicleNo
//         if (vehicleNo) {
//             query.vehicleNo = vehicleNo.trim()
//         }
//         // Filter by date range
//         if (dateFrom || dateTo) {
//             query.date = {}
//             if (dateFrom) query.date.$gte = dateFrom
//             if (dateTo) query.date.$lte = dateTo
//         }
//         // Fetch advances
//         const advances = await db
//             .collection(ADVANCES_COLLECTION)
//             .find(query)
//             .sort({ date: -1, createdAt: -1 })
//             .toArray()
//         // If tripId provided, get trip details too
//         let tripDetails = null
//         if (tripId && ObjectId.isValid(tripId)) {
//             tripDetails = await db.collection(TRIPS_COLLECTION).findOne({
//                 _id: new ObjectId(tripId),
//                 isDeleted: { $ne: true }
//             })
//         }
//         // Calculate total amount
//         const totalAmount = advances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
//         return NextResponse.json({
//             success: true,
//             data: advances,
//             count: advances.length,
//             totalAmount: totalAmount,
//             tripDetails: tripDetails ? {
//                 vehicleNo: tripDetails.vehicleNo,
//                 driverName: tripDetails.driverName,
//                 fromLocation: tripDetails.fromLocation,
//                 toLocation: tripDetails.toLocation,
//                 dieselLtr: tripDetails.dieselLtr,
//                 dieselRate: tripDetails.dieselRate,
//                 totalDieselAmount: tripDetails.totalDieselAmount,
//                 totalAdvanceAmount: tripDetails.totalAdvanceAmount || 0
//             } : null
//         })
//     } catch (error) {
//         console.error('GET advances error:', error)
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: error.message,
//                 message: 'Failed to fetch advances'
//             },
//             { status: 500 }
//         )
//     }
// }
// /* ================= CREATE ADVANCE ================= */
// export async function POST(req) {
//     try {
//         const {
//             tripId,
//             vehicleNo,
//             advanceType,
//             amount,
//             remark,
//             paymentMode = 'cash',
//             date,
//             status = 'paid',
//             createdBy = 'system'
//         } = await req.json()
//         // Validate required fields
//         if (!tripId || !vehicleNo || !advanceType || !amount) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: 'Trip ID, Vehicle No, Advance Type and Amount are required'
//                 },
//                 { status: 400 }
//             )
//         }
//         if (!ObjectId.isValid(tripId)) {
//             return NextResponse.json(
//                 { success: false, message: 'Invalid Trip ID' },
//                 { status: 400 }
//             )
//         }
//         if (isNaN(amount) || parseFloat(amount) <= 0) {
//             return NextResponse.json(
//                 { success: false, error: 'Valid amount is required' },
//                 { status: 400 }
//             )
//         }
//         const db = await getDB()
//         // Check if trip exists
//         const trip = await db.collection(TRIPS_COLLECTION).findOne({
//             _id: new ObjectId(tripId),
//             isDeleted: { $ne: true }
//         })
//         if (!trip) {
//             return NextResponse.json(
//                 { success: false, error: 'Trip not found' },
//                 { status: 404 }
//             )
//         }
//         // Check if vehicle number matches
//         if (trip.vehicleNo !== vehicleNo) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     error: 'Vehicle number does not match trip record'
//                 },
//                 { status: 400 }
//             )
//         }
//         // Generate advance ID (optional, can use _id instead)
//         const advanceCount = await db.collection(ADVANCES_COLLECTION).countDocuments({
//             tripId: new ObjectId(tripId)
//         })
//         const advanceId = `ADV${(advanceCount + 1).toString().padStart(3, '0')}`
//         // Create advance document
//         const advanceData = {
//             advanceId: advanceId,
//             tripId: new ObjectId(tripId),
//             vehicleNo: vehicleNo.trim(),
//             advanceType: advanceType.trim(),
//             amount: parseFloat(amount),
//             remark: remark?.trim() || '',
//             paymentMode: paymentMode,
//             date: date || new Date().toISOString().split('T')[0],
//             status: status,
//             createdBy: createdBy,
//             isDeleted: false,
//             createdAt: new Date(),
//             updatedAt: new Date()
//         }
//         // Insert into advances collection
//         const result = await db.collection(ADVANCES_COLLECTION).insertOne(advanceData)
//         // Calculate total advance for this trip
//         const tripAdvances = await db.collection(ADVANCES_COLLECTION).find({
//             tripId: new ObjectId(tripId),
//             isDeleted: { $ne: true }
//         }).toArray()
//         const totalAdvancePaid = tripAdvances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
//         // Update trip's totalAdvanceAmount
//         await db.collection(TRIPS_COLLECTION).updateOne(
//             { _id: new ObjectId(tripId) },
//             {
//                 $set: {
//                     totalAdvanceAmount: totalAdvancePaid,
//                     updatedAt: new Date()
//                 }
//             }
//         )
//         return NextResponse.json({
//             success: true,
//             message: 'Advance created successfully',
//             data: {
//                 ...advanceData,
//                 _id: result.insertedId
//             },
//             totalAdvancePaid: totalAdvancePaid
//         }, { status: 201 })
//     } catch (error) {
//         console.error('POST advance error:', error)
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: error.message,
//                 message: 'Failed to create advance'
//             },
//             { status: 500 }
//         )
//     }
// }
// /* ================= UPDATE ADVANCE ================= */
// export async function PUT(req) {
//     try {
//         const {
//             advanceId, // MongoDB _id of the advance
//             advanceType,
//             amount,
//             remark,
//             paymentMode,
//             date,
//             status
//         } = await req.json()
//         // Validate required fields
//         if (!advanceId) {
//             return NextResponse.json(
//                 { success: false, error: 'Advance ID is required' },
//                 { status: 400 }
//             )
//         }
//         if (!ObjectId.isValid(advanceId)) {
//             return NextResponse.json(
//                 { success: false, message: 'Invalid Advance ID' },
//                 { status: 400 }
//             )
//         }
//         const db = await getDB()
//         // Check if advance exists
//         const advance = await db.collection(ADVANCES_COLLECTION).findOne({
//             _id: new ObjectId(advanceId),
//             isDeleted: { $ne: true }
//         })
//         if (!advance) {
//             return NextResponse.json(
//                 { success: false, error: 'Advance not found' },
//                 { status: 404 }
//             )
//         }
//         // Prepare update fields
//         const updateData = {
//             updatedAt: new Date()
//         }
//         if (advanceType !== undefined) updateData.advanceType = advanceType.trim()
//         if (amount !== undefined) updateData.amount = parseFloat(amount)
//         if (remark !== undefined) updateData.remark = remark.trim()
//         if (paymentMode !== undefined) updateData.paymentMode = paymentMode
//         if (date !== undefined) updateData.date = date
//         if (status !== undefined) updateData.status = status
//         // Update advance
//         const result = await db.collection(ADVANCES_COLLECTION).updateOne(
//             { _id: new ObjectId(advanceId) },
//             { $set: updateData }
//         )
//         if (result.modifiedCount === 0) {
//             return NextResponse.json(
//                 { success: false, error: 'Failed to update advance' },
//                 { status: 500 }
//             )
//         }
//         // Recalculate total advance for the trip
//         const tripAdvances = await db.collection(ADVANCES_COLLECTION).find({
//             tripId: advance.tripId,
//             isDeleted: { $ne: true }
//         }).toArray()
//         const totalAdvancePaid = tripAdvances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
//         // Update trip's totalAdvanceAmount
//         await db.collection(TRIPS_COLLECTION).updateOne(
//             { _id: advance.tripId },
//             {
//                 $set: {
//                     totalAdvanceAmount: totalAdvancePaid,
//                     updatedAt: new Date()
//                 }
//             }
//         )
//         return NextResponse.json({
//             success: true,
//             message: 'Advance updated successfully',
//             totalAdvancePaid: totalAdvancePaid
//         })
//     } catch (error) {
//         console.error('PUT advance error:', error)
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: error.message,
//                 message: 'Failed to update advance'
//             },
//             { status: 500 }
//         )
//     }
// }
// /* ================= DELETE ADVANCE (SOFT DELETE) ================= */
// export async function DELETE(req) {
//     try {
//         const { advanceId } = await req.json()
//         if (!advanceId) {
//             return NextResponse.json(
//                 { success: false, error: 'Advance ID is required' },
//                 { status: 400 }
//             )
//         }
//         if (!ObjectId.isValid(advanceId)) {
//             return NextResponse.json(
//                 { success: false, message: 'Invalid Advance ID' },
//                 { status: 400 }
//             )
//         }
//         const db = await getDB()
//         // Get advance details before deleting
//         const advance = await db.collection(ADVANCES_COLLECTION).findOne({
//             _id: new ObjectId(advanceId)
//         })
//         if (!advance) {
//             return NextResponse.json(
//                 { success: false, error: 'Advance not found' },
//                 { status: 404 }
//             )
//         }
//         // Soft delete
//         const result = await db.collection(ADVANCES_COLLECTION).updateOne(
//             { _id: new ObjectId(advanceId) },
//             {
//                 $set: {
//                     isDeleted: true,
//                     deletedAt: new Date(),
//                     updatedAt: new Date()
//                 }
//             }
//         )
//         if (result.modifiedCount === 0) {
//             return NextResponse.json(
//                 { success: false, error: 'Failed to delete advance' },
//                 { status: 500 }
//             )
//         }
//         // Recalculate total advance for the trip
//         const tripAdvances = await db.collection(ADVANCES_COLLECTION).find({
//             tripId: advance.tripId,
//             isDeleted: { $ne: true }
//         }).toArray()
//         const totalAdvancePaid = tripAdvances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
//         // Update trip's totalAdvanceAmount
//         await db.collection(TRIPS_COLLECTION).updateOne(
//             { _id: advance.tripId },
//             {
//                 $set: {
//                     totalAdvanceAmount: totalAdvancePaid,
//                     updatedAt: new Date()
//                 }
//             }
//         )
//         return NextResponse.json({
//             success: true,
//             message: 'Advance deleted successfully',
//             totalAdvancePaid: totalAdvancePaid
//         })
//     } catch (error) {
//         console.error('DELETE advance error:', error)
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: error.message,
//                 message: 'Failed to delete advance'
//             },
//             { status: 500 }
//         )
//     }
// }
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
        const date = searchParams.get('date') // Single date for daily processing
        const status = searchParams.get('status') // Filter by status: 'paid' or 'unpaid'
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
        // Filter by specific date (for daily processing) - HIGHEST PRIORITY
        if (date) {
            query.date = date
        }
        // Filter by date range (only if specific date not provided)
        else if (dateFrom || dateTo) {
            query.date = {}
            if (dateFrom) query.date.$gte = dateFrom
            if (dateTo) query.date.$lte = dateTo
        }
        // Filter by status
        if (status) {
            query.status = status
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
        // Calculate totals by status
        const totalAmount = advances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
        const paidAmount = advances
            .filter(adv => adv.status === 'paid')
            .reduce((sum, adv) => sum + (adv.amount || 0), 0)
        const unpaidAmount = advances
            .filter(adv => adv.status === 'unpaid')
            .reduce((sum, adv) => sum + (adv.amount || 0), 0)
        // Group by vehicle for better display (especially useful for daily view)
        const vehicles = {}
        advances.forEach(advance => {
            if (!vehicles[advance.vehicleNo]) {
                vehicles[advance.vehicleNo] = {
                    vehicleNo: advance.vehicleNo,
                    driverName: advance.driverName || '',
                    paidAdvances: [],
                    unpaidAdvances: [],
                    totalPaid: 0,
                    totalUnpaid: 0
                }
            }
            if (advance.status === 'paid') {
                vehicles[advance.vehicleNo].paidAdvances.push(advance)
                vehicles[advance.vehicleNo].totalPaid += advance.amount
            } else {
                vehicles[advance.vehicleNo].unpaidAdvances.push(advance)
                vehicles[advance.vehicleNo].totalUnpaid += advance.amount
            }
        })
        return NextResponse.json({
            success: true,
            data: advances,
            vehicles: Object.values(vehicles), // Grouped by vehicle
            count: advances.length,
            paidCount: advances.filter(adv => adv.status === 'paid').length,
            unpaidCount: advances.filter(adv => adv.status === 'unpaid').length,
            totalAmount: totalAmount,
            paidAmount: paidAmount,
            unpaidAmount: unpaidAmount,
            tripDetails: tripDetails ? {
                tripDate: tripDetails.tripDate,
                vehicleNo: tripDetails.vehicleNo,
                vehicleType: tripDetails.vehicleType,
                tripStatus: tripDetails.tripStatus,
                statusRemarks: tripDetails.statusRemarks,
                lhsNo: tripDetails.lhsNo,
                driverName: tripDetails.driverName,
                fromLocation: tripDetails.fromLocation,
                toLocation: tripDetails.toLocation,
                dieselLtr: tripDetails.dieselLtr,
                dieselRate: tripDetails.dieselRate,
                totalDieselAmount: tripDetails.totalDieselAmount,
                advanceAmount: tripDetails.advanceAmount,
                totalAdvanceAmount: tripDetails.totalAdvanceAmount || 0
            } : null,
            date: date || null
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
/* ================= CREATE ADVANCE (Default: UNPAID) ================= */
/* ================= CREATE ADVANCE (Default: UNPAID) ================= */
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
            status = 'unpaid', // Default is 'unpaid' (proposed)
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
        // ============= FIXED: CHECK FOR DUPLICATE ADVANCE ON SAME DATE =============
        // Ensure we have a date
        const advanceDate = date || new Date().toISOString().split('T')[0]
        // Log for debugging
        console.log('Checking for duplicate:', {
            tripId: tripId,
            advanceType: advanceType,
            date: advanceDate
        })
        // Check if an advance of the same type already exists on the same date for this trip
        const existingAdvance = await db.collection(ADVANCES_COLLECTION).findOne({
            tripId: new ObjectId(tripId),
            advanceType: advanceType.trim(),
            date: advanceDate,  // Use the same date format
            isDeleted: { $ne: true }
        })
        if (existingAdvance) {
            console.log('Duplicate found:', existingAdvance)
            return NextResponse.json(
                {
                    success: false,
                    error: `Cannot create advance. An advance of type "${advanceType}" already exists on ${advanceDate}`,
                    existingAdvance: {
                        id: existingAdvance._id,
                        amount: existingAdvance.amount,
                        status: existingAdvance.status,
                        date: existingAdvance.date,
                        type: existingAdvance.advanceType
                    }
                },
                { status: 400 }
            )
        }
        console.log('No duplicate found, proceeding...')
        // Check if advance amount exceeds total advance amount (only for proposed advances)
        if (status === 'unpaid') {
            // Get all unpaid advances for this trip
            const unpaidAdvances = await db.collection(ADVANCES_COLLECTION).find({
                tripId: new ObjectId(tripId),
                status: 'unpaid',
                isDeleted: { $ne: true }
            }).toArray()
            const totalUnpaidAmount = unpaidAdvances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
            const totalAdvanceAmount = trip.totalAdvanceAmount || 0
            // Check if new amount + existing unpaid exceeds total advance amount
            if (parseFloat(amount) + totalUnpaidAmount > totalAdvanceAmount) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Cannot exceed total advance amount. Available: ${(totalAdvanceAmount - totalUnpaidAmount).toFixed(2)}`
                    },
                    { status: 400 }
                )
            }
        }
        // Generate advance ID
        const advanceCount = await db.collection(ADVANCES_COLLECTION).countDocuments({
            tripId: new ObjectId(tripId)
        })
        const advanceId = `ADV${(advanceCount + 1).toString().padStart(3, '0')}`
        // Create advance document
        const advanceData = {
            advanceId: advanceId,
            tripId: new ObjectId(tripId),
            vehicleNo: vehicleNo.trim(),
            driverName: trip.driverName || '',
            advanceType: advanceType.trim(),
            amount: parseFloat(amount),
            remark: remark?.trim() || '',
            paymentMode: paymentMode,
            date: advanceDate,  // Use the formatted date
            status: status,
            createdBy: createdBy,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        // Insert into advances collection
        const result = await db.collection(ADVANCES_COLLECTION).insertOne(advanceData)
        // Calculate totals for response
        const tripAdvances = await db.collection(ADVANCES_COLLECTION).find({
            tripId: new ObjectId(tripId),
            isDeleted: { $ne: true }
        }).toArray()
        const totalAdvancePaid = tripAdvances
            .filter(adv => adv.status === 'paid')
            .reduce((sum, adv) => sum + (adv.amount || 0), 0)
        const totalAdvanceUnpaid = tripAdvances
            .filter(adv => adv.status === 'unpaid')
            .reduce((sum, adv) => sum + (adv.amount || 0), 0)
        return NextResponse.json({
            success: true,
            message: status === 'unpaid' ? 'Advance proposed successfully' : 'Advance created and marked as paid',
            data: {
                ...advanceData,
                _id: result.insertedId
            },
            totalAdvancePaid: totalAdvancePaid,
            totalAdvanceUnpaid: totalAdvanceUnpaid,
            balance: (trip.totalAdvanceAmount || 0) - totalAdvancePaid
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
/* ================= UPDATE ADVANCE STATUS (Mark as Paid) ================= */
export async function PUT(req) {
    try {
        const { advanceId, status } = await req.json()
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
        if (!status || !['paid', 'unpaid'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Valid status (paid/unpaid) is required' },
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
        // Prevent changing status if already paid (once paid, cannot change back to unpaid)
        if (advance.status === 'paid' && status === 'unpaid') {
            return NextResponse.json(
                { success: false, error: 'Cannot change paid advance back to unpaid' },
                { status: 400 }
            )
        }
        // Check if marking as paid would exceed total advance amount
        if (status === 'paid') {
            const trip = await db.collection(TRIPS_COLLECTION).findOne({
                _id: advance.tripId,
                isDeleted: { $ne: true }
            })
            if (trip) {
                const paidAdvances = await db.collection(ADVANCES_COLLECTION).find({
                    tripId: advance.tripId,
                    status: 'paid',
                    isDeleted: { $ne: true }
                }).toArray()
                const totalPaidAmount = paidAdvances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
                const totalAdvanceAmount = trip.totalAdvanceAmount || 0
                // Check if marking this as paid would exceed total advance amount
                if (totalPaidAmount + advance.amount > totalAdvanceAmount) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: `Cannot mark as paid. Would exceed total advance amount. Available: ${(totalAdvanceAmount - totalPaidAmount).toFixed(2)}`
                        },
                        { status: 400 }
                    )
                }
            }
        }
        // Update advance status
        const result = await db.collection(ADVANCES_COLLECTION).updateOne(
            { _id: new ObjectId(advanceId) },
            {
                $set: {
                    status: status,
                    updatedAt: new Date(),
                    // If marking as paid, record the payment date
                    ...(status === 'paid' && !advance.paidDate ? { paidDate: new Date() } : {})
                }
            }
        )
        if (result.modifiedCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Failed to update advance status' },
                { status: 500 }
            )
        }
        // Calculate updated totals
        const tripAdvances = await db.collection(ADVANCES_COLLECTION).find({
            tripId: advance.tripId,
            isDeleted: { $ne: true }
        }).toArray()
        const totalAdvancePaid = tripAdvances
            .filter(adv => adv.status === 'paid')
            .reduce((sum, adv) => sum + (adv.amount || 0), 0)
        const totalAdvanceUnpaid = tripAdvances
            .filter(adv => adv.status === 'unpaid')
            .reduce((sum, adv) => sum + (adv.amount || 0), 0)
        return NextResponse.json({
            success: true,
            message: `Advance marked as ${status} successfully`,
            totalAdvancePaid: totalAdvancePaid,
            totalAdvanceUnpaid: totalAdvanceUnpaid,
            balance: (advance.totalAdvanceAmount || 0) - totalAdvancePaid
        })
    } catch (error) {
        console.error('PUT advance status error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Failed to update advance status'
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
        // Prevent deleting paid advances
        if (advance.status === 'paid') {
            return NextResponse.json(
                { success: false, error: 'Cannot delete paid advances' },
                { status: 400 }
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
        // Calculate updated totals for the trip
        const tripAdvances = await db.collection(ADVANCES_COLLECTION).find({
            tripId: advance.tripId,
            isDeleted: { $ne: true }
        }).toArray()
        const totalAdvancePaid = tripAdvances
            .filter(adv => adv.status === 'paid')
            .reduce((sum, adv) => sum + (adv.amount || 0), 0)
        const totalAdvanceUnpaid = tripAdvances
            .filter(adv => adv.status === 'unpaid')
            .reduce((sum, adv) => sum + (adv.amount || 0), 0)
        return NextResponse.json({
            success: true,
            message: 'Advance deleted successfully',
            totalAdvancePaid: totalAdvancePaid,
            totalAdvanceUnpaid: totalAdvanceUnpaid
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
/* ================= BULK MARK AS PAID ================= */
export async function POST_BULK_PAID(req) {
    try {
        const { advanceIds } = await req.json()
        if (!advanceIds || !Array.isArray(advanceIds) || advanceIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Advance IDs array is required' },
                { status: 400 }
            )
        }
        // Validate all advance IDs
        const invalidIds = advanceIds.filter(id => !ObjectId.isValid(id))
        if (invalidIds.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid Advance IDs found', invalidIds },
                { status: 400 }
            )
        }
        const db = await getDB()
        // Check all advances exist and are unpaid
        const objectIds = advanceIds.map(id => new ObjectId(id))
        const advances = await db.collection(ADVANCES_COLLECTION).find({
            _id: { $in: objectIds },
            isDeleted: { $ne: true }
        }).toArray()
        if (advances.length !== advanceIds.length) {
            return NextResponse.json(
                { success: false, error: 'Some advances not found' },
                { status: 404 }
            )
        }
        // Check if any advance is already paid
        const alreadyPaid = advances.filter(adv => adv.status === 'paid')
        if (alreadyPaid.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Some advances are already paid',
                    alreadyPaid: alreadyPaid.map(adv => adv._id)
                },
                { status: 400 }
            )
        }
        // Group by trip to check total advance limits
        const tripsMap = new Map()
        advances.forEach(advance => {
            if (!tripsMap.has(advance.tripId.toString())) {
                tripsMap.set(advance.tripId.toString(), [])
            }
            tripsMap.get(advance.tripId.toString()).push(advance)
        })
        // Check each trip's total advance limit
        for (const [tripId, tripAdvances] of tripsMap.entries()) {
            const trip = await db.collection(TRIPS_COLLECTION).findOne({
                _id: new ObjectId(tripId),
                isDeleted: { $ne: true }
            })
            if (trip) {
                const paidAdvances = await db.collection(ADVANCES_COLLECTION).find({
                    tripId: new ObjectId(tripId),
                    status: 'paid',
                    isDeleted: { $ne: true }
                }).toArray()
                const totalPaidAmount = paidAdvances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
                const newAmount = tripAdvances.reduce((sum, adv) => sum + adv.amount, 0)
                const totalAdvanceAmount = trip.totalAdvanceAmount || 0
                if (totalPaidAmount + newAmount > totalAdvanceAmount) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: `Cannot process. Would exceed total advance amount for trip ${trip.vehicleNo}`
                        },
                        { status: 400 }
                    )
                }
            }
        }
        // Update all advances to paid
        const result = await db.collection(ADVANCES_COLLECTION).updateMany(
            { _id: { $in: objectIds } },
            {
                $set: {
                    status: 'paid',
                    paidDate: new Date(),
                    updatedAt: new Date()
                }
            }
        )
        return NextResponse.json({
            success: true,
            message: `${result.modifiedCount} advances marked as paid successfully`,
            count: result.modifiedCount
        })
    } catch (error) {
        console.error('BULK mark as paid error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Failed to mark advances as paid'
            },
            { status: 500 }
        )
    }
}
