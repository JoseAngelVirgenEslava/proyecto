import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const name = searchParams.get('name');

    if (!name) {
        return NextResponse.json({ error: "Se debe proporcionar un nombre para buscar." }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db('tienda');
        const product = await db.collection('productos').findOne({ name: { $regex: new RegExp(name, 'i') } }); // Búsqueda insensible a mayúsculas

        if (product) {
            const productWithIdString = {
                ...product,
                _id: product._id.toString(),
            };
            return NextResponse.json({ product: productWithIdString });
        } else {
            return NextResponse.json({ product: null });
        }
    } catch (error) {
        console.error("Error al buscar el producto:", error);
        return NextResponse.json({ error: "Error al buscar el producto en la base de datos." }, { status: 500 });
    }
}