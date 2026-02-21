// app/api/apps/roles/[id]/route.js
import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

async function checkAdmin() {
    const session = await getServerSession(authOptions)
    if (!session) {
        return { error: 'Unauthorized. Please login.', status: 401 }
    }
    if (session.user.role !== 'admin') {
        return { error: 'Admin access required.', status: 403 }
    }
    return { session, success: true }
}

// ✅ FIXED: ID ko URL se nikalne ka DOOSRA TARIQA
export async function PUT(request) {
    let client
    try {
        console.log('🔵 PUT request received')
        console.log('📌 URL:', request.url)

        // 👉🏻 URL se ID nikalna (MORE RELIABLE)
        const urlParts = request.url.split('/')
        const id = urlParts[urlParts.length - 1]

        console.log('🆔 Extracted ID from URL:', id)

        const adminCheck = await checkAdmin()
        if (adminCheck.error) {
            return NextResponse.json(
                { error: adminCheck.error },
                { status: adminCheck.status }
            )
        }

        if (!id) {
            return NextResponse.json(
                { error: 'Role ID is required' },
                { status: 400 }
            )
        }

        const data = await request.json()
        console.log('📦 Request body:', data)

        client = new MongoClient(process.env.DATABASE_URL)
        await client.connect()
        const db = client.db()
        const rolesCollection = db.collection('roles')

        // Validate ObjectId
        let objectId
        try {
            objectId = new ObjectId(id)
        } catch (err) {
            return NextResponse.json(
                { error: 'Invalid role ID format' },
                { status: 400 }
            )
        }

        // Check if role exists
        const existingRole = await rolesCollection.findOne({
            _id: objectId
        })

        if (!existingRole) {
            return NextResponse.json(
                { error: 'Role not found' },
                { status: 404 }
            )
        }

        // Update role
        const updateData = {
            displayName: data.displayName || existingRole.displayName,
            description: data.description !== undefined ? data.description : existingRole.description,
            permissions: data.permissions || existingRole.permissions,
            updatedAt: new Date(),
            updatedBy: adminCheck.session.user.email
        }

        await rolesCollection.updateOne(
            { _id: objectId },
            { $set: updateData }
        )

        const updatedRole = await rolesCollection.findOne({
            _id: objectId
        })

        return NextResponse.json({
            success: true,
            message: 'Role updated successfully',
            data: {
                _id: updatedRole._id.toString(),
                name: updatedRole.name,
                displayName: updatedRole.displayName,
                description: updatedRole.description,
                permissions: updatedRole.permissions,
                updatedAt: updatedRole.updatedAt
            }
        })

    } catch (error) {
        console.error('❌ PUT role error:', error)
        return NextResponse.json(
            { error: 'Failed to update role: ' + (error.message || 'Unknown error') },
            { status: 500 }
        )
    } finally {
        if (client) await client.close()
    }
}
