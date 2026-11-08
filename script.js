(() => {
  "use strict";

  /* ---------- Content (edit these to change the site) ---------- */
  const MENU = {
    Coffee: [
      ["Espresso", "2.60", "Double shot, house blend"],
      ["Flat white", "3.80", "Two shots, silky milk"],
      ["Cappuccino", "3.60", ""],
      ["Filter coffee", "3.00", "Refills are 1.50"],
      ["Iced latte", "4.20", "Over ice, any milk"]
    ],
    Bakes: [
      ["Butter croissant", "3.20", "Baked at 6 a.m."],
      ["Cinnamon roll", "3.90", ""],
      ["Apple tart", "4.10", "Seasonal apples"],
      ["Banana bread", "3.50", "Toasted, with butter"]
    ],
    Lunch: [
      ["Soup of the day", "6.50", "With bread"],
      ["Cheese toastie", "6.90", "Aged cheddar, chutney"],
      ["Avocado toast", "8.20", "Sourdough, chilli, lemon"],
      ["Quiche and salad", "8.90", "Ask for today’s filling"]
    ]
  };

  // 0 = Sunday ... 6 = Saturday. null = closed.
  const HOURS = [
    [9, 16], null, [8, 17], [8, 17], [8, 17], [8, 17], [9, 17]
  ];
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const $ = (sel) => document.querySelector(sel);
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (h) => `${pad(h)}:00`;

  /* ---------- Mobile nav ---------- */
  const toggle = $(".nav-toggle");
  const nav = $("#nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Menu tabs ---------- */
  const tabs = $("#tabs");
  const list = $("#items");

  function renderItems(category) {
    list.innerHTML = "";
    MENU[category].forEach(([name, price, desc]) => {
      const li = document.createElement("li");
      li.innerHTML =
        `<span class="name"></span><span class="dots" aria-hidden="true"></span>` +
        `<span class="price"></span>` + (desc ? `<span class="desc"></span>` : "");
      li.querySelector(".name").textContent = name;
      li.querySelector(".price").textContent = `€${price}`;
      if (desc) li.querySelector(".desc").textContent = desc;
      list.appendChild(li);
    });
  }

  function selectTab(btn) {
    tabs.querySelectorAll("button").forEach((b) => {
      b.setAttribute("aria-selected", String(b === btn));
      b.tabIndex = b === btn ? 0 : -1;
    });
    list.setAttribute("aria-labelledby", btn.id);
    renderItems(btn.dataset.category);
  }

  Object.keys(MENU).forEach((cat, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.role = "tab";
    b.id = `tab-${i}`;
    b.dataset.category = cat;
    b.textContent = cat;
    b.addEventListener("click", () => selectTab(b));
    tabs.appendChild(b);
  });

  tabs.addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    const btns = [...tabs.querySelectorAll("button")];
    const i = btns.indexOf(document.activeElement);
    const next = btns[(i + (e.key === "ArrowRight" ? 1 : -1) + btns.length) % btns.length];
    next.focus();
    selectTab(next);
  });

  selectTab(tabs.firstElementChild);

  /* ---------- Opening hours and live status ---------- */
  const hoursBody = $("#hours");
  const today = new Date().getDay();
  [1, 2, 3, 4, 5, 6, 0].forEach((d) => {
    const tr = document.createElement("tr");
    if (d === today) tr.className = "today";
    const h = HOURS[d];
    tr.innerHTML = `<td>${DAYS[d]}</td><td>${h ? `${fmt(h[0])} – ${fmt(h[1])}` : "Closed"}</td>`;
    hoursBody.appendChild(tr);
  });

  function nextOpening(now) {
    for (let i = 1; i <= 7; i++) {
      const d = (now.getDay() + i) % 7;
      if (HOURS[d]) return i === 1 ? `tomorrow at ${fmt(HOURS[d][0])}` : `${DAYS[d]} at ${fmt(HOURS[d][0])}`;
    }
    return "";
  }

  function updateStatus() {
    const el = $("#status");
    const now = new Date();
    const h = HOURS[now.getDay()];
    const hour = now.getHours() + now.getMinutes() / 60;
    let text, state;
    if (h && hour >= h[0] && hour < h[1]) {
      text = `Open now until ${fmt(h[1])}`; state = "open";
    } else if (h && hour < h[0]) {
      text = `Closed. Opens today at ${fmt(h[0])}`; state = "closed";
    } else {
      text = `Closed. Opens ${nextOpening(now)}`; state = "closed";
    }
    el.textContent = text;
    el.className = `status ${state}`;
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---------- Contact form ---------- */
  const form = $("#contact");
  const result = $("#form-result");
  const rules = {
    name: (v) => (v.trim() ? "" : "Enter your name."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email address."),
    message: (v) => (v.trim().length >= 10 ? "" : "Write at least 10 characters.")
  };

  function check(field) {
    const msg = rules[field.name](field.value);
    form.querySelector(`[data-for="${field.name}"]`).textContent = msg;
    field.setAttribute("aria-invalid", String(Boolean(msg)));
    return !msg;
  }

  form.addEventListener("input", (e) => {
    if (e.target.name in rules && e.target.getAttribute("aria-invalid") === "true") check(e.target);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    result.textContent = "";
    const fields = [...form.querySelectorAll("input, textarea")];
    const valid = fields.map(check).every(Boolean);
    if (!valid) {
      fields.find((f) => f.getAttribute("aria-invalid") === "true").focus();
      return;
    }
    // Replace this with a real form service (Formspree, Netlify Forms, your own backend).
    result.textContent = `Thanks, ${form.name.value.trim()}. We will reply by email soon.`;
    form.reset();
  });

  $("#year").textContent = new Date().getFullYear();
})();
