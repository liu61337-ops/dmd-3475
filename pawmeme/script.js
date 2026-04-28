/* =============================
   ELEMENTS
============================= */
const memeForm = document.getElementById("memeForm");
const titleInput = document.getElementById("titleInput");
const categoryInput = document.getElementById("categoryInput");
const topTextInput = document.getElementById("topTextInput");
const bottomTextInput = document.getElementById("bottomTextInput");

const previewImage = document.getElementById("previewImage");
const previewStatus = document.getElementById("previewStatus");
const previewTopText = document.getElementById("previewTopText");
const previewBottomText = document.getElementById("previewBottomText");

const textPositionInput = document.getElementById("textPosition");
const fontSizeInput = document.getElementById("fontSizeInput");
const fontSizeLabel = document.getElementById("fontSizeLabel");

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

const resetBtn = document.getElementById("resetBtn");

/* =============================
   STATE
============================= */
let currentImage = "";
let editingId = null;

/* =============================
   DEFAULT MEMES
============================= */
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

/* =============================
   LOAD DATA
============================= */
let memes = JSON.parse(localStorage.getItem("pawMemes"));

if (!Array.isArray(memes) || memes.length === 0) {
  memes = JSON.parse(JSON.stringify(defaultMemes));
  localStorage.setItem("pawMemes", JSON.stringify(memes));
}

/* =============================
   API FETCH
============================= */
async function fetchRandomDogImage() {
  try {
    previewStatus.textContent = "Loading dog image...";
    const res = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await res.json();

    currentImage = data.message;
    previewImage.src = currentImage;
    previewImage.style.display = "block";
    previewStatus.textContent = "Image ready!";

    updatePreviewText();
  } catch {
    previewStatus.textContent = "Failed to load image.";
  }
}

/* =============================
   SAVE
============================= */
function saveMemes() {
  localStorage.setItem("pawMemes", JSON.stringify(memes));
}

/* =============================
   PREVIEW
============================= */
function updatePreviewText() {
  const pos = textPositionInput.value;
  const fontSize = Number(fontSizeInput.value);

  fontSizeLabel.textContent = fontSize + "px";

  previewTopText.style.fontSize = fontSize + "px";
  previewBottomText.style.fontSize = fontSize + "px";

  if (pos === "top") {
    previewTopText.textContent = topTextInput.value;
    previewBottomText.textContent = "";
    bottomTextInput.disabled = true;
    topTextInput.disabled = false;
  } else if (pos === "bottom") {
    previewTopText.textContent = "";
    previewBottomText.textContent = bottomTextInput.value;
    topTextInput.disabled = true;
    bottomTextInput.disabled = false;
  } else {
    previewTopText.textContent = topTextInput.value;
    previewBottomText.textContent = bottomTextInput.value;
    topTextInput.disabled = false;
    bottomTextInput.disabled = false;
  }
}

/* =============================
   FILTER / SORT
============================= */
function getProcessedMemes() {
  let result = [...memes];

  const search = searchInput.value.toLowerCase();
  const category = filterCategory.value;
  const sort = sortMemes.value;

  if (search) {
    result = result.filter(m =>
      m.title.toLowerCase().includes(search) ||
      m.topText.toLowerCase().includes(search) ||
      m.bottomText.toLowerCase().includes(search)
    );
  }

  if (category !== "all") {
    result = result.filter(m => m.category === category);
  }

  if (sort === "az") result.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "za") result.sort((a, b) => b.title.localeCompare(a.title));
  if (sort === "likesHighLow") result.sort((a, b) => b.likes - a.likes);
  if (sort === "likesLowHigh") result.sort((a, b) => a.likes - b.likes);

  return result;
}

