// import { MongoClient } from 'mongodb'
// const uri = process.env.DATABASE_URL
// if (!uri) {
//   throw new Error('DATABASE_URL is missing in .env.local')
// }
// let client
// let clientPromise
// if (process.env.NODE_ENV === 'development') {
//   if (!global._mongoClientPromise) {
//     client = new MongoClient(uri)
//     global._mongoClientPromise = client.connect()
//   }
//   clientPromise = global._mongoClientPromise
// } else {
//   client = new MongoClient(uri)
//   clientPromise = client.connect()
// }
// export default clientPromise

// import { MongoClient } from 'mongodb'

// const uri = process.env.DATABASE_URL

// if (!uri) {
//   throw new Error('DATABASE_URL is missing in .env.local')
// }

// // Connection options to handle common issues
// const options = {
//   family: 4, // Force IPv4 (fixes ECONNREFUSED in Node.js v17+)
//   connectTimeoutMS: 10000, // 10 second timeout
//   socketTimeoutMS: 45000,
//   maxPoolSize: 10,
//   minPoolSize: 1,
//   retryWrites: true,
//   retryReads: true,
//   serverSelectionTimeoutMS: 5000, // 5 second server selection timeout
// }

// let client
// let clientPromise

// // For MongoDB Atlas SRV connection issues, try alternative connection string
// function getAlternativeConnectionString(uri) {
//   if (uri.includes('mongodb+srv')) {
//     // Extract parts from SRV string
//     const matches = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/)
//     if (matches) {
//       const [, username, password, host, database] = matches
//       // Get the base cluster name
//       const clusterBase = host.split('.')[0]

//       // Alternative format using standard connection
//       console.log('Using alternative connection format for Atlas')
//       return `mongodb://${username}:${password}@${clusterBase}.ottonfn.mongodb.net:27017/${database}?ssl=true&replicaSet=atlas-${clusterBase}&authSource=admin&retryWrites=true`
//     }
//   }
//   return uri
// }

// if (process.env.NODE_ENV === 'development') {
//   // In development mode, use a global variable so that the value
//   // is preserved across module reloads caused by HMR (Hot Module Replacement).
//   if (!global._mongoClientPromise) {
//     try {
//       console.log('Attempting to connect to MongoDB...')

//       // Try with SRV connection first
//       client = new MongoClient(uri, options)

//       global._mongoClientPromise = client.connect()
//         .then(client => {
//           console.log('MongoDB connected successfully via SRV')
//           return client
//         })
//         .catch(async (err) => {
//           console.error('SRV connection failed:', err.message)

//           // If SRV fails, try alternative connection string
//           if (uri.includes('mongodb+srv')) {
//             console.log('Attempting alternative connection format...')
//             const altUri = getAlternativeConnectionString(uri)

//             const altClient = new MongoClient(altUri, options)
//             return altClient.connect().then(client => {
//               console.log('MongoDB connected successfully via alternative format')
//               return client
//             })
//           }
//           throw err
//         })
//     } catch (error) {
//       console.error('Failed to create MongoDB client:', error)
//       throw error
//     }
//   }
//   clientPromise = global._mongoClientPromise
// } else {
//   // In production mode, it's best to not use a global variable.
//   try {
//     client = new MongoClient(uri, options)
//     clientPromise = client.connect()
//       .then(client => {
//         console.log('MongoDB connected successfully')
//         return client
//       })
//       .catch(async (err) => {
//         console.error('Production connection failed:', err.message)

//         // If SRV fails, try alternative connection string
//         if (uri.includes('mongodb+srv')) {
//           console.log('Attempting alternative connection format...')
//           const altUri = getAlternativeConnectionString(uri)

//           const altClient = new MongoClient(altUri, options)
//           return altClient.connect().then(client => {
//             console.log('MongoDB connected successfully via alternative format')
//             return client
//           })
//         }
//         throw err
//       })
//   } catch (error) {
//     console.error('Failed to create MongoDB client:', error)
//     throw error
//   }
// }

// export default clientPromise
import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("DATABASE_URL is missing");
}

let client;
let clientPromise;

// Use global caching for serverless (Vercel-safe)
if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;
