// // utils/checkPermission.js
// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/libs/auth'
// import { MongoClient } from 'mongodb'
// import { permissionToDatabaseFormat } from '@/libs/permissions'

// export function checkPermission(requiredPermission) {
//     return function (handler) {
//         return async function (request, ...args) {
//             try {
//                 const session = await getServerSession(authOptions)
//                 if (!session) {
//                     return NextResponse.json(
//                         { error: 'Unauthorized. Please login.' },
//                         { status: 401 }
//                     )
//                 }

//                 const userRole = session.user?.role
//                 if (!userRole) {
//                     return NextResponse.json(
//                         { error: 'No role assigned to user' },
//                         { status: 403 }
//                     )
//                 }

//                 // ✅ ADMIN BYPASS - Admin can do everything
//                 if (userRole === 'admin') {
//                     console.log('✅ Admin access granted for:', requiredPermission)
//                     return await handler(request, ...args)
//                 }

//                 // Connect to database
//                 const client = new MongoClient(process.env.DATABASE_URL)
//                 await client.connect()
//                 const db = client.db()

//                 // Get role from database
//                 const role = await db.collection('roles').findOne({
//                     name: userRole
//                 })

//                 await client.close()

//                 if (!role) {
//                     return NextResponse.json(
//                         {
//                             error: 'Forbidden',
//                             message: `Role '${userRole}' not found in database`
//                         },
//                         { status: 403 }
//                     )
//                 }

//                 // Convert permission to database format (colon → hyphen)
//                 const dbPermission = permissionToDatabaseFormat(requiredPermission)

//                 // Check if user has the permission
//                 const hasPermission = role.permissions?.includes(dbPermission)

//                 if (!hasPermission) {
//                     return NextResponse.json(
//                         {
//                             error: 'Forbidden',
//                             message: `You need '${requiredPermission}' permission`,
//                             yourRole: userRole,
//                             yourPermissions: role.permissions,
//                             requiredPermission: dbPermission
//                         },
//                         { status: 403 }
//                     )
//                 }

//                 // Permission granted
//                 return await handler(request, ...args)
//             } catch (error) {
//                 console.error('Permission error:', error)
//                 return NextResponse.json(
//                     { error: 'Internal server error' },
//                     { status: 500 }
//                 )
//             }
//         }
//     }
// }

// // Helper function to check multiple permissions
// export function checkAnyPermission(permissions) {
//     return function (handler) {
//         return async function (request, ...args) {
//             try {
//                 const session = await getServerSession(authOptions)
//                 if (!session) {
//                     return NextResponse.json(
//                         { error: 'Unauthorized' },
//                         { status: 401 }
//                     )
//                 }

//                 // Admin bypass
//                 if (session.user?.role === 'admin') {
//                     return await handler(request, ...args)
//                 }

//                 // Check if user has ANY of the required permissions
//                 for (const permission of permissions) {
//                     const hasPerm = await checkSinglePermission(session.user?.role, permission)
//                     if (hasPerm) {
//                         return await handler(request, ...args)
//                     }
//                 }

//                 return NextResponse.json(
//                     {
//                         error: 'Forbidden',
//                         message: 'You need one of these permissions: ' + permissions.join(', ')
//                     },
//                     { status: 403 }
//                 )
//             } catch (error) {
//                 console.error('Permission error:', error)
//                 return NextResponse.json(
//                     { error: 'Internal error' },
//                     { status: 500 }
//                 )
//             }
//         }
//     }
// }

// // Helper to check single permission (reusable)
// async function checkSinglePermission(roleName, requiredPermission) {
//     const client = new MongoClient(process.env.DATABASE_URL)
//     await client.connect()
//     const db = client.db()

//     const role = await db.collection('roles').findOne({ name: roleName })
//     await client.close()

//     if (!role) return false

//     const dbPermission = permissionToDatabaseFormat(requiredPermission)
//     return role.permissions?.includes(dbPermission) || false
// }




// utils/checkPermission.js - COMPLETE FIXED VERSION
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'
import { MongoClient } from 'mongodb'
import { permissionToDatabaseFormat } from '@/libs/permissions'

