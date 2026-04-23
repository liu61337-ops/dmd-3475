const memeForm = document.getElementById("memeForm");
const titleInput = document.getElementById("titleInput");
const categoryInput = document.getElementById("categoryInput");
const topTextInput = document.getElementById("topTextInput");
const bottomTextInput = document.getElementById("bottomTextInput");
const previewImage = document.getElementById("previewImage");
const previewStatus = document.getElementById("previewStatus");
const randomDogBtn = document.getElementById("randomDogBtn");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const sortMemes = document.getElementById("sortMemes");
const memeGrid = document.getElementById("memeGrid");
const memeCount = document.getElementById("memeCount");

const editModal = document.getElementById("editModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const editForm = document.getElementById("editForm");
const editTitle = document.getElementById("editTitle");
const editTopText = document.getElementById("editTopText");
const editBottomText = document.getElementById("editBottomText");
const editCategory = document.getElementById("editCategory");
const editLikes = document.getElementById("editLikes");

const textPositionInput = document.getElementById("textPosition");
const fontSizeInput = document.getElementById("fontSizeInput");
const fontSizeLabel = document.getElementById("fontSizeLabel");
const previewTopText = document.getElementById("previewTopText");
const previewBottomText = document.getElementById("previewBottomText");

const resetBtn = document.getElementById("resetBtn");

let currentImage = "";
let editingId = null;

/* -----------------------------
   Default memes
----------------------------- */
const defaultMemes = [
  {
    id: "default-1",
    title: "Monday Mood",
    image: "https://images.dog.ceo/breeds/husky/n02110185_1469.jpg",
    topText: "WHEN THE ALARM RINGS",
    bottomText: "BUT YOU JUST CLOSED YOUR EYES",
    position: "both",
    fontSize: 24,
    category: "relatable",
    likes: 8
  },
  {
    id: "default-2",
    title: "Chaotic Energy",
    image: "https://images.dog.ceo/breeds/shiba/shiba-13.jpg",
    topText: "I SAID ONE TREAT",
    bottomText: "NOT FIVE",
    position: "both",
    fontSize: 24,
    category: "chaotic",
    likes: 15
  }
];

/* -----------------------------
   Load memes from localStorage
----------------------------- */
let memes = JSON.parse(localStorage.getItem("pawMemes"));

if (!Array.isArray(memes) || memes.length === 0) {
  memes = JSON.parse(JSON.stringify(defaultMemes));
  localStorage.setItem("pawMemes", JSON.stringify(memes));
}

/* -----------------------------
   Fetch random dog image
----------------------------- */
async function fetchRandomDogImage() {
  try {
    previewStatus.textContent = "Loading dog image...";

    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    if (!response.ok) {
      throw new Error("Failed to fetch image.");
    }

    const data = await response.json();

    currentImage = data.message;
    previewImage.src = currentImage;
    previewImage.style.display = "block";
    previewStatus.textContent = "Image ready!";

    updatePreviewText();
  } catch (error) {
    console.error("Failed to load dog image:", error);
    previewStatus.textContent = "Failed to load dog image.";
  }
}

/* -----------------------------
   Save to localStorage
----------------------------- */
function saveMemes() {
  localStorage.setItem("pawMemes", JSON.stringify(memes));
}

/* -----------------------------
   Helpers
----------------------------- */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function clearPreview() {
  currentImage = "";
  previewImage.style.display = "none";
  previewImage.src = "";
  previewStatus.textContent = 'Click "Get Random Dog" to load an image.';
  previewTopText.textContent = "";
  previewBottomText.textContent = "";
}

function resetCreateForm() {
  memeForm.reset();
  textPositionInput.value = "both";
  fontSizeInput.value = 28;
  fontSizeLabel.textContent = "28px";
  topTextInput.disabled = false;
  bottomTextInput.disabled = false;
  clearPreview();
}

function updatePreviewText() {
  const position = textPositionInput.value;
  const topText = topTextInput.value.trim();
  const bottomText = bottomTextInput.value.trim();
  const fontSize = Number(fontSizeInput.value);

  fontSizeLabel.textContent = `${fontSize}px`;

  previewTopText.style.fontSize = `${fontSize}px`;
  previewBottomText.style.fontSize = `${fontSize}px`;

  if (position === "top") {
    previewTopText.textContent = topText;
    previewBottomText.textContent = "";
    topTextInput.disabled = false;
    bottomTextInput.disabled = true;
  } else if (position === "bottom") {
    previewTopText.textContent = "";
    previewBottomText.textContent = bottomText;
    topTextInput.disabled = true;
    bottomTextInput.disabled = false;
  } else {
    previewTopText.textContent = topText;
    previewBottomText.textContent = bottomText;
    topTextInput.disabled = false;
    bottomTextInput.disabled = false;
  }
}

/* -----------------------------
   Filter + sort + search
----------------------------- */
function getProcessedMemes() {
  const searchText = searchInput.value.trim().toLowerCase();
  const categoryValue = filterCategory.value;
  const sortValue = sortMemes.value;

  let result = [...memes];

  if (searchText) {
    result = result.filter((meme) =>
      meme.title.toLowerCase().includes(searchText) ||
      meme.topText.toLowerCase().includes(searchText) ||
      meme.bottomText.toLowerCase().includes(searchText)
    );
  }

  if (categoryValue !== "all") {
    result = result.filter((meme) => meme.category === categoryValue);
  }

  if (sortValue === "az") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === "za") {
    result.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortValue === "likesHighLow") {
    result.sort((a, b) => b.likes - a.likes);
  } else if (sortValue === "likesLowHigh") {
    result.sort((a, b) => a.likes - b.likes);
  }

  return result;
}

