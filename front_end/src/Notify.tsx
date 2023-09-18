import React, { useEffect } from 'react';
import './Notify.css';
import { Link } from 'react-router-dom'; // Importez Link depuis react-router-dom

// Définissez une interface pour les props du composant
interface NotificationProps {
  message: string; // Indiquez le type de la prop message (string ici)
  onClose: () => void; // Fonction pour fermer la notification
}

const Notify: React.FC<NotificationProps> = ({ message, onClose }) => {
  // Utilisez useEffect pour définir un délai de fermeture
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose(); // Appelez la fonction onClose pour fermer la notification après 5 secondes
    }, 5000); // Délai en millisecondes (5000ms = 5 secondes)

    // Nettoyez le délai lorsque le composant est démonté
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="notification">
      {message}
      <Link to="/friends" className="notification-link">
        Voir
      </Link>
    </div>
  );
};

export default Notify;
