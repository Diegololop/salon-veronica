import express from 'express';
import cors from 'cors';
import { db } from '../lib/db';
import type { User } from '../types/auth';
import type { ServiceOrder } from '../types/orders';
import type { Appointment } from '../types/appointments';

const app = express();
const port = 3000; // Cambiado a puerto 3000

// Middleware
app.use(cors());
app.use(express.json());

// Rutas para usuarios
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.users.toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user: User = req.body;
    const id = await db.users.add(user);
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Rutas para órdenes
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.orders.toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order: ServiceOrder = req.body;
    const id = await db.orders.add(order);
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear orden' });
  }
});

// Rutas para citas
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await db.appointments.toArray();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const appointment: Appointment = req.body;
    const id = await db.appointments.add(appointment);
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear cita' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});