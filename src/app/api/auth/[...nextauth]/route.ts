import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null; // Devuelve null si las credenciales no son válidas o faltan
        }

        const client = await clientPromise;
        const database = client.db('tienda');
        const coleccion = database.collection('usuarios');
        
        const usuario = await coleccion.findOne({ email: credentials.email });

        if (usuario) {
          const valid = await bcrypt.compare(credentials.password, usuario.password);
          if (valid) {
            return {
              id: usuario._id.toString(),
              email: usuario.email,
              name: usuario.name || usuario.email
            };
          }
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/dashboard/login'
  }
});

export { handler as GET, handler as POST };