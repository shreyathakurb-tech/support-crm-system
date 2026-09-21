import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef(null);

  const token = localStorage.getItem("resolvehub_token");
  const storedUser = localStorage.getItem("resolvehub_user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const firstLetter =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("resolvehub_token");
    localStorage.removeItem("resolvehub_user");

    setIsProfileOpen(false);

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

          <Link
  to="/ai"
  className={`nav-link ${
    location.pathname === "/ai" ? "active" : ""
  }`}
>
  AI Insights
</Link>

          {/* Login / Profile */}
          {!token ? (
            <Link to="/login" className="login-button">
              Login
            </Link>
          ) : (
            <div
              className="profile-container"
              ref={profileRef}
            >

              {/* Profile Circle */}
              <button
                className="profile-avatar"
                onClick={() =>
                  setIsProfileOpen(
                    (current) => !current
                  )
                }
                aria-label="Open profile menu"
              >
                {firstLetter}
              </button>

              {/* Dropdown */}
              {isProfileOpen && (
                <div className="profile-dropdown">

                  <div className="profile-header">

                    <div className="profile-avatar large">
                      {firstLetter}
                    </div>

                    <div className="profile-user-info">
                      <strong>{user?.name}</strong>
                      <span>{user?.email}</span>
                    </div>

                  </div>

                  <div className="profile-divider"></div>

                  <div className="profile-details">

                    <div className="profile-detail-row">
                      <span>Role</span>

                      <strong>
                        {user?.role || "Customer"}
                      </strong>
                    </div>

                  </div>

                  <div className="profile-divider"></div>

                  <button
                    className="dropdown-logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>

                </div>
              )}

            </div>
          )}

        </nav>
      </div>
    </header>
  );
}

export default Header;