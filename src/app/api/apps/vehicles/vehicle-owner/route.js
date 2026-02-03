// src/app/api/vehicle-owners/route.js
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

export async function GET() {
    console.log('🚗 /api/vehicle-owners GET request')

    try {
        // Check authentication
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login.' },
                { status: 401 }
            )
        }

        // Connect to MongoDB
        const client = new MongoClient(process.env.DATABASE_URL)
        await client.connect()
        const db = client.db()
        const vehicleOwnersCollection = db.collection('vehicleOwners')

        // Fetch vehicle owners
        const owners = await vehicleOwnersCollection.find({}).sort({ createdAt: -1 }).toArray()

        await client.close()

        // Transform data - ONLY the required fields
        const formattedOwners = owners.map((owner, index) => ({
            id: owner._id.toString(),
            ownerId: `VO${String(index + 1).padStart(3, '0')}`, // Serial ID: VO001, VO002, etc.
            ownerName: owner.fullName || `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Unknown',
            mobile: owner.mobile || owner.phone || owner.contactNumber || 'Not provided',
            isActive: owner.isActive !== false // Default to true if not specified
        }))

        return NextResponse.json({
            success: true,
            data: formattedOwners,
            count: formattedOwners.length
        })

    } catch (error) {
        console.error('❌ Vehicle Owners API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch vehicle owners'
            },
            { status: 500 }
        )
    }
}
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login.' },
                { status: 401 }
            )
        }

        const data = await request.json()

        // Validate required fields
        if (!data.fullName || !data.mobile) {
            return NextResponse.json(
                { error: 'Full name and mobile number are required' },
                { status: 400 }
            )
        }

        // Connect to MongoDB
        const client = new MongoClient(process.env.DATABASE_URL)
        await client.connect()
        const db = client.db()

        // Try different collection names
        const collectionNames = ['vehicleOwners', 'vehicle_owners', 'owners', 'vehicleowners']
        let collection

        for (const collectionName of collectionNames) {
            try {
                const col = db.collection(collectionName)
                // Try to insert a test document to see if collection exists
                await col.findOne({})
                collection = col
                console.log(`✅ Using collection: ${collectionName}`)
                break
            } catch (err) {
                continue
            }
        }

        // If no collection found, create one
        if (!collection) {
            collection = db.collection('vehicleOwners')
            console.log('✅ Created new collection: vehicleOwners')
        }

        // Create new vehicle owner
        const newOwner = {
            fullName: data.fullName,
            mobile: data.mobile,
            isActive: data.isActive !== false,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const result = await collection.insertOne(newOwner)

        await client.close()

        return NextResponse.json({
            success: true,
            message: 'Vehicle owner added successfully',
            data: {
                ...newOwner,
                _id: result.insertedId
            }
        }, { status: 201 })

    } catch (error) {
        console.error('❌ Add vehicle owner error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to add vehicle owner',
                message: error.message
            },
            { status: 500 }
        )
    }
}
