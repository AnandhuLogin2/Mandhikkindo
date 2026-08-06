import { useCallback, useEffect, useState } from "react";

const KEY = "mk-community-groups-v1";

const SEED_MESSAGES = [
  "Anyone up for Chicken Mandhi tonight? Table for 4 booked.",
  "Craving Beef Mandhi this weekend, join if you're free!",
  "First-timer trying mandhi, would love some company.",
  "Regular Friday mandhi crew — always room for one more.",
];

function seedGroups(shops) {
  if (!shops.length) return [];
  const now = Date.now();
  const picks = [...shops].sort((a, b) => b.reviews - a.reviews).slice(0, 6);
  return picks.map((shop, i) => {
    const daysAhead = [0, 1, 2, 3, 5, 6][i % 6];
    const date = new Date(now + daysAhead * 86400000);
    return {
      id: `seed-${shop.id}`,
      restaurant: shop.name,
      district: shop.district,
      date: date.toISOString().slice(0, 10),
      time: ["19:00", "13:30", "20:00", "12:30", "19:30", "18:00"][i % 6],
      max: [4, 6, 3, 5, 4, 8][i % 6],
      members: 1 + (i % 3),
      message: SEED_MESSAGES[i % SEED_MESSAGES.length],
      category: (shop.types && shop.types[0]) || "Chicken Mandhi",
      host: ["Anoop", "Fathima", "Rahul", "Meera", "Sabith", "Aleena"][i % 6],
      createdAt: now - i * 100000,
      messages: [],
    };
  });
}

export function useCommunity(shops) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setGroups(JSON.parse(raw));
      } else {
        const seed = seedGroups(shops);
        setGroups(seed);
        localStorage.setItem(KEY, JSON.stringify(seed));
      }
    } catch {
      setGroups(seedGroups(shops));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops.length]);

  const persist = useCallback((next) => {
    setGroups(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const createGroup = useCallback(
    (group) => {
      const newGroup = {
        id: `g-${Date.now()}`,
        members: 1,
        messages: [],
        createdAt: Date.now(),
        ...group,
      };
      persist([newGroup, ...groups]);
      return newGroup;
    },
    [groups, persist]
  );

  const joinGroup = useCallback(
    (id) => {
      const next = groups.map((g) =>
        g.id === id && g.members < g.max ? { ...g, members: g.members + 1 } : g
      );
      persist(next);
    },
    [groups, persist]
  );

  const addMessage = useCallback(
    (id, text, author = "You") => {
      const next = groups.map((g) =>
        g.id === id
          ? { ...g, messages: [...(g.messages || []), { text, author, at: Date.now() }] }
          : g
      );
      persist(next);
    },
    [groups, persist]
  );

  return { groups, createGroup, joinGroup, addMessage };
}
