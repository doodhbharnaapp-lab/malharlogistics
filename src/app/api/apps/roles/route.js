import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/libs/auth'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const client = new MongoClient(process.env.DATABASE_URL)
        await client.connect()
        const db = client.db()
        const rolesCollection = db.collection('roles')
        const usersCollection = db.collection('users')

        // Get all roles
        const roles = await rolesCollection.find({}).sort({ createdAt: -1 }).toArray()

        // Get user counts and avatars for each role
        const rolesWithStats = await Promise.all(
            roles.map(async (role) => {
                // Count users with this role
                const userCount = await usersCollection.countDocuments({
                    role: role.name,
                    isActive: true
                })

                // Get sample avatars (limit to 3)
                const usersWithAvatars = await usersCollection.find(
                    {
                        role: role.name,
                        isActive: true,
                        $or: [
                            { avatar: { $exists: true, $ne: '' } },
                            { image: { $exists: true, $ne: '' } }
                        ]
                    },
                    {
                        projection: { avatar: 1, image: 1 },
                        limit: 3
                    }
                ).toArray()

                // Extract avatar URLs
                const avatars = usersWithAvatars.map(user => user.avatar || user.image || '')

                return {
                    ...role,
                    id: role._id.toString(),
                    title: role.displayName || role.name,
                    totalUsers: userCount,
                    avatars: avatars.filter(avatar => avatar !== ''),
                    role: role.name
                }
            })
        )

        await client.close()

        return NextResponse.json({
            success: true,
            data: rolesWithStats
        })

    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()

        // Validate required fields
        if (!data.name || !data.displayName) {
            return NextResponse.json(
                { error: 'Role name and display name are required' },
                { status: 400 }
            )
        }

        const client = new MongoClient(process.env.DATABASE_URL)
        await client.connect()
        const db = client.db()
        const rolesCollection = db.collection('roles')

        // Check if role already exists
        const existingRole = await rolesCollection.findOne({ name: data.name })
        if (existingRole) {
            await client.close()
            return NextResponse.json(
                { error: 'Role already exists' },
                { status: 400 }
            )
        }

        // Create new role
        const newRole = {
            name: data.name.toLowerCase().replace(/\s+/g, '-'),
            displayName: data.displayName,
            description: data.description || '',
            permissions: data.permissions || [],
            isSystem: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const result = await rolesCollection.insertOne(newRole)

        await client.close()

        return NextResponse.json({
            success: true,
            message: 'Role created successfully',
            data: { ...newRole, _id: result.insertedId }
        }, { status: 201 })

    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
