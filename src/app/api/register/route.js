import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '../../../libs/mongodb';
import { MongoClient } from 'mongodb'

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, password, terms } = body;
        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, message: 'All fields are required' },
                { status: 400 }
            );
        }
        if (!terms) {
            return NextResponse.json(
                { success: false, message: 'You must agree to the terms' },
                { status: 400 }
            );
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: 'Please enter a valid email' },
                { status: 400 }
            );
        }
        // Password validation
        if (password.length < 6) {
            return NextResponse.json(
                { success: false, message: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }
        // Connect to MongoDB
        const client = new MongoClient(process.env.DATABASE_URL);
        await client.connect();
        const db = client.db(); // uses "srtransport"
        const usersCollection = db.collection('users');
        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User already exists with this email' },
                { status: 409 }
            );
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create user object
        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: 'user',
            avatar: '',
            isActive: true,
            emailVerified: false,
            termsAccepted: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLogin: null
        };
        // Insert into database
        const result = await usersCollection.insertOne(newUser);
        // Remove password from response
        const userResponse = { ...newUser };
        delete userResponse.password;
        return NextResponse.json(
            {
                success: true,
                message: 'Registration successful!',
                user: {
                    id: result.insertedId,
                    name: userResponse.name,
                    email: userResponse.email,
                    role: userResponse.role
                }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Registration failed. Please try again.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
