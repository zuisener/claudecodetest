const btn = document.getElementById('random-btn');
const idleState = document.getElementById('idle-state');
const pokemonDisplay = document.getElementById('pokemon-display');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMsg = document.getElementById('error-msg');

const pokemonId = document.getElementById('pokemon-id');
const typeBadges = document.getElementById('type-badges');
const pokemonImage = document.getElementById('pokemon-image');
const pokemonName = document.getElementById('pokemon-name');
const pokemonHeight = document.getElementById('pokemon-height');
const pokemonWeight = document.getElementById('pokemon-weight');
const statsEl = document.getElementById('stats');

const TOTAL_POKEMON = 1025;

const TYPE_JA = {
  normal: 'ノーマル', fire: 'ほのお', water: 'みず', electric: 'でんき',
  grass: 'くさ', ice: 'こおり', fighting: 'かくとう', poison: 'どく',
  ground: 'じめん', flying: 'ひこう', psychic: 'エスパー', bug: 'むし',
  rock: 'いわ', ghost: 'ゴースト', dragon: 'ドラゴン', dark: 'あく',
  steel: 'はがね', fairy: 'フェアリー',
};

const STAT_JA = {
  hp: 'HP', attack: 'こうげき', defense: 'ぼうぎょ',
  'special-attack': 'とくこう', 'special-defense': 'とくぼう', speed: 'すばやさ',
};

const STAT_COLORS = {
  hp: '#ff5959', attack: '#f5ac78', defense: '#fae078',
  'special-attack': '#9db7f5', 'special-defense': '#a7db8d', speed: '#fa92b2',
};

function showPanel(name) {
  for (const id of ['idle-state', 'pokemon-display', 'loading', 'error']) {
    document.getElementById(id).classList.toggle('hidden', id !== name);
  }
}

function formatId(id) {
  return '#' + String(id).padStart(3, '0');
}

async function fetchRandomPokemon() {
  btn.disabled = true;
  showPanel('loading');

  const id = Math.floor(Math.random() * TOTAL_POKEMON) + 1;

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) throw new Error(`HTTPエラー: ${res.status}`);
    const data = await res.json();
    renderPokemon(data);
  } catch (e) {
    errorMsg.textContent = 'データの取得に失敗しました。もう一度お試しください。';
    showPanel('error');
  } finally {
    btn.disabled = false;
  }
}

function renderPokemon(data) {
  pokemonId.textContent = formatId(data.id);
  pokemonName.textContent = data.name;
  pokemonHeight.textContent = `${(data.height / 10).toFixed(1)} m`;
  pokemonWeight.textContent = `${(data.weight / 10).toFixed(1)} kg`;

  typeBadges.innerHTML = '';
  for (const t of data.types) {
    const type = t.type.name;
    const badge = document.createElement('span');
    badge.className = `type-badge type-${type}`;
    badge.textContent = TYPE_JA[type] ?? type;
    typeBadges.appendChild(badge);
  }

  const artworkUrl = data.sprites?.other?.['official-artwork']?.front_default
    ?? data.sprites?.front_default;

  pokemonImage.src = artworkUrl ?? '';
  pokemonImage.alt = data.name;

  statsEl.innerHTML = '';
  for (const s of data.stats) {
    const name = s.stat.name;
    const val = s.base_stat;
    const pct = Math.min((val / 255) * 100, 100);

    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <span class="stat-name">${STAT_JA[name] ?? name}</span>
      <span class="stat-val">${val}</span>
      <div class="stat-bar-bg">
        <div class="stat-bar" style="width:0%; background:${STAT_COLORS[name] ?? '#94a3b8'}"></div>
      </div>
    `;
    statsEl.appendChild(row);

    requestAnimationFrame(() => {
      row.querySelector('.stat-bar').style.width = `${pct}%`;
    });
  }

  showPanel('pokemon-display');
}

btn.addEventListener('click', fetchRandomPokemon);
