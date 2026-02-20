import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
const TRIPS_COLLECTION = 'trips'
const ADVANCES_COLLECTION = 'advances'
const client = new MongoClient(process.env.DATABASE_URL)
async function getDB() {
    await client.connect()
    return client.db()
}
/* ================= GET ADVANCES BY DATE ================= */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date')
        if (!date) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Date parameter is required',
                    message: 'Please provide date in YYYY-MM-DD format'
                },
                { status: 400 }
            )
        }
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(date)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid date format',
                    message: 'Date must be in YYYY-MM-DD format'
                },
                { status: 400 }
            )
        }
        const db = await getDB()
        // Get advances for specific date
        const advances = await db
            .collection(ADVANCES_COLLECTION)
            .find({
                date: date,
                isDeleted: { $ne: true }
            })
            .sort({
                status: 1, // unpaid first
                vehicleNo: 1,
                createdAt: 1
            })
            .toArray()
        // Get trip details for each advance
        const tripIds = [...new Set(advances.map(adv => adv.tripId.toString()))]
        const trips = await db.collection(TRIPS_COLLECTION).find({
            _id: { $in: tripIds.map(id => new ObjectId(id)) },
            isDeleted: { $ne: true }
        }).toArray()
        const tripMap = {}
        trips.forEach(trip => {
            tripMap[trip._id.toString()] = {
                vehicleType: trip.vehicleType,
                fromLocation: trip.fromLocation,
                toLocation: trip.toLocation,
                lhsNo: trip.lhsNo,
                bankName: trip.bankName,
                totalAdvanceAmount: trip.totalAdvanceAmount || 0
            }
        })
        // Enhance advances with trip details
        const enhancedAdvances = advances.map(advance => ({
            ...advance,
            tripDetails: tripMap[advance.tripId.toString()] || {}
        }))
        // Calculate totals
        const totalAmount = advances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
        const paidAdvances = advances.filter(adv => adv.status === 'paid')
        const unpaidAdvances = advances.filter(adv => adv.status === 'unpaid')
        const paidAmount = paidAdvances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
        const unpaidAmount = unpaidAdvances.reduce((sum, adv) => sum + (adv.amount || 0), 0)
        // Group by vehicle for better display
        const vehicles = {}
        enhancedAdvances.forEach(advance => {
            if (!vehicles[advance.vehicleNo]) {
                vehicles[advance.vehicleNo] = {
                    vehicleNo: advance.vehicleNo,
                    driverName: advance.driverName || '',
                    vehicleType: advance.tripDetails.vehicleType || '',
                    paidAdvances: [],
                    unpaidAdvances: [],
                    totalPaid: 0,
                    totalUnpaid: 0,
                    totalAdvanceAmount: advance.tripDetails.totalAdvanceAmount || 0
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
        // Calculate vehicle-wise balance
        Object.values(vehicles).forEach(vehicle => {
            vehicle.balance = vehicle.totalAdvanceAmount - vehicle.totalPaid
            vehicle.availableForPayment = vehicle.balance - vehicle.totalUnpaid
        })
        return NextResponse.json({
            success: true,
            data: enhancedAdvances,
            vehicles: Object.values(vehicles),
            summary: {
                date: date,
                totalAdvances: advances.length,
                paidCount: paidAdvances.length,
                unpaidCount: unpaidAdvances.length,
                totalAmount: totalAmount,
                paidAmount: paidAmount,
                unpaidAmount: unpaidAmount,
                vehicleCount: Object.keys(vehicles).length
            },
            count: advances.length
        })
    } catch (error) {
        console.error('GET advances by date error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Failed to fetch advances by date'
            },
            { status: 500 }
        )
    }
}
