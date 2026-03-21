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
      attacks: 'Attacks & Formulas',
      checkBtn: 'Check',
      saveBtn: 'Save',

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
      attacks: 'Атаки и формулы',
      checkBtn: 'Проверка',
      saveBtn: 'Спасбросок',

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

  const ABILITY_GENITIVE_I18N = {
    en: { STR: 'Strength', DEX: 'Dexterity', CON: 'Constitution', INT: 'Intelligence', WIS: 'Wisdom', CHA: 'Charisma' },
    ru: { STR: 'Силы', DEX: 'Ловкости', CON: 'Телосложения', INT: 'Интеллекта', WIS: 'Мудрости', CHA: 'Харизмы' }
  };

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
  const MULTI_DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];
  let multiDiceCounts = { 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0, 100: 0 };
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
      savingThrowProficiencies: [],
      skillBonuses: {},
      attacks: [],
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
    buildAttacksList(char);

    $('#text-notes').value = char.text.notes || '';

    applyLanguage();
  }

  // ── Ability Grid ──────────────────────────────────
  function buildAbilityGrid(char) {
    const grid = $('#ability-grid');
    grid.innerHTML = '';
    const t = TRANSLATIONS[currentLang];
    for (const ab of ABILITIES) {
      const score = char.abilities[ab];
      const mod = abilityMod(score);
      const isProf = char.savingThrowProficiencies && char.savingThrowProficiencies.includes(ab);
      const saveMod = mod + (isProf ? char.profBonus : 0);
      
      const abName = ABILITY_FULL_I18N[currentLang][ab].toUpperCase();

      const box = document.createElement('div');
      box.className = 'ability-box';
      box.innerHTML = `
        <div class="ability-top">
          <span class="ability-name">${abName}</span>
          <input class="ability-score-input ability-score" type="number" data-ability="${ab}" value="${score}" min="1" max="30" />
        </div>
        <div class="ability-actions">
          <button class="ability-action-btn" data-ability-roll="${ab}" data-roll-type="check">
            <span class="ability-action-name">${t.checkBtn || 'CHECK'}</span>
            <span class="ability-action-mod" data-ability-mod="${ab}">${modStr(mod)}</span>
          </button>
          
          <div class="ability-action-group">
            <label class="ability-prof-toggle">
              <input type="checkbox" data-save-prof="${ab}" ${isProf ? 'checked' : ''} />
              <span class="dot"></span>
            </label>
            <button class="ability-action-btn" data-ability-roll="${ab}" data-roll-type="save">
              <span class="ability-action-name">${t.saveBtn || 'SAVE'}</span>
              <span class="ability-action-mod" data-save-mod="${ab}">${modStr(saveMod)}</span>
            </button>
          </div>
        </div>
      `;
      grid.appendChild(box);
    }
  }

  // ── Skills ────────────────────────────────────────
  function buildSkillsList(char) {
    const list = $('#skills-list');
    list.innerHTML = '';
    
    const grouped = {};
    for (const sk of SKILLS) {
      if (!grouped[sk.ability]) grouped[sk.ability] = [];
      grouped[sk.ability].push(sk);
    }
    
    for (const ab of ABILITIES) {
      const skillsInAb = grouped[ab] || [];
      if (skillsInAb.length === 0) continue;
      
      const groupDiv = document.createElement('div');
      groupDiv.className = 'skill-group';
      
      const groupTitle = document.createElement('h3');
      groupTitle.className = 'skill-group-title';
      groupTitle.textContent = ABILITY_FULL_I18N[currentLang][ab];
      groupDiv.appendChild(groupTitle);
      
      const subList = document.createElement('div');
      subList.className = 'skills-sublist';
      
      for (const sk of skillsInAb) {
        const prof = char.skillProficiencies.includes(sk.name);
        const customBonus = char.skillBonuses && char.skillBonuses[sk.name] ? char.skillBonuses[sk.name] : 0;
        const mod = (prof ? char.profBonus : 0) + customBonus;
        const row = document.createElement('div');
        row.className = 'skill-row';
        row.innerHTML = `
          <label class="skill-check">
            <input type="checkbox" data-skill="${sk.name}" ${prof ? 'checked' : ''} />
            <span class="dot"></span>
          </label>
          <span class="skill-name">${SKILLS_I18N[currentLang][sk.name]}</span>
          <input type="number" class="skill-bonus-input" data-skill-bonus="${sk.name}" value="${customBonus}" title="Custom bonus" />
          <button class="skill-roll-btn" data-skill-roll="${sk.name}" data-skill-mod="${mod}" title="Roll d20 ${modStr(mod)}">
            ${modStr(mod)}
          </button>
        `;
        subList.appendChild(row);
      }
      groupDiv.appendChild(subList);
      list.appendChild(groupDiv);
    }
  }

  // ── Attacks & Formulas ────────────────────────────
  function buildAttacksList(char) {
    const list = $('#attacks-list');
    if (!list) return;
    list.innerHTML = '';
    
    if (!char.attacks) char.attacks = [];
    
    char.attacks.forEach((atk, i) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '8px';
      row.style.alignItems = 'center';
      
      row.innerHTML = `
        <input type="text" class="attack-name-input" data-attack-id="${i}" value="${atk.name || ''}" placeholder="Attack Name" />
        <span style="color:var(--text-sec); font-weight:bold;">:</span>
        <input type="text" class="attack-formula-input" data-attack-id="${i}" value="${atk.formula || ''}" placeholder="e.g. 1d8+[STR]" />
        <button class="btn btn-ghost btn-attack-roll" data-attack-roll="${i}" title="Roll" style="padding:4px;">🎲</button>
        <button class="btn-delete-attack" data-attack-id="${i}" title="Remove">✕</button>
      `;
      list.appendChild(row);
    });
  }

  // ── Skill Roll Modal State ────────────────────────
  let skillRollName = '';
  let skillRollType = 'skill';
  let skillRollDefaultMod = 0;
  let skillRollSelectedMod = 0;
  let skillRollD20 = null;
  const skillRollModal = document.getElementById('skill-roll-modal');

  function openSkillRollModal(nameKey, type, skillMod, customTitle = null) {
    skillRollName = nameKey;
    skillRollType = type;
    skillRollDefaultMod = skillMod;
    skillRollSelectedMod = skillMod;
    skillRollD20 = null;

    // Set skill name display
    const displayName = customTitle || SKILLS_I18N[currentLang][nameKey] || nameKey;
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
    const t = TRANSLATIONS[currentLang];

    // Breakdown: (17) – 5  or  (17) + 3
    let breakdownStr = `(${d20})`;
    if (mod > 0) breakdownStr += ` + ${mod}`;
    else if (mod < 0) breakdownStr += ` – ${Math.abs(mod)}`;

    // Formula: (1к20) – 5
    let formulaStr = currentLang === 'ru' ? '(1к20)' : '(1d20)';
    if (mod > 0) formulaStr += ` + ${mod}`;
    else if (mod < 0) formulaStr += ` – ${Math.abs(mod)}`;

    let titleStr = '';
    if (skillRollType === 'skill') {
      const genitiveName = SKILLS_GENITIVE_I18N[currentLang][skillRollName];
      titleStr = currentLang === 'ru' ? `${t.checkOf} ${genitiveName} — ${total}` : `${genitiveName} ${t.checkOf} — ${total}`;
    } else if (skillRollType === 'check') {
      const abName = ABILITY_GENITIVE_I18N[currentLang][skillRollName];
      titleStr = currentLang === 'ru' ? `Проверка ${abName} — ${total}` : `Ability Check: ${abName} — ${total}`;
    } else if (skillRollType === 'save') {
      const abName = ABILITY_GENITIVE_I18N[currentLang][skillRollName];
      titleStr = currentLang === 'ru' ? `Спасбросок ${abName} — ${total}` : `Saving Throw: ${abName} — ${total}`;
    }

    if (d20 === 20) titleStr = `🔥 ${titleStr} 🔥`;
    if (d20 === 1) titleStr = `🩸 ${titleStr} 🩸`;

    const colorInt = parseInt(webhookColor.replace(/^#/, ''), 16);
    const embed = {
      author: { name: char.name },
      title: titleStr,
      description: breakdownStr,
      footer: { text: formulaStr },
      color: isNaN(colorInt) ? 0x5865F2 : colorInt,
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
    openSkillRollModal(skillName, 'skill', skillMod);
  }

  function rollAbility(ab, type, abMod, char) {
    let mod = abMod;
    if (type === 'save') {
      const isProf = char.savingThrowProficiencies && char.savingThrowProficiencies.includes(ab);
      if (isProf) mod += char.profBonus;
    }
    const t = TRANSLATIONS[currentLang];
    const abName = ABILITY_FULL_I18N[currentLang][ab];
    const prefix = type === 'save' ? t.saveBtn : t.checkBtn;
    const title = `${prefix}: ${abName}`;
    openSkillRollModal(ab, type, mod, title);
  }

  // ── Attack Roll Modal State & Logic ────────────────
  let currentAttackSegments = [];
  let currentAttackName = '';

  function parseFormulaSegments(formula, char) {
    if (!formula) return [];
    const rawSegments = formula.split(/\s+\+\s+/);
    
    return rawSegments.map(seg => {
      let s = seg;
      const stats = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA', 'СИЛ', 'ЛОВ', 'ТЕЛ', 'ИНТ', 'МУД', 'ХАР'];
      stats.forEach(st => {
        const re = new RegExp(`\\[${st}\\]`, 'gi');
        if (re.test(s)) {
          const map = { 'СИЛ': 'STR', 'ЛОВ': 'DEX', 'ТЕЛ': 'CON', 'ИНТ': 'INT', 'МУД': 'WIS', 'ХАР': 'CHA' };
          const key = map[st.toUpperCase()] || st.toUpperCase();
          const mod = abilityMod(char.abilities[key]);
          const signedMod = mod >= 0 ? `+${mod}` : `${mod}`;
          s = s.replace(re, signedMod);
        }
      });

      s = s.replace(/\+\+/g, '+').replace(/\+-/g, '-').replace(/-\+/g, '-').replace(/--/g, '+');
      
      let totalStaticMod = 0;
      let diceList = [];
      let remaining = s;
      const diceRe = /(\d+)[dкDК](\d+)/g;
      let match;
      while ((match = diceRe.exec(s)) !== null) {
        let count = parseInt(match[1]);
        if (count > 20) count = 20; 
        diceList.push({ count, sides: parseInt(match[2]), results: Array(count).fill(null) });
        remaining = remaining.replace(match[0], '');
      }
      
      try {
        const staticNums = remaining.replace(/\s+/g, '').match(/[+-]?\d+/g) || [];
        totalStaticMod = staticNums.reduce((sum, val) => sum + parseInt(val), 0);
      } catch(e) {}

      return {
        originalLabel: seg,
        cleanLabel: s,
        diceList,
        staticMod: totalStaticMod
      };
    });
  }

  function openAttackModal(name, formula) {
    const char = getActiveChar();
    if (!char) return;
    currentAttackName = name || 'Attack';
    $('#attack-modal-title').textContent = `⚔️ ${currentAttackName}`;
    currentAttackSegments = parseFormulaSegments(formula, char);
    renderAttackModalSegments();
    
    $('#attack-status').textContent = '';
    $('#attack-status').className = 'dice-status';
    $('#attack-modal').style.display = 'flex';
  }

  function closeAttackModal() {
    $('#attack-modal').style.display = 'none';
  }

  function renderAttackModalSegments() {
    const area = $('#attack-segments-area');
    area.innerHTML = '';
    
    if (currentAttackSegments.length === 0) {
       area.innerHTML = '<p style="color:var(--text-dim);text-align:center;">No parsed formula.</p>';
       $('#btn-send-attack-sep').disabled = true;
       $('#btn-send-attack-comb').disabled = true;
       return;
    }

    const t = TRANSLATIONS[currentLang];

    currentAttackSegments.forEach((seg, sIdx) => {
      const segBlock = document.createElement('div');
      segBlock.style.marginBottom = '20px';
      
      let allReady = true;
      let segSum = seg.staticMod;
      const headerDiv = document.createElement('div');
      headerDiv.className = 'dice-formula';
      headerDiv.style.marginBottom = '16px';
      headerDiv.innerHTML = `${seg.cleanLabel} <span class="attack-seg-sum" style="opacity:0.6;font-size:0.8em;font-weight:normal;"></span>`;
      segBlock.appendChild(headerDiv);

      seg.diceList.forEach((dGroup, gIdx) => {
        const groupDiv = document.createElement('div');
        groupDiv.style.marginBottom = '12px';
        
        for (let i = 0; i < dGroup.count; i++) {
          const val = dGroup.results[i];
          if (val === null) allReady = false;
          else segSum += val;

          const rowDiv = document.createElement('div');
          rowDiv.style.marginBottom = '10px';
          const dNot = currentLang === 'ru' ? 'к' : 'd';
          rowDiv.innerHTML = `<div style="font-size:13px; font-weight: 700; color:var(--text-sec); margin-bottom:8px;">${t.dieNum}${i+1} (${dNot}${dGroup.sides})</div>`;
          
          const grid = document.createElement('div');
          grid.className = 'dice-number-grid';
          
          for (let n = 1; n <= dGroup.sides; n++) {
            const btn = document.createElement('button');
            btn.className = 'dice-num-btn' + (val === n ? ' selected' : '');
            btn.textContent = n;
            btn.addEventListener('click', () => {
              dGroup.results[i] = n;
              renderAttackModalSegments();
            });
            grid.appendChild(btn);
          }
          rowDiv.appendChild(grid);
          groupDiv.appendChild(rowDiv);
        }
        segBlock.appendChild(groupDiv);
      });
      
      const sumSpan = headerDiv.querySelector('.attack-seg-sum');
      sumSpan.textContent = allReady ? `(Total: ${segSum})` : '';
      
      area.appendChild(segBlock);
    });

    const ready = currentAttackSegments.length > 0 && currentAttackSegments.every(seg => 
      seg.diceList.every(g => g.results.every(r => r !== null))
    );
    $('#btn-send-attack-sep').disabled = !ready;
    $('#btn-send-attack-comb').disabled = !ready;
  }

  async function sendAttackToWebhook(combined) {
    const char = getActiveChar();
    if (!webhookUrl || !char) return;
    
    $('#attack-status').textContent = 'Sending...';
    $('#attack-status').className = 'dice-status';
    $('#btn-send-attack-sep').disabled = true;
    $('#btn-send-attack-comb').disabled = true;

    try {
      if (combined) {
        let totalVal = 0;
        let breakdownParts = [];
        let formulaParts = [];
        currentAttackSegments.forEach(seg => {
          let segSum = seg.staticMod;
          let segBreakdown = [];
          seg.diceList.forEach(g => {
            segSum += g.results.reduce((a, b) => a + b, 0);
            segBreakdown.push(`${g.results.join(' + ')}`);
          });
          totalVal += segSum;
          let segFinalBrk = segBreakdown.length > 0 ? `(${segBreakdown.join(') + (')})` : '';
          
          if (seg.staticMod > 0) segFinalBrk = segFinalBrk ? `${segFinalBrk} + ${seg.staticMod}` : `${seg.staticMod}`;
          else if (seg.staticMod < 0) segFinalBrk = segFinalBrk ? `${segFinalBrk} - ${Math.abs(seg.staticMod)}` : `-${Math.abs(seg.staticMod)}`;
          
          if (segFinalBrk) breakdownParts.push(segFinalBrk);
          
          let f = '';
          seg.diceList.forEach(g => {
            const dNot = currentLang === 'ru' ? 'к' : 'd';
            f += (f ? ' + ' : '') + `(${g.count}${dNot}${g.sides})`;
          });
          if (seg.staticMod > 0) f = f ? `${f} + ${seg.staticMod}` : `${seg.staticMod}`;
          else if (seg.staticMod < 0) f = f ? `${f} - ${Math.abs(seg.staticMod)}` : `-${Math.abs(seg.staticMod)}`;
          if (f) formulaParts.push(f);
        });

        const colorInt = parseInt(webhookColor.replace(/^#/, ''), 16);
        const titleStr = currentLang === 'ru' ? `Бросок — ${totalVal}` : `Roll — ${totalVal}`;
        const embed = {
          author: { name: char.name },
          title: titleStr,
          description: breakdownParts.join(' + '),
          footer: { text: formulaParts.join(' + ') },
          color: isNaN(colorInt) ? 0x5865F2 : colorInt,
        };
        if (char.pfpUrl && char.pfpUrl.startsWith('http')) embed.thumbnail = { url: char.pfpUrl };

        const resp = await fetch(webhookUrl, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ embeds: [embed] })
        });
        if (!resp.ok && resp.status !== 204) throw new Error('Error sending to Discord');
      } else {
        for (const seg of currentAttackSegments) {
          let segSum = seg.staticMod;
          let allDiceVals = [];
          
          let f = '';
          seg.diceList.forEach(g => {
            allDiceVals.push(...g.results);
            segSum += g.results.reduce((a, b) => a + b, 0);
            const dNot = currentLang === 'ru' ? 'к' : 'd';
            f += (f ? ' + ' : '') + `(${g.count}${dNot}${g.sides})`;
          });
          
          let breakdownStr = allDiceVals.length > 0 ? `(${allDiceVals.join(' + ')})` : '';
          if (seg.staticMod > 0) breakdownStr = breakdownStr ? `${breakdownStr} + ${seg.staticMod}` : `${seg.staticMod}`;
          else if (seg.staticMod < 0) breakdownStr = breakdownStr ? `${breakdownStr} - ${Math.abs(seg.staticMod)}` : `-${Math.abs(seg.staticMod)}`;
          
          if (seg.staticMod > 0) f = f ? `${f} + ${seg.staticMod}` : `${seg.staticMod}`;
          else if (seg.staticMod < 0) f = f ? `${f} - ${Math.abs(seg.staticMod)}` : `-${Math.abs(seg.staticMod)}`;

          const titlePrefix = currentLang === 'ru' ? `Бросок` : `Roll`;

          const colorInt = parseInt(webhookColor.replace(/^#/, ''), 16);
          const embed = {
            author: { name: char.name },
            title: `${titlePrefix} — ${segSum}`,
            description: breakdownStr,
            footer: { text: f },
            color: isNaN(colorInt) ? 0x5865F2 : colorInt,
          };
          if (char.pfpUrl && char.pfpUrl.startsWith('http')) embed.thumbnail = { url: char.pfpUrl };

          const resp = await fetch(webhookUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
          });
          if (!resp.ok && resp.status !== 204) throw new Error('Error sending to Discord');
          await new Promise(r => setTimeout(r, 400)); 
        }
      }
      
      $('#attack-status').textContent = '✓ Sent to Discord!';
      $('#attack-status').className = 'dice-status success';
      setTimeout(closeAttackModal, 1500);
    } catch (err) {
      $('#attack-status').textContent = `✕ ${err.message}`;
      $('#attack-status').className = 'dice-status error';
      $('#btn-send-attack-sep').disabled = false;
      $('#btn-send-attack-comb').disabled = false;
    }
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
    });

    // Skill & Save proficiencies (delegated)
    document.addEventListener('change', (e) => {
      if (e.target.matches('[data-skill]')) {
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
      } else if (e.target.matches('[data-save-prof]')) {
        const char = getActiveChar();
        if (!char) return;
        if (!char.savingThrowProficiencies) char.savingThrowProficiencies = [];
        const ab = e.target.dataset.saveProf;
        if (e.target.checked) {
          if (!char.savingThrowProficiencies.includes(ab)) char.savingThrowProficiencies.push(ab);
        } else {
          char.savingThrowProficiencies = char.savingThrowProficiencies.filter(a => a !== ab);
        }
        saveData();
        buildAbilityGrid(char);
        buildSkillsList(char);
      }
    });

    // Custom skill bonus
    $('#skills-list').addEventListener('input', (e) => {
      if (e.target.matches('.skill-bonus-input')) {
        const char = getActiveChar();
        if (!char) return;
        if (!char.skillBonuses) char.skillBonuses = {};
        const sk = e.target.dataset.skillBonus;
        const val = parseInt(e.target.value) || 0;
        char.skillBonuses[sk] = val;
        
        const prof = char.skillProficiencies.includes(sk);
        const mod = (prof ? char.profBonus : 0) + val;
        
        const btn = e.target.nextElementSibling;
        if (btn && btn.classList.contains('skill-roll-btn')) {
          btn.dataset.skillMod = mod;
          btn.textContent = modStr(mod);
          btn.title = `Roll d20 ${modStr(mod)}`;
        }
        
        saveData();
      }
    });

    // Attacks & Formulas
    $('#btn-add-attack').addEventListener('click', () => {
      const char = getActiveChar();
      if (!char) return;
      if (!char.attacks) char.attacks = [];
      char.attacks.push({ name: '', formula: '' });
      saveData();
      buildAttacksList(char);
    });

    $('#attacks-list').addEventListener('input', (e) => {
      if (e.target.matches('.attack-name-input') || e.target.matches('.attack-formula-input')) {
        const char = getActiveChar();
        const id = parseInt(e.target.dataset.attackId);
        if (char && char.attacks && char.attacks[id]) {
          if (e.target.matches('.attack-name-input')) char.attacks[id].name = e.target.value;
          else char.attacks[id].formula = e.target.value;
          saveData();
        }
      }
    });

    $('#attacks-list').addEventListener('click', (e) => {
      if (e.target.closest('.btn-attack-roll')) {
        const id = parseInt(e.target.closest('.btn-attack-roll').dataset.attackRoll);
        const char = getActiveChar();
        if (char && char.attacks && char.attacks[id]) {
          openAttackModal(char.attacks[id].name, char.attacks[id].formula);
        }
      } else if (e.target.matches('.btn-delete-attack')) {
        const char = getActiveChar();
        const id = parseInt(e.target.dataset.attackId);
        if (char && char.attacks) {
          char.attacks.splice(id, 1);
          saveData();
          buildAttacksList(char);
        }
      }
    });

    // Attack Modal listeners
    $('#attack-close').addEventListener('click', closeAttackModal);
    $('#btn-send-attack-sep').addEventListener('click', () => sendAttackToWebhook(false));
    $('#btn-send-attack-comb').addEventListener('click', () => sendAttackToWebhook(true));

    // Roll buttons (delegated)
    document.addEventListener('click', (e) => {
      const skillBtn = e.target.closest('[data-skill-roll]');
      if (skillBtn) {
        e.preventDefault();
        const skillName = skillBtn.dataset.skillRoll;
        const skillMod = parseInt(skillBtn.dataset.skillMod);
        rollSkillCheck(skillName, skillMod);
        return;
      }
      
      const abBtn = e.target.closest('[data-ability-roll]');
      if (abBtn) {
        e.preventDefault();
        const ab = abBtn.dataset.abilityRoll;
        const type = abBtn.dataset.rollType;
        const char = getActiveChar();
        if (!char) return;
        const score = char.abilities[ab];
        const mod = abilityMod(score);
        rollAbility(ab, type, mod, char);
      }
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
    MULTI_DICE_TYPES.forEach(d => multiDiceCounts[d] = 0);
    diceResults = [];
    buildMultiDiceConfig();
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

  function buildMultiDiceConfig() {
    const container = $('#multi-dice-container');
    if (!container) return;
    container.innerHTML = '';
    MULTI_DICE_TYPES.forEach(d => {
      const row = document.createElement('div');
      row.className = 'dice-row';
      row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:var(--bg-input); padding:8px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); margin:0;';
      row.innerHTML = `
        <span class="dice-label" style="margin:0; font-size:14px;">d${d}</span>
        <div class="dice-count-row" style="gap:8px;">
          <button class="dice-count-btn" style="width:30px; height:30px; font-size:1rem;" data-multi-minus="${d}">−</button>
          <span class="dice-count-val" style="min-width:20px; font-size:1.1rem;" id="multi-count-${d}">${multiDiceCounts[d]}</span>
          <button class="dice-count-btn" style="width:30px; height:30px; font-size:1rem;" data-multi-plus="${d}">+</button>
        </div>
      `;
      container.appendChild(row);
    });
  }

  function updateDiceFormula() {
    let parts = [];
    MULTI_DICE_TYPES.forEach(d => {
      if (multiDiceCounts[d] > 0) parts.push(`${multiDiceCounts[d]}d${d}`);
    });
    $('#dice-formula').textContent = parts.length > 0 ? parts.join(' + ') : '0';
  }

  function buildDiceResultsArea() {
    const area = $('#dice-results-area');
    area.innerHTML = '';
    diceResults = [];
    
    MULTI_DICE_TYPES.forEach(d => {
      for (let i = 0; i < multiDiceCounts[d]; i++) {
        diceResults.push({ type: d, value: null });
      }
    });

    const t = TRANSLATIONS[currentLang];
    diceResults.forEach((die, index) => {
      const group = document.createElement('div');
      group.className = 'dice-die-group';

      const label = document.createElement('div');
      label.className = 'dice-die-label';
      label.textContent = `${t.dieNum}${index + 1} (d${die.type})`;
      group.appendChild(label);

      const grid = document.createElement('div');
      grid.className = 'dice-number-grid';

      for (let n = 1; n <= die.type; n++) {
        const btn = document.createElement('button');
        btn.className = 'dice-num-btn';
        btn.textContent = n;
        btn.dataset.dieIndex = index;
        btn.dataset.value = n;
        btn.addEventListener('click', () => selectDiceResult(index, n));
        grid.appendChild(btn);
      }

      group.appendChild(grid);
      area.appendChild(group);
    });
  }

  function selectDiceResult(dieIndex, value) {
    diceResults[dieIndex].value = value;
    const btns = $$(`[data-die-index="${dieIndex}"]`);
    btns.forEach(btn => {
      btn.classList.toggle('selected', parseInt(btn.dataset.value) === value);
    });
    const allSelected = diceResults.length > 0 && diceResults.every(d => d.value !== null);
    if (allSelected) {
      const total = diceResults.reduce((sum, d) => sum + d.value, 0);
      $('#dice-total-value').textContent = total;
      $('#dice-total-row').style.display = 'flex';
      $('#btn-send-dice').disabled = false;
    } else {
      $('#dice-total-row').style.display = 'none';
      $('#btn-send-dice').disabled = true;
    }
  }

  function setupDiceListeners() {
    const mc = $('#multi-dice-container');
    if (mc) {
      mc.addEventListener('click', (e) => {
        const minusBtn = e.target.closest('[data-multi-minus]');
        if (minusBtn) {
          const d = parseInt(minusBtn.dataset.multiMinus);
          if (multiDiceCounts[d] > 0) {
            multiDiceCounts[d]--;
            $(`#multi-count-${d}`).textContent = multiDiceCounts[d];
            updateDiceFormula();
            buildDiceResultsArea();
            $('#dice-total-row').style.display = 'none';
            $('#btn-send-dice').disabled = true;
          }
        }
        
        const plusBtn = e.target.closest('[data-multi-plus]');
        if (plusBtn) {
          const d = parseInt(plusBtn.dataset.multiPlus);
          if (multiDiceCounts[d] < 40) { // arbitrary cap
            multiDiceCounts[d]++;
            $(`#multi-count-${d}`).textContent = multiDiceCounts[d];
            updateDiceFormula();
            buildDiceResultsArea();
            $('#dice-total-row').style.display = 'none';
            $('#btn-send-dice').disabled = true;
          }
        }
      });
    }

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

    if (diceResults.length === 0 || !diceResults.every(d => d.value !== null)) return;

    const total = diceResults.reduce((sum, d) => sum + d.value, 0);
    const dNotation = currentLang === 'ru' ? 'к' : 'd';
    
    let breakdownParts = [];
    let formulaParts = [];
    MULTI_DICE_TYPES.forEach(d => {
      if (multiDiceCounts[d] > 0) {
        formulaParts.push(`(${multiDiceCounts[d]}${dNotation}${d})`);
        const vals = diceResults.filter(res => res.type === d).map(res => res.value);
        breakdownParts.push(`(${vals.join(' + ')})`);
      }
    });

    const breakdownStr = breakdownParts.join(' + ');
    const formulaStr = formulaParts.join(' + ');
    const t = TRANSLATIONS[currentLang];
    
    let titleStr = currentLang === 'ru' ? `Бросок — ${total}` : `Roll — ${total}`;
    
    const has20 = diceResults.some(d => d.type === 20 && d.value === 20);
    const has1 = diceResults.some(d => d.type === 20 && d.value === 1);
    
    if (has20) {
      titleStr = `🔥 ${titleStr} 🔥`;
    } else if (has1) {
      titleStr = `🩸 ${titleStr} 🩸`;
    }

    const colorInt = parseInt(webhookColor.replace(/^#/, ''), 16);
    const embed = {
      author: { name: char.name },
      title: titleStr,
      description: breakdownStr,
      footer: { text: formulaStr },
      color: isNaN(colorInt) ? 0x5865F2 : colorInt,
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
    $('#webhook-color-text').value = webhookColor;
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

    const syncTextToColor = () => {
      $('#webhook-color-text').value = $('#webhook-color').value.toUpperCase();
    };
    $('#webhook-color').addEventListener('input', syncTextToColor);
    $('#webhook-color').addEventListener('change', syncTextToColor);

    $('#webhook-color-text').addEventListener('input', (e) => {
      let val = e.target.value.trim();
      if (val.length === 6 && !val.startsWith('#')) {
        val = '#' + val;
      }
      if (/^#[0-9a-f]{6}$/i.test(val)) {
        $('#webhook-color').value = val;
      }
    });

    $('#webhook-color-text').addEventListener('blur', (e) => {
      let val = e.target.value.trim();
      if (val.length === 6 && !val.startsWith('#')) val = '#' + val;
      if (/^#[0-9a-f]{6}$/i.test(val)) {
        e.target.value = val.toUpperCase();
        $('#webhook-color').value = val;
      } else {
        e.target.value = $('#webhook-color').value.toUpperCase();
      }
    });

    $('#btn-webhook-save').addEventListener('click', () => {
      webhookUrl = $('#webhook-url').value.trim();
      let colorText = $('#webhook-color-text').value.trim();
      if (colorText.length === 6 && !colorText.startsWith('#')) colorText = '#' + colorText;
      if (/^#[0-9a-f]{6}$/i.test(colorText)) {
        webhookColor = colorText.toUpperCase();
      } else {
        webhookColor = $('#webhook-color').value.toUpperCase();
      }
      saveData();
      $('#webhook-status').textContent = '✓ Saved!';
      $('#webhook-status').className = 'webhook-status success';
      setTimeout(closeWebhookModal, 800);
    });

    $('#btn-webhook-test').addEventListener('click', async () => {
      const url = $('#webhook-url').value.trim();
      let colorText = $('#webhook-color-text').value.trim();
      if (colorText.length === 6 && !colorText.startsWith('#')) colorText = '#' + colorText;
      let finalColor = /^#[0-9a-f]{6}$/i.test(colorText) ? colorText : $('#webhook-color').value;
      const colorInt = parseInt(finalColor.replace(/^#/, ''), 16);
      const colorHex = isNaN(colorInt) ? 0x5865F2 : colorInt;

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
