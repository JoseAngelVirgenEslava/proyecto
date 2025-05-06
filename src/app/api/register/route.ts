import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  await connectDB()

  const userExists = await User.findOne({ email })
  if (userExists) {
    return NextResponse.json({ message: 'Usuario ya existe' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({ email, password: hashedPassword })

  return NextResponse.json({ message: 'Usuario creado', user })
}