/* -----------------------------
   Render memes
----------------------------- */
function renderMemes() {
  const processedMemes = getProcessedMemes();
  memeGrid.innerHTML = "";
  memeCount.textContent = `${processedMemes.length} meme${processedMemes.length === 1 ? "" : "s"}`;

  if (processedMemes.length === 0) {
    memeGrid.innerHTML = `
      <div class="empty-message">
        No memes found. Try creating one!
      </div>
    `;
    return;
  }

  processedMemes.forEach((meme) => {
    const card = document.createElement("article");
    card.className = "meme-card";

    card.innerHTML = `
      <div class="meme-image-wrap">
        <img class="meme-image" src="${meme.image}" alt="${meme.title}" />

        <div
          class="meme-text meme-top"
          style="font-size: ${meme.fontSize || 24}px;"
        >
          ${meme.position === "bottom" ? "" : meme.topText}
        </div>

        <div
          class="meme-text meme-bottom"
          style="font-size: ${meme.fontSize || 24}px;"
        >
          ${meme.position === "top" ? "" : meme.bottomText}
        </div>
      </div>

      <div class="meme-card-content">
        <h3>${meme.title}</h3>
        <p class="meme-meta">
          Category: ${capitalize(meme.category)} · ❤️ ${meme.likes}
        </p>

        <div class="meme-actions">
          <button class="like-btn" data-id="${meme.id}">❤️ Like</button>
          <button class="edit-btn" data-id="${meme.id}">Edit</button>
          <button class="delete-btn" data-id="${meme.id}">Delete</button>
        </div>
      </div>
    `;

    memeGrid.appendChild(card);
  });

  addCardEvents();
}

function addCardEvents() {
  document.querySelectorAll(".like-btn").forEach((button) => {
    button.addEventListener("click", () => {
      likeMeme(button.dataset.id);
    });
  });

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => {
      openEditModal(button.dataset.id);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", () => {
      deleteMeme(button.dataset.id);
    });
  });
}

/* -----------------------------
   Create meme
----------------------------- */
memeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!currentImage) {
    previewStatus.textContent = "Please load a dog image first.";
    return;
  }

  const newMeme = {
    id: crypto.randomUUID(),
    title: titleInput.value.trim(),
    image: currentImage,
    topText: topTextInput.value.trim(),
    bottomText: bottomTextInput.value.trim(),
    position: textPositionInput.value,
    fontSize: Number(fontSizeInput.value),
    category: categoryInput.value,
    likes: 0
  };

  memes.unshift(newMeme);
  saveMemes();
  renderMemes();
  resetCreateForm();
});

/* -----------------------------
   Like meme
----------------------------- */
function likeMeme(id) {
  const meme = memes.find((item) => item.id === id);
  if (!meme) return;

  meme.likes += 1;
  saveMemes();
  renderMemes();
}

/* -----------------------------
   Delete meme
----------------------------- */
function deleteMeme(id) {
  memes = memes.filter((meme) => meme.id !== id);
  saveMemes();
  renderMemes();
}

/* -----------------------------
   Edit meme
----------------------------- */
function openEditModal(id) {
  const meme = memes.find((item) => item.id === id);
  if (!meme) return;

  editingId = id;
  editTitle.value = meme.title;
  editTopText.value = meme.topText;
  editBottomText.value = meme.bottomText;
  editCategory.value = meme.category;
  editLikes.value = meme.likes;

  editModal.classList.remove("hidden");
}

function closeEditModal() {
  editModal.classList.add("hidden");
  editForm.reset();
  editingId = null;
}

editForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const memeIndex = memes.findIndex((item) => item.id === editingId);
  if (memeIndex === -1) return;

  memes[memeIndex].title = editTitle.value.trim();
  memes[memeIndex].topText = editTopText.value.trim();
  memes[memeIndex].bottomText = editBottomText.value.trim();
  memes[memeIndex].category = editCategory.value;
  memes[memeIndex].likes = Number(editLikes.value);

  saveMemes();
  renderMemes();
  closeEditModal();
});

/* -----------------------------
   Reset memes
----------------------------- */
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    const confirmReset = confirm("Are you sure you want to reset all memes?");

    if (confirmReset) {
      memes = JSON.parse(JSON.stringify(defaultMemes));
      saveMemes();
      renderMemes();
      resetCreateForm();
    }
  });
}

/* -----------------------------
   Events
----------------------------- */
if (randomDogBtn) {
  randomDogBtn.addEventListener("click", fetchRandomDogImage);
}

searchInput.addEventListener("input", renderMemes);
filterCategory.addEventListener("change", renderMemes);
sortMemes.addEventListener("change", renderMemes);

topTextInput.addEventListener("input", updatePreviewText);
bottomTextInput.addEventListener("input", updatePreviewText);
textPositionInput.addEventListener("change", updatePreviewText);
fontSizeInput.addEventListener("input", updatePreviewText);

closeModalBtn.addEventListener("click", closeEditModal);

editModal.addEventListener("click", (event) => {
  if (event.target === editModal) {
    closeEditModal();
  }
});

bottomTextInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    memeForm.requestSubmit();
  }
});

/* -----------------------------
   Init
----------------------------- */
renderMemes();
updatePreviewText();