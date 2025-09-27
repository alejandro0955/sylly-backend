import React, { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Dashboard from "./pages/Dashboard";
import Syllabi from "./pages/Syllabi";
import Planner from "./pages/Planner";
import Chat from "./pages/Chat";
import PublicSearch from "./pages/PublicSearch";
import { setAccessTokenSupplier } from "./api/client";

const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

const NAV_ITEMS = [
  ["dashboard", "Dashboard"],
  ["syllabi", "My Syllabi"],
  ["planner", "Planner"],
  ["chat", "Chat"],
  ["browse", "Shared Syllabi"],
];

function Nav({ page, setPage, userName, onLogout }) {
  return (
    <header>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <strong>Sylly</strong>
        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          <span className="muted">{userName}</span>
          <button type="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
      <nav className="row">
        {NAV_ITEMS.map(([key, label]) => (
          <a
            key={key}
            href="#"
            className={page === key ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setPage(key);
            }}
          >
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
            Sign in with Auth0 to upload syllabi, review extracted events, and push them to your Google Calendar.
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