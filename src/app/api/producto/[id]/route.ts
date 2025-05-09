import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface RouteParams {
    id: string;
}

export async function GET(
    request: NextRequest,
    { params }: { params: RouteParams }
) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ message: "El ID del producto es requerido." }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
        return NextResponse.json({ message: "El ID del producto proporcionado no es válido." }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db('tienda');
        const producto = await db.collection('productos').findOne({ _id: new ObjectId(id) });

        if (!producto) {
            return NextResponse.json({ message: "Producto no encontrado." }, { status: 404 });
        }
        return NextResponse.json(producto); 
    } catch (error) {
        console.error("Error al obtener el producto por ID:", error);
        return NextResponse.json({ message: "Error interno del servidor al intentar obtener el producto." }, { status: 500 });
    }
}