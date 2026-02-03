import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

const client = new MongoClient(process.env.DATABASE_URL)

async function getDB() {
    await client.connect()
    return client.db()
}

export async function POST(request) {
    try {
        const { advanceIds } = await request.json()

        if (!advanceIds || !Array.isArray(advanceIds) || advanceIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Advance IDs array is required' },
                { status: 400 }
            )
        }

        const db = await getDB()

        // Filter valid ObjectIds
        const validIds = advanceIds.filter(id => ObjectId.isValid(id))

        if (validIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No valid advance IDs found' },
                { status: 400 }
            )
        }

        const objectIds = validIds.map(id => new ObjectId(id))

        // Update only unpaid advances to paid (skipping already paid ones)
        const result = await db.collection('advances').updateMany(
            {
                _id: { $in: objectIds },
                status: 'unpaid',  // Only update unpaid ones
                isDeleted: { $ne: true }
            },
            {
                $set: {
                    status: 'paid',
                    paidDate: new Date(),
                    updatedAt: new Date()
                }
            }
        )

        // Count how many were already paid
        const allAdvances = await db.collection('advances').find({
            _id: { $in: objectIds },
            isDeleted: { $ne: true }
        }).toArray()

        const alreadyPaidCount = allAdvances.filter(adv => adv.status === 'paid').length

        return NextResponse.json({
            success: true,
            message: `${result.modifiedCount} advances marked as paid. ${alreadyPaidCount} were already paid.`,
            count: result.modifiedCount,
            alreadyPaid: alreadyPaidCount,
            details: {
                requested: advanceIds.length,
                validIds: validIds.length,
                processed: result.modifiedCount,
                skipped: alreadyPaidCount + (advanceIds.length - validIds.length)
            }
        })

    } catch (error) {
        console.error('Bulk mark as paid error:', error)
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
