import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
const COLLECTION = 'locations-info'
const LOCATIONS_COLLECTION = 'locations'
const VEHICLE_TYPES_COLLECTION = 'vehicleTypes'
const client = new MongoClient(process.env.DATABASE_URL)
async function getDB() {
    await client.connect()
    return client.db()
}
/* ================= GET ================= */
/* ================= GET ================= */
/* ================= GET ================= */
export async function GET() {
    try {
        const db = await getDB()
        // Fetch all routes
        const routes = await db
            .collection(COLLECTION)
            .find({ isDeleted: { $ne: true } })
            .sort({ srno: 1 })
            .toArray()
        console.log('Raw routes from DB:', JSON.stringify(routes, null, 2));
        // REMOVE THE .project() CLAUSES - fetch all fields
        const locations = await db
            .collection(LOCATIONS_COLLECTION)
            .find({ isDeleted: { $ne: true } })
            .toArray()
        const vehicleTypes = await db
            .collection(VEHICLE_TYPES_COLLECTION)
            .find({ isDeleted: { $ne: true } })
            .toArray()
        console.log('Vehicle types from DB (all fields):', JSON.stringify(vehicleTypes, null, 2));
        console.log('Locations from DB (all fields):', JSON.stringify(locations, null, 2));
        // Create lookup maps
        const locationMap = new Map()
        const vehicleTypeMap = new Map()
        locations.forEach(loc => {
            locationMap.set(loc._id.toString(), {
                _id: loc._id,
                locationName: loc.locationName,
                locationCode: loc.locationCode || null,
                type: loc.type || null
            })
        })
        vehicleTypes.forEach(vt => {
            // Check what fields actually exist in your database
            console.log('Vehicle type document fields:', Object.keys(vt));
            vehicleTypeMap.set(vt._id.toString(), {
                _id: vt._id,
                vehicleType: vt.vehicleType || vt.type || null, // Try multiple field names
                vehicleCode: vt.vehicleCode || vt.srno || vt.code || null // Try multiple field names
            })
        })
        // Enrich routes with location and vehicle type details
        const enrichedRoutes = routes.map(route => {
            console.log('Processing route:', route._id);
            // Extract IDs - convert to string for Map lookup
            const vehicleTypeId = route.vehicleType ? route.vehicleType.toString() : null;
            const fromLocationId = route.fromLocation ? route.fromLocation.toString() : null;
            const viaToId = route.viaTo ? route.viaTo.toString() : null;
            console.log('Vehicle Type ID:', vehicleTypeId);
            console.log('From Location ID:', fromLocationId);
            console.log('ViaTo ID:', viaToId);
            const vehicleType = vehicleTypeId ? vehicleTypeMap.get(vehicleTypeId) || {} : {};
            const fromLocation = fromLocationId ? locationMap.get(fromLocationId) || null : null;
            const viaTo = viaToId ? locationMap.get(viaToId) || null : null;
            console.log('Found vehicleType:', vehicleType);
            return {
                _id: route._id,
                srno: route.srno,
                fromLocation,
                viaTo,
                distanceKm: route.distanceKm,
                routeCode: route.routeCode,
                vehicleType,
                dieselLtr: route.dieselLtr,
                advanceAmount: route.advanceAmount,
                isActive: route.isActive,
                isDeleted: route.isDeleted,
                createdAt: route.createdAt
            };
        })
        return NextResponse.json({ success: true, data: enrichedRoutes })
    } catch (error) {
        console.error('GET error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
/* ================= POST ================= */
export async function POST(req) {
    try {
        const {
            fromLocation,
            viaTo,
            distanceKm,
            routeCode,
            vehicleType,
            dieselLtr,
            advanceAmount,
            isActive
        } = await req.json()
        if (!fromLocation || !viaTo || !routeCode) {
            return NextResponse.json(
                { error: 'From Location, Via/To and Route Code are required' },
                { status: 400 }
            )
        }
        const db = await getDB()
        // ✅ ADD THIS: Check if route code already exists
        const existingRoute = await db.collection(COLLECTION).findOne({
            routeCode: routeCode.trim(),
            isDeleted: { $ne: true }
        })
        if (existingRoute) {
            return NextResponse.json(
                {
                    error: 'Route code already exists. Please use a different code.',
                    field: 'routeCode' // Optional: Helps frontend identify which field has error
                },
                { status: 409 } // 409 Conflict is appropriate for duplicate resources
            )
        }
        // Validate that locations and vehicle type exist
        const fromLocationExists = await db.collection(LOCATIONS_COLLECTION).findOne({
            _id: new ObjectId(fromLocation),
            isDeleted: { $ne: true }
        })
        const viaToExists = await db.collection(LOCATIONS_COLLECTION).findOne({
            _id: new ObjectId(viaTo),
            isDeleted: { $ne: true }
        })
        const vehicleTypeExists = await db.collection(VEHICLE_TYPES_COLLECTION).findOne({
            _id: new ObjectId(vehicleType),
            isDeleted: { $ne: true }
        })
        if (!fromLocationExists) {
            return NextResponse.json(
                { error: 'From Location not found' },
                { status: 404 }
            )
        }
        if (!viaToExists) {
            return NextResponse.json(
                { error: 'Via/To Location not found' },
                { status: 404 }
            )
        }
        if (!vehicleTypeExists) {
            return NextResponse.json(
                { error: 'Vehicle Type not found' },
                { status: 404 }
            )
        }
        const lastRoute = await db
            .collection(COLLECTION)
            .find({ isDeleted: { $ne: true } })
            .sort({ srno: -1 })
            .limit(1)
            .toArray()
        const nextSrNo = lastRoute.length > 0 ? lastRoute[0].srno + 1 : 1
        const payload = {
            srno: Number(nextSrNo),
            fromLocation: new ObjectId(fromLocation),
            viaTo: new ObjectId(viaTo),
            distanceKm: Number(distanceKm),
            routeCode: routeCode.trim(), // ✅ Trim whitespace
            vehicleType: new ObjectId(vehicleType),
            dieselLtr: Number(dieselLtr),
            advanceAmount: Number(advanceAmount),
            isActive: Boolean(isActive),
            isDeleted: false,
            createdAt: new Date()
        }
        const result = await db.collection(COLLECTION).insertOne(payload)
        // Enrich the response with location and vehicle type details
        const enrichedData = {
            _id: result.insertedId,
            ...payload,
            fromLocation: {
                _id: fromLocationExists._id,
                locationName: fromLocationExists.locationName,
                locationCode: fromLocationExists.locationCode,
                type: fromLocationExists.type
            },
            viaTo: {
                _id: viaToExists._id,
                locationName: viaToExists.locationName,
                locationCode: viaToExists.locationCode,
                type: viaToExists.type
            },
            vehicleType: {
                _id: vehicleTypeExists._id,
                vehicleType: vehicleTypeExists.type,
                vehicleCode: vehicleTypeExists.srno
            }
        }
        return NextResponse.json(
            {
                success: true,
                message: 'Route created successfully',
                data: enrichedData
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('POST error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
/* ================= PUT ================= */
export async function PUT(req) {
    try {
        const {
            id,
            fromLocation,
            viaTo,
            distanceKm,
            routeCode,
            vehicleType,
            dieselLtr,
            advanceAmount,
            isActive
        } = await req.json()
        if (!id) {
            return NextResponse.json(
                { error: 'ID is required' },
                { status: 400 }
            )
        }
        const db = await getDB()
        // ✅ ADD THIS: If routeCode is being updated, check for uniqueness
        if (routeCode) {
            const existingRoute = await db.collection(COLLECTION).findOne({
                routeCode: routeCode.trim(),
                _id: { $ne: new ObjectId(id) }, // Exclude current route from check
                isDeleted: { $ne: true }
            })
            if (existingRoute) {
                return NextResponse.json(
                    {
                        error: 'Route code already exists. Please use a different code.',
                        field: 'routeCode'
                    },
                    { status: 409 }
                )
            }
        }
        // Validate that locations and vehicle type exist if provided
        if (fromLocation) {
            const fromLocationExists = await db.collection(LOCATIONS_COLLECTION).findOne({
                _id: new ObjectId(fromLocation),
                isDeleted: { $ne: true }
            })
            if (!fromLocationExists) {
                return NextResponse.json(
                    { error: 'From Location not found' },
                    { status: 404 }
                )
            }
        }
        if (viaTo) {
            const viaToExists = await db.collection(LOCATIONS_COLLECTION).findOne({
                _id: new ObjectId(viaTo),
                isDeleted: { $ne: true }
            })
            if (!viaToExists) {
                return NextResponse.json(
                    { error: 'Via/To Location not found' },
                    { status: 404 }
                )
            }
        }
        if (vehicleType) {
            const vehicleTypeExists = await db.collection(VEHICLE_TYPES_COLLECTION).findOne({
                _id: new ObjectId(vehicleType),
                isDeleted: { $ne: true }
            })
            if (!vehicleTypeExists) {
                return NextResponse.json(
                    { error: 'Vehicle Type not found' },
                    { status: 404 }
                )
            }
        }
        const updateData = {
            ...(fromLocation && { fromLocation: new ObjectId(fromLocation) }),
            ...(viaTo && { viaTo: new ObjectId(viaTo) }),
            ...(distanceKm && { distanceKm: Number(distanceKm) }),
            ...(routeCode && { routeCode: routeCode.trim() }), // ✅ Trim whitespace
            ...(vehicleType && { vehicleType: new ObjectId(vehicleType) }),
            ...(dieselLtr && { dieselLtr: Number(dieselLtr) }),
            ...(advanceAmount && { advanceAmount: Number(advanceAmount) }),
            isActive: Boolean(isActive),
            updatedAt: new Date()
        }
        const result = await db.collection(COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        )
        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Route not found' },
                { status: 404 }
            )
        }
        return NextResponse.json({
            success: true,
            message: 'Route updated successfully'
        })
    } catch (error) {
        console.error('PUT error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
/* ================= DELETE (SOFT) ================= */
export async function DELETE(req) {
    try {
        const { id } = await req.json()
        if (!id) {
            return NextResponse.json(
                { error: 'ID is required' },
                { status: 400 }
            )
        }
        const db = await getDB()
        await db.collection(COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    isDeleted: true,
                    updatedAt: new Date()
                }
            }
        )
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
/* ================= GET SINGLE ROUTE ================= */
export async function GETS(request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID is required' },
                { status: 400 }
            )
        }
        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid ID' },
                { status: 400 }
            )
        }
        const db = await getDB()
        // Fetch the route
        const route = await db.collection(COLLECTION).findOne({
            _id: new ObjectId(id),
            isDeleted: { $ne: true }
        })
        if (!route) {
            return NextResponse.json(
                { success: false, message: 'Route not found' },
                { status: 404 }
            )
        }
        // Fetch related location and vehicle type details
        const [fromLocation, viaTo, vehicleType] = await Promise.all([
            db.collection(LOCATIONS_COLLECTION).findOne({
                _id: route.fromLocation,
                isDeleted: { $ne: true }
            }),
            db.collection(LOCATIONS_COLLECTION).findOne({
                _id: route.viaTo,
                isDeleted: { $ne: true }
            }),
            db.collection(VEHICLE_TYPES_COLLECTION).findOne({
                _id: route.vehicleType,
                isDeleted: { $ne: true }
            })
        ])
        // Enrich the route with fetched details
        const enrichedRoute = {
            ...route,
            fromLocation: fromLocation ? {
                _id: fromLocation._id,
                locationName: fromLocation.locationName,
                locationCode: fromLocation.locationCode,
                type: fromLocation.type
            } : null,
            viaTo: viaTo ? {
                _id: viaTo._id,
                locationName: viaTo.locationName,
                locationCode: viaTo.locationCode,
                type: viaTo.type
            } : null,
            vehicleType: vehicleType ? {
                _id: vehicleType._id,
                vehicleType: vehicleType.vehicleType,
                vehicleCode: vehicleType.vehicleCode
            } : null
        }
        return NextResponse.json(
            { success: true, data: enrichedRoute },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
/* ================= CHECK ROUTE CODE UNIQUENESS ================= */
export async function HEAD(req) {
    try {
        const { searchParams } = new URL(req.url)
        const routeCode = searchParams.get('routeCode')
        const excludeId = searchParams.get('excludeId') // For edit scenarios
        if (!routeCode) {
            return NextResponse.json(
                { error: 'Route code is required' },
                { status: 400 }
            )
        }
        const db = await getDB()
        const query = {
            routeCode: routeCode.trim(),
            isDeleted: { $ne: true }
        }
        // Exclude current route when checking for edits
        if (excludeId && ObjectId.isValid(excludeId)) {
            query._id = { $ne: new ObjectId(excludeId) }
        }
        const existingRoute = await db.collection(COLLECTION).findOne(query)
        // Return 200 if unique, 409 if exists
        const status = existingRoute ? 409 : 200
        return new NextResponse(null, {
            status,
            headers: {
                'X-Route-Code-Available': (!existingRoute).toString()
            }
        })
    } catch (error) {
        console.error('HEAD error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
