import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  console.log("GET /api/login fue llamado")
  return NextResponse.json({ message: "El endpoint existe y acepta GET" })
}

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const client = await clientPromise
  const db = client.db('tienda')
  const coleccion = db.collection('usuarios')
  const user = await coleccion.findOne({ email })
  if (!user) {
    return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ message: 'Contraseña incorrecta' }, { status: 401 })
  }

  return NextResponse.json({ message: 'Login exitoso', user })
}