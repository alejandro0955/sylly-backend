import React, { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Dashboard from "./pages/Dashboard";
import Syllabi from "./pages/Syllabi";
import Planner from "./pages/Planner";
import Chat from "./pages/Chat";
import PublicSearch from "./pages/PublicSearch";
import { setAccessTokenSupplier } from "./api/client";
import logo from "../logo.svg";

// Import icons, including the new ones for the hamburger menu
import {
  FaTachometerAlt,
  FaBook,
  FaClipboardList,
  FaComments,
  FaSearch,
  FaBars, // Hamburger menu icon
  FaTimes, // Close menu icon
} from "react-icons/fa";

const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

// Add icon component as third element in each nav item
const NAV_ITEMS = [
  ["dashboard", "Dashboard", <FaTachometerAlt />],
  ["syllabi", "My Syllabi", <FaBook />],
  ["planner", "Planner", <FaClipboardList />],
  ["chat", "Chat", <FaComments />],
  ["browse", "Shared Syllabi", <FaSearch />],
];

// Define the breakpoint for desktop/mobile view
const BREAKPOINT = 1110; // Adjust this value as needed

const NavLink = ({
  itemKey,
  label,
  icon,
  page,
  setPage,
  navigateAndClose,
  isDesktop,
}) => (
  <a
    key={itemKey}
    href="#"
    onClick={(e) => {
      e.preventDefault();
      navigateAndClose(itemKey);
    }}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      // Updated padding
      padding: isDesktop ? "10px 15px" : "12px 0",
      borderRadius: 4,

      fontWeight: page === itemKey ? "bold" : "normal",
      backgroundColor: page === itemKey ? "#F0ECF9" : "transparent",
      color: page === itemKey ? "#5D3A9F" : "#333",

      width: isDesktop ? "auto" : "100%",
      textDecoration: "none",
      transition: "background-color 0.2s",
      borderBottom: isDesktop ? "none" : "1px solid #eee",
    }}
  >
    {icon}
    {label}
  </a>
);

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [apiReady, setApiReady] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for hamburger menu
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  const isDesktop = screenWidth >= BREAKPOINT;
  const userName = user?.name || user?.email || "Account";

  // Function to handle logout
  const onLogout = () =>
    logout({
      logoutParams: { returnTo: window.location.origin },
    });

  // Function to close the menu and navigate (for mobile)
  const navigateAndClose = (key) => {
    setPage(key);
    if (!isDesktop) {
      setIsMenuOpen(false); // Close menu after selection on mobile
    }
  };

  // Effect to handle access token
  const authParams = useMemo(() => (audience ? { audience } : {}), []);
  useEffect(() => {
    if (isAuthenticated) {
      setApiReady(false);
      setAccessTokenSupplier(() =>
        getAccessTokenSilently({
          authorizationParams: authParams,
        })
      );
      setApiReady(true);
    } else {
      setAccessTokenSupplier(null);
      setApiReady(true);
    }
  }, [isAuthenticated, getAccessTokenSilently, authParams]);

  // Effect to track screen width
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading || !apiReady) {
    return (
      <div className="card" style={{ margin: 32 }}>
        <p>Preparing your workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: "grid", gap: 24, padding: 24 }}>
        <PublicSearch compact={false} />
        <div className="card" style={{ maxWidth: 420 }}>
          <h1>Welcome to Sylly</h1>
          <p className="muted">
            Sign in with Auth0 to upload syllabi, review extracted events, and
            push them to your Google Calendar.
          </p>
          <button type="button" onClick={() => loginWithRedirect()}>
            Log in / Sign up
          </button>
        </div>
      </div>
    );
  }

  // The Nav component logic is now inline here
  const Nav = (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        borderBottom: "1px solid #ccc",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        zIndex: 1000,
      }}
    >
      {/* Left: Logo */}
      <a href="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src={logo}
            alt="Sylly Logo"
            width="40"
            height="50"
            className="d-inline-block align-top"
          />
        </div>
      </a>

      {/* Center: Navigation Links (Desktop) */}
      {isDesktop && (
        <nav
          style={{
            display: "flex",
            alignItems: "center", // <-- FIX APPLIED HERE
            height: "100%", // <-- FIX APPLIED HERE
            gap: 10,
          }}
        >
          {NAV_ITEMS.map(([key, label, icon]) => (
            <NavLink
              key={key}
              itemKey={key}
              label={label}
              icon={icon}
              page={page}
              setPage={setPage}
              navigateAndClose={navigateAndClose}
              isDesktop={isDesktop}
            />
          ))}
        </nav>
      )}

      {/* Right: User Info & Hamburger Button */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* User Info & Logout (Desktop View) */}
        {isDesktop && (
          <>
            <span className="muted">{userName}</span>
            <button type="button" onClick={onLogout}>
              Log out
            </button>
          </>
        )}

        {/* Hamburger/Close Button (Mobile View) */}
        {!isDesktop && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.5rem",
              color: "#333",
              zIndex: 1001,
            }}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {!isDesktop && isMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%", // Position right below the header
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderBottom: "1px solid #ccc",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            padding: "12px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 5,
            zIndex: 999,
          }}
        >
          {NAV_ITEMS.map(([key, label, icon]) => (
            <NavLink
              key={key}
              itemKey={key}
              label={label}
              icon={icon}
              page={page}
              setPage={setPage}
              navigateAndClose={navigateAndClose}
              isDesktop={isDesktop}
            />
          ))}

          {/* User Info and Logout inside the Mobile Menu */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 10,
              marginTop: 5,
              borderTop: "1px solid #eee",
            }}
          >
            <span className="muted" style={{ fontWeight: "bold" }}>
              {userName}
            </span>
            <button type="button" onClick={onLogout}>
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );

  return (
    <div>
      {Nav} {/* Render the responsive navigation */}
      <main style={{ paddingTop: 100 }}>
        {" "}
        {/* Add padding to main to account for fixed header */}
        {page === "dashboard" && <Dashboard />}
        {page === "syllabi" && <Syllabi />}
        {page === "planner" && <Planner />}
        {page === "chat" && <Chat />}
        {page === "browse" && <PublicSearch compact />}
      </main>
    </div>
  );
}
