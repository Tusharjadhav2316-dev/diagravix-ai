import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function getServiceAccount(): Record<string, unknown> | undefined {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_B64
  if (!encoded) return undefined

  const decoded = Buffer.from(encoded, "base64").toString("utf8")
  return JSON.parse(decoded) as Record<string, unknown>
}

const serviceAccount = getServiceAccount()

export const adminApp: App =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(serviceAccount ? { credential: cert(serviceAccount) } : undefined)

export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
