import React, { useEffect, useState } from 'react';

const ComingSoonPage: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  function calculateTimeLeft() {
    const targetDate = new Date('2023-12-31T23:59:59'); // Cambia esta fecha por tu fecha de lanzamiento
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();
  }

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh', // Ocupa toda la altura de la ventana
      backgroundColor: 'white', // Fondo blanco
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
    },
    logo: {
      width: '200px', // Ajusta el ancho del logo
      height: 'auto', // La altura se ajusta automáticamente
    },
    message: {
      fontSize: '1.5rem',
      color: '#666', // Color del texto
      marginTop: '20px', // Espacio entre el logo y el mensaje
    },
  };
  
  return (
    <div style={styles.container}>
      <img
        src="https://scontent-scl2-1.xx.fbcdn.net/v/t1.6435-9/60341474_2309470355988454_2714644507617394688_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHkfH4VqNvlr1cM-0SvRVWQ_4UcK-hnKUn_hRwr6GcpSRe7Cmopb0k0VusDXXArIL8&_nc_ohc=hYc2DKKu3dkQ7kNvgGNqsIw&_nc_oc=Adg2CMQgyUv_J8X2UBqk06R0Ut4-l7SCIWIMguEMG5m0hrEv6pLTtJcRyAdyXKJphXmN8kS1IElQHSD3Pf6gVB7e&_nc_zt=23&_nc_ht=scontent-scl2-1.xx&_nc_gid=A2OYYVicevViiL_JcwOwiO7&oh=00_AYAMmQgg6EtidRsjze5a6hBtTyl2_uo7uUyc5W_V33vBGw&oe=67E1A538"
        alt="Logo de Servtec"
        style={styles.logo}
      />
      <p style={styles.message}>Estamos trabajando para ofrecerte el mejor servicio. ¡Volvemos pronto!</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  },
  title: {
    fontSize: '3rem',
    color: '#333',
  },
  message: {
    fontSize: '1.5rem',
    color: '#666',
  },
  countdown: {
    marginTop: '20px',
    fontSize: '1.2rem',
    color: '#444',
  },
};

export default ComingSoonPage;