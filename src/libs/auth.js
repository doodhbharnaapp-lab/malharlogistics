import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { MongoClient } from 'mongodb'

export const authOptions = {
  providers: [
    CredentialProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@gmail.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials ?? {}

          if (!email || !password) {
            throw new Error('Email and password are required')
          }

          // Connect to MongoDB
          const client = new MongoClient(process.env.DATABASE_URL)
          await client.connect()
          const db = client.db()
          const usersCollection = db.collection('users')

          // Find user
          const user = await usersCollection.findOne({
            email: email.toLowerCase().trim(),
            isActive: true
          })

          if (!user) {
            await client.close()
            throw new Error('Invalid email or password')
          }

          // Verify password with bcrypt
          const isPasswordValid = await bcrypt.compare(password, user.password)

          if (!isPasswordValid) {
            await client.close()
            throw new Error('Invalid email or password')
          }

          // Update last login
          await usersCollection.updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date() } }
          )

          await client.close()

          // Return user object
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.avatar || null
          }

        } catch (err) {
          console.error('AUTH ERROR:', err.message)
          throw new Error(err.message || 'Login failed')
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.role = user.role
        token.email = user.email
        token.image = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.role = token.role
        session.user.email = token.email
        session.user.image = token.image
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}
