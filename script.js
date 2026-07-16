const playlist = [
  {
    title: "Oh Alma Mía",
    artist: "Los Voceros de Cristo",
    src: "songs/a5.mp3",
    cover: "images/a5.png"
  },
  {
    title: "Cristo por su Iglesia viene",
    artist: "Los Voceros de Cristo",
    src: "songs/Cristo.mp3",
    cover: "images/Cristo.jpg"
  },
  {
    title: "Loor a ti mi Dios",
    artist: "Los Voceros de Cristo",
    src: "songs/Loor.mp3",
    cover: "images/Loor.jpg"
  },
  {
    title: "Escogido fui de Dios",
    artist: "Los Voceros de Cristo",
    src: "songs/song11.mp3",
    cover: "images/song11.png"
  },
  {
    title: "Loor a ti mi Dios v2",
    artist: "Los Voceros de Cristo",
    src: "songs/Loor2.mp3",
    cover: "images/a5.png"
  },
  {
    title: "Jesús es mi Refugio",
    artist: "Los Voceros de Cristo",
    src: "songs/Refugio.mp3",
    cover: "images/new3.png"
  },
  {
    title: "Mi cántaro vacío",
    artist: "Los Voceros de Cristo",
    src: "songs/cántaro.mp3",
    cover: "images/a5.png"
  },
  {
    title: "El volverá",
    artist: "Los Voceros de Cristo/Aníbal Marroquín",
    src: "songs/volverá.mp3",
    cover: "images/new4.png"
  },
];

// --- element refs ---
const audio = document.getElementById('audio');
const seekBar = document.getElementById('seek-bar');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const cover = document.getElementById('cover');
const playlistEl = document.getElementById('playlist');
const body = document.getElementById("body");

const playBtn = document.getElementById('play');
const playIcon = document.getElementById('play-icon');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');

const shuffleBtn = document.getElementById('shuffle');
const repeatBtn = document.getElementById('repeat');

const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('total-duration');
const searchBar = document.getElementById('search-bar');


// --- state ---
let currentSong = 0;
let isPlaying = false;
let repeat = false;
let shuffle = true;

// shuffle queue + position
let shuffleQueue = [];
let shuffleIndex = -1;

//vibrant node
const colorCache = {};

async function getSongColors(imageUrl) {
  if (colorCache[imageUrl]) return colorCache[imageUrl];

  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const vibrant = new Vibrant(img);
    const palette = await vibrant.getPalette();

    // Helper function to check if a color is too dark (close to black)
    function isTooDark(hexColor) {
      // Convert hex to RGB
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      
      // Calculate perceived brightness (standard formula)
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
      
      // If brightness is below 30 (out of 255), it's too dark
      return brightness < 30;
    }
    
    // Get the colors from palette
    let darkColor = palette.DarkVibrant?.getHex() || "#121212";
    const vibrantColor = palette.Vibrant?.getHex() || "#121212";
    const lightColor = palette.LightVibrant?.getHex() || "#121212";
    const muted = palette.Muted?.getHex() || "#121212";
    const lightMuted = palette.LightMuted?.getHex() || "#121212";
    
    // If DarkVibrant is too dark (close to black), fall back to Vibrant
    if (isTooDark(darkColor)) {
      darkColor = muted;
    }

    const colors = {
      main: darkColor,
      dark: darkColor,
      light: lightColor,
      vibrant: vibrantColor
    };

    colorCache[imageUrl] = colors;
    return colors;

  } catch (err) {
    console.error('Error extracting colors:', err);
    return {
      main: "#121212",
      dark: "#121212",
      light: "#ffffff"
    };
  }
}

// --- shuffle helpers ---
function createShuffleQueue(startIndex = currentSong) {
  shuffleQueue = Array.from({ length: playlist.length }, (_, i) => i);

  // Fisher–Yates shuffle
  for (let i = shuffleQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffleQueue[i], shuffleQueue[j]] = [shuffleQueue[j], shuffleQueue[i]];
  }

  // make sure currentSong is at the front, then start after it
  const pos = shuffleQueue.indexOf(startIndex);
  if (pos > -1) {
    [shuffleQueue[0], shuffleQueue[pos]] = [shuffleQueue[pos], shuffleQueue[0]];
  }
  shuffleIndex = 0;
}

function getNextShuffleSong() {
  if (shuffleIndex + 1 >= shuffleQueue.length) {
    createShuffleQueue(currentSong); // reshuffle when done
  }
  shuffleIndex++;
  return shuffleQueue[shuffleIndex];
}

