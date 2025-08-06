import * as dotenv from 'dotenv';
dotenv.config();

import { createTestUsers } from './test-users';

// Ejecutar la creación de usuarios
createTestUsers()
  .then((result) => {
    if (result.success) {
      console.log('Usuarios creados exitosamente:', result.users);
    } else {
      console.error('Error al crear usuarios:', result.error);
    }
  })
  .catch((error) => {
    console.error('Error inesperado:', error);
  });