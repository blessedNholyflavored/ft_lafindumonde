import logo from "./img/logo42.png";
import { useNavigate } from 'react-router-dom';


export const PageNotFound = () => {
	const navigate = useNavigate();

	const navigateToHome = () => {
		navigate('/');
	};
	return (
		<>
		<div>
			404 not found
		</div>
			<div>
			{/* <br></br> */}
			<button className="logoutBtn" onClick={navigateToHome}>HOME</button>
			<img src={logo} className="logo" alt="icon" />
		</div>
		</>
	);
};

export default PageNotFound;