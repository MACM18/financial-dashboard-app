import { Client, Account, Databases, ID } from "appwrite"

const client = new Client()

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")

export const account = new Account(client)
export const databases = new Databases(client)

export { ID }

// Database and collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || ""
export const BUDGET_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BUDGET_COLLECTION_ID || ""
export const SAVINGS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SAVINGS_COLLECTION_ID || ""
export const DEBT_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DEBT_COLLECTION_ID || ""
