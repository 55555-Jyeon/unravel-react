import "./loading.css";
import ClipLoader from "react-spinners/ClipLoader";

const LoadingSpinner = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <div className="loader">
      <ClipLoader loading={isLoading} color="#36d7b7" size={30} />
    </div>
  );
};
export default LoadingSpinner;
