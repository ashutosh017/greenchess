// import { withAccelerate } from "@prisma/extension-accelerate"
// import { PrismaPg } from '@prisma/adapter-pg'
// import { env } from "./env"
// import { PrismaClient } from "@/app/generated/prisma/client"
// import { Pool } from "pg"

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// const pool = new Pool({
//     database: env.DATABASE_URL
// })
// const adapter = new PrismaPg(pool)

// export const prisma =
//     globalForPrisma.prisma || new PrismaClient({
//         adapter
//     }).$extends(withAccelerate())

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})

const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma