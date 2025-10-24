import { renderAuthorForm } from "./author.js";
import { initLearn } from "./learn.js";
// Format date/time for capsule updates
function timeAgo(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}


// Main Library render function
export function renderLibrary() {
  const container = document.getElementById("library-content");
  container.innerHTML = "";
 // Load capsule index list
  const index = JSON.parse(localStorage.getItem("pc_capsules_index") || "[]");
  if (index.length === 0) {
    container.innerHTML = `<div class="alert alert-info">No capsules. Click "New Capsule" to create one.</div>`;
    return;
  }

  const row = document.createElement("div");
  row.className = "row g-3";
// Loop through capsules and build cards
  index.forEach((summary) => {
    const capsule =
      JSON.parse(localStorage.getItem(`pc_capsule_${summary.id}`)) || summary;
// Calculate known/unknown flashcards
    const known =
      (capsule.flashcardStats && capsule.flashcardStats.known) ||
      (capsule.flashcards
        ? capsule.flashcards.filter((f) => f.status === "known").length
        : 0);
    const unknown =
      (capsule.flashcardStats && capsule.flashcardStats.unknown) ||
      (capsule.flashcards
        ? capsule.flashcards.filter((f) => f.status === "unknown").length
        : 0);

 // Get quiz progress percentage
    const quizProgress =
      summary.quizProgress ||
      capsule.quizProgress ||
      capsule.lastScorePercent ||
      0;
// Create capsule card
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 capsule-col"; // responsive: 1 / 2 / 3 cards per row

    col.innerHTML = `
      <div class="card shadow-sm h-100 capsule-card d-flex flex-column">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between">
            <div>
              <h5 class="card-title mb-1">${capsule.title}</h5>
              <p class=" mb-1 capsule-subject">${capsule.subject || ""}</p>
              <small style= "color:#6c757d ; font-size: 0.85rem">Updated at: ${timeAgo(
                capsule.updatedAt
              )}</small>
            </div>
            <span class="badge bg-dark align-self-start">${
              capsule.level || ""
            }</span>
          </div>
            <div class = mt-auto>
          <div class="mt-3 d-flex gap-2 flex-wrap btn-group-wrap">
            <button class="btn btn-sm btn-outline-success learn-btn flex-grow-1"><i class="fas fa-book-open me-1"></i>Learn</button>
            <button class="btn btn-sm btn-outline-primary edit-btn flex-grow-1"><i class="fas fa-pen me-1"></i>Edit</button>
            <button class="btn btn-sm btn-outline-warning export-btn flex-grow-1"><i class="fas fa-download me-1"></i>Export</button>
            <button class="btn btn-sm btn-outline-danger delete-btn ms-auto flex-grow-1"><i class="fas fa-trash me-1"></i>Delete</button>
          </div>

          
          <div class="mt-3">
            <div class="d-flex align-items-center gap-2">
               <div class="small" style= "color:#343a40">Flashcards:</div>
               <div class="small" style = "color : #a4adb45d", "font-weight: 600">${
                 known || unknown
                   ? `${known} Known · ${unknown} Unknown`
                   : "0 known · 0 unknown"
               }</div>
            </div>
            <div class="mt-2">
              <div class="small" style= "color:#343a40">Quiz progress:</div>
              <div class="progress" style="height:12px; background:#333;">
                <div class="progress-bar" role="progressbar" style="width:${quizProgress}%; background: linear-gradient(to right, #009966, #00b399, #00cccc);color:#fff; 
                text-align:center; 
                font-size:0.75rem; 
                line-height:12px;"">
                  ${quizProgress}%
                </div>
              </div>
            </div>
          </div>
          </div>
          </div>

          <div class="mt-3 d-flex gap-2 justify-content-end">
            <button class="btn btn-sm btn-outline-secondary retry-btn"><i class="fas fa-undo me-1"></i>Retry</button>
          </div>
        </div>
      </div>
    `;

    // Learn button → open Learn tab and initialize
    col.querySelector(".learn-btn").addEventListener("click", () => {
      localStorage.setItem("pc_selected_capsule", summary.id);
      document.getElementById("nav-learn").click();
      setTimeout(() => {
        try {
          initLearn();
        } catch (e) {}
      }, 150);
    });
 // Edit button → open Author form with data
    col.querySelector(".edit-btn").addEventListener("click", () => {
      const capsuleData = JSON.parse(
        localStorage.getItem(`pc_capsule_${summary.id}`)
      );
      if (!capsuleData) return;
      document.getElementById("nav-author").click();
      setTimeout(() => {
        try {
          renderAuthorForm(capsuleData);
        } catch (e) {
          console.error(e);
        }
      }, 200);
    });
// Export button → download capsule JSON
    col.querySelector(".export-btn").addEventListener("click", () => {
      const data = JSON.stringify(
        JSON.parse(localStorage.getItem(`pc_capsule_${summary.id}`)),
        null,
        2
      );
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(capsule.title || "capsule").replace(/\s+/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
// Delete button → remove capsule from storage
    col.querySelector(".delete-btn").addEventListener("click", () => {
      if (!confirm(`Delete "${capsule.title}"?`)) return;
      const idx = index.findIndex((c) => c.id === summary.id);
      if (idx !== -1) {
        index.splice(idx, 1);
        localStorage.setItem("pc_capsules_index", JSON.stringify(index));
      }
      localStorage.removeItem(`pc_capsule_${summary.id}`);
      renderLibrary();
    });
// Retry button → reset flashcard and quiz progress
    col.querySelector(".retry-btn").addEventListener("click", () => {
      if (!confirm(`Reset learning progress for "${capsule.title}"?`)) return;
      const realCapsule =
        JSON.parse(localStorage.getItem(`pc_capsule_${summary.id}`)) || capsule;
      realCapsule.flashcards = (realCapsule.flashcards || []).map((f) => ({
        ...f,
        status: "unseen",
      }));
      realCapsule.lastScorePercent = 0;
      localStorage.setItem(
        `pc_capsule_${summary.id}`,
        JSON.stringify(realCapsule)
      );

      const i = index.findIndex((x) => x.id === summary.id);
      if (i !== -1) {
        index[i].flashcardStats = { known: 0, unknown: 0 };
        index[i].quizProgress = 0;
        index[i].updatedAt = new Date().toISOString();
        localStorage.setItem("pc_capsules_index", JSON.stringify(index));
      }
// Show temporary confirmation message
      const msg = document.createElement("div");
      msg.className = "alert position-fixed bottom-0 end-0 m-3";
      msg.style.zIndex = "1050";
      msg.textContent = "Progress reset successfully!";
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 2000);

      renderLibrary();
    });

    row.appendChild(col);
  });

  container.appendChild(row);
}

// Import capsule from uploaded JSON
export function importCapsule(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result);
// Validate required fields
      if (!json.id || !json.title || !json.flashcards || !json.quiz) {
        return alert("Invalid File: Missing required fields!");
      }
// Save capsule content
      localStorage.setItem(`pc_capsule_${json.id}`, JSON.stringify(json));
// Update index
      let index = JSON.parse(localStorage.getItem("pc_capsules_index") || "[]");
      const idx = index.findIndex((c) => c.id === json.id);
      if (idx === -1) {
        index.push({
          id: json.id,
          title: json.title,
          subject: json.subject || "",
          level: json.level || "",
          quizProgress: json.quizProgress || 0,
          updatedAt: json.updatedAt || new Date().toISOString(),
        });
      } else {
        index[idx] = {
          ...index[idx],
          title: json.title,
          subject: json.subject || "",
          level: json.level || "",
          quizProgress: json.quizProgress || 0,
          updatedAt: json.updatedAt || new Date().toISOString(),
        };
      }
      localStorage.setItem("pc_capsules_index", JSON.stringify(index));

      alert("Capsule imported successfully!");
      renderLibrary();
    } catch (err) {
      console.error(err);
      alert("Invalid File: JSON parsing failed!");
    }
  };
  reader.readAsText(file);
}
