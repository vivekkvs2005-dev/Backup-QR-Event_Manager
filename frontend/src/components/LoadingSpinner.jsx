import { FaSpinner } from "react-icons/fa";

function LoadingSpinner({

  text = "Loading..."

}) {

  return (

    <div className="loading-spinner">

      <FaSpinner className="spinner-icon" />

      <span>{text}</span>

    </div>
  );
}

export default LoadingSpinner;