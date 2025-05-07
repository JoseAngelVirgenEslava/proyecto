import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function GET() {
  console.log("GET /api/register fue llamado")
  return NextResponse.json({ message: "El endpoint existe y acepta GET" })
}

export async function POST(req: Request) {
  console.log("POST /api/register fue llamado")

  try {
    const body = await req.json()
    console.log("Datos recibidos:", body)

    const { email, password } = body
    if (!email || !password) {
      console.warn("Campos faltantes")
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };
    const client = await clientPromise
    const database = client.db('tienda')
    const coleccion = database.collection('usuarios')
    const user = await coleccion.findOne({email})
    if (user) {
      console.warn("Usuario ya existe")
      return NextResponse.json({ error: 'Usuario ya existe' }, { status: 409 })
    } else {
      coleccion.insertOne(newUser)
      return NextResponse.json({ message: "Usuario agregado correctamente" }, {status: 200})
    }

  } catch (err: any) {
    console.error("Error en POST:", err.message)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}