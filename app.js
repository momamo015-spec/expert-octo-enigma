import { firebaseConfig } from "./firebase-config.js";

const input = document.querySelector("#searchInput");
const searchForm = document.querySelector("#searchForm");
const emailForm = document.querySelector("#signupForm");
const emailInput = document.querySelector("#emailInput");
const emailMessage = document.querySelector("#emailMessage");
const firebaseReady = !Object.values(firebaseConfig).some((value) => value.startsWith("YOUR_"));
let db = null;

if (firebaseReady) {
  const [{ initializeApp }, { getFirestore, collection, addDoc, serverTimestamp }] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
  ]);
  const app = initializeApp(firebaseConfig);
  db = { firestore: getFirestore(app), collection, addDoc, serverTimestamp };
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) { input.focus(); return; }
  if (db) await db.addDoc(db.collection(db.firestore, "searches"), { query, createdAt: db.serverTimestamp() });
  const resultsSection = document.querySelector("#results");
  const resultsList = document.querySelector("#resultsList");
  const resultsTitle = document.querySelector("#resultsTitle");
  const resultsCount = document.querySelector("#resultsCount");
  resultsSection.hidden = false;
  resultsTitle.textContent = `نتائج: ${query}`;
  resultsCount.textContent = "جارِ البحث...";
  resultsList.innerHTML = '<div class="loading">نبحث لك في Google...</div>';
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  try {
    const provider = document.querySelector("#providerSelect").value;
    const response = await fetch(`/api/search?provider=${provider}&q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Search API unavailable");
    const data = await response.json();
    const items = data.items || [];
    resultsCount.textContent = `${items.length} نتيجة`;
    resultsList.innerHTML = items.length ? items.map((item) => `<a class="result-card open-inside" href="${escapeHtml(item.link)}" data-url="${escapeHtml(item.link)}"><cite>${escapeHtml(item.displayLink || item.link)}</cite><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.snippet || "")}</p></a>`).join("") : '<div class="loading">لم نجد نتائج. جرّب كلمات مختلفة.</div>';
    resultsList.querySelectorAll(".open-inside").forEach((card) => card.addEventListener("click", (event) => { event.preventDefault(); openInsideSite(card.dataset.url); }));
  } catch {
    resultsCount.textContent = "";
    resultsList.innerHTML = `<div class="loading">تعذر الاتصال بخدمة البحث المحلية. <a href="https://www.google.com/search?q=${encodeURIComponent(query)}" target="_blank" rel="noopener noreferrer">افتح النتائج في Google</a></div>`;
  }
});

function openInsideSite(url) {
  const viewer = document.querySelector("#siteViewer");
  const frame = document.querySelector("#siteFrame");
  const address = document.querySelector("#viewerAddress");
  try { new URL(url); } catch { return; }
  frame.src = url;
  address.textContent = url;
  viewer.hidden = false;
  viewer.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelector("#closeViewer").addEventListener("click", () => {
  const viewer = document.querySelector("#siteViewer");
  document.querySelector("#siteFrame").src = "about:blank";
  viewer.hidden = true;
});

document.querySelector("#googleResults").addEventListener("click", (event) => {
  const link = event.target.closest("a.gs-title, a.gs-visibleUrl");
  if (!link || !link.href) return;
  event.preventDefault();
  openInsideSite(link.href);
});

window.addEventListener("message", (event) => {
  if (event.data?.type === "open-inside") openInsideSite(event.data.url);
});

function escapeHtml(value) {
  return String(value).replace(/[&<>\"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#039;" })[character]);
}

document.querySelector("#clearSearch").addEventListener("click", () => { input.value = ""; input.focus(); });
document.querySelectorAll("[data-query]").forEach((button) => button.addEventListener("click", () => { input.value = button.dataset.query; input.focus(); }));

emailForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.(com|mom)$/i.test(email)) {
    emailMessage.textContent = "استخدم بريدًا ينتهي بـ .com أو .mom";
    emailMessage.style.color = "#c65151";
    return;
  }
  if (db) await db.addDoc(db.collection(db.firestore, "subscribers"), { email, createdAt: db.serverTimestamp() });
  emailMessage.textContent = firebaseReady ? "تم الاشتراك بنجاح — شكرًا لك!" : "تم التحقق! فعّل Firebase لحفظ الاشتراك في قاعدة البيانات.";
  emailMessage.style.color = "#3d756a";
  emailInput.value = "";
});

document.querySelector("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.querySelector("#themeToggle").textContent = document.body.classList.contains("dark") ? "☾" : "☼";
});
