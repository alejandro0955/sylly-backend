import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Syllabi from "./pages/Syllabi";
import Planner from "./pages/Planner";
import Chat from "./pages/Chat";

function Nav({ page, setPage }) {
	return (
		<header>
			<strong>Sylly (No Auth)</strong>
			<nav className="row">
				<a
					href="#"
					onClick={(e) => {
						e.preventDefault();
						setPage("dashboard");
					}}
				>
					Dashboard
				</a>
				<a
					href="#"
					onClick={(e) => {
						e.preventDefault();
						setPage("syllabi");
					}}
				>
					Syllabi
				</a>
				<a
					href="#"
					onClick={(e) => {
						e.preventDefault();
						setPage("planner");
					}}
				>
					Planner
				</a>
				<a
					href="#"
					onClick={(e) => {
						e.preventDefault();
						setPage("chat");
					}}
				>
					Chat
				</a>
			</nav>
		</header>
	);
}

export default function App() {
	const [page, setPage] = useState("dashboard");
	return (
		<div>
			<Nav page={page} setPage={setPage} />
			<main>
				{page === "dashboard" && <Dashboard />}
				{page === "syllabi" && <Syllabi />}
				{page === "planner" && <Planner />}
				{page === "chat" && <Chat />}
			</main>
		</div>
	);
}
