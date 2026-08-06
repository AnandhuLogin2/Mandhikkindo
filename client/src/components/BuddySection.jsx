import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import "./BuddySection.css";

export default function BuddySection() {
  const { openCommunity } = useApp();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleCreateGroup = () => {
    if (!user) {
      navigate("/login", {
        state: { from: location, reason: "Sign in to create a Mandhi group" },
      });
    } else {
      openCommunity("create");
    }
  };

  return (
    <section className="section buddy-section" id="buddy">
      <div className="buddy-shell glass" data-reveal="fade-up">
        <div className="buddy-text">
          <h2 className="section-title">🍗 Find Your Mandhi Buddy</h2>
          <p className="section-sub">
            Want to eat Mandhi but don't have anyone to join you? Create or join a nearby Mandhi
            meetup.
          </p>
        </div>
        <div className="buddy-btn-row">
          <button className="btn btn-primary" onClick={handleCreateGroup}>
            Create a Mandhi Group
          </button>
          <button className="btn btn-ghost" onClick={() => openCommunity("browse")}>
            Join a Nearby Group
          </button>
          <button className="btn btn-outline" onClick={() => openCommunity("browse")}>
            View All Communities
          </button>
        </div>
      </div>
    </section>
  );
}
