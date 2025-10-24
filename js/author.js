import { renderLibrary } from "./library.js";
// Main function to render the Author form (for creating or editing capsules)
export function renderAuthorForm(capsule = null) {
  // Select the container and clear any previous content
  const container = document.getElementById("author-content");
  container.innerHTML = "";
   // Create the form wrapper
  const form = document.createElement("div");
  form.className = "author-form p-3 bg-dark text-light rounded shadow-sm";

  // Hidden input to identify if editing an existing capsule or creating a new one
  const capsuleIdValue = capsule && capsule.id ? capsule.id : "";
 // Build the form HTML structure
  form.innerHTML = `
    <input type="hidden" id="capsule-id" value="${capsuleIdValue}" />

    <div class="d-flex justify-content-between align-items-start mb-3">
      <div>
        <h5 class="mb-1">${capsule ? "Edit Capsule" : "Author Capsules"}</h5>
        <p class="text-muted small mb-0">You can record key information about your capsule here and manage flashcards and quiz questions below.</p>
      </div>
      <div>
        <button type="button" id="save-capsule" class="btn btn-sm btn-success me-2">Save</button>
        <button type="button" id="back-capsule" class="btn btn-sm btn-secondary">Back</button>
      </div>
    </div>

    <div class="row g-3 mb-2">
      <div class="col-md-6">
        <div class="mb-2">
          <label class="form-label">Title *</label>
          <input type="text" class="form-control form-control-sm bg-secondary text-light" id="capsule-title" required />
        </div>
        <div class="mb-2">
          <label class="form-label">Subject</label>
          <input type="text" class="form-control form-control-sm bg-light text-dark" id="capsule-subject" />
        </div>
        <div class="mb-2">
          <label class="form-label">Level</label>
          <select class="form-select form-select-sm bg-secondary text-light" id="capsule-level">
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div class="mb-2">
          <label class="form-label">Description</label>
          <textarea class="form-control form-control-sm bg-secondary text-light" id="capsule-description" rows="2"></textarea>
        </div>
      </div>
      <div class="col-md-6">
        <label class="form-label">Notes (one per line)</label>
        <textarea class="form-control form-control-sm bg-secondary text-light" id="capsule-notes" rows="10" placeholder="Enter your notes here..."></textarea>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card p-3 bg-dark text-light shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6>Add Flashcards</h6>
            <button type="button" id="add-flashcard" class="btn btn-sm btn-outline-primary">Add</button>
          </div>
          <div id="flashcards-list" class="flashcards-list"></div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card p-3 bg-dark text-light shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6>Add Quiz Question</h6>
            <button type="button" id="add-quiz" class="btn btn-sm btn-outline-warning">Add</button>
          </div>
          <div id="quiz-list" class="quiz-list"></div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(form);

  //Helper elements for adding flashcards and quizzes
  const flashcardsList = form.querySelector("#flashcards-list");
  const quizList = form.querySelector("#quiz-list");
  // Function to create and add a flashcard input row
  const addFlashcard = (term = "", definition = "") => {
    const div = document.createElement("div");
    div.className = "d-flex gap-2 mb-2";
    div.innerHTML = `
      <input type="text" class="form-control form-control-sm bg-secondary text-light fc-term" placeholder="Term" value="${term}" />
      <input type="text" class="form-control form-control-sm bg-secondary text-light fc-def" placeholder="Definition" value="${definition}" />
      <button type="button" class="btn btn-sm btn-danger fc-remove">×</button>
    `;
    // Remove flashcard when delete button is clicked
    div.querySelector(".fc-remove").addEventListener("click", () => div.remove());
    flashcardsList.appendChild(div);
  };
  // Function to create and add a quiz question block
  const addQuiz = (question = "", options = ["", "", "", ""], answer = "", explanation = "") => {
    const div = document.createElement("div");
    div.className = "quiz-card mb-2 p-2 border border-secondary rounded";

    div.innerHTML = `
      <div class="mb-1">
        <input type="text" class="form-control form-control-sm bg-secondary text-light q-question" placeholder="Question" value="${question}" />
      </div>
      <div class="row g-1 mb-1">
        <div class="col"><input type="text" class="form-control form-control-sm bg-secondary text-light q-opt" placeholder="Option A" value="${options[0]}" /></div>
        <div class="col"><input type="text" class="form-control form-control-sm bg-secondary text-light q-opt" placeholder="Option B" value="${options[1]}" /></div>
      </div>
      <div class="row g-1 mb-1">
        <div class="col"><input type="text" class="form-control form-control-sm bg-secondary text-light q-opt" placeholder="Option C" value="${options[2]}" /></div>
        <div class="col"><input type="text" class="form-control form-control-sm bg-secondary text-light q-opt" placeholder="Option D" value="${options[3]}" /></div>
      </div>
      <div class="mb-1"><input type="text" class="form-control form-control-sm bg-secondary text-light q-answer" placeholder="Correct Answer:please choose between (A-D)" value="${answer}" /></div>
      <div class="mb-1"><input type="text" class="form-control form-control-sm bg-secondary text-light q-explain" placeholder="Explanation (optional)" value="${explanation}" /></div>
      <button type="button" class="btn btn-sm btn-danger mt-1 q-remove">× Remove</button>
    `;
    // Remove quiz block when delete button is clicked
    div.querySelector(".q-remove").addEventListener("click", () => div.remove());
    quizList.appendChild(div);
  };

  // Button handlers for adding flashcards or quiz questions
  form.querySelector("#add-flashcard").addEventListener("click", () => addFlashcard());
  form.querySelector("#add-quiz").addEventListener("click", () => addQuiz());

    //Prefill form if editing an existing capsule
  if (capsule) {
    form.querySelector("#capsule-title").value = capsule.title || "";
    form.querySelector("#capsule-subject").value = capsule.subject || "";
    // normalize level string to match option values
    const lvl = (capsule.level || "Intermediate").toLowerCase();
    if (lvl.startsWith("b")) form.querySelector("#capsule-level").value = "Beginner";
    else if (lvl.startsWith("a")) form.querySelector("#capsule-level").value = "Advanced";
    else form.querySelector("#capsule-level").value = "Intermediate";

    form.querySelector("#capsule-description").value = capsule.description || "";
    form.querySelector("#capsule-notes").value = (capsule.notes || []).join("\n");

    (capsule.flashcards || []).forEach(fc => addFlashcard(fc.term, fc.definition));
    (capsule.quiz || []).forEach(q => addQuiz(q.question, q.options, q.answer, q.explanation || ""));
  }

  //Save button handler (handles both create and update modes)
  form.querySelector("#save-capsule").addEventListener("click", () => {
    const title = form.querySelector("#capsule-title").value.trim();
    if (!title) { alert("Title is required."); return; }
    // Collect all field values
    const subject = form.querySelector("#capsule-subject").value.trim();
    const level = form.querySelector("#capsule-level").value;
    const description = form.querySelector("#capsule-description").value.trim();
    const notes = form.querySelector("#capsule-notes").value.split("\n").map(n => n.trim()).filter(n => n);
    // Collect flashcards
    const flashcards = Array.from(flashcardsList.children).map(div => {
      const term = div.querySelector(".fc-term")?.value.trim() || "";
      const definition = div.querySelector(".fc-def")?.value.trim() || "";
      return { term, definition, status: "unseen" };
    }).filter(fc => fc.term && fc.definition);
    // Collect quiz data
    const quiz = Array.from(quizList.children).map(div => {
      const question = div.querySelector(".q-question")?.value.trim() || "";
      const opts = Array.from(div.querySelectorAll(".q-opt")).map(i => i.value.trim());
      const answer = div.querySelector(".q-answer")?.value.trim() || "";
      const explanation = div.querySelector(".q-explain")?.value.trim() || "";
      return { question, options: opts, answer, explanation };
    }).filter(q => q.question && q.options.every(o => o) && q.answer);
    // Load capsule index list from localStorage
    const indexList = JSON.parse(localStorage.getItem("pc_capsules_index") || "[]");
    // Get existing capsule ID (if editing)
    const existingId = form.querySelector("#capsule-id").value;
    const now = new Date().toISOString();
    // Update existing capsule
    if (existingId) {
      
      const idx = indexList.findIndex(c => c.id === existingId);
      const updatedCapsule = {
        id: existingId,
        title, subject, level, description,
        notes, flashcards, quiz,
        updatedAt: now,
        lastScorePercent: (JSON.parse(localStorage.getItem(`pc_capsule_${existingId}`)) || {}).lastScorePercent || 0
      };
      localStorage.setItem(`pc_capsule_${existingId}`, JSON.stringify(updatedCapsule));
      if (idx !== -1) {
        indexList[idx] = { ...indexList[idx], title, subject, level, updatedAt: now, flashcardStats: { known: flashcards.filter(f=>f.status==='known').length, unknown: flashcards.filter(f=>f.status==='unknown').length } };
      }
    } else {
      //Create new capsule
      const capsuleId = Date.now().toString();
      const newCapsule = {
        id: capsuleId,
        title, subject, level, description,
        notes, flashcards, quiz,
        updatedAt: now,
        lastScorePercent: 0
      };
      indexList.push({ id: capsuleId, title, subject, level, updatedAt: now, flashcardStats: { known: 0, unknown: 0 }, quizProgress: 0 });
      localStorage.setItem(`pc_capsule_${capsuleId}`, JSON.stringify(newCapsule));
    }
    // Save updated index list
    localStorage.setItem("pc_capsules_index", JSON.stringify(indexList));
    // Confirmation message and redirect to library
    alert("Capsule saved!");
    renderLibrary();
    // optionally navigate back to library tab
    document.getElementById("nav-library").click();
  });

  //Back button: return to Library view
  form.querySelector("#back-capsule").addEventListener("click", () => {
    renderLibrary();
    document.getElementById("nav-library").click();
  });
}