// ============================================
// CORE PERMISSION CHECK FUNCTION
// ============================================
export function checkPermission(requiredPermission) {
    return function (handler) {
        return async function (request, ...args) {
            try {
                const session = await getServerSession(authOptions)
                if (!session) {
                    return NextResponse.json(
                        { error: 'Unauthorized. Please login.' },
                        { status: 401 }
                    )
                }

                const userRole = session.user?.role
                if (!userRole) {
                    return NextResponse.json(
                        { error: 'No role assigned to user' },
                        { status: 403 }
                    )
                }

                // ✅ ADMIN BYPASS
                if (userRole === 'admin') {
                    console.log('✅ Admin access granted for:', requiredPermission)
                    return await handler(request, ...args)
                }

                // Check permission
                const hasPermission = await checkUserPermission(userRole, requiredPermission)

                if (!hasPermission) {
                    // Get role for better error message
                    const role = await getRoleFromDB(userRole)
                    return NextResponse.json(
                        {
                            error: 'Forbidden',
                            message: `You need '${requiredPermission}' permission`,
                            yourRole: userRole,
                            yourPermissions: role?.permissions || []
                        },
                        { status: 403 }
                    )
                }

                // Permission granted
                return await handler(request, ...args)
            } catch (error) {
                console.error('❌ Permission error:', error)
                return NextResponse.json(
                    { error: 'Internal server error' },
                    { status: 500 }
                )
            }
        }
    }
}

// ============================================
// CHECK ANY PERMISSION (OR condition)
// ============================================
export function checkAnyPermission(permissions) {
    return function (handler) {
        return async function (request, ...args) {
            try {
                const session = await getServerSession(authOptions)
                if (!session) {
                    return NextResponse.json(
                        { error: 'Unauthorized' },
                        { status: 401 }
                    )
                }

                const userRole = session.user?.role

                // Admin bypass
                if (userRole === 'admin') {
                    return await handler(request, ...args)
                }

                // Check if user has ANY of the required permissions
                for (const permission of permissions) {
                    const hasPerm = await checkUserPermission(userRole, permission)
                    if (hasPerm) {
                        return await handler(request, ...args)
                    }
                }

                return NextResponse.json(
                    {
                        error: 'Forbidden',
                        message: 'You need one of these permissions: ' + permissions.join(', ')
                    },
                    { status: 403 }
                )
            } catch (error) {
                console.error('❌ Permission error:', error)
                return NextResponse.json(
                    { error: 'Internal error' },
                    { status: 500 }
                )
            }
        }
    }
}

// ============================================
// INTERNAL: Check user permission (reusable)
// ============================================
async function checkUserPermission(roleName, requiredPermission) {
    // Return false if no role or permission
    if (!roleName || !requiredPermission) return false

    let client
    try {
        client = new MongoClient(process.env.DATABASE_URL)
        await client.connect()
        const db = client.db()

        const role = await db.collection('roles').findOne({ name: roleName })

        if (!role) return false

        const dbPermission = permissionToDatabaseFormat(requiredPermission)
        return role.permissions?.includes(dbPermission) || false
    } catch (error) {
        console.error('❌ checkUserPermission error:', error)
        return false
    } finally {
        if (client) await client.close()
    }
}

// ============================================
// INTERNAL: Get role from DB
// ============================================
async function getRoleFromDB(roleName) {
    let client
    try {
        client = new MongoClient(process.env.DATABASE_URL)
        await client.connect()
        const db = client.db()
        return await db.collection('roles').findOne({ name: roleName })
    } catch (error) {
        console.error('❌ getRoleFromDB error:', error)
        return null
    } finally {
        if (client) await client.close()
    }
}

// ============================================
// PUBLIC: Quick permission check (without handler)
// ============================================
export async function hasPermission(userRole, requiredPermission) {
    return await checkUserPermission(userRole, requiredPermission)
}

// ============================================
// PUBLIC: Bulk permission check
// ============================================
export async function checkBulkPermission(userRole, module, operation) {
    if (userRole === 'admin') return true

    const bulkPermissionMap = {
        vehicles: {
            update: 'vehicles:bulk-update',
            delete: 'vehicles:bulk-delete',
            status: 'vehicles:bulk-status'
        },
        marketVehicles: {
            update: 'market-vehicles:bulk-update',
            delete: 'market-vehicles:bulk-delete',
            status: 'market-vehicles:bulk-status'
        },
        trips: {
            update: 'trips:bulk-update',
            delete: 'trips:bulk-delete',
            status: 'trips:bulk-status'
        },
        marketTrips: {
            update: 'market-trips:bulk-update',
            delete: 'market-trips:bulk-delete',
            status: 'market-trips:bulk-status'
        },
        advance: {
            update: 'advance:bulk-update',
            delete: 'advance:bulk-delete',
            status: 'advance:bulk-status'
        },
        marketAdvance: {
            update: 'market-advance:bulk-update',
            delete: 'market-advance:bulk-delete',
            status: 'market-advance:bulk-status'
        }
    }

    const requiredPermission = bulkPermissionMap[module]?.[operation]
    if (!requiredPermission) return false

    return await checkUserPermission(userRole, requiredPermission)
}
