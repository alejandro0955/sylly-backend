import React, { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Dashboard from "./pages/Dashboard";
import Syllabi from "./pages/Syllabi";
import Planner from "./pages/Planner";
import Chat from "./pages/Chat";
import PublicSearch from "./pages/PublicSearch";
import { setAccessTokenSupplier } from "./api/client";
import logo from "../logo.svg";

// Import some icons
import {
  FaTachometerAlt,
  FaBook,
  FaClipboardList,
  FaComments,
  FaSearch,
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

function Nav({ page, setPage, userName, onLogout }) {
  return (
    <header style={{ padding: "12px 24px", borderBottom: "1px solid #ccc" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {/* Left: Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src={logo}
            alt="Sylly Logo"
            width="40"
            height="50"
            className="d-inline-block align-top"
          />
          <strong>Sylly</strong>
        </div>

        {/* Right: Profile info */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="muted">{userName}</span>
          <button type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>

      {/* Nav Links */}
      <nav
        style={{
          display: "flex",
          gap: 16,
          borderTop: "1px solid #eee",
          paddingTop: 8,
        }}
      >
        {NAV_ITEMS.map(([key, label, icon]) => (
          <a
            key={key}
            href="#"
            className={page === key ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setPage(key);
            }}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {icon}
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [apiReady, setApiReady] = useState(false);
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    user,
    getAccessTokenSilently,
  } = useAuth0();

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

  return (
    <div>
      <Nav
        page={page}
        setPage={setPage}
        userName={user?.name || user?.email || "Account"}
        onLogout={() =>
          logout({
            logoutParams: { returnTo: window.location.origin },
          })
        }
      />
      <main>
        {page === "dashboard" && <Dashboard />}
        {page === "syllabi" && <Syllabi />}
        {page === "planner" && <Planner />}
        {page === "chat" && <Chat />}
        {page === "browse" && <PublicSearch compact />}
      </main>
    </div>
  );
}
