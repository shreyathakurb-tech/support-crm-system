import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("resolvehub_token");

  const storedUser = localStorage.getItem("resolvehub_user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  function handleLogout() {
    localStorage.removeItem("resolvehub_token");
    localStorage.removeItem("resolvehub_user");

    navigate("/login");
  }

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
            className={`nav-link ${
              location.pathname === "/" ? "active" : ""
            }`}
          >
            Tickets
          </Link>

          <span className="nav-link disabled">
            Analytics
          </span>

          <span className="nav-link disabled">
            AI Insights
          </span>

          {!token ? (
            <Link
              to="/login"
              className="login-button"
            >
              Login
            </Link>
          ) : (
            <div className="user-menu">

              <div className="user-info">
                <span className="user-name">
                  {user?.name}
                </span>

                <span className="user-role">
                  {user?.role}
                </span>
              </div>

              <button
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>
          )}

        </nav>

      </div>
    </header>
  );
}

export default Header;