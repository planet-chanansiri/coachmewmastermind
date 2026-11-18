(function () {
  "use strict";

  var D = window.QUIZ_DATA;
  var app = document.getElementById("app");
  var UI = D.assessment_ui;
  var TOTAL = D.questions.length;
  var TYPE_ORDER = ["G", "D", "T", "V"];

  var state = { screen: "intro", index: 0, answers: new Array(TOTAL).fill(null) };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Celestial icons (approved palette only) ---------- */
  var ICONS = {
    G: // Sun
      '<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="#BE9261" stroke-width="4" stroke-linecap="round">' +
      [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) {
        return '<line x1="50" y1="10" x2="50" y2="20" transform="rotate(' + a + ' 50 50)"/>';
      }).join("") +
      '</g><circle cx="50" cy="50" r="22" fill="#BE9261"/><circle cx="50" cy="50" r="14" fill="#DCC6A4" opacity=".55"/></svg>',
    D: // Comet
      '<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="ct" x1="0" y1="1" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#DCC6A4" stop-opacity="0"/><stop offset="1" stop-color="#DCC6A4"/></linearGradient></defs>' +
      '<path d="M14 86 L60 34 L72 48 Z" fill="url(#ct)"/><path d="M24 88 L64 44" stroke="#BE9261" stroke-width="2" opacity=".6"/>' +
      '<circle cx="68" cy="36" r="16" fill="#DCC6A4"/><circle cx="68" cy="36" r="8" fill="#F4EFE8"/></svg>',
    T: // Saturn
      '<svg viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(-18 50 52)">' +
      '<path d="M8 52 A42 11 0 0 1 92 52" fill="none" stroke="#BE9261" stroke-width="4"/>' +
      '<circle cx="50" cy="52" r="22" fill="#DCC6A4"/>' +
      '<path d="M32 44 Q50 39 68 44" stroke="#BE9261" stroke-width="3" fill="none" opacity=".6"/>' +
      '<path d="M8 52 A42 11 0 0 0 92 52" fill="none" stroke="#BE9261" stroke-width="4"/></g></svg>',
    V: // Moon
      '<svg viewBox="0 0 100 100" aria-hidden="true"><mask id="mm"><rect width="100" height="100" fill="#fff"/>' +
      '<circle cx="64" cy="40" r="26" fill="#000"/></mask><circle cx="48" cy="52" r="32" fill="#F4EFE8" mask="url(#mm)"/>' +
      '<circle cx="78" cy="22" r="2.5" fill="#BE9261"/><circle cx="86" cy="40" r="1.8" fill="#DCC6A4"/></svg>'
  };

  function chapterOf(qIndex) {
    var q = D.questions[qIndex];
    return D.chapters.filter(function (c) { return c.id === q.chapter; })[0];
  }

  function render() {
    window.scrollTo(0, 0);
    var s = state.screen;
    if (s === "intro") return renderIntro();
    if (s === "question") return renderQuestion();
    if (s === "chapter") return renderChapter();
    if (s === "complete") return renderComplete();
    if (s === "result") return renderResult();
  }

  /* ---------- Intro: brand story + welcome ---------- */
  function renderIntro() {
    var bs = D.brand_story;
    var chapters = D.chapters.map(function (c) {
      return "<div><b>CHAPTER " + c.id + "</b><span>" + esc(c.title_th) + "</span></div>";
    }).join("");

    app.innerHTML =
      '<section class="story" aria-labelledby="story-h">' +
        '<div class="wrap wide">' +
          '<div class="eyebrow">' + esc(bs.section_label) + "</div>" +
          '<h1 id="story-h">' + esc(bs.headline) + "</h1>" +
          '<div class="story-cols">' + bs.paragraphs.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>" +
        "</div>" +
      "</section>" +
      '<section class="story-closing"><div class="wrap wide"><blockquote>' + esc(bs.closing_quote) + "</blockquote></div></section>" +
      '<section class="welcome"><div class="wrap">' +
        '<div class="eyebrow">' + esc(D.project) + "</div>" +
        "<h2>Cosmic Identity</h2>" +
        '<p class="lead">' + esc(UI.welcome) + "</p>" +
        '<p class="note">' + esc(UI.instruction) + "</p>" +
        '<div class="chapters-preview">' + chapters + "</div>" +
        '<button class="btn" id="start">' + esc(UI.start) + " →</button>" +
        '<p class="meta">' + TOTAL + " ข้อ · ประมาณ 4–6 นาที</p>" +
        '<p class="disclaimer">' + esc(D.public_disclaimer) + "</p>" +
      "</div></section>";

    document.getElementById("start").onclick = function () {
      state.index = 0;
      state.screen = "question";
      render();
    };
  }

  /* ---------- Question ---------- */
  function renderQuestion() {
    var i = state.index;
    var q = D.questions[i];
    var ch = chapterOf(i);
    var answered = state.answers.filter(function (a) { return a !== null; }).length;
    var selected = state.answers[i];

    app.innerHTML =
      '<div class="wrap">' +
        '<div class="progress"><span>ข้อ ' + (i + 1) + " / " + TOTAL + '</span><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + TOTAL + '" aria-valuenow="' + answered + '"><i style="width:' + (answered / TOTAL * 100) + '%"></i></div><span>' + answered + "/" + TOTAL + "</span></div>" +
        '<article class="qcard">' +
          '<div class="eyebrow">Chapter ' + ch.id + " · " + esc(ch.name) + " · " + esc(q.title) + "</div>" +
          '<h2 id="qh">' + esc(q.prompt) + "</h2>" +
          '<div class="answers" role="radiogroup" aria-labelledby="qh">' +
            q.answers.map(function (a, k) {
              return '<button class="answer" role="radio" data-k="' + k + '" aria-checked="' + (selected === k) + '">' +
                '<span class="opt">' + esc(a.option) + "</span><span>" + esc(a.text) + "</span></button>";
            }).join("") +
          "</div>" +
        "</article>" +
        '<div class="nav">' +
          '<button class="btn btn-ghost" id="back">← ' + esc(UI.back) + "</button>" +
          '<button class="btn" id="next"' + (selected === null ? " disabled" : "") + ">" + esc(UI.next) + " →</button>" +
        "</div>" +
      "</div>";

    Array.prototype.forEach.call(app.querySelectorAll(".answer"), function (b) {
      b.onclick = function () {
        state.answers[i] = Number(b.dataset.k);
        renderQuestion();
        var nb = document.getElementById("next");
        if (nb) nb.focus({ preventScroll: true });
      };
    });

    document.getElementById("back").onclick = function () {
      if (i === 0) { state.screen = "intro"; }
      else { state.index = i - 1; }
      render();
    };

    document.getElementById("next").onclick = function () {
      if (state.answers[i] === null) return;
      var done = i + 1;
      if (done === UI.reveal_after) { state.screen = "complete"; }
      else if (UI.chapter_transitions_after.indexOf(done) !== -1) { state.index = done; state.screen = "chapter"; }
      else { state.index = done; }
      render();
    };
  }

  /* ---------- Chapter transition ---------- */
  function renderChapter() {
    var ch = chapterOf(state.index);
    app.innerHTML =
      '<div class="wrap center">' +
        '<div class="chapter-num">' + ch.id + "</div>" +
        '<div class="eyebrow">Chapter ' + ch.id + " · " + esc(ch.name) + "</div>" +
        "<h2>" + esc(ch.title_th) + "</h2>" +
        "<p>" + esc(ch.intro) + "</p>" +
        '<div class="actions">' +
          '<button class="btn btn-ghost" id="back">← ' + esc(UI.back) + "</button>" +
          '<button class="btn" id="go">ไปต่อ →</button>' +
        "</div>" +
      "</div>";
    document.getElementById("go").onclick = function () { state.screen = "question"; render(); };
    document.getElementById("back").onclick = function () { state.index -= 1; state.screen = "question"; render(); };
  }

  /* ---------- Completion ---------- */
  function renderComplete() {
    app.innerHTML =
      '<div class="wrap center">' +
        '<div class="eyebrow">' + TOTAL + " / " + TOTAL + "</div>" +
        "<h2>" + esc(UI.completion) + "</h2>" +
        "<p>พร้อมแล้วหรือยัง ที่จะรู้จักดวงดาวในตัวคุณ</p>" +
        '<div class="actions">' +
          '<button class="btn btn-ghost" id="back">← ' + esc(UI.back) + "</button>" +
          '<button class="btn" id="reveal">✦ ' + esc(UI.reveal) + "</button>" +
        "</div>" +
      "</div>";
    document.getElementById("reveal").onclick = function () { state.screen = "result"; render(); };
    document.getElementById("back").onclick = function () { state.index = TOTAL - 1; state.screen = "question"; render(); };
  }

  /* ---------- Scoring ---------- */
  function score() {
    var s = { G: 0, D: 0, T: 0, V: 0 };
    state.answers.forEach(function (k, i) {
      if (k === null) return;
      s[D.questions[i].answers[k].type_code] += D.scoring.points_per_answer;
    });
    var max = Math.max.apply(null, TYPE_ORDER.map(function (t) { return s[t]; }));
    var top = TYPE_ORDER.filter(function (t) { return s[t] === max; });
    return { scores: s, top: top };
  }

  function list(items) {
    return "<ul>" + items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
  }

  function typeDetail(code) {
    var t = D.types[code];
    return '<section class="panel" aria-label="' + esc(t.display_name) + '">' +
      "<h3>รู้จัก " + esc(t.display_name) + "</h3>" +
      t.intro.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
      "<h3>พลังที่โดดเด่นของคุณ</h3>" + list(t.strength) +
      "<h3>สไตล์การสร้างความน่าเชื่อถือ · " + esc(t.trust_style) + "</h3><p>" + esc(t.trust) + "</p>" +
      "<h3>คอนเทนต์ที่เข้ากับพลังของคุณ</h3>" + list(t.content) +
      '<div class="callout"><b>ตัวอย่างหัวข้อ:</b> ' + esc(t.example) + "</div>" +
      '<div class="shadow-box"><h3>ด้านเงาที่ควรรู้</h3><p>' + esc(t.shadow) + '</p><p class="line">' + esc(t.shadowline) + "</p></div>" +
      "<h3>ภารกิจ: ลองเล่าเรื่องเหล่านี้</h3>" + list(t.missions) +
      '<p class="reminder">' + esc(t.reminder) + "</p>" +
    "</section>";
  }

  /* ---------- Result ---------- */
  function renderResult() {
    var r = score();
    var joint = r.top.length > 1;

    var heroes = r.top.map(function (code) {
      var t = D.types[code];
      return '<div class="result-hero">' +
        '<div class="icon">' + ICONS[code] + "</div>" +
        '<div class="eyebrow">' + esc(t.symbol) + "</div>" +
        "<h1>" + esc(t.display_name) + "</h1>" +
        '<div class="sub">' + esc(t.title) + "</div>" +
        '<p class="tag">' + esc(t.tag) + "</p>" +
        '<div class="pills"><span class="pill">' + esc(t.signature_power) + '</span><span class="pill">' + esc(t.trust_style) + "</span></div>" +
      "</div>";
    }).join("");

    var bars = TYPE_ORDER.slice().sort(function (a, b) { return r.scores[b] - r.scores[a]; }).map(function (code) {
      var t = D.types[code];
      var pct = Math.round(r.scores[code] / TOTAL * 100);
      return '<div class="score">' + ICONS[code] +
        '<div><div class="name">' + esc(t.display_name) + " · " + esc(t.symbol) + '</div><div class="bar"><i style="width:' + pct + '%"></i></div></div>' +
        '<div class="pct">' + pct + "%</div></div>";
    }).join("");

    var shareText = r.top.map(function (c) { return D.types[c].share; }).join("\n") + "\n#CosmicIdentity #CoachMewMastermind";

    app.innerHTML =
      '<div class="wrap">' +
        '<div class="eyebrow" style="text-align:center">Your Cosmic Identity</div>' +
        (joint ? '<p class="joint">คุณมีพลังโดดเด่นเท่ากันใน ' + r.top.length + " ดวงดาว</p>" : "") +
        heroes +
        '<section class="scores" aria-label="สัดส่วนคำตอบ">' + bars +
          '<p class="note-small">เปอร์เซ็นต์คือสัดส่วนคำตอบของคุณในแต่ละไทป์ ไม่ใช่ความแม่นยำของบุคลิกภาพ</p></section>' +
        r.top.map(typeDetail).join("") +
        '<section class="share">' +
          '<div class="eyebrow">แชร์ดวงดาวของคุณ</div>' +
          '<div class="share-text">' + esc(shareText).replace(/\n/g, "<br>") + "</div>" +
          '<div class="actions">' +
            '<button class="btn" id="copy">คัดลอกข้อความ</button>' +
            '<button class="btn btn-ghost" id="restart">ทำแบบประเมินใหม่</button>' +
          "</div>" +
        "</section>" +
        '<p class="disclaimer">' + esc(D.public_disclaimer) + "</p>" +
      "</div>" +
      '<footer class="footer">© ' + esc(D.project) + "</footer>";

    document.getElementById("copy").onclick = function () {
      var btn = this;
      var full = shareText + "\n" + location.href.split("#")[0];
      var ok = function () { btn.textContent = "คัดลอกแล้ว ✓"; };
      if (navigator.clipboard) navigator.clipboard.writeText(full).then(ok, function () {});
    };
    document.getElementById("restart").onclick = function () {
      state = { screen: "intro", index: 0, answers: new Array(TOTAL).fill(null) };
      render();
    };
  }

  render();
})();
