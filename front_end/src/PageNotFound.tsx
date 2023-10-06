import logo from "./img/logo42.png";
import { Link, useNavigate } from "react-router-dom";

export const PageNotFound = () => {
  const navigate = useNavigate();

  const navigateToHome = () => {
    navigate("/");
  };
  return (
    <div style={styles.container}>
      <div style={styles.errorCode}>404</div>
      <div style={styles.errorMessage}>Page Not Found</div>
      <p>Désolé, la page que vous recherchez est introuvable.</p>
      <Link to="/" style={styles.backHome}>
        Retour à la page d'accueil
      </Link>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
  },
  errorCode: {
    fontSize: "120px",
    fontWeight: "bold",
    color: "#e74c3c",
  },
  errorMessage: {
    fontSize: "36px",
    marginBottom: "30px",
  },
  backHome: {
    textDecoration: "none",
    backgroundColor: "#3498db",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "5px",
    fontSize: "24px",
    transition: "background-color 0.3s ease",
  },
};

export default PageNotFound;
