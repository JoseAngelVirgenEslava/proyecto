import { NextResponse, NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface OrderItem {
    productId: string;
    quantity: number;
}

export async function POST(request: NextRequest) {
    try {
        const { orderDetails }: { orderDetails: OrderItem[] } = await request.json();

        if (!orderDetails || orderDetails.length === 0) {
            return NextResponse.json({ error: "No hay productos en el pedido." }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('tienda');
        const productosCollection = db.collection('productos');

        const updateOperations = orderDetails.map(async (item: OrderItem) => {
            const productId = new ObjectId(item.productId);
            const quantityToDecrease = item.quantity;

            // Verificar si hay suficientes unidades disponibles
            const product = await productosCollection.findOne({ _id: productId });
            if (!product || product.units < quantityToDecrease) {
                return { error: `No hay suficientes unidades disponibles para el producto: ${product?.name || item.productId}` };
            }

            // Realizar la actualización
            const updateResult = await productosCollection.updateOne(
                { _id: productId },
                { $inc: { units: -quantityToDecrease } }
            );

            if (updateResult.modifiedCount !== 1) {
                return { error: `Error al actualizar las unidades para el producto: ${product?.name || item.productId}` };
            }

            return { success: true, productId: item.productId, quantity: quantityToDecrease };
        });

        const results = await Promise.all(updateOperations);

        // Verificar si hubo algún error en las actualizaciones
        const errors = results.filter(result => result?.error);
        if (errors.length > 0) {
            return NextResponse.json({ errors: errors.map(err => err.error) }, { status: 400 });
        }

        return NextResponse.json({ message: "Pedido realizado y unidades actualizadas correctamente." });

    } catch (error) {
        console.error("Error al procesar la compra:", error);
        return NextResponse.json({ error: "Error al procesar la compra en el servidor." }, { status: 500 });
    }
}