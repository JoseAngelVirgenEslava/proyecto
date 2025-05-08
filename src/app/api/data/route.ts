import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('tienda');
    const productos = await db.collection('productos').find().toArray();
    const productosConIdString = productos.map(producto => ({
      ...producto,
      _id: producto._id.toString(), // Convertir ObjectId a string
    }));
    return NextResponse.json({ productos: productosConIdString });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}