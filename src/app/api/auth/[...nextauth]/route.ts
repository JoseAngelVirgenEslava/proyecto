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
      async authorize(credentials, req) { // credentials puede ser undefined
        if (!credentials?.email || !credentials?.password) {
          // Si no hay credenciales, NextAuth por defecto lanza un error o no autentica.
          // Puedes lanzar un error personalizado si quieres un mensaje específico.
          // throw new Error("Email y contraseña son requeridos.");
          return null; // Devuelve null si las credenciales no son válidas o faltan.
        }

        const client = await clientPromise;
        const database = client.db('tienda');
        const coleccion = database.collection('usuarios');
        
        const usuario = await coleccion.findOne({ email: credentials.email });

        if (usuario) {
          const valid = await bcrypt.compare(credentials.password, usuario.password);
          if (valid) {
            // Cualquier objeto que devuelvas aquí estará disponible en el callback `jwt`
            // y en la sesión si usas JWT.
            return {
              id: usuario._id.toString(),
              email: usuario.email,
              name: usuario.name || usuario.email, // Asegúrate de tener 'name' o usa email como fallback
              // puedes añadir más propiedades si las necesitas en el token/sesión
            };
          }
        }
        // Devuelve null si el usuario no se encuentra o la contraseña es incorrecta.
        // NextAuth interpretará esto como un fallo de autenticación.
        // La función signIn() en el cliente recibirá result.error con un mensaje genérico
        // como "CredentialsSignin" a menos que lances un error específico aquí
        // (ej. throw new Error("Credenciales inválidas")).
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
      // `user` solo está presente en el primer login.
      // Persiste el id del usuario (y otros datos que quieras) en el token JWT.
      if (user) {
        token.id = user.id;
        token.email = user.email; // Asegúrate de que `user.email` está definido
        // token.name = user.name; // Si tienes `name` en el objeto `user` de `authorize`
      }
      return token;
    },
    async session({ session, token }) {
      // Pasa datos del token JWT a la sesión del cliente.
      // `token` es el JWT que viene del callback `jwt`.
      // `session.user` es lo que `useSession()` y `getSession()` retornan.
      if (token && session.user) {
        (session.user as any).id = token.id; // TypeScript puede necesitar un type assertion
        session.user.email = token.email as string; // Asegúrate de que `token.email` existe y es string
        // session.user.name = token.name as string; // Si tienes `name`
      }
      return session;
    },
  },
  pages: {
    signIn: '/dashboard/login', // Si el usuario necesita iniciar sesión, será redirigido aquí.
    // error: '/auth/error', // Opcional: página para mostrar errores de autenticación
  }
});

export { handler as GET, handler as POST };