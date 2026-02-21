// libs/permissions.js

// ALL PERMISSIONS DEFINED HERE
export const PERMISSIONS = {
    // Vehicles Module
    vehicles: {
        READ: 'vehicles:read',
        WRITE: 'vehicles:write',
        CREATE: 'vehicles:create',
        DELETE: 'vehicles:delete'
    },

    // Market Vehicles Module
    marketVehicles: {
        READ: 'market-vehicles:read',
        WRITE: 'market-vehicles:write',
        CREATE: 'market-vehicles:create',
        DELETE: 'market-vehicles:delete'
    },

    // Trips Module
    trips: {
        READ: 'trips:read',
        WRITE: 'trips:write',
        CREATE: 'trips:create',
        DELETE: 'trips:delete'
    },

    // Market Trips Module
    marketTrips: {
        READ: 'market-trips:read',
        WRITE: 'market-trips:write',
        CREATE: 'market-trips:create',
        DELETE: 'market-trips:delete'
    },

    // Advance Module (with diesel only)
    advance: {
        READ: 'advance:read',
        WRITE: 'advance:write',
        CREATE: 'advance:create',
        DELETE: 'advance:delete',
        DIESEL_ONLY: 'advance:diesel-only'  // Special for Account Two
    },

    // Market Advance Module
    marketAdvance: {
        READ: 'market-advance:read',
        WRITE: 'market-advance:write',
        CREATE: 'market-advance:create',
        DELETE: 'market-advance:delete'
    }
}

// ROLE DEFINITIONS
export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    ACCOUNT_ONE: 'account-one',
    ACCOUNT_TWO: 'account-two',
    OTHERS: 'others'
}

// FOR FRONTEND DROPDOWN - Display names
export const ROLE_DISPLAY_NAMES = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.MANAGER]: 'Manager',
    [ROLES.ACCOUNT_ONE]: 'Account One',
    [ROLES.ACCOUNT_TWO]: 'Account Two',
    [ROLES.OTHERS]: 'Others'
}

// DEFAULT PERMISSIONS FOR FRONTEND TABLE
export const DEFAULT_PERMISSIONS = [
    { module: 'Vehicles', access: ['read', 'write', 'create', 'delete'] },
    { module: 'Market Vehicles', access: ['read', 'write', 'create', 'delete'] },
    { module: 'Trips', access: ['read', 'write', 'create', 'delete'] },
    { module: 'Market Trips', access: ['read', 'write', 'create', 'delete'] },
    { module: 'Advance', access: ['read', 'write', 'create', 'delete', 'diesel-only'] },
    { module: 'Market Advance', access: ['read', 'write', 'create', 'delete'] }
]

// HELPER: Convert permission from colon to hyphen format (for database)
export function permissionToDatabaseFormat(permission) {
    const mapping = {
        'vehicles:read': 'vehicles-read',
        'vehicles:write': 'vehicles-write',
        'vehicles:create': 'vehicles-create',
        'vehicles:delete': 'vehicles-delete',

        'market-vehicles:read': 'market-vehicles-read',
        'market-vehicles:write': 'market-vehicles-write',
        'market-vehicles:create': 'market-vehicles-create',
        'market-vehicles:delete': 'market-vehicles-delete',

        'trips:read': 'trips-read',
        'trips:write': 'trips-write',
        'trips:create': 'trips-create',
        'trips:delete': 'trips-delete',

        'market-trips:read': 'market-trips-read',
        'market-trips:write': 'market-trips-write',
        'market-trips:create': 'market-trips-create',
        'market-trips:delete': 'market-trips-delete',

        'advance:read': 'advance-read',
        'advance:write': 'advance-write',
        'advance:create': 'advance-create',
        'advance:delete': 'advance-delete',
        'advance:diesel-only': 'advance-diesel-only',

        'market-advance:read': 'market-advance-read',
        'market-advance:write': 'market-advance-write',
        'market-advance:create': 'market-advance-create',
        'market-advance:delete': 'market-advance-delete'
    }
    return mapping[permission] || permission
}

// HELPER: Convert permission from hyphen to colon format (for frontend)
export function permissionToFrontendFormat(permission) {
    const mapping = {
        'vehicles-read': 'vehicles:read',
        'vehicles-write': 'vehicles:write',
        'vehicles-create': 'vehicles:create',
        'vehicles-delete': 'vehicles:delete',

        'market-vehicles-read': 'market-vehicles:read',
        'market-vehicles-write': 'market-vehicles:write',
        'market-vehicles-create': 'market-vehicles:create',
        'market-vehicles-delete': 'market-vehicles:delete',

        'trips-read': 'trips:read',
        'trips-write': 'trips:write',
        'trips-create': 'trips:create',
        'trips-delete': 'trips:delete',

        'market-trips-read': 'market-trips:read',
        'market-trips-write': 'market-trips:write',
        'market-trips-create': 'market-trips:create',
        'market-trips-delete': 'market-trips:delete',

        'advance-read': 'advance:read',
        'advance-write': 'advance:write',
        'advance-create': 'advance:create',
        'advance-delete': 'advance:delete',
        'advance-diesel-only': 'advance:diesel-only',

        'market-advance-read': 'market-advance:read',
        'market-advance-write': 'market-advance:write',
        'market-advance-create': 'market-advance:create',
        'market-advance-delete': 'market-advance:delete'
    }
    return mapping[permission] || permission
}
