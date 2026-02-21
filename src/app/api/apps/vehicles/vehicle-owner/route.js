// app/api/apps/vehicles/vehicle-owner/route.js
import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import { PERMISSIONS } from '@/libs/permissions'
import { checkPermission } from '@/utils/checkPermission'

// ✅ GET with permission check
export const GET = checkPermission(PERMISSIONS.vehicleOwners.READ)(
    async function GET(request) {
        console.log('🚗 GET /api/vehicle-owners')
        let client
        try {
            const session = await getServerSession(authOptions)

            client = new MongoClient(process.env.DATABASE_URL)
            await client.connect()
            const db = client.db()

            const owners = await db.collection('vehicleOwners')
                .find({})
                .sort({ createdAt: -1 })
                .toArray()

            const formattedOwners = owners.map((owner, index) => ({
                id: owner._id.toString(),
                ownerId: `VO${String(index + 1).padStart(3, '0')}`,
                ownerName: owner.fullName || 'Unknown',
                mobile: owner.mobile || 'Not provided',
                isActive: owner.isActive !== false
            }))

            return NextResponse.json({
                success: true,
                data: formattedOwners,
                count: formattedOwners.length
            })
        } catch (error) {
            console.error('❌ Error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch owners' },
                { status: 500 }
            )
        } finally {
            if (client) await client.close()
        }
    }
)

// ✅ POST with permission check
export const POST = checkPermission(PERMISSIONS.vehicleOwners.CREATE)(
    async function POST(request) {
        console.log('🚗 POST /api/vehicle-owners')
        let client
        try {
            const session = await getServerSession(authOptions)
            const data = await request.json()

            if (!data.fullName || !data.mobile) {
                return NextResponse.json(
                    { error: 'Full name and mobile required' },
                    { status: 400 }
                )
            }

            client = new MongoClient(process.env.DATABASE_URL)
            await client.connect()
            const db = client.db()

            const newOwner = {
                fullName: data.fullName,
                mobile: data.mobile,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: session.user.email
            }

            const result = await db.collection('vehicleOwners').insertOne(newOwner)

            return NextResponse.json({
                success: true,
                data: { ...newOwner, _id: result.insertedId }
            }, { status: 201 })
        } catch (error) {
            console.error('❌ Error:', error)
            return NextResponse.json(
                { error: 'Failed to create owner' },
                { status: 500 }
            )
        } finally {
            if (client) await client.close()
        }
    }
)
