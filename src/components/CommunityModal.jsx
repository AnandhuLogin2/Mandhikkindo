import { useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { useShops } from "../hooks/useShops";
import { useCommunity } from "../hooks/useCommunity";
import "./CommunityModal.css";

export default function CommunityModal() {
  const {
    communityOpen, setCommunityOpen,
    communityTab, setCommunityTab,
    prefillShop, showToast,
  } = useApp();
  const { shops, districts } = useShops();
  const { groups, createGroup, joinGroup, addMessage } = useCommunity(shops);

  const [detailId, setDetailId] = useState(null);
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [chip, setChip] = useState("all");

  useEffect(() => {
    if (!communityOpen) {
      setDetailId(null);
      setSearch("");
      setDistrictFilter("");
      setChip("all");
    }
  }, [communityOpen]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setCommunityOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommunityOpen]);

  const filteredGroups = useMemo(() => {
    let list = [...groups];
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);

    if (chip === "today") list = list.filter((g) => g.date === today);
    else if (chip === "tomorrow") list = list.filter((g) => g.date === tomorrow);
    else if (chip === "weekend")
      list = list.filter((g) => [0, 6].includes(new Date(g.date).getDay()));
    else if (chip === "family") list = list.filter((g) => g.max >= 5);
    else if (chip !== "all") list = list.filter((g) => g.category === chip);

    if (districtFilter) list = list.filter((g) => g.district === districtFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (g) => g.restaurant.toLowerCase().includes(q) || g.district.toLowerCase().includes(q)
      );
    }
    return list;
  }, [groups, chip, districtFilter, search]);

  const detailGroup = groups.find((g) => g.id === detailId);

  if (!communityOpen) return null;

  return (
    <div className="community-modal" onClick={() => setCommunityOpen(false)}>
      <div className="community-modal-inner glass" onClick={(e) => e.stopPropagation()}>
        <div className="community-modal-head">
          <div className="community-tabs">
            <button
              className={`community-tab ${communityTab === "browse" && !detailId ? "active" : ""}`}
              onClick={() => { setCommunityTab("browse"); setDetailId(null); }}
            >
              Browse Groups
            </button>
            <button
              className={`community-tab ${communityTab === "create" ? "active" : ""}`}
              onClick={() => { setCommunityTab("create"); setDetailId(null); }}
            >
              Create Group
            </button>
          </div>
          <button className="icon-btn" aria-label="Close community" onClick={() => setCommunityOpen(false)}>✕</button>
        </div>

        {detailId && detailGroup ? (
          <GroupDetail
            group={detailGroup}
            onBack={() => setDetailId(null)}
            onJoin={() => { joinGroup(detailGroup.id); showToast(`Joined ${detailGroup.restaurant}'s group.`); }}
            onSend={(text) => addMessage(detailGroup.id, text)}
          />
        ) : communityTab === "browse" ? (
          <BrowsePanel
            groups={filteredGroups}
            districts={districts}
            search={search} setSearch={setSearch}
            districtFilter={districtFilter} setDistrictFilter={setDistrictFilter}
            chip={chip} setChip={setChip}
            onOpen={(g) => setDetailId(g.id)}
          />
        ) : (
          <CreatePanel
            shops={shops}
            districts={districts}
            prefillShop={prefillShop}
            onCreate={(group) => {
              const g = createGroup(group);
              showToast("Mandhi group created!");
              setDetailId(g.id);
            }}
          />
        )}
      </div>
    </div>
  );
}

