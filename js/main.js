import { renderLibrary } from "./library.js";
import { renderAuthorForm } from "./author.js";
import { initLearn } from "./learn.js";

document.addEventListener("DOMContentLoaded", () => {
  // Show Library section on page load
  renderLibrary();
  document.getElementById("section-library").classList.remove("d-none");
  setActiveTab("nav-library");
});

// --- Tab Navigation ---
document.getElementById("nav-library").addEventListener("click", () => {
  // Show Library, hide others
  document.getElementById("section-library").classList.remove("d-none");
  document.getElementById("section-author").classList.add("d-none");
  document.getElementById("section-learn").classList.add("d-none");
  setActiveTab("nav-library");
  renderLibrary();
});

// Author Tab
document.getElementById("nav-author").addEventListener("click", () => {
  // Show Author, hide others
  document.getElementById("section-library").classList.add("d-none");
  document.getElementById("section-author").classList.remove("d-none");
  document.getElementById("section-learn").classList.add("d-none");
  setActiveTab("nav-author");
  renderAuthorForm();
});
// Learn Tab
document.getElementById("nav-learn").addEventListener("click", () => {
   // Show Learn, hide others
  document.getElementById("section-library").classList.add("d-none");
  document.getElementById("section-author").classList.add("d-none");
  document.getElementById("section-learn").classList.remove("d-none");
  setActiveTab("nav-learn");
  initLearn();
});
// --- Helper: set active tab ---
function setActiveTab(id) {
  document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// --- Create New Capsule button ---
document.getElementById("new-capsule-btn").addEventListener("click", () => {
    // Switch to Author tab and show form
  document.getElementById("nav-author").click();
  renderAuthorForm();
});

// --- Import JSON Capsules ---
document.getElementById("import-capsule-btn").addEventListener("click", () => {
    // Open file picker for JSON files
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target.result);
        const isArray = Array.isArray(data);
        const capsules = isArray ? data : [data];
// Loop through imported capsules
        capsules.forEach(capsule => {
          if (!capsule.title) capsule.title = "Untitled";
          const capsuleId = Date.now().toString() + Math.floor(Math.random() * 1000);
          const newCapsule = { id: capsuleId, ...capsule };

          // Save capsule to LocalStorage
          localStorage.setItem(`pc_capsule_${capsuleId}`, JSON.stringify(newCapsule));

           // Add capsule info to index
          const indexList = JSON.parse(localStorage.getItem("pc_capsules_index") || "[]");
          indexList.push({
            id: capsuleId,
            title: newCapsule.title,
            subject: newCapsule.subject || "",
            level: newCapsule.level || "Intermediate",
            updatedAt: new Date().toISOString(),
            flashcardStats: { known: 0, unknown: newCapsule.flashcards ? newCapsule.flashcards.length : 0 },
            quizProgress: 0
          });
          localStorage.setItem("pc_capsules_index", JSON.stringify(indexList));
        });
// Refresh library view
        renderLibrary();
        alert("Capsules imported successfully!");
      } catch (err) {
        console.error(err);
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
});

// Export: اضافه شده برای هر کپسول در renderLibrary
// (نیازی به تغییر در main.js ندارد، col.querySelector(".export-btn") در library.js مدیریت می‌شود)