/* =============================
   RENDER
============================= */
function renderMemes() {
  if (!memeGrid) return;

  const list = getProcessedMemes();
  memeGrid.innerHTML = "";
  memeCount.textContent = list.length + " memes";

  if (list.length === 0) {
    memeGrid.innerHTML = `<div class="empty-message">No memes</div>`;
    return;
  }

  list.forEach(meme => {
    const card = document.createElement("article");
    card.className = "meme-card";

    card.innerHTML = `
      <div class="meme-image-wrap">
        <img src="${meme.image}" class="meme-image"/>

        <div class="meme-text meme-top" style="font-size:${meme.fontSize}px">
          ${meme.position === "bottom" ? "" : meme.topText}
        </div>

        <div class="meme-text meme-bottom" style="font-size:${meme.fontSize}px">
          ${meme.position === "top" ? "" : meme.bottomText}
        </div>
      </div>

      <div class="meme-card-content">
        <h3>${meme.title}</h3>
        <p>❤️ ${meme.likes}</p>

        <div class="meme-actions">
          <button class="like-btn" data-id="${meme.id}">❤️</button>
          <button class="edit-btn" data-id="${meme.id}">Edit</button>
          <button class="delete-btn" data-id="${meme.id}">Delete</button>
          <button class="download-btn" data-id="${meme.id}">Download</button>
        </div>
      </div>
    `;

    memeGrid.appendChild(card);
  });

  addCardEvents();
}

/* =============================
   EVENTS ON CARDS
============================= */
function addCardEvents() {
  document.querySelectorAll(".like-btn").forEach(btn =>
    btn.onclick = () => {
      const m = memes.find(x => x.id === btn.dataset.id);
      m.likes++;
      saveMemes();
      renderMemes();
    }
  );

  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.onclick = () => {
      memes = memes.filter(x => x.id !== btn.dataset.id);
      saveMemes();
      renderMemes();
    }
  );

  document.querySelectorAll(".edit-btn").forEach(btn =>
    btn.onclick = () => openEditModal(btn.dataset.id)
  );

  document.querySelectorAll(".download-btn").forEach(btn =>
    btn.onclick = () => downloadMeme(btn.dataset.id)
  );
}

/* =============================
   CREATE
============================= */
memeForm.addEventListener("submit", e => {
  e.preventDefault();

  if (!currentImage) return;

  memes.unshift({
    id: crypto.randomUUID(),
    title: titleInput.value,
    image: currentImage,
    topText: topTextInput.value,
    bottomText: bottomTextInput.value,
    position: textPositionInput.value,
    fontSize: Number(fontSizeInput.value),
    category: categoryInput.value,
    likes: 0
  });

  saveMemes();
  renderMemes();
});

/* =============================
   TEXT WRAP (🔥)
============================= */
function drawText(ctx, text, x, y, maxWidth, lineHeight, bottom=false) {
  const words = text.split(" ");
  let line = "";
  let lines = [];

  words.forEach(word => {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word + " ";
    } else {
      line = test;
    }
  });

  lines.push(line);

  if (bottom) lines.reverse();

  lines.forEach((l,i)=>{
    const offset = bottom ? -i*lineHeight : i*lineHeight;
    ctx.strokeText(l.trim(), x, y + offset);
    ctx.fillText(l.trim(), x, y + offset);
  });
}

/* =============================
   DOWNLOAD
============================= */
function downloadMeme(id) {
  const meme = memes.find(m => m.id === id);

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = meme.image;

  img.onload = () => {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");

    c.width = img.width;
    c.height = img.height;

    ctx.drawImage(img,0,0);

    ctx.fillStyle="white";
    ctx.strokeStyle="black";
    ctx.lineWidth=6;
    ctx.textAlign="center";

    const fs = meme.fontSize || 32;
    ctx.font = `bold ${fs}px Impact`;

    const maxWidth = c.width*0.9;

    if (meme.position !== "bottom") {
      drawText(ctx,meme.topText.toUpperCase(),c.width/2,fs+10,maxWidth,fs+8,false);
    }

    if (meme.position !== "top") {
      drawText(ctx,meme.bottomText.toUpperCase(),c.width/2,c.height-20,maxWidth,fs+8,true);
    }

    const link=document.createElement("a");
    link.download="meme.png";
    link.href=c.toDataURL();
    link.click();
  };
}

/* =============================
   RESET
============================= */
if (resetBtn) {
  resetBtn.onclick = () => {
    memes = JSON.parse(JSON.stringify(defaultMemes));
    saveMemes();
    renderMemes();
  };
}

/* =============================
   OTHER EVENTS
============================= */
randomDogBtn?.addEventListener("click", fetchRandomDogImage);

searchInput.oninput = renderMemes;
filterCategory.onchange = renderMemes;
sortMemes.onchange = renderMemes;

topTextInput.oninput = updatePreviewText;
bottomTextInput.oninput = updatePreviewText;
textPositionInput.onchange = updatePreviewText;
fontSizeInput.oninput = updatePreviewText;

/* =============================
   INIT
============================= */
renderMemes();
updatePreviewText();