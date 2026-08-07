import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, resetPassword } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Failed to log in as Admin.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your admin email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg" />
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <div className="admin-login-logo-icon">🍚</div>
          <div>
            <h1>Mandhikkindo</h1>
            <p>Master Admin Console</p>
          </div>
        </div>

        {isForgotPassword ? (
          <>
            <h2 className="admin-login-title">Reset Password</h2>
            <p className="admin-login-sub">Enter your email to receive a password reset link.</p>

            {resetSent ? (
              <div className="admin-login-success">
                <span>✅</span> Reset instructions sent to <strong>{email}</strong>!
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                {error && (
                  <div className="admin-login-error">
                    <span>⚠️</span> {error}
                  </div>
                )}
                <div className="admin-form-group">
                  <label className="admin-form-label">Admin Email</label>
                  <div className="admin-input-group">
                    <span className="admin-input-icon">✉️</span>
                    <input
                      type="email"
                      required
                      className="admin-form-input"
                      placeholder="admin@mandhikkindo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="admin-btn admin-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  {loading ? <span className="admin-spinner" /> : "Send Reset Email"}
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setIsForgotPassword(false);
                setResetSent(false);
                setError("");
              }}
              className="admin-btn admin-btn-secondary"
              style={{ width: "100%", justifyContent: "center", marginTop: "14px" }}
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <h2 className="admin-login-title">Admin Login</h2>
            <p className="admin-login-sub">Access strict administrator dashboard controls.</p>

            {error && (
              <div className="admin-login-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="admin-form-group">
                <label className="admin-form-label">Email Address</label>
                <div className="admin-input-group">
                  <span className="admin-input-icon">✉️</span>
                  <input
                    type="email"
                    required
                    className="admin-form-input"
                    placeholder="admin@mandhikkindo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Password</label>
                <div className="admin-input-group">
                  <span className="admin-input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="admin-form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="admin-remember-row">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="admin-forgot-link"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="admin-btn admin-btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "12px" }}
              >
                {loading ? <span className="admin-spinner" /> : "Authenticate Admin"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
