import { useApp } from "../context/AppContext";
import "./BuddySection.css";

export default function BuddySection() {
  const { openCommunity } = useApp();

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
          <button className="btn btn-primary" onClick={() => openCommunity("create")}>
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
