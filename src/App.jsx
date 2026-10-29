import { useState } from "react";
import { AuthProvider, useAuth } from "./auth.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import Products from "./pages/ProductsManual.jsx";
import Profile from "./pages/Profile.jsx";
import Categories from "./pages/CategoriesManual.jsx";
import Movies from "./pages/MoviesPage.jsx";

// To add a new table: create a page (copy Products.jsx) and add one line here.
const PAGES = {
  categories: { label: "Categories", Component: Categories },
  products: { label: "Products", Component: Products },
  movies: { label: "Movies", Component: Movies },
  profile: { label: "Profile", Component: Profile },
};

function Layout() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("categories");
  const { Component } = PAGES[page];

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>DC Client</h2>
        <p>{user.name}</p>
        <ul>
          {Object.entries(PAGES).map(([key, p]) => (
            <li key={key}>
              <button className={page === key ? "active" : ""} onClick={() => setPage(key)}>
                {p.label}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={logout}>Logout</button>
      </aside>
      <main className="content">
        <Component />
      </main>
    </div>
  );
}

// Flow: not logged in -> login/register; logged in but not onboarded -> onboarding; otherwise the app.
function Gate() {
  const { user, loading } = useAuth();

  if (loading) return <p className="content">Loading...</p>;
  if (!user) return <AuthPage />;
  if (!user.onboarding_completed) return <OnboardingPage />;
  return <Layout />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
