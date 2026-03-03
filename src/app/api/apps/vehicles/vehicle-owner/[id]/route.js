// app/api/apps/vehicles/vehicle-owner/[id]/route.js
import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import { PERMISSIONS } from '@/libs/permissions'
import { checkPermission } from '@/utils/checkPermission'

// ✅ GET single owner by ID
export const GET = checkPermission(PERMISSIONS.vehicleOwners.READ)(
    async function GET(request, { params }) {
        console.log('🚗 GET /api/vehicle-owners/[id]')
        let client
        try {
            const { id } = await params
            const session = await getServerSession(authOptions)

            if (!id) {
                return NextResponse.json(
                    { error: 'Owner ID is required' },
                    { status: 400 }
                )
            }

            client = new MongoClient(process.env.DATABASE_URL)
            await client.connect()
            const db = client.db()

            const owner = await db.collection('vehicleOwners').findOne({
                _id: new ObjectId(id)
            })

            if (!owner) {
                return NextResponse.json(
                    { error: 'Owner not found' },
                    { status: 404 }
                )
            }

            return NextResponse.json({
                success: true,
                data: {
                    id: owner._id.toString(),
                    fullName: owner.fullName,
                    mobile: owner.mobile,
                    isActive: owner.isActive,
                    createdAt: owner.createdAt,
                    updatedAt: owner.updatedAt
                }
            })
        } catch (error) {
            console.error('❌ Error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch owner' },
                { status: 500 }
            )
        } finally {
            if (client) await client.close()
        }
    }
)

// ✅ PUT update owner by ID
export const PUT = checkPermission(PERMISSIONS.vehicleOwners.UPDATE)(
    async function PUT(request, { params }) {
        console.log('🚗 PUT /api/vehicle-owners/[id]')
        let client
        try {
            const { id } = await params
            const session = await getServerSession(authOptions)
            const data = await request.json()

            console.log('Update data received:', data) // Add this for debugging

            if (!id) {
                return NextResponse.json(
                    { error: 'Owner ID is required' },
                    { status: 400 }
                )
            }

            // Check for either fullName or ownerName
            const fullName = data.fullName || data.ownerName
            const mobile = data.mobile

            if (!fullName || !mobile) {
                return NextResponse.json(
                    {
                        error: 'Full name and mobile required',
                        received: { fullName, mobile, originalData: data }
                    },
                    { status: 400 }
                )
            }

            client = new MongoClient(process.env.DATABASE_URL)
            await client.connect()
            const db = client.db()

            // Check if mobile number already exists for another owner
            const existingOwner = await db.collection('vehicleOwners').findOne({
                mobile: mobile,
                _id: { $ne: new ObjectId(id) }
            })

            if (existingOwner) {
                return NextResponse.json(
                    { error: 'Owner with this mobile number already exists' },
                    { status: 409 }
                )
            }

            const updateData = {
                fullName: fullName,
                mobile: mobile,
                isActive: data.isActive !== undefined ? data.isActive : true,
                updatedAt: new Date(),
                updatedBy: session?.user?.email || 'system'
            }

            const result = await db.collection('vehicleOwners').updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            )

            if (result.matchedCount === 0) {
                return NextResponse.json(
                    { error: 'Owner not found' },
                    { status: 404 }
                )
            }

            const updatedOwner = await db.collection('vehicleOwners').findOne({
                _id: new ObjectId(id)
            })

            return NextResponse.json({
                success: true,
                data: {
                    id: updatedOwner._id.toString(),
                    fullName: updatedOwner.fullName,
                    ownerName: updatedOwner.fullName, // Include ownerName for frontend compatibility
                    mobile: updatedOwner.mobile,
                    isActive: updatedOwner.isActive,
                    updatedAt: updatedOwner.updatedAt
                }
            })
        } catch (error) {
            console.error('❌ Error:', error)
            return NextResponse.json(
                { error: 'Failed to update owner' },
                { status: 500 }
            )
        } finally {
            if (client) await client.close()
        }
    }
)

// ✅ DELETE owner by ID
export const DELETE = checkPermission(PERMISSIONS.vehicleOwners.DELETE)(
    async function DELETE(request, { params }) {
        console.log('🚗 DELETE /api/vehicle-owners/[id]')
        let client
        try {
            const { id } = await params
            const session = await getServerSession(authOptions)

            if (!id) {
                return NextResponse.json(
                    { error: 'Owner ID is required' },
                    { status: 400 }
                )
            }

            client = new MongoClient(process.env.DATABASE_URL)
            await client.connect()
            const db = client.db()

            // Check if owner has any vehicles before deleting
            const vehiclesWithOwner = await db.collection('vehicles').findOne({
                ownerId: id
            })

            if (vehiclesWithOwner) {
                return NextResponse.json(
                    { error: 'Cannot delete owner with associated vehicles' },
                    { status: 409 }
                )
            }

            const result = await db.collection('vehicleOwners').deleteOne({
                _id: new ObjectId(id)
            })

            if (result.deletedCount === 0) {
                return NextResponse.json(
                    { error: 'Owner not found' },
                    { status: 404 }
                )
            }

            return NextResponse.json({
                success: true,
                message: 'Owner deleted successfully',
                deletedCount: result.deletedCount
            })
        } catch (error) {
            console.error('❌ Error:', error)
            return NextResponse.json(
                { error: 'Failed to delete owner' },
                { status: 500 }
            )
        } finally {
            if (client) await client.close()
        }
    }
)

// ✅ PATCH toggle active status
export const PATCH = checkPermission(PERMISSIONS.vehicleOwners.UPDATE)(
    async function PATCH(request, { params }) {
        console.log('🚗 PATCH /api/vehicle-owners/[id]')
        let client
        try {
            const { id } = await params
            const session = await getServerSession(authOptions)
            const data = await request.json()

            if (!id) {
                return NextResponse.json(
                    { error: 'Owner ID is required' },
                    { status: 400 }
                )
            }

            if (data.isActive === undefined) {
                return NextResponse.json(
                    { error: 'isActive status is required' },
                    { status: 400 }
                )
            }

            client = new MongoClient(process.env.DATABASE_URL)
            await client.connect()
            const db = client.db()

            const result = await db.collection('vehicleOwners').updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        isActive: data.isActive,
                        updatedAt: new Date(),
                        updatedBy: session?.user?.email || 'system'
                    }
                }
            )

            if (result.matchedCount === 0) {
                return NextResponse.json(
                    { error: 'Owner not found' },
                    { status: 404 }
                )
            }

            return NextResponse.json({
                success: true,
                message: `Owner ${data.isActive ? 'activated' : 'deactivated'} successfully`
            })
        } catch (error) {
            console.error('❌ Error:', error)
            return NextResponse.json(
                { error: 'Failed to update owner status' },
                { status: 500 }
            )
        } finally {
            if (client) await client.close()
        }
    }
)
