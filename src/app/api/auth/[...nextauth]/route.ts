import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import clientPromise from "@/lib/mongodb"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const client = await clientPromise
        const db = client.db('tienda')
        const user = await db.collection('usuarios').findOne({ email: credentials?.email })

        if (!user) return null
        if (user.password !== credentials?.password) return null

        return { id: user._id.toString(), email: user.email }
      }
    })
  ],
  pages: {
    signIn: '/login', // opcional: puedes personalizar la página de login
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
