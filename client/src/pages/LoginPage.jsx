import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Destination to redirect to after successful login
  const from = location.state?.from?.pathname || "/";
  const redirectReason = location.state?.reason;

  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg("");
      setIsSigningIn(true);
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setErrorMsg("Sign-in popup was closed before completing.");
      } else if (err.code === "auth/network-request-failed") {
        setErrorMsg("Network error. Please check your internet connection.");
      } else {
        setErrorMsg(err.message || "Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (authLoading) {
    return (
      <div className="login-page-wrap">
        <div className="login-spinner-container">
          <div className="login-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="login-page-wrap">
      {/* Top Bar Navigation back to Home */}
      <header className="login-top-bar">
        <Link to="/" className="login-back-link">
          <span className="back-arrow">←</span> Back to Mandhikkindo
        </Link>
      </header>

      <main className="login-content">
        <div className="login-glass-card glass">
          {/* Logo Brand */}
          <div className="login-brand">
            <span className="login-logo-mark">🔥</span>
            <h1 className="login-logo-word">Mandhikkindo</h1>
          </div>

          <h2 className="login-title">Welcome to Kerala's Mandhi Discovery</h2>
          <p className="login-subtitle">
            Sign in to create groups, join Mandhi Buddies, and share authentic shop reviews.
          </p>

          {/* Context Notice if redirected */}
          {redirectReason && (
            <div className="login-notice-badge">
              <span className="notice-icon">🔒</span> {redirectReason}
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="login-error-alert" role="alert">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            className="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            aria-label="Continue with Google"
          >
            {isSigningIn ? (
              <span className="btn-loading-flex">
                <span className="small-spinner" /> Signing in...
              </span>
            ) : (
              <>
                <svg className="google-g-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="login-footer-text">
            <span>Browsing shops, maps, and quiz remain free to everyone.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
