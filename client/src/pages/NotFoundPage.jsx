import { Link } from "react-router-dom";
import "./LoginPage.css";

export default function NotFoundPage() {
  return (
    <div className="login-page-wrap">
      <main className="login-content">
        <div className="login-glass-card glass">
          <div className="login-brand">
            <span className="login-logo-mark">🔥</span>
            <span className="login-logo-word">Mandhikkindo</span>
          </div>

          <h1 style={{ fontSize: "3rem", color: "var(--ember)", margin: "0.5rem 0" }}>404</h1>
          <h2 className="login-title">Page Not Found</h2>
          <p className="login-subtitle">
            Looks like this pit was moved or doesn't exist. Let's get you back to the feast.
          </p>

          <Link to="/" className="btn btn-primary" style={{ textDecoration: "none", width: "100%" }}>
            ← Back to Mandhikkindo
          </Link>
        </div>
      </main>
    </div>
  );
}
