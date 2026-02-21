// libs/permissions.js
export const PERMISSIONS = {
    // User Management
    userManagement: {
        READ: 'user-management:read',
        WRITE: 'user-management:write',
        CREATE: 'user-management:create',
        DELETE: 'user-management:delete'
    },
    // ✅ ADD VEHICLE OWNERS
    vehicleOwners: {
        READ: 'vehicle-owners:read',
        WRITE: 'vehicle-owners:write',
        CREATE: 'vehicle-owners:create',
        DELETE: 'vehicle-owners:delete'
    },
    // Vehicles Module
    vehicles: {
        READ: 'vehicles:read',
        WRITE: 'vehicles:write',
        CREATE: 'vehicles:create',
        DELETE: 'vehicles:delete',
        BULK_UPDATE: 'vehicles:bulk-update',
        BULK_DELETE: 'vehicles:bulk-delete',
        BULK_STATUS: 'vehicles:bulk-status'
    },
    // Market Vehicles Module
    marketVehicles: {
        READ: 'market-vehicles:read',
        WRITE: 'market-vehicles:write',
        CREATE: 'market-vehicles:create',
        DELETE: 'market-vehicles:delete',
        BULK_UPDATE: 'market-vehicles:bulk-update',
        BULK_DELETE: 'market-vehicles:bulk-delete',
        BULK_STATUS: 'market-vehicles:bulk-status'
    },
    // Trips Module
    trips: {
        READ: 'trips:read',
        WRITE: 'trips:write',
        CREATE: 'trips:create',
        DELETE: 'trips:delete',
        BULK_UPDATE: 'trips:bulk-update',
        BULK_DELETE: 'trips:bulk-delete',
        BULK_STATUS: 'trips:bulk-status'
    },
    // Market Trips Module
    marketTrips: {
        READ: 'market-trips:read',
        WRITE: 'market-trips:write',
        CREATE: 'market-trips:create',
        DELETE: 'market-trips:delete',
        BULK_UPDATE: 'market-trips:bulk-update',
        BULK_DELETE: 'market-trips:bulk-delete',
        BULK_STATUS: 'market-trips:bulk-status'
    },
    // Advance Module
    advance: {
        READ: 'advance:read',
        WRITE: 'advance:write',
        CREATE: 'advance:create',
        DELETE: 'advance:delete',
        DIESEL_ONLY: 'advance:diesel-only',
        BULK_UPDATE: 'advance:bulk-update',
        BULK_DELETE: 'advance:bulk-delete',
        BULK_STATUS: 'advance:bulk-status'
    },
    // Market Advance Module
    marketAdvance: {
        READ: 'market-advance:read',
        WRITE: 'market-advance:write',
        CREATE: 'market-advance:create',
        DELETE: 'market-advance:delete',
        BULK_UPDATE: 'market-advance:bulk-update',
        BULK_DELETE: 'market-advance:bulk-delete',
        BULK_STATUS: 'market-advance:bulk-status'
    }
}
// ✅ UPDATE permissionToDatabaseFormat function
export function permissionToDatabaseFormat(permission) {
    const mapping = {
        // Vehicle Owners
        'vehicle-owners:read': 'vehicle-owners-read',
        'vehicle-owners:write': 'vehicle-owners-write',
        'vehicle-owners:create': 'vehicle-owners-create',
        'vehicle-owners:delete': 'vehicle-owners-delete',
        // User Management
        'user-management:read': 'user-management-read',
        'user-management:write': 'user-management-write',
        'user-management:create': 'user-management-create',
        'user-management:delete': 'user-management-delete',
        // Vehicles
        'vehicles:read': 'vehicles-read',
        'vehicles:write': 'vehicles-write',
        'vehicles:create': 'vehicles-create',
        'vehicles:delete': 'vehicles-delete',
        'vehicles:bulk-update': 'vehicles-bulk-update',
        'vehicles:bulk-delete': 'vehicles-bulk-delete',
        'vehicles:bulk-status': 'vehicles-bulk-status',
        // Market Vehicles
        'market-vehicles:read': 'market-vehicles-read',
        'market-vehicles:write': 'market-vehicles-write',
        'market-vehicles:create': 'market-vehicles-create',
        'market-vehicles:delete': 'market-vehicles-delete',
        'market-vehicles:bulk-update': 'market-vehicles-bulk-update',
        'market-vehicles:bulk-delete': 'market-vehicles-bulk-delete',
        'market-vehicles:bulk-status': 'market-vehicles-bulk-status',
        // Trips
        'trips:read': 'trips-read',
        'trips:write': 'trips-write',
        'trips:create': 'trips-create',
        'trips:delete': 'trips-delete',
        'trips:bulk-update': 'trips-bulk-update',
        'trips:bulk-delete': 'trips-bulk-delete',
        'trips:bulk-status': 'trips-bulk-status',
        // Market Trips
        'market-trips:read': 'market-trips-read',
        'market-trips:write': 'market-trips-write',
        'market-trips:create': 'market-trips-create',
        'market-trips:delete': 'market-trips-delete',
        'market-trips:bulk-update': 'market-trips-bulk-update',
        'market-trips:bulk-delete': 'market-trips-bulk-delete',
        'market-trips:bulk-status': 'market-trips-bulk-status',
        // Advance
        'advance:read': 'advance-read',
        'advance:write': 'advance-write',
        'advance:create': 'advance-create',
        'advance:delete': 'advance-delete',
        'advance:diesel-only': 'advance-diesel-only',
        'advance:bulk-update': 'advance-bulk-update',
        'advance:bulk-delete': 'advance-bulk-delete',
        'advance:bulk-status': 'advance-bulk-status',
        // Market Advance
        'market-advance:read': 'market-advance-read',
        'market-advance:write': 'market-advance-write',
        'market-advance:create': 'market-advance-create',
        'market-advance:delete': 'market-advance-delete',
        'market-advance:bulk-update': 'market-advance-bulk-update',
        'market-advance:bulk-delete': 'market-advance-bulk-delete',
        'market-advance:bulk-status': 'market-advance-bulk-status'
    }
    return mapping[permission] || permission
}
