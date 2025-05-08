'use client';

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise
        const database = client.db('tienda')
        const coleccion = database.collection('usuarios')
        const email = credentials?.email

        // Buscar usuario por correo electrónico
        const usuario = await coleccion.findOne({ email })
        if (usuario && credentials?.password) {
          // Comparar la contraseña ingresada con la almacenada en la base de datos
          const valid = await bcrypt.compare(credentials.password, usuario.password)
          if (valid) {
            return {
              id: usuario._id.toString(),
              email: usuario.email,
              name: usuario.name, // Ajusta según la estructura de tu documento
            }
          }
        }
        // Si no se encuentra el usuario o la contraseña es incorrecta, retorna null
        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }