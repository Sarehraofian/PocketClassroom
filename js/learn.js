import { renderLibrary } from "./library.js";

export function initLearn() {
   // Get main Learn section elements
  const learnContent = document.getElementById("learn-content");
  const learnSelect = document.getElementById("learn-capsule-select");
   // Remove old export button if exists
  const exportBtn = document.getElementById("export-capsule-btn");
  if (exportBtn) exportBtn.remove();
  // Load capsule index from localStorage
  const indexList = JSON.parse(
    localStorage.getItem("pc_capsules_index") || "[]"
  );
   // Populate dropdown with capsule titles
  learnSelect.innerHTML = '<option value="">Select Capsule</option>';
  indexList.forEach((c) => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.title;
    learnSelect.appendChild(option);
  });
// Save capsule and update index
  function saveCapsuleAndIndex(capsule) {
    localStorage.setItem(`pc_capsule_${capsule.id}`, JSON.stringify(capsule));
    const idx = JSON.parse(localStorage.getItem("pc_capsules_index") || "[]");
    const i = idx.findIndex((x) => x.id === capsule.id);
    const known = (capsule.flashcards || []).filter(
      (f) => f.status === "known"
    ).length;
    const unknown = (capsule.flashcards || []).filter(
      (f) => f.status === "unknown"
    ).length;
    const quizProgress = capsule.lastScorePercent || 0;
    const updatedAt = new Date().toISOString();
    // Update or add capsule data
    if (i !== -1) {
      idx[i] = {
        ...idx[i],
        title: capsule.title,
        subject: capsule.subject,
        level: capsule.level,
        updatedAt,
        flashcardStats: { known, unknown },
        quizProgress,
      };
    } else {
      idx.push({
        id: capsule.id,
        title: capsule.title,
        subject: capsule.subject,
        level: capsule.level,
        updatedAt,
        flashcardStats: { known, unknown },
        quizProgress,
      });
    }
    localStorage.setItem("pc_capsules_index", JSON.stringify(idx));
    try {
      renderLibrary();
    } catch (e) {}
  }
// Load a capsule by its ID
  function loadCapsuleById(capsuleId) {
    const capsule = JSON.parse(localStorage.getItem(`pc_capsule_${capsuleId}`));
    if (!capsule) {
      learnContent.innerHTML = `<p class="text-muted">Capsule not found.</p>`;
      return;
    }
// Initialize flashcards and quiz progress if missing
    capsule.flashcards = (capsule.flashcards || []).map((fc) => ({
      ...fc,
      status: fc.status || "unseen",
    }));
    capsule.lastScorePercent = capsule.lastScorePercent || 0;

    learnSelect.value = capsuleId;
// Main Learn view UI (Notes / Flashcards / Quiz tabs)
    learnContent.innerHTML = `
      <div class="mb-3 p-3 bg-dark text-light rounded d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-0">${capsule.title}</h5>
          <small class="text-muted">${capsule.subject || "N/A"}</small>
        </div>
        <button id="export-now" class="btn btn-sm btn-outline-info ms-2"><i class="fa fa-download me-1"></i>Export</button>
      </div>

      <div class="learn-tabs d-flex gap-2 mb-2" role="tablist" aria-label="Learn sections">
        <button class="btn btn-sm btn-outline-light" data-target="notes" role="tab" id="notes-tab">Notes</button>
        <button class="btn btn-sm btn-outline-light" data-target="flashcards" role="tab" id="flashcards-tab">Flashcards</button>
        <button class="btn btn-sm btn-outline-light" data-target="quiz" role="tab" id="quiz-tab">Quiz</button>
      </div>

      <div id="learn-sections">
        <div id="notes" class="learn-section d-none bg-dark text-light p-2 rounded">
          <h6>Key notes — ${capsule.title}</h6>
          <div class="notes-list p-2 rounded mb-3">
            ${
              (capsule.notes || [])
                .map((n) => `<div class="mb-1">${n}</div>`)
                .join("") || '<div class="text-muted">No notes.</div>'
            }
          </div>
        </div>

        <div id="flashcards" class="learn-section d-none">
  <div class="flashcard-single-area mb-2"></div>

  <div class="d-flex flex-column flex-md-row w-100 gap-2">
    <!-- Known & Unknown -->
    <div class="d-flex flex-column flex-md-row gap-2">
      <button id="fc-known" class="btn btn-sm btn-success w-100">Known: 0</button>
      <button id="fc-unknown" class="btn btn-sm btn-danger w-100">Unknown: 0</button>
    </div>

    <!-- Back & Next به سمت راست -->
    <div class="d-flex flex-column flex-md-row gap-2 ms-md-auto">
      <button id="fc-back" class="btn btn-sm btn-outline-primary bg-dark w-100">⬅ Back</button>
      <button id="fc-next" class="btn btn-sm btn-outline-success bg-dark w-100">Next ➜</button>
    </div>
  </div>
</div>

        </div>

        <div id="quiz" class="learn-section d-none">
          <div class="quiz-single-area mb-2"></div>
          <div class="btn-group-wrap mt-2">
            <button id="quiz-back" class="btn btn-sm btn-outline-primary bg-dark">⬅ Back</button>
            <button id="quiz-next" class="btn btn-sm btn-outline-success bg-dark">Next ➜</button>
          </div>
        </div>
      </div>
    `;

    // Export capsule as JSON file
    const exportNow = document.getElementById("export-now");
    exportNow.addEventListener("click", () => {
      const data = JSON.stringify(capsule, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${capsule.title.replace(/\s+/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
 // Handle tab navigation
    const tabButtons = Array.from(
      learnContent.querySelectorAll(".learn-tabs [role='tab']")
    );

    function activateTab(index) {
      tabButtons.forEach((b, i) => {
        b.classList.toggle("active", i === index);
        b.style.backgroundColor = i === index ? "#1abcff" : ""; // بنفش نئونی
      });
      const target = tabButtons[index].dataset.target;
      learnContent
        .querySelectorAll(".learn-section")
        .forEach((s) => s.classList.add("d-none"));
      learnContent.querySelector(`#${target}`).classList.remove("d-none");
       // Load tab-specific content
      if (target === "flashcards") renderFlashcardsForCapsule(capsule);
      if (target === "quiz") startQuizForCapsule(capsule);
    }

    // Hide all tabs initially
    tabButtons.forEach((b) => b.classList.remove("active"));
    tabButtons.forEach((b) => (b.style.backgroundColor = ""));
    learnContent
      .querySelectorAll(".learn-section")
      .forEach((s) => s.classList.add("d-none"));

    // Tab navigation with arrow keys
    document.addEventListener("keydown", (e) => {
      const activeIndex = tabButtons.findIndex((tab) =>
        tab.classList.contains("active")
      );
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = (activeIndex + 1) % tabButtons.length;
        tabButtons[nextIndex].click();
        tabButtons[nextIndex].focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex =
          (activeIndex - 1 + tabButtons.length) % tabButtons.length;
        tabButtons[prevIndex].click();
        tabButtons[prevIndex].focus();
      }
    });
// Tab click handler
    tabButtons.forEach((btn, idx) =>
      btn.addEventListener("click", () => activateTab(idx))
    );

    // FLASHCARDS
    function renderFlashcardsForCapsule(capsule) {
      const flashcardsArea = learnContent.querySelector(
        ".flashcard-single-area"
      );
      let fcIndex = 0;
      const btnKnown = learnContent.querySelector("#fc-known");
      const btnUnknown = learnContent.querySelector("#fc-unknown");
      const btnNext = learnContent.querySelector("#fc-next");
      const btnBack = learnContent.querySelector("#fc-back");
      // Update known/unknown counts
      function updateCounts() {
        const known = (capsule.flashcards || []).filter(
          (f) => f.status === "known"
        ).length;
        const unknown = (capsule.flashcards || []).filter(
          (f) => f.status === "unknown"
        ).length;
        btnKnown.textContent = `Known: ${known}`;
        btnUnknown.textContent = `Unknown: ${unknown}`;
      }
       // Render a single flashcard
      function renderFlashcardAt(i) {
        const fc = capsule.flashcards[i];
        if (!fc) {
          flashcardsArea.innerHTML = `<div class="text-muted">No flashcards.</div>`;
          return;
        }
        flashcardsArea.innerHTML = `
          <div class="flip-card mx-auto" tabindex="0" style="width:100%; height:120px;">
            <div class="front fs-5">${fc.term}</div>
            <div class="back fs-6">${fc.definition}</div>
          </div>
          <div class="mt-2 small text-muted">Card ${i + 1} of ${
          capsule.flashcards.length
        }</div>
        `;
        const flipCard = flashcardsArea.querySelector(".flip-card");
        flipCard.addEventListener("click", () =>
          flipCard.classList.toggle("flipped")
        );
        // Flip card with Space key
        flipCard.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault(); // جلوگیری از اسکرول صفحه
        flipCard.classList.toggle("flipped");
      }
    });
      }

      renderFlashcardAt(fcIndex);
      updateCounts();
      // Button actions
      btnKnown.onclick = () => {
        const fc = capsule.flashcards[fcIndex];
        if (fc) fc.status = "known";
        updateCounts();
        saveCapsuleAndIndex(capsule);
      };
      btnUnknown.onclick = () => {
        const fc = capsule.flashcards[fcIndex];
        if (fc) fc.status = "unknown";
        updateCounts();
        saveCapsuleAndIndex(capsule);
      };
      btnNext.onclick = () => {
        if (fcIndex < capsule.flashcards.length - 1) fcIndex++;
        renderFlashcardAt(fcIndex);
      };
      btnBack.onclick = () => {
        if (fcIndex > 0) fcIndex--;
        renderFlashcardAt(fcIndex);
      };
    }

    // QUIZ
   function startQuizForCapsule(capsule) {
  const quizArea = learnContent.querySelector(".quiz-single-area");
  const quizList = capsule.quiz || [];
  let qIndex = 0, qCorrect = 0;

  if (quizList.length === 0) {
    quizArea.innerHTML = `<div class="text-muted">No quiz questions available.</div>`;
    return;
  }

  const btnNext = learnContent.querySelector("#quiz-next");
  const btnBack = learnContent.querySelector("#quiz-back");
// Render a single quiz question
  function renderQuestionAt(i) {
    const q = quizList[i];
    if (!q) {
      quizArea.innerHTML = `<div class="text-muted">Quiz finished — Score: ${qCorrect}/${quizList.length}</div>`;
      return;
    }

    // ساخت container برای گزینه‌ها
    quizArea.innerHTML = `
      <div class="card bg-dark text-light p-3" style="max-width:720px;">
        <div class="mb-2"><strong>Question ${i + 1} of ${quizList.length}</strong></div>
        <div class="mb-2">${q.question}</div>
        <div class="row quiz-options mb-3"></div>
        <div class="mt-2 result"></div>
      </div>
    `;

const optionsContainer = quizArea.querySelector(".quiz-options");
const resultDiv = quizArea.querySelector(".result");
const letters = ["A", "B", "C", "D"];
// Render quiz options
q.options.forEach((opt, idx) => {
  const col = document.createElement("div");
  col.className = "col-12 col-md-6 d-flex mb-2"; // d-flex برای کشیدن ارتفاع
  col.innerHTML = `
    <button class="btn btn-outline-light quiz-answer w-100 flex-fill text-start" data-answer="${letters[idx]}">
      ${letters[idx]}: ${opt}
    </button>
  `;
  optionsContainer.appendChild(col);
});
// Handle answer click
    const answerBtns = quizArea.querySelectorAll(".quiz-answer");
    answerBtns.forEach((btn) => {
      btn.onclick = () => {
        const chosen = btn.dataset.answer;
        if (chosen === q.answer) {
          qCorrect++;
          resultDiv.innerHTML = `<span class="text-success">✔ Correct</span>`;
        } else {
          resultDiv.innerHTML = `<span class="text-danger">✖ Wrong — correct: ${q.answer}</span>`;
        }
        answerBtns.forEach((b) => (b.disabled = true));
        capsule.lastScorePercent = Math.round((qCorrect / quizList.length) * 100);
        saveCapsuleAndIndex(capsule);
      };
    });
  }

  renderQuestionAt(qIndex);
// Navigation buttons
  btnNext.onclick = () => {
    if (qIndex < quizList.length - 1) qIndex++;
    renderQuestionAt(qIndex);
  };

  btnBack.onclick = () => {
    if (qIndex > 0) qIndex--;
    renderQuestionAt(qIndex);
  };
}

// Auto-load capsule from Library if selected
    const fromLibrarySelected = localStorage.getItem("pc_selected_capsule");
    if (fromLibrarySelected) {
      localStorage.removeItem("pc_selected_capsule");
      loadCapsuleById(fromLibrarySelected);
    }
  }
// When user selects a capsule manually
  learnSelect.addEventListener("change", () => {
    if (learnSelect.value) loadCapsuleById(learnSelect.value);
  });
// Auto-load selected capsule if stored
  const selectedCapsule = localStorage.getItem("pc_selected_capsule");
  if (selectedCapsule) loadCapsuleById(selectedCapsule);
}
