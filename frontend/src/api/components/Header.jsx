import { Link, useLocation } from "react-router-dom";
import "./Header.css";

function Header() {
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="header-container">

        {/* Logo */}
        <Link to="/" className="brand">
          <div className="brand-logo">R</div>
          <span className="brand-name">ResolveHub</span>
        </Link>

        {/* Navigation */}
        <nav className="navbar">

          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Tickets
          </Link>

          <span className="nav-link disabled">
            Analytics
          </span>

          <span className="nav-link disabled">
            AI Insights
          </span>

        </nav>

      </div>
    </header>
  );
}

export default Header;