function getPrevShuffleSong() {
  if (shuffleIndex > 0) {
    shuffleIndex--;
    return shuffleQueue[shuffleIndex];
  }
  return currentSong; // stay if no prev
}

function updatePlaylistGradient(main, dark) {
  document.body.style.background = `${main}`;
}

// --- load & play ---
function loadSong(index) {
  const song = playlist[index];
  audio.src = song.src;
  title.textContent = song.title;
  artist.textContent = song.artist;
  cover.src = song.cover;
  updateActiveSong();
  getSongColors(song.cover).then(colors => {
  updatePlaylistGradient(colors.dark);
});

if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: song.title,
    artist: song.artist,
    artwork: [
      { src: song.cover, sizes: '96x96', type: 'image/jpeg' },
      { src: song.cover, sizes: '128x128', type: 'image/jpeg' },
      { src: song.cover, sizes: '192x192', type: 'image/jpeg' },
      { src: song.cover, sizes: '256x256', type: 'image/jpeg' },
      { src: song.cover, sizes: '384x384', type: 'image/jpeg' },
      { src: song.cover, sizes: '512x512', type: 'image/jpeg' }
    ]
  });

  // Enable playback controls on lock screen
  navigator.mediaSession.setActionHandler('play', () => audio.play());
  navigator.mediaSession.setActionHandler('pause', () => audio.pause());
  navigator.mediaSession.setActionHandler('previoustrack', () => prevBtn.click());
  navigator.mediaSession.setActionHandler('nexttrack', () => nextBtn.click());
}
}

function playSong(index, direction = "next") {
  currentSong = index;
  loadSong(index, direction);
  audio.play().catch(err => console.warn('Play prevented:', err));
}

function togglePlay() {
  if (isPlaying) {
    audio.pause();
  } else {
    audio.play();
  }
}

// --- build playlist UI/searchbar ---
function buildPlaylistUI(filterText = "") {
  playlistEl.innerHTML = "";
  const lowerFilter = filterText.toLowerCase();

  playlist.forEach((song, index) => {
    if (song.title.toLowerCase().includes(lowerFilter) || 
        song.artist.toLowerCase().includes(lowerFilter)) {
      const li = document.createElement('li');
      li.textContent = `${song.title} - ${song.artist}`;
      li.addEventListener('click', () => {
        playSong(index);
        if (shuffle) createShuffleQueue(index);
      });
      playlistEl.appendChild(li);
    }
  });

  updateActiveSong();
}

// build on load
buildPlaylistUI();

// hook up search
searchBar.addEventListener('input', () => {
  buildPlaylistUI(searchBar.value);
});

// --- update active playlist row ---
function updateActiveSong() {
  const items = document.querySelectorAll('#playlist li');
  items.forEach((item, i) => {
    item.classList.toggle('active', i === currentSong);
    if (i === currentSong) {
      item.scrollIntoView({ behavior: 'smooth', block: 'center' });//
    }
  });
}

// --- time formatting ---
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}

// --- audio events ---
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  
  const progress = (audio.currentTime / audio.duration) * 100 || 0;

  seekBar.value = progress;

  seekBar.style.background = `linear-gradient(
    to right,
    white 0%,
    white ${progress}%,
    #818181b9 ${progress}%,
    #818181b9 100%
  )`;

  seekBar.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = `- ${formatTime(audio.duration || 0)}`;
});

seekBar.addEventListener('input', () => {
  if (audio.duration) {
    audio.currentTime = (seekBar.value / 100) * audio.duration;
  }
});

audio.addEventListener('play', () => {
  setPlayIcon(true);
  isPlaying = true;
});

audio.addEventListener('pause', () => {
  setPlayIcon(false);
  isPlaying = false;
});

audio.addEventListener('ended', () => {
  if (repeat) {
    audio.currentTime = 0;
    audio.play();
    return;
  }
  if (shuffle) {
    currentSong = getNextShuffleSong();
    playSong(currentSong);
    return;
  }
  currentSong = (currentSong + 1) % playlist.length;
  playSong(currentSong);
});

// --- controls ---
playBtn.addEventListener('click', togglePlay);

nextBtn.addEventListener('click', () => {
  if (shuffle) {
    currentSong = getNextShuffleSong();
  } else {
    currentSong = (currentSong + 1) % playlist.length;
  }
  playSong(currentSong);
  changeSong(nextIndex);
});

