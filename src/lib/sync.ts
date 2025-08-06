import { db } from './db';

// Función para sincronizar datos específicos
async function syncData(key: string, data: any) {
  try {
    switch (key) {
      case 'users':
        await db.users.clear();
        await db.users.bulkPut(data);
        break;
      case 'serviceOrders':
        await db.orders.clear();
        await db.orders.bulkPut(data);
        break;
      case 'appointments':
        await db.appointments.clear();
        await db.appointments.bulkPut(data);
        break;
    }
  } catch (error) {
    console.error(`Error syncing ${key}:`, error);
  }
}

// Función para observar cambios en localStorage
export function initializeAutoSync() {
  // Sincronizar datos existentes al iniciar
  const initialSync = async () => {
    const keys = ['users', 'serviceOrders', 'appointments'];
    for (const key of keys) {
      const data = localStorage.getItem(key);
      if (data) {
        await syncData(key, JSON.parse(data));
      }
    }
  };

  // Realizar sincronización inicial
  initialSync();

  // Observar cambios en localStorage
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key: string, value: string) {
    originalSetItem.apply(this, [key, value]);
    
    // Solo sincronizar las claves que nos interesan
    if (['users', 'serviceOrders', 'appointments'].includes(key)) {
      syncData(key, JSON.parse(value));
    }
    
    // Disparar evento de storage para otros componentes
    const event = new StorageEvent('storage', {
      key: key,
      newValue: value,
      oldValue: localStorage.getItem(key),
      storageArea: localStorage
    });
    window.dispatchEvent(event);
  };
}