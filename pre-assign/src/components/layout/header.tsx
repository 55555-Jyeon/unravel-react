import reactLogo from "../../assets/react.svg";
import viteLogo from "/vite.svg";
import "./header.css";

const Header = () => {
  return (
    <header className="header">
      <a href="https://vitejs.dev" target="_blank">
        <img src={viteLogo} className="logo" alt="Vite logo" />
      </a>
      <a href="https://react.dev" target="_blank">
        <img src={reactLogo} className="logo react" alt="React logo" />
      </a>
    </header>
  );
};
export default Header;