prevBtn.addEventListener('click', () => {
  if (shuffle) {
    currentSong = getPrevShuffleSong();
  } else {
    currentSong = (currentSong - 1 + playlist.length) % playlist.length;
  }
  playSong(currentSong);
  changeSong(prevIndex, { animate: true, direction: "prev" });
});

function changeSong(index, { animate = true, direction = "next", autoPlay = true } = {}) {
  animateCoverChange(song.cover, direction);
}

// --- repeat & shuffle toggles ---
function setToggleButtonState(button, enabled) {
  if (enabled) {
    button.classList.add('mode-active');
    button.setAttribute('aria-pressed', 'true');
  } else {
    button.classList.remove('mode-active');
    button.setAttribute('aria-pressed', 'false');
  }
}

shuffleBtn.addEventListener('click', () => {
  shuffle = !shuffle;
  if (shuffle) {
    repeat = false;
    createShuffleQueue(currentSong);
  }
  setToggleButtonState(shuffleBtn, shuffle);
  setToggleButtonState(repeatBtn, repeat);
});

repeatBtn.addEventListener('click', () => {
  repeat = !repeat;
  if (repeat) shuffle = false;
  setToggleButtonState(repeatBtn, repeat);
  setToggleButtonState(shuffleBtn, shuffle);
});

// --- play/pause icon ---
function setPlayIcon(isNowPlaying) {
  playBtn.innerHTML = isNowPlaying
    ? `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM8.07612 8.61732C8 8.80109 8 9.03406 8 9.5V14.5C8 14.9659 8 15.1989 8.07612 15.3827C8.17761 15.6277 8.37229 15.8224 8.61732 15.9239C8.80109 16 9.03406 16 9.5 16C9.96594 16 10.1989 16 10.3827 15.9239C10.6277 15.8224 10.8224 15.6277 10.9239 15.3827C11 15.1989 11 14.9659 11 14.5V9.5C11 9.03406 11 8.80109 10.9239 8.61732C10.8224 8.37229 10.6277 8.17761 10.3827 8.07612C10.1989 8 9.96594 8 9.5 8C9.03406 8 8.80109 8 8.61732 8.07612C8.37229 8.17761 8.17761 8.37229 8.07612 8.61732ZM13.0761 8.61732C13 8.80109 13 9.03406 13 9.5V14.5C13 14.9659 13 15.1989 13.0761 15.3827C13.1776 15.6277 13.3723 15.8224 13.6173 15.9239C13.8011 16 14.0341 16 14.5 16C14.9659 16 15.1989 16 15.3827 15.9239C15.6277 15.8224 15.8224 15.6277 15.9239 15.3827C16 15.1989 16 14.9659 16 14.5V9.5C16 9.03406 16 8.80109 15.9239 8.61732C15.8224 8.37229 15.6277 8.17761 15.3827 8.07612C15.1989 8 14.9659 8 14.5 8C14.0341 8 13.8011 8 13.6173 8.07612C13.3723 8.17761 13.1776 8.37229 13.0761 8.61732Z" fill="#ffffff"></path> </g></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM10.6935 15.8458L15.4137 13.059C16.1954 12.5974 16.1954 11.4026 15.4137 10.941L10.6935 8.15419C9.93371 7.70561 9 8.28947 9 9.21316V14.7868C9 15.7105 9.93371 16.2944 10.6935 15.8458Z" fill="#ffffff"></path> </g></svg>`;
}

function animateCoverChange(newCoverSrc, direction = "next", callback) {
  const cover = document.getElementById("cover");
  const slideOutClass = direction === "next" ? "slide-out-left" : "slide-out-right";
  const slideInClass = direction === "next" ? "slide-in-right" : "slide-in-left";

  // 1. Slide OLD cover out
  cover.classList.add(slideOutClass);

  setTimeout(() => {
    // 2. Freeze transitions and move off-screen opposite side
    cover.classList.add("no-transition");
    cover.classList.remove(slideOutClass);

    // 3. Change the image while off-screen
    cover.src = newCoverSrc;

    // 4. Position new image off-screen on the opposite side
    cover.classList.add(slideInClass);

    // Force browser to commit layout
    cover.getBoundingClientRect();

    // 5. Re-enable transition and slide in
    requestAnimationFrame(() => {
      cover.classList.remove("no-transition");
      cover.classList.remove(slideInClass);

      // 6. Call callback after slide-in finishes
      if (callback) callback();
    });

  }, 550); // match CSS slide-out duration
}

// --- init ---
currentSong = Math.floor(Math.random() * playlist.length);
loadSong(currentSong);
updateActiveSong();
setPlayIcon(false);
