import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  console.log('Intentando registrar:', email)

  await connectDB()
  console.log('Conectado a la base de datos')

  const userExists = await User.findOne({ email })
  if (userExists) {
    console.log('Usuario ya existe')
    return NextResponse.json({ message: 'Usuario ya existe' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({ email, password: hashedPassword })
  console.log('Usuario creado:', user)

  return NextResponse.json({ message: 'Usuario creado', user })
}