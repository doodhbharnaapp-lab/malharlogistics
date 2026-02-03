// // import { NextResponse } from 'next/server'
// // import { MongoClient, ObjectId } from 'mongodb'
// // import { getServerSession } from 'next-auth'
// // import { authOptions } from '@/libs/auth'
// // /* ===========================
// //    Mongo Connection
// // =========================== */
// // const client = new MongoClient(process.env.DATABASE_URL)
// // async function getDB() {
// //     await client.connect()
// //     return client.db()
// // }
// // /* ===========================
// //    Helpers
// // =========================== */
// // function normalizeDocuments(documents = []) {
// //     const today = new Date()
// //     today.setHours(0, 0, 0, 0)
// //     return documents.map(doc => {
// //         const expiry = new Date(doc.expiryDate)
// //         expiry.setHours(0, 0, 0, 0)
// //         return {
// //             documentType: doc.documentType,
// //             expiryDate: expiry,
// //             isExpired: expiry < today
// //         }
// //     })
// // }
// // /* ===========================   GET =========================== */
// // export async function GET(req) {
// //     try {
// //         const session = await getServerSession(authOptions)
// //         if (!session) {
// //             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
// //         }
// //         const { searchParams } = new URL(req.url)
// //         const action = searchParams.get('action')
// //         const id = searchParams.get('id')
// //         const db = await getDB()
// //         /* ===== SINGLE VEHICLE ===== */
// //         if (id) {
// //             const vehicle = await db.collection('vehicles').findOne({
// //                 _id: new ObjectId(id),
// //                 isActive: true
// //             })
// //             return NextResponse.json({ success: true, data: vehicle })
// //         }
// //         /* ===== VEHICLE LIST ===== */
// //         if (!action || action === 'list') {
// //             const vehicles = await db.collection('vehicles').aggregate([
// //                 { $match: { isActive: true } },
// //                 {
// //                     $lookup: {
// //                         from: 'vehicleOwners',
// //                         localField: 'ownerId',
// //                         foreignField: '_id',
// //                         as: 'owner'
// //                     }
// //                 },
// //                 {
// //                     $lookup: {
// //                         from: 'users',
// //                         let: { driverId: '$driverId' },
// //                         pipeline: [
// //                             { $match: { $expr: { $eq: ['$_id', '$$driverId'] } } },
// //                             { $project: { name: 1, contact: 1 } }
// //                         ],
// //                         as: 'driver'
// //                     }
// //                 },
// //                 {
// //                     $addFields: {
// //                         ownerName: { $arrayElemAt: ['$owner.fullName', 0] },
// //                         driverName: { $arrayElemAt: ['$driver.name', 0] },
// //                         driverMobile: { $arrayElemAt: ['$driver.contact', 0] }
// //                     }
// //                 },
// //                 { $project: { owner: 0, driver: 0 } },
// //                 { $sort: { createdAt: -1 } }
// //             ]).toArray()
// //             return NextResponse.json({ success: true, data: vehicles })
// //         }
// //         /* ===== FORM DATA ===== */
// //         if (action === 'form-data') {
// //             const owners = await db.collection('vehicleOwners')
// //                 .find({ isActive: true })
// //                 .project({ fullName: 1, mobile: 1 })
// //                 .toArray()
// //             const drivers = await db.collection('users')
// //                 .find({ role: 'driver', isActive: true })
// //                 .project({ name: 1, contact: 1 })
// //                 .toArray()
// //             return NextResponse.json({
// //                 success: true,
// //                 data: { owners, drivers }
// //             })
// //         }
// //         return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
// //     } catch (err) {
// //         console.error('GET vehicles error:', err)
// //         return NextResponse.json({ error: 'Server error' }, { status: 500 })
// //     }
// // }
// // /* ===========================
// //    POST – Create Vehicle
// // =========================== */
// // export async function POST(req) {
// //     try {
// //         const session = await getServerSession(authOptions)
// //         if (!session || !['admin', 'manager'].includes(session.user.role)) {
// //             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
// //         }
// //         const data = await req.json()
// //         const db = await getDB()
// //         if (!data.vehicleNo || !data.ownerId || !data.vehicleModel) {
// //             return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
// //         }
// //         const exists = await db.collection('vehicles').findOne({
// //             vehicleNo: data.vehicleNo
// //         })
// //         if (exists) {
// //             return NextResponse.json({ error: 'Vehicle already exists' }, { status: 400 })
// //         }
// //         const vehicle = {
// //             vehicleNo: data.vehicleNo,
// //             ownerId: new ObjectId(data.ownerId),
// //             driverId: data.driverId ? new ObjectId(data.driverId) : null,
// //             model: data.vehicleModel,
// //             bankName: data.bankName,
// //             accountNo: data.accountNo,
// //             ifscCode: data.ifscCode,
// //             accountHolderName: data.accountHolderName,
// //             documents: normalizeDocuments(data.documents),
// //             isActive: data.isActive ?? true,
// //             createdAt: new Date(),
// //             updatedAt: new Date()
// //         }
// //         const result = await db.collection('vehicles').insertOne(vehicle)
// //         return NextResponse.json({ success: true, id: result.insertedId, "result is": data })
// //     } catch (err) {
// //         console.error('POST vehicle error:', err)
// //         return NextResponse.json({ error: 'Server error' }, { status: 500 })
// //     }
// // }
// // /* ===========================
// //    PUT – Update Vehicle
// // =========================== */
// // export async function PUT(req) {
// //     try {
// //         const session = await getServerSession(authOptions)
// //         if (!session || !['admin', 'manager'].includes(session.user.role)) {
// //             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
// //         }
// //         const data = await req.json()
// //         if (!data.id) {
// //             return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 })
// //         }
// //         const db = await getDB()
// //         const update = {
// //             vehicleNo: data.vehicleNo,
// //             ownerId: new ObjectId(data.ownerId),
// //             driverId: data.driverId ? new ObjectId(data.driverId) : null,
// //             model: data.vehicleModel,
// //             bankName: data.bankName,
// //             accountNo: data.accountNo,
// //             ifscCode: data.ifscCode,
// //             accountHolderName: data.accountHolderName,
// //             documents: normalizeDocuments(data.documents),
// //             isActive: data.isActive ?? true,
// //             createdAt: new Date(),
// //             updatedAt: new Date()
// //         }
// //         await db.collection('vehicles').updateOne(
// //             { _id: new ObjectId(data.id) },
// //             { $set: update }
// //         )
// //         return NextResponse.json({ success: true })
// //     } catch (err) {
// //         console.error('PUT vehicle error:', err)
// //         return NextResponse.json({ error: 'Server error' }, { status: 500 })
// //     }
// // }
// // /* ===========================
// //    DELETE – Soft Delete
// // =========================== */
// // export async function DELETE(req) {
// //     try {
// //         const { id } = await req.json()
// //         if (!id) {
// //             return NextResponse.json(
// //                 { error: 'ID is required' },
// //                 { status: 400 }
// //             )
// //         }
// //         const db = await getDB()
// //         await db.collection('vehicles').updateOne(
// //             { _id: new ObjectId(id) },
// //             {
// //                 $set: {
// //                     isDeleted: true,
// //                     updatedAt: new Date()
// //                 }
// //             }
// //         )
// //         return NextResponse.json({ success: true })
// //     } catch (error) {
// //         console.error('DELETE error:', error)
// //         return NextResponse.json(
// //             { error: error.message },
// //             { status: 500 }
// //         )
// //     }
// // }
// // // New function to get active vehicle count
// // export async function getActiveVehicleCount() {
// //     const db = await getDB()
// //     const count = await db.collection('vehicles').countDocuments({ isActive: true })
// //     return count
// // }
// import { NextResponse } from 'next/server'
// import { MongoClient, ObjectId } from 'mongodb'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/libs/auth'
// /* ===========================
//    Mongo Connection
// =========================== */
// const client = new MongoClient(process.env.DATABASE_URL)
// async function getDB() {
//     await client.connect()
//     return client.db()
// }
// /* ===========================
//    Helpers
// =========================== */
// function normalizeDocuments(documents = []) {
//     const today = new Date()
//     today.setHours(0, 0, 0, 0)
//     return documents.map(doc => {
//         const expiry = new Date(doc.expiryDate)
//         expiry.setHours(0, 0, 0, 0)
//         return {
//             documentType: doc.documentType,
//             expiryDate: expiry,
//             imageUrl: doc.imageUrl || '',
//             publicId: doc.publicId || '',
//             isExpired: expiry < today
//         }
//     })
// }
// /* ===========================
//    GET - Vehicle Types
// =========================== */
// export async function GET(req) {
//     try {
//         const session = await getServerSession(authOptions)
//         if (!session) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//         }
//         const { searchParams } = new URL(req.url)
//         const action = searchParams.get('action')
//         const id = searchParams.get('id')
//         const db = await getDB()
//         /* ===== VEHICLE TYPES ===== */
//         if (action === 'types') {
//             const vehicleTypes = await db.collection('vehicleTypes')
//                 .find({ isActive: true })
//                 .project({ type: 1, description: 1 })
//                 .toArray()
//             return NextResponse.json({
//                 success: true,
//                 data: vehicleTypes
//             })
//         }
//         /* ===== SINGLE VEHICLE ===== */
//         if (id) {
//             const vehicle = await db.collection('vehicles').findOne({
//                 _id: new ObjectId(id),
//                 isActive: true
//             })
//             // Format dates for display
//             if (vehicle?.documents) {
//                 vehicle.documents = vehicle.documents.map(doc => ({
//                     ...doc,
//                     expiryDate: doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : ''
//                 }))
//             }
//             return NextResponse.json({ success: true, data: vehicle })
//         }
//         /* ===== VEHICLE LIST ===== */
//         if (!action || action === 'list') {
//             const vehicles = await db.collection('vehicles').aggregate([
//                 { $match: { isActive: true } },
//                 {
//                     $lookup: {
//                         from: 'vehicleOwners',
//                         localField: 'ownerId',
//                         foreignField: '_id',
//                         as: 'owner'
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: 'vehicleTypes',
//                         let: { modelId: '$model' },
//                         pipeline: [
//                             { $match: { $expr: { $eq: ['$_id', '$$modelId'] } } },
//                             { $project: { type: 1 } }
//                         ],
//                         as: 'vehicleType'
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: 'users',
//                         let: { driverId: '$driverId' },
//                         pipeline: [
//                             { $match: { $expr: { $eq: ['$_id', '$$driverId'] } } },
//                             { $project: { name: 1, contact: 1 } }
//                         ],
//                         as: 'driver'
//                     }
//                 },
//                 {
//                     $addFields: {
//                         ownerName: { $arrayElemAt: ['$owner.fullName', 0] },
//                         vehicleType: { $arrayElemAt: ['$vehicleType.type', 0] },
//                         driverName: { $arrayElemAt: ['$driver.name', 0] },
//                         driverMobile: { $arrayElemAt: ['$driver.contact', 0] },
//                         expiredDocumentsCount: {
//                             $size: {
//                                 $filter: {
//                                     input: '$documents',
//                                     as: 'doc',
//                                     cond: { $eq: ['$$doc.isExpired', true] }
//                                 }
//                             }
//                         },
//                         hasDocuments: { $gt: [{ $size: '$documents' }, 0] }
//                     }
//                 },
//                 { $project: { owner: 0, driver: 0, vehicleTypeArray: 0 } },
//                 { $sort: { createdAt: -1 } }
//             ]).toArray()
//             return NextResponse.json({ success: true, data: vehicles })
//         }
//         /* ===== FORM DATA ===== */
//         if (action === 'form-data') {
//             const owners = await db.collection('vehicleOwners')
//                 .find({ isActive: true })
//                 .project({ fullName: 1, mobile: 1 })
//                 .toArray()
//             const drivers = await db.collection('users')
//                 .find({ role: 'driver', isActive: true })
//                 .project({ name: 1, contact: 1 })
//                 .toArray()
//             return NextResponse.json({
//                 success: true,
//                 data: { owners, drivers }
//             })
//         }
//         return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
//     } catch (err) {
//         console.error('GET vehicles error:', err)
//         return NextResponse.json({ error: 'Server error' }, { status: 500 })
//     }
// }
// /* ===========================
//    POST – Create Vehicle
// =========================== */
// export async function POST(req) {
//     try {
//         const session = await getServerSession(authOptions)
//         if (!session || !['admin', 'manager'].includes(session.user.role)) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//         }
//         const data = await req.json()
//         const db = await getDB()
//         // Validate required fields
//         if (!data.vehicleNo || !data.ownerId || !data.vehicleModel) {
//             return NextResponse.json({
//                 error: 'Vehicle number, owner, and vehicle type are required'
//             }, { status: 400 })
//         }
//         // Check if vehicle already exists (case-insensitive)
//         const exists = await db.collection('vehicles').findOne({
//             vehicleNo: { $regex: new RegExp(`^${data.vehicleNo}$`, 'i') },
//             isActive: true
//         })
//         if (exists) {
//             return NextResponse.json({
//                 error: `Vehicle ${data.vehicleNo} already exists`
//             }, { status: 400 })
//         }
//         // Create vehicle document
//         const vehicle = {
//             vehicleNo: data.vehicleNo.toUpperCase(),
//             ownerId: new ObjectId(data.ownerId),
//             driverId: data.driverId ? new ObjectId(data.driverId) : null,
//             // model: new ObjectId(data.vehicleModel),
//             model: data.vehicleModel,
//             bankName: data.bankName || '',
//             accountNo: data.accountNo || '',
//             ifscCode: data.ifscCode || '',
//             accountHolderName: data.accountHolderName || '',
//             documents: normalizeDocuments(data.documents || []),
//             isActive: data.isActive ?? true,
//             createdBy: session.user.id,
//             createdAt: new Date(),
//             updatedAt: new Date()
//         }
//         const result = await db.collection('vehicles').insertOne(vehicle)
//         // Update owner with vehicle reference
//         if (data.driverId) {
//             await db.collection('users').updateOne(
//                 { _id: new ObjectId(data.driverId) },
//                 {
//                     $set: {
//                         assignedVehicle: result.insertedId,
//                         updatedAt: new Date()
//                     }
//                 }
//             )
//         }
//         return NextResponse.json({
//             success: true,
//             id: result.insertedId,
//             message: 'Vehicle created successfully'
//         })
//     } catch (err) {
//         console.error('POST vehicle error:', err)
//         return NextResponse.json({ error: 'Server error' }, { status: 500 })
//     }
// }
// /* ===========================
//    PUT – Update Vehicle
// =========================== */
// export async function PUT(req) {
//     try {
//         const session = await getServerSession(authOptions)
//         if (!session || !['admin', 'manager'].includes(session.user.role)) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//         }
//         const data = await req.json()
//         if (!data.id) {
//             return NextResponse.json({
//                 error: 'Vehicle ID required'
//             }, { status: 400 })
//         }
//         if (!data.vehicleNo || !data.ownerId || !data.vehicleModel) {
//             return NextResponse.json({
//                 error: 'Vehicle number, owner, and vehicle type are required'
//             }, { status: 400 })
//         }
//         const db = await getDB()
//         const vehicleId = new ObjectId(data.id)
//         // Check if vehicle exists
//         const existingVehicle = await db.collection('vehicles').findOne({
//             _id: vehicleId,
//             isActive: true
//         })
//         if (!existingVehicle) {
//             return NextResponse.json({
//                 error: 'Vehicle not found'
//             }, { status: 404 })
//         }
//         // Check if new vehicle number conflicts with another vehicle
//         if (data.vehicleNo !== existingVehicle.vehicleNo) {
//             const duplicate = await db.collection('vehicles').findOne({
//                 vehicleNo: { $regex: new RegExp(`^${data.vehicleNo}$`, 'i') },
//                 _id: { $ne: vehicleId },
//                 isActive: true
//             })
//             if (duplicate) {
//                 return NextResponse.json({
//                     error: `Vehicle ${data.vehicleNo} already exists`
//                 }, { status: 400 })
//             }
//         }
//         // Handle driver assignment changes
//         const previousDriverId = existingVehicle.driverId
//         const newDriverId = data.driverId ? new ObjectId(data.driverId) : null
//         // If driver changed, update both old and new driver records
//         if (previousDriverId?.toString() !== newDriverId?.toString()) {
//             // Remove vehicle from previous driver
//             if (previousDriverId) {
//                 await db.collection('users').updateOne(
//                     { _id: previousDriverId },
//                     {
//                         $unset: { assignedVehicle: "" },
//                         $set: { updatedAt: new Date() }
//                     }
//                 )
//             }
//             // Assign vehicle to new driver
//             if (newDriverId) {
//                 await db.collection('users').updateOne(
//                     { _id: newDriverId },
//                     {
//                         $set: {
//                             assignedVehicle: vehicleId,
//                             updatedAt: new Date()
//                         }
//                     }
//                 )
//             }
//         }
//         // Prepare update document
//         const update = {
//             vehicleNo: data.vehicleNo.toUpperCase(),
//             ownerId: new ObjectId(data.ownerId),
//             driverId: newDriverId,
//             model: new ObjectId(data.vehicleModel),
//             bankName: data.bankName || '',
//             accountNo: data.accountNo || '',
//             ifscCode: data.ifscCode || '',
//             accountHolderName: data.accountHolderName || '',
//             documents: normalizeDocuments(data.documents || []),
//             isActive: data.isActive ?? true,
//             updatedBy: session.user.id,
//             updatedAt: new Date()
//         }
//         await db.collection('vehicles').updateOne(
//             { _id: vehicleId },
//             { $set: update }
//         )
//         return NextResponse.json({
//             success: true,
//             message: 'Vehicle updated successfully'
//         })
//     } catch (err) {
//         console.error('PUT vehicle error:', err)
//         return NextResponse.json({ error: 'Server error' }, { status: 500 })
//     }
// }
// /* ===========================
//    PATCH – Update Documents Only
// =========================== */
// export async function PATCH(req) {
//     try {
//         const session = await getServerSession(authOptions)
//         if (!session || !['admin', 'manager'].includes(session.user.role)) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//         }
//         const data = await req.json()
//         if (!data.id || !Array.isArray(data.documents)) {
//             return NextResponse.json({
//                 error: 'Vehicle ID and documents array are required'
//             }, { status: 400 })
//         }
//         const db = await getDB()
//         await db.collection('vehicles').updateOne(
//             { _id: new ObjectId(data.id) },
//             {
//                 $set: {
//                     documents: normalizeDocuments(data.documents),
//                     updatedAt: new Date(),
//                     updatedBy: session.user.id
//                 }
//             }
//         )
//         return NextResponse.json({
//             success: true,
//             message: 'Documents updated successfully'
//         })
//     } catch (err) {
//         console.error('PATCH documents error:', err)
//         return NextResponse.json({ error: 'Server error' }, { status: 500 })
//     }
// }
// /* ===========================
//    PUT – Update Bulk Vehicle Status
// =========================== */
// export async function BulkPUT(req) {
//     try {
//         const session = await getServerSession(authOptions)
//         if (!session || !['admin', 'manager'].includes(session.user.role)) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//         }
//         const { ids, isActive } = await req.json()
//         if (!ids || !Array.isArray(ids) || ids.length === 0) {
//             return NextResponse.json(
//                 { error: 'Vehicle IDs are required' },
//                 { status: 400 }
//             )
//         }
//         const db = await getDB()
//         const objectIds = ids.map(id => new ObjectId(id))
//         await db.collection('vehicles').updateMany(
//             { _id: { $in: objectIds } },
//             {
//                 $set: {
//                     isActive: isActive,
//                     updatedAt: new Date(),
//                     updatedBy: session.user.id
//                 }
//             }
//         )
//         return NextResponse.json({
//             success: true,
//             message: `${ids.length} vehicle(s) updated successfully`
//         })
//     } catch (error) {
//         console.error('Bulk status update error:', error)
//         return NextResponse.json(
//             { error: error.message },
//             { status: 500 }
//         )
//     }
// }
// /* ===========================
//    DELETE – Soft Delete
// =========================== */
// export async function DELETE(req) {
//     try {
//         const session = await getServerSession(authOptions)
//         if (!session || !['admin', 'manager'].includes(session.user.role)) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//         }
//         const { id } = await req.json()
//         if (!id) {
//             return NextResponse.json(
//                 { error: 'Vehicle ID is required' },
//                 { status: 400 }
//             )
//         }
//         const db = await getDB()
//         const vehicleId = new ObjectId(id)
//         // Find vehicle to get driver info
//         const vehicle = await db.collection('vehicles').findOne({
//             _id: vehicleId,
//             isActive: true
//         })
//         if (!vehicle) {
//             return NextResponse.json(
//                 { error: 'Vehicle not found' },
//                 { status: 404 }
//             )
//         }
//         // Remove vehicle assignment from driver
//         if (vehicle.driverId) {
//             await db.collection('users').updateOne(
//                 { _id: vehicle.driverId },
//                 {
//                     $unset: { assignedVehicle: "" },
//                     $set: { updatedAt: new Date() }
//                 }
//             )
//         }
//         // Soft delete the vehicle
//         await db.collection('vehicles').updateOne(
//             { _id: vehicleId },
//             {
//                 $set: {
//                     isActive: false,
//                     deletedAt: new Date(),
//                     deletedBy: session.user.id,
//                     updatedAt: new Date()
//                 }
//             }
//         )
//         return NextResponse.json({
//             success: true,
//             message: 'Vehicle deleted successfully'
//         })
//     } catch (error) {
//         console.error('DELETE error:', error)
//         return NextResponse.json(
//             { error: error.message },
//             { status: 500 }
//         )
//     }
// }
// /* ===========================
//    DELETE – Bulk Delete
// =========================== */
// export async function BulkDELETE(req) {
//     try {
//         const session = await getServerSession(authOptions)
//         if (!session || !['admin', 'manager'].includes(session.user.role)) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//         }
//         const { ids } = await req.json()
//         if (!ids || !Array.isArray(ids) || ids.length === 0) {
//             return NextResponse.json(
//                 { error: 'Vehicle IDs are required' },
//                 { status: 400 }
//             )
//         }
//         const db = await getDB()
//         const objectIds = ids.map(id => new ObjectId(id))
//         // Find all vehicles to get driver info
//         const vehicles = await db.collection('vehicles')
//             .find({ _id: { $in: objectIds } })
//             .toArray()
//         // Remove vehicle assignments from drivers
//         const driverIds = vehicles
//             .map(v => v.driverId)
//             .filter(id => id)
//         if (driverIds.length > 0) {
//             await db.collection('users').updateMany(
//                 { _id: { $in: driverIds } },
//                 {
//                     $unset: { assignedVehicle: "" },
//                     $set: { updatedAt: new Date() }
//                 }
//             )
//         }
//         // Soft delete vehicles
//         await db.collection('vehicles').updateMany(
//             { _id: { $in: objectIds } },
//             {
//                 $set: {
//                     isActive: false,
//                     deletedAt: new Date(),
//                     deletedBy: session.user.id,
//                     updatedAt: new Date()
//                 }
//             }
//         )
//         return NextResponse.json({
//             success: true,
//             message: `${ids.length} vehicle(s) deleted successfully`
//         })
//     } catch (error) {
//         console.error('Bulk DELETE error:', error)
//         return NextResponse.json(
//             { error: error.message },
//             { status: 500 }
//         )
//     }
// }
// /* ===========================
//    GET Active Vehicle Count
// =========================== */
// export async function getActiveVehicleCount() {
//     try {
//         const db = await getDB()
//         const count = await db.collection('vehicles')
//             .countDocuments({ isActive: true })
//         return count
//     } catch (error) {
//         console.error('getActiveVehicleCount error:', error)
//         return 0
//     }
// }
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
// export async function GET(req) {
//     try {
//         const session = await getServerSession(authOptions)
//         if (!session) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//         }
//         const { searchParams } = new URL(req.url)
//         const action = searchParams.get('action')
//         const id = searchParams.get('id')
//         const db = await getDB()
//         /* ===== VEHICLE TYPES ===== */
//         if (action === 'types') {
//             const vehicleTypes = await db.collection('vehicleTypes')
//                 .find({ isActive: true })
//                 .project({ type: 1, description: 1 })
//                 .toArray()
//             return NextResponse.json({
//                 success: true,
//                 data: vehicleTypes
//             })
//         }
//         /* ===== SINGLE VEHICLE ===== */
//         if (id) {
//             const vehicle = await db.collection('vehicles').findOne({
//                 _id: new ObjectId(id),
//                 isActive: true
//             })
//             // Format dates for display
//             if (vehicle?.documents) {
//                 vehicle.documents = vehicle.documents.map(doc => ({
//                     ...doc,
//                     expiryDate: doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : ''
//                 }))
//             }
//             return NextResponse.json({ success: true, data: vehicle })
//         }
//         /* ===== VEHICLE LIST ===== */
//         if (!action || action === 'list') {
//             const vehicles = await db.collection('vehicles').aggregate([
//                 { $match: { isActive: true } },
//                 {
//                     $lookup: {
//                         from: 'vehicleOwners',
//                         localField: 'ownerId',
//                         foreignField: '_id',
//                         as: 'owner'
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: 'vehicleTypes',
//                         let: { modelId: '$model' },
//                         pipeline: [
//                             { $match: { $expr: { $eq: ['$_id', '$$modelId'] } } },
//                             { $project: { type: 1 } }
//                         ],
//                         as: 'vehicleType'
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: 'users',
//                         let: { driverId: '$driverId' },
//                         pipeline: [
//                             { $match: { $expr: { $eq: ['$_id', '$$driverId'] } } },
//                             { $project: { name: 1, contact: 1 } }
//                         ],
//                         as: 'driver'
//                     }
//                 },
//                 {
//                     $addFields: {
//                         ownerName: { $arrayElemAt: ['$owner.fullName', 0] },
//                         vehicleType: { $arrayElemAt: ['$vehicleType.type', 0] },
//                         driverName: { $arrayElemAt: ['$driver.name', 0] },
//                         driverMobile: { $arrayElemAt: ['$driver.contact', 0] },
//                         expiredDocumentsCount: {
//                             $size: {
//                                 $filter: {
//                                     input: '$documents',
//                                     as: 'doc',
//                                     cond: { $eq: ['$$doc.isExpired', true] }
//                                 }
//                             }
//                         },
//                         hasDocuments: { $gt: [{ $size: '$documents' }, 0] }
//                     }
//                 },
//                 { $project: { owner: 0, driver: 0, vehicleTypeArray: 0 } },
//                 { $sort: { createdAt: -1 } }
//             ]).toArray()
//             return NextResponse.json({ success: true, data: vehicles })
//         }
//         /* ===== FORM DATA ===== */
//         if (action === 'form-data') {
//             const owners = await db.collection('vehicleOwners')
//                 .find({ isActive: true })
//                 .project({ fullName: 1, mobile: 1 })
//                 .toArray()
//             const drivers = await db.collection('users')
//                 .find({ role: 'driver', isActive: true })
//                 .project({ name: 1, contact: 1 })
//                 .toArray()
//             return NextResponse.json({
//                 success: true,
//                 data: { owners, drivers }
//             })
//         }
//         return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
//     } catch (err) {
//         console.error('GET vehicles error:', err)
//         return NextResponse.json({ error: 'Server error' }, { status: 500 })
//     }
// }
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
        const vehicleNo = searchParams.get('vehicleNo') // ADD THIS LINE
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
        if (vehicleNo) { // ADD THIS SECTION
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
                        driverName: { $arrayElemAt: ['$driver.name', 0] },
                        driverMobile: { $arrayElemAt: ['$driver.contact', 0] },
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
                        driverName: { $arrayElemAt: ['$driver.name', 0] },
                        driverMobile: { $arrayElemAt: ['$driver.contact', 0] },
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
        // Update owner with vehicle reference
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
            // Handle driver assignment changes
            const previousDriverId = existingVehicle.driverId
            const newDriverId = data.driverId ? new ObjectId(data.driverId) : null
            // If driver changed, update both old and new driver records
            if (previousDriverId?.toString() !== newDriverId?.toString()) {
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
            // Prepare update document
            const update = {
                vehicleNo: data.vehicleNo.toUpperCase(),
                ownerId: new ObjectId(data.ownerId),
                driverId: newDriverId,
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
        if (!session || !['admin', 'manager'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const data = await req.json()
        if (!data.id) {
            return NextResponse.json({
                error: 'Vehicle ID is required'
            }, { status: 400 })
        }
        const db = await getDB()
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
        await db.collection('vehicles').updateOne(
            { _id: vehicleId },
            { $set: update }
        )
        return NextResponse.json({
            success: true,
            message: 'Vehicle updated successfully'
        })
    } catch (err) {
        console.error('PATCH vehicle error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
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
            // Find all vehicles to get driver info
            const vehicles = await db.collection('vehicles')
                .find({ _id: { $in: objectIds } })
                .toArray()
            // Remove vehicle assignments from drivers
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
            // Remove vehicle assignment from driver
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
