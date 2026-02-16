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
            imageUrl: doc.imageUrl || '',
            publicId: doc.publicId || '',
            isExpired: expiry < today
        }
    })
}
/* ===========================
   GET
=========================== */
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { searchParams } = new URL(req.url)
        const action = searchParams.get('action')
        const id = searchParams.get('id')
        const vehicleNo = searchParams.get('vehicleNo')
        const db = await getDB()
        /* ===== VEHICLE TYPES ===== */
        if (action === 'types') {
            const vehicleTypes = await db.collection('vehicleTypes')
                .find({ isActive: true })
                .project({ type: 1, description: 1 })
                .toArray()
            return NextResponse.json({
                success: true,
                data: vehicleTypes
            })
        }
        /* ===== SEARCH BY VEHICLE NUMBER ===== */
        if (vehicleNo) {
            const vehicle = await db.collection('vehicles').aggregate([
                {
                    $match: {
                        vehicleNo: { $regex: new RegExp(`^${vehicleNo}$`, 'i') },
                        isActive: true
                    }
                },
                {
                    $lookup: {
                        from: 'vehicleOwners',
                        localField: 'ownerId',
                        foreignField: '_id',
                        as: 'owner'
                    }
                },
                {
                    $lookup: {
                        from: 'vehicleTypes',
                        let: { modelId: '$model' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$modelId'] } } },
                            { $project: { type: 1 } }
                        ],
                        as: 'vehicleType'
                    }
                },
                {
                    $addFields: {
                        ownerName: { $arrayElemAt: ['$owner.fullName', 0] },
                        vehicleType: { $arrayElemAt: ['$vehicleType.type', 0] },
                        // Handle both selected driver and manual driver
                        driverName: {
                            $cond: {
                                if: { $ne: ['$driverId', null] },
                                then: { $arrayElemAt: ['$driver.name', 0] },
                                else: '$manualDriver.name'
                            }
                        },
                        driverMobile: {
                            $cond: {
                                if: { $ne: ['$driverId', null] },
                                then: { $arrayElemAt: ['$driver.contact', 0] },
                                else: '$manualDriver.mobile'
                            }
                        },
                        driverMode: {
                            $cond: {
                                if: { $ne: ['$driverId', null] },
                                then: 'select',
                                else: 'manual'
                            }
                        },
                        expiredDocumentsCount: {
                            $size: {
                                $filter: {
                                    input: '$documents',
                                    as: 'doc',
                                    cond: { $eq: ['$$doc.isExpired', true] }
                                }
                            }
                        },
                        hasDocuments: { $gt: [{ $size: '$documents' }, 0] }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { driverId: '$driverId' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$driverId'] } } },
                            { $project: { name: 1, contact: 1 } }
                        ],
                        as: 'driver'
                    }
                },
                { $project: { owner: 0, driver: 0, vehicleTypeArray: 0 } }
            ]).toArray()
            return NextResponse.json({
                success: true,
                data: vehicle.length > 0 ? vehicle[0] : null
            })
        }
        /* ===== SINGLE VEHICLE BY ID ===== */
        if (id) {
            const vehicle = await db.collection('vehicles').findOne({
                _id: new ObjectId(id),
                isActive: true
            })
            // Format dates for display
            if (vehicle?.documents) {
                vehicle.documents = vehicle.documents.map(doc => ({
                    ...doc,
                    expiryDate: doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : ''
                }))
            }
            return NextResponse.json({ success: true, data: vehicle })
        }
        /* ===== VEHICLE LIST ===== */
        if (!action || action === 'list') {
            const vehicles = await db.collection('vehicles').aggregate([
                { $match: { isActive: true } },
                {
                    $lookup: {
                        from: 'vehicleOwners',
                        localField: 'ownerId',
                        foreignField: '_id',
                        as: 'owner'
                    }
                },
                {
                    $lookup: {
                        from: 'vehicleTypes',
                        let: { modelId: '$model' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$modelId'] } } },
                            { $project: { type: 1 } }
                        ],
                        as: 'vehicleType'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { driverId: '$driverId' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$_id', '$$driverId'] } } },
                            { $project: { name: 1, contact: 1 } }
                        ],
                        as: 'driver'
                    }
                },
                {
                    $addFields: {
                        ownerName: { $arrayElemAt: ['$owner.fullName', 0] },
                        vehicleType: { $arrayElemAt: ['$vehicleType.type', 0] },
                        // Handle both selected driver and manual driver
                        driverName: {
                            $cond: {
                                if: { $ne: ['$driverId', null] },
                                then: { $arrayElemAt: ['$driver.name', 0] },
                                else: '$manualDriver.name'
                            }
                        },
                        driverMobile: {
                            $cond: {
                                if: { $ne: ['$driverId', null] },
                                then: { $arrayElemAt: ['$driver.contact', 0] },
                                else: '$manualDriver.mobile'
                            }
                        },
                        driverMode: {
                            $cond: {
                                if: { $ne: ['$driverId', null] },
                                then: 'select',
                                else: 'manual'
                            }
                        },
                        expiredDocumentsCount: {
                            $size: {
                                $filter: {
                                    input: '$documents',
                                    as: 'doc',
                                    cond: { $eq: ['$$doc.isExpired', true] }
                                }
                            }
                        },
                        hasDocuments: { $gt: [{ $size: '$documents' }, 0] }
                    }
                },
                { $project: { owner: 0, driver: 0, vehicleTypeArray: 0 } },
                { $sort: { createdAt: -1 } }
            ]).toArray()
            return NextResponse.json({ success: true, data: vehicles })
        }
        /* ===== FORM DATA ===== */
        if (action === 'form-data') {
            const owners = await db.collection('vehicleOwners')
                .find({ isActive: true })
                .project({ fullName: 1, mobile: 1 })
                .toArray()
            const drivers = await db.collection('users')
                .find({ role: 'driver', isActive: true })
                .project({ name: 1, contact: 1 })
                .toArray()
            return NextResponse.json({
                success: true,
                data: { owners, drivers }
            })
        }
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
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
        // Validate required fields
        if (!data.vehicleNo || !data.ownerId || !data.vehicleModel) {
            return NextResponse.json({
                error: 'Vehicle number, owner, and vehicle type are required'
            }, { status: 400 })
        }
        // Validate manual driver fields if in manual mode
        if (data.driverMode === 'manual') {
            if (!data.manualDriver?.name || !data.manualDriver?.mobile) {
                return NextResponse.json({
                    error: 'Driver name and mobile are required for manual driver entry'
                }, { status: 400 })
            }
        }
        // Check if vehicle already exists (case-insensitive)
        const exists = await db.collection('vehicles').findOne({
            vehicleNo: { $regex: new RegExp(`^${data.vehicleNo}$`, 'i') },
            isActive: true
        })
        if (exists) {
            return NextResponse.json({
                error: `Vehicle ${data.vehicleNo} already exists`
            }, { status: 400 })
        }
        // Create vehicle document
        const vehicle = {
            vehicleNo: data.vehicleNo.toUpperCase(),
            ownerId: new ObjectId(data.ownerId),
            driverId: data.driverId ? new ObjectId(data.driverId) : null,
            manualDriver: data.manualDriver || null, // Add manual driver data
            model: data.vehicleModel,
            bankName: data.bankName || '',
            accountNo: data.accountNo || '',
            ifscCode: data.ifscCode || '',
            accountHolderName: data.accountHolderName || '',
            documents: normalizeDocuments(data.documents || []),
            isActive: data.isActive ?? true,
            createdBy: session.user.id,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        const result = await db.collection('vehicles').insertOne(vehicle)
        // Update owner with vehicle reference (only for selected driver mode)
        if (data.driverId) {
            await db.collection('users').updateOne(
                { _id: new ObjectId(data.driverId) },
                {
                    $set: {
                        assignedVehicle: result.insertedId,
                        updatedAt: new Date()
                    }
                }
            )
        }
        return NextResponse.json({
            success: true,
            id: result.insertedId,
            message: 'Vehicle created successfully'
        })
    } catch (err) {
        console.error('POST vehicle error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
/* ===========================
   PUT – Update Vehicle (Full update or bulk)
=========================== */
export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['admin', 'manager'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const data = await req.json()
        const db = await getDB()
        // Check if this is a bulk operation
        if (data.ids && Array.isArray(data.ids)) {
            // BULK STATUS UPDATE
            const { ids, isActive } = data
            if (!ids || ids.length === 0) {
                return NextResponse.json(
                    { error: 'Vehicle IDs are required' },
                    { status: 400 }
                )
            }
            const objectIds = ids.map(id => new ObjectId(id))
            await db.collection('vehicles').updateMany(
                { _id: { $in: objectIds } },
                {
                    $set: {
                        isActive: isActive,
                        updatedAt: new Date(),
                        updatedBy: session.user.id
                    }
                }
            )
            return NextResponse.json({
                success: true,
                message: `${ids.length} vehicle(s) updated successfully`
            })
        } else {
            // SINGLE VEHICLE UPDATE
            if (!data.id) {
                return NextResponse.json({
                    error: 'Vehicle ID required'
                }, { status: 400 })
            }
            if (!data.vehicleNo || !data.ownerId || !data.vehicleModel) {
                return NextResponse.json({
                    error: 'Vehicle number, owner, and vehicle type are required'
                }, { status: 400 })
            }
            // Validate manual driver fields if in manual mode
            if (data.driverMode === 'manual') {
                if (!data.manualDriver?.name || !data.manualDriver?.mobile) {
                    return NextResponse.json({
                        error: 'Driver name and mobile are required for manual driver entry'
                    }, { status: 400 })
                }
            }
            const vehicleId = new ObjectId(data.id)
            // Check if vehicle exists
            const existingVehicle = await db.collection('vehicles').findOne({
                _id: vehicleId,
                isActive: true
            })
            if (!existingVehicle) {
                return NextResponse.json({
                    error: 'Vehicle not found'
                }, { status: 404 })
            }
            // Check if new vehicle number conflicts with another vehicle
            if (data.vehicleNo !== existingVehicle.vehicleNo) {
                const duplicate = await db.collection('vehicles').findOne({
                    vehicleNo: { $regex: new RegExp(`^${data.vehicleNo}$`, 'i') },
                    _id: { $ne: vehicleId },
                    isActive: true
                })
                if (duplicate) {
                    return NextResponse.json({
                        error: `Vehicle ${data.vehicleNo} already exists`
                    }, { status: 400 })
                }
            }
            // Handle driver assignment changes (only for selected driver mode)
            const previousDriverId = existingVehicle.driverId
            const newDriverId = data.driverId ? new ObjectId(data.driverId) : null
            // Only handle driver assignment if in select mode and driver changed
            if (data.driverMode !== 'manual' && previousDriverId?.toString() !== newDriverId?.toString()) {
                // Remove vehicle from previous driver
                if (previousDriverId) {
                    await db.collection('users').updateOne(
                        { _id: previousDriverId },
                        {
                            $unset: { assignedVehicle: "" },
                            $set: { updatedAt: new Date() }
                        }
                    )
                }
                // Assign vehicle to new driver
                if (newDriverId) {
                    await db.collection('users').updateOne(
                        { _id: newDriverId },
                        {
                            $set: {
                                assignedVehicle: vehicleId,
                                updatedAt: new Date()
                            }
                        }
                    )
                }
            }
            // If switching from select to manual mode, remove driver assignment
            if (data.driverMode === 'manual' && previousDriverId) {
                await db.collection('users').updateOne(
                    { _id: previousDriverId },
                    {
                        $unset: { assignedVehicle: "" },
                        $set: { updatedAt: new Date() }
                    }
                )
            }
            // Prepare update document
            const update = {
                vehicleNo: data.vehicleNo.toUpperCase(),
                ownerId: new ObjectId(data.ownerId),
                driverId: data.driverMode !== 'manual' ? newDriverId : null,
                manualDriver: data.driverMode === 'manual' ? (data.manualDriver || null) : null,
                model: data.vehicleModel,
                bankName: data.bankName || '',
                accountNo: data.accountNo || '',
                ifscCode: data.ifscCode || '',
                accountHolderName: data.accountHolderName || '',
                documents: normalizeDocuments(data.documents || []),
                isActive: data.isActive ?? true,
                updatedBy: session.user.id,
                updatedAt: new Date()
            }
            await db.collection('vehicles').updateOne(
                { _id: vehicleId },
                { $set: update }
            )
            return NextResponse.json({
                success: true,
                message: 'Vehicle updated successfully'
            })
        }
    } catch (err) {
        console.error('PUT vehicle error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
/* ===========================

   PATCH – Partial Update (e.g., just documents)
=========================== */
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions)
        console.log('=== BACKEND PATCH DEBUG ===')
        console.log('1. Session:', session?.user?.email)

        if (!session || !['admin', 'manager'].includes(session.user.role)) {
            console.log('2. Unauthorized - session invalid or wrong role')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        console.log('3. Request data:', JSON.stringify(data, null, 2))

        if (!data.id) {
            console.log('4. No ID provided')
            return NextResponse.json({
                error: 'Vehicle ID is required'
            }, { status: 400 })
        }

        console.log('5. ID received:', data.id)
        console.log('6. ID type:', typeof data.id)
        console.log('7. ID length:', data.id.length)
        console.log('8. Is valid ObjectId?', ObjectId.isValid(data.id))

        let vehicleId
        try {
            vehicleId = new ObjectId(data.id)
            console.log('9. Successfully created ObjectId:', vehicleId.toString())
        } catch (err) {
            console.log('9. Failed to create ObjectId:', err.message)
            return NextResponse.json({
                error: `Invalid vehicle ID format: ${data.id}`
            }, { status: 400 })
        }

        const db = await getDB()
        console.log('10. Database connected')

        // IMPORTANT FIX: Remove the isActive: true filter to find the vehicle regardless of its status
        console.log('11. Looking for vehicle with ID:', vehicleId.toString())
        const existingVehicle = await db.collection('vehicles').findOne({
            _id: vehicleId
            // Removed: isActive: true  <- This was the problem!
        })

        console.log('12. Vehicle lookup result:', existingVehicle ? 'Found' : 'Not found')

        if (existingVehicle) {
            console.log('13. Found vehicle details:', {
                id: existingVehicle._id.toString(),
                vehicleNo: existingVehicle.vehicleNo,
                isActive: existingVehicle.isActive
            })
        }

        if (!existingVehicle) {
            console.log('14. Vehicle not found in database')
            return NextResponse.json({
                error: 'Vehicle not found'
            }, { status: 404 })
        }

        // Build partial update object
        const update = {
            updatedAt: new Date(),
            updatedBy: session.user.id
        }

        // Update specific fields if provided
        if (Array.isArray(data.documents)) {
            update.documents = normalizeDocuments(data.documents)
        }

        if (data.isActive !== undefined) {
            update.isActive = data.isActive
            console.log('15. Updating isActive to:', data.isActive)
        }

        if (data.driverId !== undefined) {
            update.driverId = data.driverId ? new ObjectId(data.driverId) : null
            // Handle driver assignment if changed
            if (existingVehicle.driverId?.toString() !== update.driverId?.toString()) {
                // Remove from old driver
                if (existingVehicle.driverId) {
                    await db.collection('users').updateOne(
                        { _id: existingVehicle.driverId },
                        {
                            $unset: { assignedVehicle: "" },
                            $set: { updatedAt: new Date() }
                        }
                    )
                }
                // Assign to new driver
                if (update.driverId) {
                    await db.collection('users').updateOne(
                        { _id: update.driverId },
                        {
                            $set: {
                                assignedVehicle: vehicleId,
                                updatedAt: new Date()
                            }
                        }
                    )
                }
            }
        }

        if (data.manualDriver !== undefined) {
            update.manualDriver = data.manualDriver
        }

        console.log('16. Performing update with:', update)

        const result = await db.collection('vehicles').updateOne(
            { _id: vehicleId },
            { $set: update }
        )

        console.log('17. Update result:', {
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            acknowledged: result.acknowledged
        })

        if (result.matchedCount === 0) {
            console.log('18. No document matched the query')
            return NextResponse.json({
                error: 'Vehicle not found during update'
            }, { status: 404 })
        }

        console.log('19. Update successful')

        return NextResponse.json({
            success: true,
            message: 'Vehicle updated successfully'
        })
    } catch (err) {
        console.error('❌ PATCH vehicle error:', err)
        console.error('Error stack:', err.stack)
        return NextResponse.json({
            error: 'Server error: ' + err.message
        }, { status: 500 })
    }
}
/* ===========================
   DELETE – Single or Bulk Delete
=========================== */
export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !['admin', 'manager'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const data = await req.json()
        // Check if this is a bulk delete
        if (data.ids && Array.isArray(data.ids)) {
            // BULK DELETE
            const { ids } = data
            if (!ids || ids.length === 0) {
                return NextResponse.json(
                    { error: 'Vehicle IDs are required' },
                    { status: 400 }
                )
            }
            const db = await getDB()
            const objectIds = ids.map(id => new ObjectId(id))
            // Find all vehicles to get driver info (only for selected drivers)
            const vehicles = await db.collection('vehicles')
                .find({ _id: { $in: objectIds } })
                .toArray()
            // Remove vehicle assignments from drivers (only for selected drivers)
            const driverIds = vehicles
                .map(v => v.driverId)
                .filter(id => id)
            if (driverIds.length > 0) {
                await db.collection('users').updateMany(
                    { _id: { $in: driverIds } },
                    {
                        $unset: { assignedVehicle: "" },
                        $set: { updatedAt: new Date() }
                    }
                )
            }
            // Soft delete vehicles
            await db.collection('vehicles').updateMany(
                { _id: { $in: objectIds } },
                {
                    $set: {
                        isActive: false,
                        deletedAt: new Date(),
                        deletedBy: session.user.id,
                        updatedAt: new Date()
                    }
                }
            )
            return NextResponse.json({
                success: true,
                message: `${ids.length} vehicle(s) deleted successfully`
            })
        } else {
            // SINGLE DELETE
            const { id } = data
            if (!id) {
                return NextResponse.json(
                    { error: 'Vehicle ID is required' },
                    { status: 400 }
                )
            }
            const db = await getDB()
            const vehicleId = new ObjectId(id)
            // Find vehicle to get driver info
            const vehicle = await db.collection('vehicles').findOne({
                _id: vehicleId,
                isActive: true
            })
            if (!vehicle) {
                return NextResponse.json(
                    { error: 'Vehicle not found' },
                    { status: 404 }
                )
            }
            // Remove vehicle assignment from driver (only if it's a selected driver)
            if (vehicle.driverId) {
                await db.collection('users').updateOne(
                    { _id: vehicle.driverId },
                    {
                        $unset: { assignedVehicle: "" },
                        $set: { updatedAt: new Date() }
                    }
                )
            }
            // Soft delete the vehicle
            await db.collection('vehicles').updateOne(
                { _id: vehicleId },
                {
                    $set: {
                        isActive: false,
                        deletedAt: new Date(),
                        deletedBy: session.user.id,
                        updatedAt: new Date()
                    }
                }
            )
            return NextResponse.json({
                success: true,
                message: 'Vehicle deleted successfully'
            })
        }
    } catch (error) {
        console.error('DELETE error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
/* ===========================
   GET Active Vehicle Count
=========================== */
export async function getActiveVehicleCount() {
    try {
        const db = await getDB()
        const count = await db.collection('vehicles')
            .countDocuments({ isActive: true })
        return count
    } catch (error) {
        console.error('getActiveVehicleCount error:', error)
        return 0
    }
}
