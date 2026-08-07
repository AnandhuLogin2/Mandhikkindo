import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useShops } from "../hooks/useShops";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useCommunity } from "../hooks/useCommunity";
import { subscribeQuizQuestions, saveQuizAttemptResult } from "../services/quizService";
import "./QuizSection.css";

function computeMatches(shops, answers) {
  let list = [...shops];
  if (answers.protein) {
    const withProtein = list.filter((s) => (s.types || s.selectedTypes || []).includes(answers.protein));
    if (withProtein.length) list = withProtein;
  }
  if (answers.district && answers.district !== "any") {
    const inDistrict = list.filter((s) => s.district === answers.district);
    if (inDistrict.length) list = inDistrict;
  }
  if (answers.crowd === "family" || answers.crowd === "friends") {
    list = [...list].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
  } else if (answers.budget === "premium") {
    list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (answers.budget === "budget") {
    list = [...list].sort((a, b) => (a.reviews || 0) - (b.reviews || 0) || (b.rating || 0) - (a.rating || 0));
  } else {
    list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  return list.slice(0, 3);
}

export default function QuizSection() {
  const { shops, districts } = useShops();
  const { openCommunity, openShopDetail, playSizzle } = useApp();
  const { user } = useAuth();
  const { groups } = useCommunity();
  const location = useLocation();
  const navigate = useNavigate();

  const [dbQuestions, setDbQuestions] = useState([]);

  useEffect(() => {
    const unsub = subscribeQuizQuestions((items) => {
      if (items && items.length > 0) {
        setDbQuestions(items);
      }
    });
    return () => unsub();
  }, []);

  const questions = useMemo(() => {
    const base = dbQuestions.length > 0 ? dbQuestions : [
      {
        key: "protein",
        text: "Chicken, Beef, Mutton or Fish?",
        options: [
          { label: "Chicken", value: "Chicken Mandhi" },
          { label: "Beef", value: "Beef Mandhi" },
          { label: "Mutton", value: "Mutton Mandhi" },
          { label: "Fish", value: "Fish Mandhi" },
        ],
      },
      {
        key: "spice",
        text: "Spicy or Mild?",
        options: [
          { label: "Bring the heat", value: "spicy" },
          { label: "Keep it mild", value: "mild" },
        ],
      },
      {
        key: "budget",
        text: "Budget bite or Premium plate?",
        options: [
          { label: "Budget", value: "budget" },
          { label: "Premium", value: "premium" },
        ],
      },
    ];

    return [
      ...base,
      {
        key: "district",
        text: "Which district are you in?",
        options: [
          ...districts.map((d) => ({ label: d, value: d })),
          { label: "Surprise me", value: "any" },
        ],
      },
    ];
  }, [dbQuestions, districts]);

  const [stage, setStage] = useState("intro"); // intro | questions | results
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const begin = () => {
    setAnswers({});
    setStep(0);
    setStage("questions");
  };

  const finishQuiz = (finalAnswers) => {
    setStage("results");
    playSizzle();
    saveQuizAttemptResult({ answers: finalAnswers }, user).catch((err) => {
      console.warn("Could not save quiz attempt:", err);
    });
  };

  const pick = (key, value) => {
    const nextAnswers = { ...answers, [key]: value };
    setAnswers(nextAnswers);
    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep((s) => s + 1);
      } else {
        finishQuiz(nextAnswers);
      }
    }, 220);
  };

  const handleCreateGroupFromQuiz = (shopName) => {
    if (!user) {
      navigate("/login", {
        state: { from: location, reason: "Sign in to create a Mandhi group" },
      });
    } else {
      openCommunity("create", shopName);
    }
  };

  const matches = stage === "results" ? computeMatches(shops, answers) : [];
  const q = questions[step];
  const progressPct = ((step + 1) / questions.length) * 100;

  return (
    <section className="section quiz-section" id="interrogation">
      <div className="section-head" data-reveal="fade-up">
        <h2 className="section-title">Start the Interrogation 🍗</h2>
        <p className="section-sub">
          Still confused about where to eat Mandhi? Answer a few questions and we'll find your
          match.
        </p>
      </div>

      <div className="quiz-shell glass" data-reveal="fade-up">
        {stage === "intro" && (
          <div className="quiz-panel active">
            <p className="quiz-intro-text">
              Five quick questions. One perfect plate. No judgement if the answer is "unlimited
              rice."
            </p>
            <button className="btn btn-primary" onClick={begin}>Begin Questioning</button>
          </div>
        )}

        {stage === "questions" && (
          <div className="quiz-panel active">
            <div className="quiz-progress-row">
              <span className="progress-label">Question {step + 1} of {questions.length}</span>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPct}%` }}></div>
              </div>
            </div>
            <h3 className="quiz-question">{q.text}</h3>
            <div className="quiz-options">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  className={`quiz-option ${answers[q.key] === opt.value ? "selected" : ""}`}
                  onClick={() => pick(q.key, opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="quiz-nav-row">
              <button
                className="btn btn-ghost small"
                style={{ visibility: step === 0 ? "hidden" : "visible" }}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                ◂ Previous
              </button>
              <button
                className="btn btn-ghost small"
                onClick={() => {
                  if (step < questions.length - 1) setStep((s) => s + 1);
                  else {
                    setStage("results");
                    playSizzle();
                  }
                }}
              >
                Skip ▸
              </button>
            </div>
          </div>
        )}

        {stage === "results" && (
          <div className="quiz-panel active">
            <Confetti />
            <h3 className="quiz-result-title">Your matches are ready ✨</h3>
            <div className="quiz-result-list">
              {matches.length ? (
                matches.map((s) => (
                  <div
                    className="quiz-result-item"
                    key={s.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => openShopDetail(s)}
                  >
                    <div>
                      <div className="qr-name">{s.name}</div>
                      <div className="qr-loc">{s.district} · Click to view menu</div>
                    </div>
                    <span className="qr-rating">★ {s.rating.toFixed(1)}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: "var(--text-faint)" }}>
                  No exact match — but any pit in Kerala will do.
                </p>
              )}
            </div>

            <div className="going-alone-block">
              <h4 className="going-alone-title">🍗 Going Alone?</h4>
              <div className="going-alone-btns">
                <button
                  className="btn btn-ghost small"
                  onClick={() => openCommunity("browse")}
                >
                  Find a Mandhi Buddy
                </button>
                <button
                  className="btn btn-ghost small"
                  onClick={() => handleCreateGroupFromQuiz(matches[0]?.name)}
                >
                  Create a Mandhi Group
                </button>
              </div>
              <h5 className="active-groups-title">Active Community Groups</h5>
              <div className="quiz-groups-list">
                {groups.slice(0, 3).map((g) => (
                  <div className="quiz-group-chip" key={g.id} onClick={() => openCommunity("browse")}>
                    <span>{g.restaurant}</span>
                    <span className="quiz-group-meta">{g.date} · {(Array.isArray(g.members) ? g.members.length : g.members || 1)}/{g.max}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-outline" onClick={() => setStage("intro")}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Confetti() {
  const colors = ["#F59E0B", "#FFB703", "#F97316", "#D97706"];
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: Math.random() * 100,
        bg: colors[i % colors.length],
        delay: Math.random() * 0.5,
        round: Math.random() > 0.5,
      })),
    []
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            left: `${p.left}%`,
            background: p.bg,
            animationDelay: `${p.delay}s`,
            borderRadius: p.round ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
