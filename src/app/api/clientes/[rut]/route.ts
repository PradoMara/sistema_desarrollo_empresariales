import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clientes/[rut] — obtiene un cliente por su RUT
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ rut: string }> },
) {
  try {
    const { rut } = await params;
    const cliente = await prisma.client.findUnique({
      where: { rut },
      include: { patients: true },
    });
    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 });
    }
    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error fetching cliente:', error);
    return NextResponse.json({ error: 'Error al obtener el cliente.' }, { status: 500 });
  }
}

// PUT /api/clientes/[rut] — actualiza datos de contacto del tutor
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ rut: string }> },
) {
  try {
    const { rut } = await params;
    const body = await request.json();
    const { nombre, telefono, email, estadoCrediticio, vincularPacienteId } = body as {
      nombre?: string;
      telefono?: string;
      email?: string;
      estadoCrediticio?: string;
      vincularPacienteId?: string;
    };

    const existe = await prisma.client.findUnique({ where: { rut } });
    if (!existe) {
      return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 });
    }

    const actualizado = await prisma.client.update({
      where: { rut },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(telefono !== undefined && { telefono }),
        ...(email !== undefined && { email }),
        ...(estadoCrediticio !== undefined && { estadoCrediticio }),
        ...(vincularPacienteId && {
          patients: {
            connect: { id: vincularPacienteId }
          }
        })
      },
      include: { patients: true },
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error('Error updating cliente:', error);
    return NextResponse.json({ error: 'Error al actualizar el cliente.' }, { status: 500 });
  }
}

// DELETE /api/clientes/[rut] — elimina un cliente por su RUT
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ rut: string }> },
) {
  try {
    const { rut } = await params;
    
    const existe = await prisma.client.findUnique({ where: { rut } });
    if (!existe) {
      return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 });
    }

    await prisma.client.delete({
      where: { rut },
    });

    return NextResponse.json({ message: 'Cliente eliminado correctamente.' });
  } catch (error) {
    console.error('Error deleting cliente:', error);
    return NextResponse.json({ error: 'Error al eliminar el cliente.' }, { status: 500 });
  }
}
