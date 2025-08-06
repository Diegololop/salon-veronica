// src/config/businessInfo.ts

export const businessInfo = {
  name: 'ServTec',
  logoUrl: 'https://i.postimg.cc/tJMct98k/logo.webp',
  description: 'Expertos en reparación de celulares y computadores, brindando soluciones técnicas profesionales desde 2000.',
  tagline: 'Servicio técnico profesional en San Antonio, Chile',
  
  contact: {
    phone: '+56 9 3400 1830',
    email: 'juansandovalc@gmail.com',
    address: {
      full: 'Av. Centenario 286, Of 4, 5 y 6, San Antonio, Chile',
      simplified: 'Av. Centenario 286, Of. 4, 5 y 6, San Antonio',
    },
  },

  legal: {
    rut: '77.494.886-4',
  },

  online: {
    website: 'www.servtec.cl',
    facebook: 'https://www.facebook.com/ServtecChile/?locale=es_LA',
    instagram: 'https://www.instagram.com/servtec_sanantonio/?hl=es',
    // Generates a proper, URL-encoded Google Maps link
    getGoogleMapsLink: () => `https://www.google.com/maps/place/ServTec/@-33.5796545,-71.609338,21z/data=!4m9!1m2!2m1!1sAv.+Centenario+286,+Of+4,+5+y+6,+San+Antonio,+Chile!3m5!1s0x966238e6124228e3:0xc9acbdff8cd42d46!8m2!3d-33.579708!4d-71.609166!16s%2Fg%2F11bx1csvbd?entry=ttu&g_ep=EgoyMDI1MDczMC4wIKXMDSoASAFQAw%3D%3D`,
  },

  operations: {
    schedule: [
      { days: 'Lunes a Viernes', hours: '09:30 - 19:00' },
      { days: 'Sábados', hours: '10:00 - 17:00' },
      { days: 'Domingos', hours: 'Cerrado' },
    ],
    paymentMethods: ['Efectivo', 'Transferencia'],
  },
  
  print: {
    terms: [
      'Los equipos no retirados después de 40 días se considerarán abandonados, perdiendo todo derecho de reclamo. El equipo quedará a disposición del servicio técnico para compensar gastos.',
      'La garantía es válida por 5 días después del retiro del equipo y aplica exclusivamente sobre el trabajo realizado especificado en esta orden.',
      'Equipos que ingresen apagados no tienen garantía sobre funciones adicionales una vez reparado el encendido (cámara, táctil, micrófono, etc.).',
      'No se ofrece garantía en equipos con daño por líquidos.',
      'Durante reparaciones que involucren software, puede ser necesaria la modificación del sistema operativo. El servicio técnico no se responsabiliza por pérdida de datos.',
      'El respaldo de datos es un servicio adicional con costo aparte.',
      'El equipo solo puede ser retirado presentando esta orden de servicio.',
      'Este servicio se rige por la Ley N° 19.496 de Protección de los Derechos de los Consumidores y normativa chilena aplicable.',
    ],
  },
};

// Utility function to generate a tel: link
export const getPhoneLink = (phone: string) => {
  return `tel:${phone.replace(/\s/g, '')}`;
};

// Utility function to generate a mail link for desktop or mobile
export const getEmailLink = (email: string) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  return isMobile ? `googlegmail:///co?to=${email}` : `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
};