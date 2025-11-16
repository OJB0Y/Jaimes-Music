const playlist = [
  {
    title: "Buscale",
    artist: "Óscar Medina",
    src: "songs/Buscale.mp3",
    cover: "images/Buscale.jpg"
  },
    {
    title: "Increíble (feat.Evan Craft)",
    artist: "Miel San Marcos/Evan Craft",
    src: "songs/SpotiDownloader.com - Increíble (feat. Evan Craft) - Miel San Marcos.mp3",
    cover: "images/Cover of Increíble (feat. Evan Craft) by Miel San Marcos, Evan Craft.jpg"
  },
  {
    title: "Todo Lo Has Cambiado",
    artist: "Danilo Montero",
    src: "songs/SpotiDownloader.com - Todo Lo Has Cambiado - Danilo Montero.mp3",
    cover: "images/Cover of Todo Lo Has Cambiado by Danilo Montero, Su Presencia, Thalles Roberto, Victoria Montero.jpg"
  },
  {
    title: "Cuando Yo Te Conocí",
    artist: "Alex Zurdo",
    src: "songs/SpotiDownloader.com - Cuando Yo Te Conocí - Alex Zurdo.mp3",
    cover: "images/Cover of Cuando Yo Te Conocí by Alex Zurdo, AZ Family.jpg"
  },
  {
    title: "Como Una Flor (Versión Los Hermanos Reyes)",
    artist: "Hermanos Osorio, Los Hermanos Reyes de Guatemala",
    src: "songs/Como Una Flor (Versión Los Hermanos Reyes).mp3",
    cover: "images/Como Una Flor (Versión Los Hermanos Reyes).png"
  },
  {
    title: "Empezar de Nuevo",
    artist: "Kike Pavón/Funky",
    src: "songs/Empezar.mp3",
    cover: "images/kiki.png"
  },
  {
    title: "Mas Rico Del Mundo",
    artist: "Evan Craft",
    src: "songs/Más_Rico_Del_Mundo.mp3",
    cover: "images/Más_Rico_Del_Mundo.png"
  },
  {
    title: "Be Alright",
    artist: "Evan Craft",
    src: "songs/Be Alright.mp3",
    cover: "images/evan.png"
  },
  {
    title: "Desesperado",
    artist: "Evan Craft",
    src: "songs/Desesperado.mp3",
    cover: "images/evan.png"
  },
  {
    title: "INFINITO",
    artist: "Madiel Lara",
    src: "songs/SpotiDownloader.com - INFINITO - Madiel Lara.mp3",
    cover: "images/Cover of INFINITO by Madiel Lara.jpg"
  },
  {
    title: "Vida Encontré",
    artist: "Majo y Dan",
    src: "songs/song13.mp3",
    cover: "images/song13.png"
  },
  {
    title: "Jesús Pt. 2",
    artist: "LEAD/Musiko",
    src: "songs/Pt 2.mp3",
    cover: "images/image (2).png"
  },
  {
    title: "Espíritu Santo",
    artist: "Redimi2/Barak",
    src: "songs/Espíritu.mp3",
    cover: "images/image (6).png"
  },
];

// --- element refs ---
const audio = document.getElementById('audio');
const seekBar = document.getElementById('seek-bar');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const cover = document.getElementById('cover');
const playlistEl = document.getElementById('playlist');

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
let shuffle = false;

// shuffle queue + position
let shuffleQueue = [];
let shuffleIndex = -1;

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

// --- load & play ---
function loadSong(index) {
  const song = playlist[index];
  audio.src = song.src;
  title.textContent = song.title;
  artist.textContent = song.artist;
  cover.src = song.cover;
  updateActiveSong();
}

function playSong(index) {
  currentSong = index;
  loadSong(index);
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
  seekBar.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = `/ ${formatTime(audio.duration || 0)}`;
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
});

prevBtn.addEventListener('click', () => {
  if (shuffle) {
    currentSong = getPrevShuffleSong();
  } else {
    currentSong = (currentSong - 1 + playlist.length) % playlist.length;
  }
  playSong(currentSong);
});


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

// --- init ---
currentSong = 0;
loadSong(currentSong);
updateActiveSong();
setPlayIcon(false);