function BrowsePanel({ groups, districts, search, setSearch, districtFilter, setDistrictFilter, chip, setChip, onOpen }) {
  const CHIPS = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "tomorrow", label: "Tomorrow" },
    { key: "weekend", label: "This Weekend" },
    { key: "Chicken Mandhi", label: "Chicken" },
    { key: "Beef Mandhi", label: "Beef" },
    { key: "family", label: "Family Groups" },
  ];
  return (
    <div className="community-panel active">
      <div className="community-filters">
        <input
          type="text"
          placeholder="Search restaurant or district…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
          <option value="">All Districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <div className="filter-chip-row">
          {CHIPS.map((c) => (
            <button
              key={c.key}
              className={`chip ${chip === c.key ? "active" : ""}`}
              onClick={() => setChip(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {groups.length ? (
        <div className="community-grid">
          {groups.map((g) => (
            <button className="community-card" key={g.id} onClick={() => onOpen(g)}>
              <div className="cc-top">
                <span className="cc-restaurant">{g.restaurant}</span>
                <span className="cc-members">{g.members}/{g.max}</span>
              </div>
              <span className="cc-district">{g.district}</span>
              <span className="cc-when">{formatDate(g.date)} · {g.time}</span>
              <span className="cc-category">{g.category}</span>
              {g.message && <p className="cc-message">"{g.message}"</p>}
            </button>
          ))}
        </div>
      ) : (
        <p className="community-empty">No groups match those filters yet — be the first to create one.</p>
      )}
    </div>
  );
}

function CreatePanel({ shops, districts, prefillShop, onCreate }) {
  const [restaurant, setRestaurant] = useState(prefillShop || "");
  const [district, setDistrict] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:30");
  const [max, setMax] = useState(4);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (prefillShop) {
      setRestaurant(prefillShop);
      const shop = shops.find((s) => s.name === prefillShop);
      if (shop) setDistrict(shop.district);
    }
  }, [prefillShop, shops]);

  const submit = (e) => {
    e.preventDefault();
    if (!restaurant || !district || !date) return;
    const shop = shops.find((s) => s.name === restaurant);
    onCreate({
      restaurant,
      district,
      date,
      time,
      max: Number(max),
      message,
      category: shop?.types?.[0] || "Chicken Mandhi",
      host: "You",
    });
  };

  return (
    <div className="community-panel active">
      <form className="create-group-form" onSubmit={submit}>
        <label>
          Restaurant
          <input
            list="restaurant-list"
            required
            placeholder="Start typing a shop name…"
            autoComplete="off"
            value={restaurant}
            onChange={(e) => {
              setRestaurant(e.target.value);
              const shop = shops.find((s) => s.name === e.target.value);
              if (shop) setDistrict(shop.district);
            }}
          />
        </label>
        <datalist id="restaurant-list">
          {shops.map((s) => (
            <option key={s.id} value={s.name} />
          ))}
        </datalist>

        <label>
          District
          <select required value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="" disabled>Select a district</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>

        <div className="form-row-2">
          <label>Date
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>Time
            <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
        </div>

        <label>
          Maximum Members (2–10)
          <input
            type="number" min={2} max={10} required
            value={max} onChange={(e) => setMax(e.target.value)}
          />
        </label>

        <label>
          Short Description (optional)
          <textarea
            maxLength={140} rows={2}
            placeholder="Anyone interested in Chicken Mandhi tonight?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>

        <button type="submit" className="btn btn-primary">Create Group</button>
      </form>
    </div>
  );
}

function GroupDetail({ group, onBack, onJoin, onSend }) {
  const [text, setText] = useState("");
  const full = group.members >= group.max;

  return (
    <div className="community-panel active">
      <button className="detail-back-btn" onClick={onBack}>◂ Back to groups</button>
      <div className="community-detail-content">
        <h3 className="detail-title">{group.restaurant}</h3>
        <p className="detail-sub">{group.district} · {formatDate(group.date)} at {group.time}</p>
        <div className="detail-meta-row">
          <span className="detail-tag">{group.category}</span>
          <span className="detail-tag">{group.members}/{group.max} joined</span>
          <span className="detail-tag">Hosted by {group.host}</span>
        </div>
        {group.message && <p className="detail-message">"{group.message}"</p>}

        <button className="btn btn-primary" disabled={full} onClick={onJoin}>
          {full ? "Group is full" : "Join this Group"}
        </button>

        <div className="detail-chat">
          <h4>Group chat</h4>
          <div className="detail-chat-list">
            {(group.messages || []).length === 0 && (
              <p className="detail-chat-empty">No messages yet — say hi!</p>
            )}
            {(group.messages || []).map((m, i) => (
              <div className="detail-chat-msg" key={i}>
                <strong>{m.author}:</strong> {m.text}
              </div>
            ))}
          </div>
          <form
            className="detail-chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              onSend(text.trim());
              setText("");
            }}
          >
            <input
              type="text"
              placeholder="Say something to the group…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}
