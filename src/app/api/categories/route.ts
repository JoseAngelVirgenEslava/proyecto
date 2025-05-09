import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('tienda');
        const categories = await db.collection('productos').distinct('category');
        return NextResponse.json({ categories });
    } catch (error) {
        return NextResponse.json(
            { error: "Error al obtener las categorías" },
            { status: 500 }
        );
    }
}