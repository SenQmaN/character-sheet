/* ══════════════════════════════════════════════════════
   D&D Character Sheet Manager
   Character CRUD, stats, throwable skills, Discord webhook
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Constants ─────────────────────────────────────
  const STORAGE_KEY = 'dnd_characters';
  const WEBHOOK_KEY = 'dnd_webhook_url';
  const WEBHOOK_COLOR_KEY = 'dnd_webhook_color';
  const LANG_KEY = 'dnd_lang';

  // ── i18n ───────────────────────────────────────────
  const TRANSLATIONS = {
    en: {
      subtitle: 'Manage your heroes',
      newChar: 'New Character',
      webhookSettings: 'Webhook Settings',
      webhookColor: 'Embed Color',
      backChars: 'Characters',
      dice: 'Dice',
      delete: 'Delete',
      changePfp: 'Change',
      abilityScores: 'Ability Scores',
      savingThrows: 'Saving Throws',
      skills: 'Skills',
      passiveSenses: 'Passive Senses',

      notes: 'Notes',
      diceRoll: 'Dice Roll', dieType: 'Die Type', numDice: 'Number of Dice',
      modifier: 'Modifier', total: 'Total:', sendDiscord: 'Send to Discord',
      webhookHint: 'This webhook will be used to send dice roll results for all characters.',
      testConn: 'Test Connection', save: 'Save',
      deleteChar: 'Delete Character', cancel: 'Cancel',
      phCharName: 'Character Name', phRace: 'Race', phClass: 'Class', phLvl: 'Lvl',
      phPfpUrl: 'Image URL for Discord (https://...)',
      phNotes: 'Additional notes...',
      noChars: 'No characters yet. Create one!',
      selectResult: 'Select result',
      dieNum: 'Die #',
      skillCheck: 'Skill Check',
      checkOf: 'Check',
    },
    ru: {
      subtitle: 'Управляйте своими героями',
      newChar: 'Новый персонаж',
      webhookSettings: 'Настройки вебхука',
      webhookColor: 'Цвет сообщения',
      backChars: 'Персонажи',
      dice: 'Кости',
      delete: 'Удалить',
      changePfp: 'Изменить',
      abilityScores: 'Характеристики',
      savingThrows: 'Спасброски',
      skills: 'Навыки',
      passiveSenses: 'Пассивные чувства',

      notes: 'Заметки',
      diceRoll: 'Бросок кости', dieType: 'Тип кости', numDice: 'Количество костей',
      modifier: 'Модификатор', total: 'Итого:', sendDiscord: 'Отправить в Discord',
      webhookHint: 'Этот вебхук будет использоваться для отправки результатов бросков всех персонажей.',
      testConn: 'Проверить соединение', save: 'Сохранить',
      deleteChar: 'Удалить персонажа', cancel: 'Отмена',
      phCharName: 'Имя персонажа', phRace: 'Раса', phClass: 'Класс', phLvl: 'Ур.',
      phPfpUrl: 'URL изображения для Discord (https://...)',
      phNotes: 'Дополнительные заметки...',
      noChars: 'Персонажей пока нет. Создайте первого!',
      selectResult: 'Выберите результат',
      dieNum: 'Кость №',
      skillCheck: 'Проверка навыка',
      checkOf: 'Проверка',
    },
  };

  const ABILITY_FULL_I18N = {
    en: { STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution', INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma' },
    ru: { STR: 'Сила', DEX: 'Ловкость', CON: 'Телосложение', INT: 'Интеллект', WIS: 'Мудрость', CHA: 'Харизма' },
  };

  const SKILLS_I18N = {
    en: { 'Acrobatics': 'Acrobatics', 'Animal Handling': 'Animal Handling', 'Arcana': 'Arcana', 'Athletics': 'Athletics', 'Deception': 'Deception', 'History': 'History', 'Insight': 'Insight', 'Intimidation': 'Intimidation', 'Investigation': 'Investigation', 'Medicine': 'Medicine', 'Nature': 'Nature', 'Perception': 'Perception', 'Performance': 'Performance', 'Persuasion': 'Persuasion', 'Religion': 'Religion', 'Sleight of Hand': 'Sleight of Hand', 'Stealth': 'Stealth', 'Survival': 'Survival' },
    ru: { 'Acrobatics': 'Акробатика', 'Animal Handling': 'Уход за животными', 'Arcana': 'Магия', 'Athletics': 'Атлетика', 'Deception': 'Обман', 'History': 'История', 'Insight': 'Проницательность', 'Intimidation': 'Запугивание', 'Investigation': 'Анализ', 'Medicine': 'Медицина', 'Nature': 'Природа', 'Perception': 'Восприятие', 'Performance': 'Выступление', 'Persuasion': 'Убеждение', 'Religion': 'Религия', 'Sleight of Hand': 'Ловкость рук', 'Stealth': 'Скрытность', 'Survival': 'Выживание' },
  };

  const SKILLS_GENITIVE_I18N = {
    en: { 'Acrobatics': 'Acrobatics', 'Animal Handling': 'Animal Handling', 'Arcana': 'Arcana', 'Athletics': 'Athletics', 'Deception': 'Deception', 'History': 'History', 'Insight': 'Insight', 'Intimidation': 'Intimidation', 'Investigation': 'Investigation', 'Medicine': 'Medicine', 'Nature': 'Nature', 'Perception': 'Perception', 'Performance': 'Performance', 'Persuasion': 'Persuasion', 'Religion': 'Religion', 'Sleight of Hand': 'Sleight of Hand', 'Stealth': 'Stealth', 'Survival': 'Survival' },
    ru: { 'Acrobatics': 'Акробатики', 'Animal Handling': 'Ухода за животными', 'Arcana': 'Магии', 'Athletics': 'Атлетики', 'Deception': 'Обмана', 'History': 'Истории', 'Insight': 'Проницательности', 'Intimidation': 'Запугивания', 'Investigation': 'Анализа', 'Medicine': 'Медицины', 'Nature': 'Природы', 'Perception': 'Восприятия', 'Performance': 'Выступления', 'Persuasion': 'Убеждения', 'Religion': 'Религии', 'Sleight of Hand': 'Ловкости рук', 'Stealth': 'Скрытности', 'Survival': 'Выживания' },
  };

  const ABILITIES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

  const SKILLS = [
    { name: 'Acrobatics', ability: 'DEX' },
    { name: 'Animal Handling', ability: 'WIS' },
    { name: 'Arcana', ability: 'INT' },
    { name: 'Athletics', ability: 'STR' },
    { name: 'Deception', ability: 'CHA' },
    { name: 'History', ability: 'INT' },
    { name: 'Insight', ability: 'WIS' },
    { name: 'Intimidation', ability: 'CHA' },
    { name: 'Investigation', ability: 'INT' },
    { name: 'Medicine', ability: 'WIS' },
    { name: 'Nature', ability: 'INT' },
    { name: 'Perception', ability: 'WIS' },
    { name: 'Performance', ability: 'CHA' },
    { name: 'Persuasion', ability: 'CHA' },
    { name: 'Religion', ability: 'INT' },
    { name: 'Sleight of Hand', ability: 'DEX' },
    { name: 'Stealth', ability: 'DEX' },
    { name: 'Survival', ability: 'WIS' },
  ];

  const DEFAULT_PFP = 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#1a1a2e"/>
      <circle cx="50" cy="38" r="18" fill="#333350"/>
      <ellipse cx="50" cy="78" rx="28" ry="22" fill="#333350"/>
    </svg>
  `);

  // ── State ─────────────────────────────────────────
  let characters = [];
  let activeCharId = null;
  let webhookUrl = '';
  let webhookColor = '#5865F2';
  let currentLang = 'en';

  // Dice state
  let diceType = 4;
  let diceCount = 1;
  let diceModifier = 0;
  let diceResults = [];

  // ── DOM ───────────────────────────────────────────
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const viewList = $('#view-list');
  const viewSheet = $('#view-sheet');
  const charGrid = $('#char-grid');
  const btnCreate = $('#btn-create-char');
  const btnWebhookGlobal = $('#btn-webhook-global');
  const btnBack = $('#btn-back');
  const btnDiceOpen = $('#btn-dice-open');
  const btnDeleteChar = $('#btn-delete-char');
  const profilePfp = $('#profile-pfp');
  const pfpWrap = $('#pfp-wrap');
  const pfpInput = $('#pfp-input');
  const profileName = $('#profile-name');
  const diceModal = $('#dice-modal');
  const webhookModal = $('#webhook-modal');
  const deleteModal = $('#delete-modal');

  // ── Load / Save ───────────────────────────────────
  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      characters = raw ? JSON.parse(raw) : [];
    } catch { characters = []; }
    webhookUrl = localStorage.getItem(WEBHOOK_KEY) || '';
    webhookColor = localStorage.getItem(WEBHOOK_COLOR_KEY) || '#5865F2';
    currentLang = localStorage.getItem(LANG_KEY) || 'en';
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    localStorage.setItem(WEBHOOK_KEY, webhookUrl);
    localStorage.setItem(WEBHOOK_COLOR_KEY, webhookColor);
    localStorage.setItem(LANG_KEY, currentLang);
  }

  // ── Language ───────────────────────────────────────
  function applyLanguage() {
    const t = TRANSLATIONS[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.dataset.i18nPh;
      if (t[key] !== undefined) el.placeholder = t[key];
    });
    // Both lang toggle labels
    const ll = document.getElementById('lang-label');
    const lls = document.getElementById('lang-label-sheet');
    const label = currentLang === 'en' ? 'RU' : 'EN';
    if (ll) ll.textContent = label;
    if (lls) lls.textContent = label;

    // Re-render dynamic lists if sheet is active
    const char = getActiveChar();
    if (char) {
      buildAbilityGrid(char);
      buildSkillsList(char);
      buildPassivesList(char);
    }
  }

  function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ru' : 'en';
    saveData();
    applyLanguage();
    if (!activeCharId) renderCharGrid();
  }

  // ── Create Default Character ──────────────────────
  function createDefaultChar() {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: 'New Character',
      race: '',
      class: '',
      level: 1,
      pfp: '',
      pfpUrl: '',
      abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
      skillProficiencies: [],
      profBonus: 2,
      text: { notes: '' },
    };
  }

  // ── Helpers ───────────────────────────────────────
  function abilityMod(score) {
    return Math.floor((score - 10) / 2);
  }

  function modStr(mod) {
    return (mod >= 0 ? '+' : '') + mod;
  }

  function getActiveChar() {
    return characters.find(c => c.id === activeCharId) || null;
  }

  function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ── View Router ───────────────────────────────────
  function showList() {
    viewList.classList.add('active');
    viewSheet.classList.remove('active');
    activeCharId = null;
    renderCharGrid();
  }

  function showSheet(charId) {
    activeCharId = charId;
    viewList.classList.remove('active');
    viewSheet.classList.add('active');
    populateSheet();
  }

  // ── Render Character Grid ─────────────────────────
  function renderCharGrid() {
    charGrid.innerHTML = '';
    if (characters.length === 0) {
      const t = TRANSLATIONS[currentLang];
      charGrid.innerHTML = `<p style="color: var(--text-dim); grid-column: 1/-1; text-align:center; padding: 40px;">${t.noChars}</p>`;
      return;
    }
    for (const char of characters) {
      const card = document.createElement('div');
      card.className = 'char-card';
      card.dataset.id = char.id;
      const sub = [char.race, char.class, char.level ? `Lvl ${char.level}` : ''].filter(Boolean).join(' · ');
      const stats = ABILITIES.map(a => `${a} ${char.abilities[a]}`);
      card.innerHTML = `
        <div class="char-card-top">
          <img class="char-card-pfp" src="${char.pfp || DEFAULT_PFP}" alt="" />
          <div class="char-card-info">
            <div class="char-card-name">${escHtml(char.name)}</div>
            <div class="char-card-sub">${escHtml(sub) || 'Unconfigured'}</div>
          </div>
        </div>
        <div class="char-card-stats">
          ${stats.map(s => `<span class="char-card-stat">${s}</span>`).join('')}
        </div>
      `;
      card.addEventListener('click', () => showSheet(char.id));
      charGrid.appendChild(card);
    }
  }

  // ── Populate Sheet ────────────────────────────────
  function populateSheet() {
    const char = getActiveChar();
    if (!char) return showList();

    // Ensure profBonus field exists (migration)
    if (char.profBonus === undefined) char.profBonus = 2;

    profilePfp.src = char.pfp || DEFAULT_PFP;
    profileName.value = char.name;
    $('#field-race').value = char.race;
    $('#field-class').value = char.class;
    $('#field-level').value = char.level || '';
    $('#field-pfp-url').value = char.pfpUrl || '';

    buildAbilityGrid(char);
    buildSkillsList(char);
    buildPassivesList(char);

    $('#text-notes').value = char.text.notes || '';

    applyLanguage();
  }

  // ── Ability Grid ──────────────────────────────────
  function buildAbilityGrid(char) {
    const grid = $('#ability-grid');
    grid.innerHTML = '';
    for (const ab of ABILITIES) {
      const score = char.abilities[ab];
      const mod = abilityMod(score);
      const box = document.createElement('div');
      box.className = 'ability-box';
      box.innerHTML = `
        <span class="ability-label">${ab}</span>
        <input class="ability-score" type="number" data-ability="${ab}" value="${score}" min="1" max="30" />
        <span class="ability-mod" data-ability-mod="${ab}">${modStr(mod)}</span>
      `;
      grid.appendChild(box);
    }
  }

  // ── Skills ────────────────────────────────────────
  function buildSkillsList(char) {
    const list = $('#skills-list');
    list.innerHTML = '';
    for (const sk of SKILLS) {
      const prof = char.skillProficiencies.includes(sk.name);
      const mod = abilityMod(char.abilities[sk.ability]) + (prof ? char.profBonus : 0);
      const row = document.createElement('div');
      row.className = 'skill-row';
      row.innerHTML = `
        <label class="skill-check">
          <input type="checkbox" data-skill="${sk.name}" ${prof ? 'checked' : ''} />
          <span class="dot"></span>
        </label>
        <span class="skill-name">${SKILLS_I18N[currentLang][sk.name]} <small style="color:var(--text-dim)">(${sk.ability})</small></span>
        <button class="skill-roll-btn" data-skill-roll="${sk.name}" data-skill-mod="${mod}" title="Roll d20 ${modStr(mod)}">
          ${modStr(mod)}
        </button>
      `;
      list.appendChild(row);
    }
  }

  // ── Passive Senses ────────────────────────────────
  function buildPassivesList(char) {
    const list = $('#passives-list');
    if (!list) return;
    list.innerHTML = '';
    const passives = [
      { name: 'Perception', label: currentLang === 'ru' ? 'МУДРОСТЬ (ВОСПРИЯТИЕ)' : 'WISDOM (PERCEPTION)' },
      { name: 'Insight', label: currentLang === 'ru' ? 'МУДРОСТЬ (ПРОНИЦАТЕЛЬНОСТЬ)' : 'WISDOM (INSIGHT)' },
      { name: 'Investigation', label: currentLang === 'ru' ? 'ИНТЕЛЛЕКТ (АНАЛИЗ)' : 'INTELLIGENCE (INVESTIGATION)' }
    ];
    for (const p of passives) {
      const sk = SKILLS.find(s => s.name === p.name);
      const prof = char.skillProficiencies.includes(sk.name);
      const mod = abilityMod(char.abilities[sk.ability]) + (prof ? char.profBonus : 0);
      const score = 10 + mod;
      
      const row = document.createElement('div');
      row.className = 'passive-row';
      row.style.display = 'flex';
      row.style.background = '#1a1a24';
      row.style.border = '1px solid #333344';
      row.style.borderRadius = '4px';
      row.style.marginBottom = '6px';
      row.style.padding = '6px 10px';
      row.style.alignItems = 'center';

      row.innerHTML = `
        <div style="font-weight:bold; font-size:16px; min-width:30px; text-align:center; padding-right:10px; border-right:1px solid #333344; margin-right:10px;">${score}</div>
        <div style="font-size:12px; font-weight:600; letter-spacing:0.5px; opacity:0.8;">${p.label}</div>
      `;
      list.appendChild(row);
    }
  }

  // ── Skill Roll Modal State ────────────────────────
  let skillRollName = '';
  let skillRollDefaultMod = 0;
  let skillRollSelectedMod = 0;
  let skillRollD20 = null;
  const skillRollModal = document.getElementById('skill-roll-modal');

  function openSkillRollModal(skillName, skillMod) {
    skillRollName = skillName;
    skillRollDefaultMod = skillMod;
    skillRollSelectedMod = skillMod;
    skillRollD20 = null;

    // Set skill name display
    const displayName = SKILLS_I18N[currentLang][skillName];
    $('#skill-roll-skill-name').textContent = displayName;

    // Build modifier selector buttons (-5 to +10)
    const modContainer = $('#skill-mod-selector');
    modContainer.innerHTML = '';
    for (let m = -5; m <= 10; m++) {
      const btn = document.createElement('button');
      btn.className = 'skill-mod-btn' + (m === skillMod ? ' active' : '');
      btn.textContent = (m >= 0 ? '+' : '') + m;
      btn.dataset.mod = m;
      btn.addEventListener('click', () => selectSkillMod(m));
      modContainer.appendChild(btn);
    }

    // Build d20 grid (1-20)
    const d20Grid = $('#skill-roll-d20-grid');
    d20Grid.innerHTML = '';
    for (let n = 1; n <= 20; n++) {
      const btn = document.createElement('button');
      btn.className = 'dice-num-btn';
      btn.textContent = n;
      btn.dataset.d20val = n;
      btn.addEventListener('click', () => selectSkillD20(n));
      d20Grid.appendChild(btn);
    }

    // Reset total & status
    $('#skill-roll-total-row').style.display = 'none';
    $('#btn-send-skill-roll').disabled = true;
    $('#skill-roll-status').textContent = '';

    skillRollModal.style.display = 'flex';
    applyLanguage();
  }

  function closeSkillRollModal() {
    skillRollModal.style.display = 'none';
  }

  function selectSkillMod(mod) {
    skillRollSelectedMod = mod;
    $$('#skill-mod-selector .skill-mod-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.mod) === mod);
    });
    updateSkillRollTotal();
  }

  function selectSkillD20(value) {
    skillRollD20 = value;
    $$('#skill-roll-d20-grid .dice-num-btn').forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.dataset.d20val) === value);
    });
    updateSkillRollTotal();
  }

  function updateSkillRollTotal() {
    if (skillRollD20 !== null) {
      const total = skillRollD20 + skillRollSelectedMod;
      $('#skill-roll-total-value').textContent = total;
      $('#skill-roll-total-row').style.display = 'flex';
      $('#btn-send-skill-roll').disabled = false;
    }
  }

  function setupSkillRollListeners() {
    $('#skill-roll-close').addEventListener('click', closeSkillRollModal);
    skillRollModal.addEventListener('click', (e) => {
      if (e.target === skillRollModal) closeSkillRollModal();
    });
    $('#btn-send-skill-roll').addEventListener('click', sendSkillRollToWebhook);
  }

  async function sendSkillRollToWebhook() {
    const char = getActiveChar();
    if (!char) return;

    if (!webhookUrl) {
      $('#skill-roll-status').textContent = currentLang === 'ru'
        ? '⚠ Сначала настройте вебхук'
        : '⚠ Set webhook URL first (⚙ button on character list)';
      $('#skill-roll-status').className = 'dice-status error';
      return;
    }

    const d20 = skillRollD20;
    const mod = skillRollSelectedMod;
    const total = d20 + mod;
    const skillGenitiveName = SKILLS_GENITIVE_I18N[currentLang][skillRollName];
    const t = TRANSLATIONS[currentLang];

    // Breakdown: (17) – 5  or  (17) + 3
    let breakdownStr = `(${d20})`;
    if (mod > 0) breakdownStr += ` + ${mod}`;
    else if (mod < 0) breakdownStr += ` – ${Math.abs(mod)}`;

    // Formula: (1к20) – 5
    let formulaStr = currentLang === 'ru' ? '(1к20)' : '(1d20)';
    if (mod > 0) formulaStr += ` + ${mod}`;
    else if (mod < 0) formulaStr += ` – ${Math.abs(mod)}`;

    let titleStr = currentLang === 'ru' ? `${t.checkOf} ${skillGenitiveName} — ${total}` : `${skillGenitiveName} ${t.checkOf} — ${total}`;
    if (d20 === 20) titleStr = `🔥 ${titleStr} 🔥`;
    if (d20 === 1) titleStr = `🩸 ${titleStr} 🩸`;

    const embed = {
      author: { name: char.name },
      title: titleStr,
      description: breakdownStr,
      footer: { text: formulaStr },
      color: parseInt(webhookColor.replace('#', ''), 16),
    };

    if (char.pfpUrl && char.pfpUrl.startsWith('http')) {
      embed.thumbnail = { url: char.pfpUrl };
    }

    const body = { embeds: [embed] };

    try {
      $('#btn-send-skill-roll').disabled = true;
      $('#skill-roll-status').textContent = 'Sending...';
      $('#skill-roll-status').className = 'dice-status';

      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (resp.ok || resp.status === 204) {
        $('#skill-roll-status').textContent = '✓ Sent to Discord!';
        $('#skill-roll-status').className = 'dice-status success';
      } else {
        const text = await resp.text();
        $('#skill-roll-status').textContent = `✕ Error ${resp.status}: ${text.slice(0, 100)}`;
        $('#skill-roll-status').className = 'dice-status error';
      }
    } catch (err) {
      $('#skill-roll-status').textContent = `✕ ${err.message}`;
      $('#skill-roll-status').className = 'dice-status error';
    }

    $('#btn-send-skill-roll').disabled = false;
  }

  // ── Skill Roll (Throwable) ────────────────────────
  function rollSkillCheck(skillName, skillMod) {
    openSkillRollModal(skillName, skillMod);
  }

  // ── Auto-save on change ───────────────────────────
  function setupSheetListeners() {
    // Profile fields
    const profileFields = [
      { sel: '#profile-name', key: 'name' },
      { sel: '#field-race', key: 'race' },
      { sel: '#field-class', key: 'class' },
      { sel: '#field-level', key: 'level', num: true },
      { sel: '#field-pfp-url', key: 'pfpUrl' },
    ];

    for (const f of profileFields) {
      $(f.sel).addEventListener('input', () => {
        const char = getActiveChar();
        if (!char) return;
        char[f.key] = f.num ? (parseInt($(f.sel).value) || 0) : $(f.sel).value;
        saveData();
      });
    }

    // Ability scores (delegated)
    $('#ability-grid').addEventListener('input', (e) => {
      if (!e.target.matches('.ability-score')) return;
      const char = getActiveChar();
      if (!char) return;
      const ab = e.target.dataset.ability;
      const val = parseInt(e.target.value) || 10;
      char.abilities[ab] = val;
      const mod = abilityMod(val);
      document.querySelector(`[data-ability-mod="${ab}"]`).textContent = modStr(mod);
      saveData();
      buildSkillsList(char);
      buildPassivesList(char);
    });

    // Skill proficiencies (delegated)
    document.addEventListener('change', (e) => {
      if (!e.target.matches('[data-skill]')) return;
      const char = getActiveChar();
      if (!char) return;
      const sk = e.target.dataset.skill;
      if (e.target.checked) {
        if (!char.skillProficiencies.includes(sk)) char.skillProficiencies.push(sk);
      } else {
        char.skillProficiencies = char.skillProficiencies.filter(s => s !== sk);
      }
      saveData();
      buildSkillsList(char);
      buildPassivesList(char);
    });

    // Skill roll buttons (delegated)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-skill-roll]');
      if (!btn) return;
      e.preventDefault();
      const skillName = btn.dataset.skillRoll;
      const skillMod = parseInt(btn.dataset.skillMod);
      rollSkillCheck(skillName, skillMod);
    });

    // Notes
    $('#text-notes').addEventListener('input', () => {
      const char = getActiveChar();
      if (!char) return;
      char.text.notes = $('#text-notes').value;
      saveData();
    });

    // Profile picture
    pfpWrap.addEventListener('click', () => pfpInput.click());
    pfpInput.addEventListener('change', () => {
      const file = pfpInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const char = getActiveChar();
        if (!char) return;
        char.pfp = e.target.result;
        profilePfp.src = char.pfp;
        saveData();
      };
      reader.readAsDataURL(file);
    });

    // ImgBB Auto-Uploader
    document.getElementById('btn-upload-imgbb').addEventListener('click', async () => {
      const char = getActiveChar();
      if (!char || !char.pfp || char.pfp.startsWith('http')) {
        alert(currentLang === 'ru' ? 'Сначала прикрепите локальное изображение(кликните на аватар в левом верхнем углу)' : 'Please select a local image (click on the avatar in top left corner)');
        return;
      }
      
      const btn = document.getElementById('btn-upload-imgbb');
      const originalText = btn.textContent;
      btn.textContent = '⏳...';
      btn.disabled = true;
      
      try {
        const base64Data = char.pfp.split(',')[1];
        if (!base64Data) throw new Error('Invalid image format');
        
        const params = new URLSearchParams();
        params.append('key', 'a8561fad24ac2633b4450240d5337dc1');
        params.append('image', base64Data);
        
        const res = await fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: params
        });
        
        const data = await res.json();
        if (data.success && data.data.url) {
          const url = data.data.url;
          char.pfpUrl = url;
          document.getElementById('field-pfp-url').value = url;
          saveData();
          btn.textContent = '✅';
          setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 2000);
        } else {
          throw new Error(data.error?.message || 'Upload failed');
        }
      } catch (err) {
        alert('Upload Error: ' + err.message);
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  // ── Dice Modal ────────────────────────────────────
  function openDiceModal() {
    diceType = 4;
    diceCount = 1;
    diceModifier = 0;
    diceResults = [];
    updateDieTypeButtons();
    $('#dice-count').textContent = '1';
    $('#dice-modifier').value = '0';
    updateDiceFormula();
    buildDiceResultsArea();
    $('#dice-total-row').style.display = 'none';
    $('#btn-send-dice').disabled = true;
    $('#dice-status').textContent = '';
    diceModal.style.display = 'flex';
  }

  function closeDiceModal() {
    diceModal.style.display = 'none';
  }

  function updateDieTypeButtons() {
    $$('#die-type-btns .die-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.die) === diceType);
    });
  }

  function updateDiceFormula() {
    const mod = diceModifier;
    let formula = `${diceCount}d${diceType}`;
    if (mod > 0) formula += ` + ${mod}`;
    else if (mod < 0) formula += ` – ${Math.abs(mod)}`;
    $('#dice-formula').textContent = formula;
  }

  function buildDiceResultsArea() {
    const area = $('#dice-results-area');
    area.innerHTML = '';
    diceResults = new Array(diceCount).fill(null);

    for (let d = 0; d < diceCount; d++) {
      const group = document.createElement('div');
      group.className = 'dice-die-group';

      const label = document.createElement('div');
      label.className = 'dice-die-label';
      const t = TRANSLATIONS[currentLang];
      label.textContent = diceCount > 1 ? `${t.dieNum}${d + 1} (d${diceType})` : `${t.selectResult} (d${diceType})`;
      group.appendChild(label);

      const grid = document.createElement('div');
      grid.className = 'dice-number-grid';

      for (let n = 1; n <= diceType; n++) {
        const btn = document.createElement('button');
        btn.className = 'dice-num-btn';
        btn.textContent = n;
        btn.dataset.dieIndex = d;
        btn.dataset.value = n;
        btn.addEventListener('click', () => selectDiceResult(d, n));
        grid.appendChild(btn);
      }

      group.appendChild(grid);
      area.appendChild(group);
    }
  }

  function selectDiceResult(dieIndex, value) {
    diceResults[dieIndex] = value;
    const btns = $$(`[data-die-index="${dieIndex}"]`);
    btns.forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.dataset.value) === value);
    });
    const allSelected = diceResults.every(v => v !== null);
    if (allSelected) {
      const sum = diceResults.reduce((a, b) => a + b, 0);
      const total = sum + diceModifier;
      $('#dice-total-value').textContent = total;
      $('#dice-total-row').style.display = 'flex';
      $('#btn-send-dice').disabled = false;
    }
  }

  function setupDiceListeners() {
    $('#die-type-btns').addEventListener('click', (e) => {
      const btn = e.target.closest('.die-btn');
      if (!btn) return;
      diceType = parseInt(btn.dataset.die);
      updateDieTypeButtons();
      updateDiceFormula();
      buildDiceResultsArea();
      $('#dice-total-row').style.display = 'none';
      $('#btn-send-dice').disabled = true;
    });

    $('#dice-minus').addEventListener('click', () => {
      if (diceCount > 1) {
        diceCount--;
        $('#dice-count').textContent = diceCount;
        updateDiceFormula();
        buildDiceResultsArea();
        $('#dice-total-row').style.display = 'none';
        $('#btn-send-dice').disabled = true;
      }
    });

    $('#dice-plus').addEventListener('click', () => {
      if (diceCount < 20) {
        diceCount++;
        $('#dice-count').textContent = diceCount;
        updateDiceFormula();
        buildDiceResultsArea();
        $('#dice-total-row').style.display = 'none';
        $('#btn-send-dice').disabled = true;
      }
    });

    $('#dice-modifier').addEventListener('input', () => {
      diceModifier = parseInt($('#dice-modifier').value) || 0;
      updateDiceFormula();
      if (diceResults.every(v => v !== null) && diceResults.length > 0) {
        const sum = diceResults.reduce((a, b) => a + b, 0);
        $('#dice-total-value').textContent = sum + diceModifier;
      }
    });

    btnDiceOpen.addEventListener('click', openDiceModal);
    $('#dice-close').addEventListener('click', closeDiceModal);
    diceModal.addEventListener('click', (e) => {
      if (e.target === diceModal) closeDiceModal();
    });

    $('#btn-send-dice').addEventListener('click', sendDiceToWebhook);
  }

  // ── Discord Webhook ───────────────────────────────
  async function sendDiceToWebhook() {
    if (!webhookUrl) {
      $('#dice-status').textContent = currentLang === 'ru'
        ? '⚠ Сначала настройте вебхук'
        : '⚠ Set webhook URL first (⚙ button on character list)';
      $('#dice-status').className = 'dice-status error';
      return;
    }

    const char = getActiveChar();
    if (!char) return;

    const sum = diceResults.reduce((a, b) => a + b, 0);
    const total = sum + diceModifier;

    const diceStr = diceResults.join(' + ');
    let breakdownStr = `(${diceStr})`;
    if (diceModifier > 0) breakdownStr += ` + ${diceModifier}`;
    else if (diceModifier < 0) breakdownStr += ` – ${Math.abs(diceModifier)}`;

    const dNotation = currentLang === 'ru' ? 'к' : 'd';
    let formulaStr = `(${diceCount}${dNotation}${diceType})`;
    if (diceModifier > 0) formulaStr += ` + ${diceModifier}`;
    else if (diceModifier < 0) formulaStr += ` – ${Math.abs(diceModifier)}`;

    let titleStr = `Бросок — ${total}`;
    if (diceType === 20) {
      if (diceResults.includes(20)) titleStr = `🔥 ${titleStr} 🔥`;
      else if (diceResults.includes(1)) titleStr = `🩸 ${titleStr} 🩸`;
    }

    const embed = {
      author: { name: char.name },
      title: titleStr,
      description: breakdownStr,
      footer: { text: formulaStr },
      color: parseInt(webhookColor.replace('#', ''), 16),
    };

    if (char.pfpUrl && char.pfpUrl.startsWith('http')) {
      embed.thumbnail = { url: char.pfpUrl };
    }

    const body = { embeds: [embed] };

    try {
      $('#btn-send-dice').disabled = true;
      $('#dice-status').textContent = 'Sending...';
      $('#dice-status').className = 'dice-status';

      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (resp.ok || resp.status === 204) {
        $('#dice-status').textContent = '✓ Sent to Discord!';
        $('#dice-status').className = 'dice-status success';
      } else {
        const text = await resp.text();
        $('#dice-status').textContent = `✕ Error ${resp.status}: ${text.slice(0, 100)}`;
        $('#dice-status').className = 'dice-status error';
      }
    } catch (err) {
      $('#dice-status').textContent = `✕ ${err.message}`;
      $('#dice-status').className = 'dice-status error';
    }

    $('#btn-send-dice').disabled = false;
  }

  // ── Webhook Settings Modal ────────────────────────
  function openWebhookModal() {
    $('#webhook-url').value = webhookUrl;
    $('#webhook-color').value = webhookColor;
    $('#webhook-status').textContent = '';
    webhookModal.style.display = 'flex';
  }

  function closeWebhookModal() {
    webhookModal.style.display = 'none';
  }

  function setupWebhookListeners() {
    btnWebhookGlobal.addEventListener('click', openWebhookModal);
    document.getElementById('btn-webhook-sheet').addEventListener('click', openWebhookModal);
    $('#webhook-close').addEventListener('click', closeWebhookModal);
    webhookModal.addEventListener('click', (e) => {
      if (e.target === webhookModal) closeWebhookModal();
    });

    $('#btn-webhook-save').addEventListener('click', () => {
      webhookUrl = $('#webhook-url').value.trim();
      webhookColor = $('#webhook-color').value;
      saveData();
      $('#webhook-status').textContent = '✓ Saved!';
      $('#webhook-status').className = 'webhook-status success';
      setTimeout(closeWebhookModal, 800);
    });

    $('#btn-webhook-test').addEventListener('click', async () => {
      const url = $('#webhook-url').value.trim();
      const colorHex = parseInt($('#webhook-color').value.replace('#', ''), 16);
      if (!url) {
        $('#webhook-status').textContent = '⚠ Enter a URL first';
        $('#webhook-status').className = 'webhook-status error';
        return;
      }
      try {
        $('#webhook-status').textContent = 'Testing...';
        $('#webhook-status').className = 'webhook-status';

        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: '🎲 Character Sheet',
              description: 'Webhook connected successfully!',
              color: colorHex
            }]
          }),
        });

        if (resp.ok || resp.status === 204) {
          $('#webhook-status').textContent = '✓ Connection successful!';
          $('#webhook-status').className = 'webhook-status success';
        } else {
          $('#webhook-status').textContent = `✕ Error ${resp.status}`;
          $('#webhook-status').className = 'webhook-status error';
        }
      } catch (err) {
        $('#webhook-status').textContent = `✕ ${err.message}`;
        $('#webhook-status').className = 'webhook-status error';
      }
    });
  }

  // ── Delete Character ──────────────────────────────
  function openDeleteModal() {
    const char = getActiveChar();
    if (!char) return;
    $('#delete-name').textContent = char.name;
    deleteModal.style.display = 'flex';
  }

  function closeDeleteModal() {
    deleteModal.style.display = 'none';
  }

  function setupDeleteListeners() {
    btnDeleteChar.addEventListener('click', openDeleteModal);
    $('#delete-close').addEventListener('click', closeDeleteModal);
    $('#btn-delete-cancel').addEventListener('click', closeDeleteModal);
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) closeDeleteModal();
    });

    $('#btn-delete-confirm').addEventListener('click', () => {
      characters = characters.filter(c => c.id !== activeCharId);
      saveData();
      closeDeleteModal();
      showList();
    });
  }

  // ── Navigation ────────────────────────────────────
  function setupNavListeners() {
    btnBack.addEventListener('click', showList);

    btnCreate.addEventListener('click', () => {
      const char = createDefaultChar();
      characters.push(char);
      saveData();
      showSheet(char.id);
    });

    // Language toggles (both list and sheet)
    document.getElementById('btn-lang-toggle').addEventListener('click', toggleLanguage);
    document.getElementById('btn-lang-toggle-sheet').addEventListener('click', toggleLanguage);
  }

  // ── Init ──────────────────────────────────────────
  function init() {
    loadData();
    setupNavListeners();
    setupSheetListeners();
    setupDiceListeners();
    setupSkillRollListeners();
    setupWebhookListeners();
    setupDeleteListeners();
    applyLanguage();
    showList();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
