// ================================================================
// STATE
// ================================================================
const state = {
  // buyback tab
  detail: null,
  type: 'buy',
  color: 'dark',
  warranty: 'no',
  bodyCondition: '99',
  pinStatus: '85',
  selectedDefects: [],
  detailCache: {},
  chatPanelOpen: false,
  _searchTimer: null,
  _searchRequestId: 0,
  activeTab: 'buyback',
  searchIndex: [],
  searchIndexReady: false,
  typeCollapseOpen: false,
  defectCollapseOpen: false,

  // repair tab
  repairDevice: null,
  repairDefects: [],
  repairSelected: null,
  repairQuery: '',
  repairDefectQuery: '',
  _repairSearchTimer: null,
  _repairSearchRequestId: 0,
  repairResultsCollapseOpen: false,

  // requests tab
  requests: [],
  requestFilter: { status: 'pending', period: 'today' },
  _requestsTimer: null,
  _requestsRequestId: 0,
  priceModalOpen: false,
  editingRequest: null,
};

const els = {};
const API_BASE = window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL;

// ================================================================
// INIT
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  bindEvents();
  updateCollapseVisibility();
  render();
  loadSearchIndex();
});

function cacheElements() {
  // buyback
  els.searchInput = document.getElementById('searchInput');
  els.clearSearchBtn = document.getElementById('clearSearchBtn');
  els.searchState = document.getElementById('searchState');
  els.suggestions = document.getElementById('suggestions');
  els.detailCard = document.getElementById('detailCard');
  els.emptyState = document.getElementById('emptyState');
  els.loadingOverlay = document.getElementById('loadingOverlay');
  els.deviceTitle = document.getElementById('deviceTitle');
  els.deviceMeta = document.getElementById('deviceMeta');
  els.basePriceText = document.getElementById('basePriceText');
  els.typeGroup = document.getElementById('typeGroup');
  els.typeCollapse = document.getElementById('typeCollapse');
  els.typeToggleBtn = document.getElementById('typeToggleBtn');
  els.typeArrow = document.getElementById('typeArrow');
  els.colorGroup = document.getElementById('colorGroup');
  els.warrantyGroup = document.getElementById('warrantyGroup');
  els.bodyGroup = document.getElementById('bodyGroup');
  els.pinGroup = document.getElementById('pinGroup');
  els.defectList = document.getElementById('defectList');
  els.defectCollapse = document.getElementById('defectCollapse');
  els.defectToggleBtn = document.getElementById('defectToggleBtn');
  els.defectArrow = document.getElementById('defectArrow');
  els.defectHint = document.getElementById('defectHint');
  els.finalPriceText = document.getElementById('finalPriceText');
  els.priceBreakdown = document.getElementById('priceBreakdown');
  els.chatBubbleBtn = document.getElementById('chatBubbleBtn');
  els.chatBubbleText = document.getElementById('chatBubbleText');
  els.chatPanel = document.getElementById('chatPanel');
  els.closeChatPanelBtn = document.getElementById('closeChatPanelBtn');
  els.chatBuybackTab = document.getElementById('chatBuybackTab');
  els.chatRepairTab = document.getElementById('chatRepairTab');
  els.chatFormBuyback = document.getElementById('chatFormBuyback');
  els.chatFormRepair = document.getElementById('chatFormRepair');
  els.chatDeviceName = document.getElementById('chatDeviceName');
  els.chatStorage = document.getElementById('chatStorage');
  els.chatBodyCondition = document.getElementById('chatBodyCondition');
  els.chatPinStatus = document.getElementById('chatPinStatus');
  els.chatBuybackSummary = document.getElementById('chatBuybackSummary');
  els.marketInput = document.getElementById('marketInput');
  els.accessoriesInput = document.getElementById('accessoriesInput');
  els.conditionInput = document.getElementById('conditionInput');
  els.chatRepairDeviceName = document.getElementById('chatRepairDeviceName');
  els.chatRepairStorage = document.getElementById('chatRepairStorage');
  els.chatRepairDefects = document.getElementById('chatRepairDefects');
  els.chatRepairNote = document.getElementById('chatRepairNote');
  els.chatMessage = document.getElementById('chatMessage');
  els.chatRepairMessage = document.getElementById('chatRepairMessage');

  // tabs
  els.buybackTabBtn = document.getElementById('buybackTabBtn');
  els.repairTabBtn = document.getElementById('repairTabBtn');
  els.buybackPage = document.getElementById('buybackPage');
  els.repairPage = document.getElementById('repairPage');

  // repair
  els.repairDeviceInput = document.getElementById('repairDeviceInput');
  els.clearRepairBtn = document.getElementById('clearRepairBtn');
  els.repairSearchState = document.getElementById('repairSearchState');
  els.repairSuggestions = document.getElementById('repairSuggestions');
  els.repairDeviceCard = document.getElementById('repairDeviceCard');
  els.repairEmptyState = document.getElementById('repairEmptyState');
  els.repairDeviceTitle = document.getElementById('repairDeviceTitle');
  els.repairDeviceMeta = document.getElementById('repairDeviceMeta');
  els.repairCountText = document.getElementById('repairCountText');
  els.repairItemInput = document.getElementById('repairItemInput');
  els.repairItemState = document.getElementById('repairItemState');
  els.repairResultsCollapse = document.getElementById('repairResultsCollapse');
  els.repairResultsToggleBtn = document.getElementById('repairResultsToggleBtn');
  els.repairResultsArrow = document.getElementById('repairResultsArrow');
  els.repairResults = document.getElementById('repairResults');
  els.repairSelectedCard = document.getElementById('repairSelectedCard');
  els.repairItemClearBtn = document.getElementById('repairItemClearBtn');
  els.repairItemTitle = document.getElementById('repairItemTitle');
  els.repairItemMeta = document.getElementById('repairItemMeta');
  els.repairPriceText = document.getElementById('repairPriceText');

  // requests
  els.requestsTabBtn = document.getElementById('requestsTabBtn');
  els.requestsPage = document.getElementById('requestsPage');
  els.requestsList = document.getElementById('requestsList');
  els.requestsEmptyState = document.getElementById('requestsEmptyState');
  els.requestStatusFilters = document.getElementById('requestStatusFilters');
  els.requestPeriodFilter = document.getElementById('requestPeriodFilter');
  els.requestFilterState = document.getElementById('requestFilterState');
  els.priceModal = document.getElementById('priceModal');
  els.priceModalBackdrop = document.getElementById('priceModalBackdrop');
  els.priceModalTitle = document.getElementById('priceModalTitle');
  els.priceModalInfo = document.getElementById('priceModalInfo');
  els.priceForm = document.getElementById('priceForm');
  els.priceInput = document.getElementById('priceInput');
  els.priceFormMessage = document.getElementById('priceFormMessage');
  els.closePriceModalBtn = document.getElementById('closePriceModalBtn');
  els.cancelPriceModalBtn = document.getElementById('cancelPriceModalBtn');
}

// ================================================================
// EVENTS
// ================================================================
function bindEvents() {
  // tabs
  els.buybackTabBtn.addEventListener('click', () => switchTab('buyback'));
  els.repairTabBtn.addEventListener('click', () => switchTab('repair'));
  els.requestsTabBtn.addEventListener('click', () => switchTab('requests'));

  // buyback search
  els.searchInput.addEventListener('input', () => handleSearchInput('buyback'));
  els.clearSearchBtn.addEventListener('click', clearBuybackSearch);

  if (els.typeToggleBtn) els.typeToggleBtn.addEventListener('click', () => toggleCollapse('type'));
  if (els.defectToggleBtn) els.defectToggleBtn.addEventListener('click', () => toggleCollapse('defect'));
  if (els.repairResultsToggleBtn) els.repairResultsToggleBtn.addEventListener('click', () => toggleCollapse('repairResults'));

  // repair device search
  els.repairDeviceInput.addEventListener('input', () => handleSearchInput('repair'));
  els.clearRepairBtn.addEventListener('click', clearRepairDevice);

  // repair defect search
  els.repairItemInput.addEventListener('input', handleRepairDefectInput);
  if (els.repairItemClearBtn) els.repairItemClearBtn.addEventListener('click', clearRepairItem);

  // requests filters
  if (els.requestStatusFilters) {
    els.requestStatusFilters.addEventListener('click', (event) => {
      const chip = event.target.closest('.chip');
      if (!chip) return;
      [...els.requestStatusFilters.querySelectorAll('.chip')].forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.requestFilter = state.requestFilter || {};
      state.requestFilter.status = chip.dataset.status || 'all';
      loadRequests();
    });
  }
  if (els.requestPeriodFilter) {
    els.requestPeriodFilter.addEventListener('change', () => {
      state.requestFilter = state.requestFilter || {};
      state.requestFilter.period = els.requestPeriodFilter.value || 'all';
      loadRequests();
    });
  }
  els.closePriceModalBtn.addEventListener('click', closePriceModal);
  els.cancelPriceModalBtn.addEventListener('click', closePriceModal);
  els.priceModalBackdrop.addEventListener('click', closePriceModal);
  els.priceForm.addEventListener('submit', submitPrice);

  // global clicks
  document.addEventListener('click', (event) => {
    if (!els.suggestions.contains(event.target) && event.target !== els.searchInput) hideSuggestions();
    if (!els.repairSuggestions.contains(event.target) && event.target !== els.repairDeviceInput) hideRepairSuggestions();
    if (state.chatPanelOpen && !els.chatPanel.contains(event.target)) {
      closeChatPanel();
    }
  });

  // buyback chips
  bindChipGroup(els.typeGroup, 'type');
  bindChipGroup(els.colorGroup, 'color');
  bindChipGroup(els.warrantyGroup, 'warranty');
  bindChipGroup(els.bodyGroup, 'bodyCondition');
  bindChipGroup(els.pinGroup, 'pinStatus');

  // chat
  els.chatBubbleBtn.addEventListener('click', (event) => { event.stopPropagation(); openChatPanel(); });
  els.chatPanel.addEventListener('click', (event) => event.stopPropagation());
  els.closeChatPanelBtn.addEventListener('click', closeChatPanel);
  els.chatBuybackTab.addEventListener('click', () => switchChatTab('buyback'));
  els.chatRepairTab.addEventListener('click', () => switchChatTab('repair'));
  els.chatFormBuyback.addEventListener('submit', submitBuybackRequest);
  els.chatFormRepair.addEventListener('submit', submitRepairRequest);
}

function bindChipGroup(container, key) {
  container.addEventListener('click', (event) => {
    const btn = event.target.closest('.chip');
    if (!btn) return;
    state[key] = btn.dataset.value;
    [...container.querySelectorAll('.chip')].forEach(chip => chip.classList.remove('active'));
    btn.classList.add('active');
    syncChatSummary();
    updatePrice();
  });
}

// ================================================================
// TAB SWITCHER
// ================================================================
function switchTab(tab) {
  state.activeTab = tab;
  if (tab === 'buyback') {
    els.buybackTabBtn.classList.add('active');
    els.repairTabBtn.classList.remove('active');
    els.requestsTabBtn.classList.remove('active');
    els.buybackPage.classList.remove('hidden');
    els.repairPage.classList.add('hidden');
    els.requestsPage.classList.add('hidden');
  } else if (tab === 'repair') {
    els.repairTabBtn.classList.add('active');
    els.buybackTabBtn.classList.remove('active');
    els.requestsTabBtn.classList.remove('active');
    els.repairPage.classList.remove('hidden');
    els.buybackPage.classList.add('hidden');
    els.requestsPage.classList.add('hidden');
    hideSuggestions();
  } else {
    els.requestsTabBtn.classList.add('active');
    els.buybackTabBtn.classList.remove('active');
    els.repairTabBtn.classList.remove('active');
    els.requestsPage.classList.remove('hidden');
    els.buybackPage.classList.add('hidden');
    els.repairPage.classList.add('hidden');
    hideSuggestions();
    hideRepairSuggestions();
    state.requestFilter = state.requestFilter || {};
    state.requestFilter.status = (els.requestStatusFilters.querySelector('.chip.active') || {}).dataset.status || 'all';
    state.requestFilter.period = els.requestPeriodFilter.value || 'all';
    loadRequests();
  }
}

// ================================================================
// BUYBACK SEARCH
// ================================================================
async function doSearch(query, tab) {
  if (!API_BASE || API_BASE.includes('PASTE_YOUR')) {
    if (tab === 'buyback') {
      els.searchState.textContent = 'Chưa cấu hình API_BASE_URL.';
    } else {
      els.repairSearchState.textContent = 'Chưa cấu hình API_BASE_URL.';
    }
    return;
  }

  if (tab === 'repair' && state.searchIndexReady && state.searchIndex.length > 0) {
    const arr = filterLocalIndex(query);
    if (arr.length) {
      renderRepairSuggestions(arr);
      els.repairSearchState.textContent = `Tìm thấy ${arr.length} gợi ý.`;
    } else {
      hideRepairSuggestions();
      els.repairSearchState.textContent = 'Không tìm thấy model phù hợp.';
    }
    return;
  }

  try {
    const requestId = tab === 'buyback'
      ? ++state._searchRequestId
      : ++state._repairSearchRequestId;
    const url = `${API_BASE}?action=search&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const currentRequestId = tab === 'buyback' ? state._searchRequestId : state._repairSearchRequestId;
    if (requestId !== currentRequestId) return;
    const data = await res.json();
    const latestRequestId = tab === 'buyback' ? state._searchRequestId : state._repairSearchRequestId;
    if (requestId !== latestRequestId) return;
    const arr = Array.isArray(data) ? data : [];
    console.log(`[search:${tab}]`, query, 'results=', arr.length);

    if (tab === 'buyback') {
      if (arr.length) {
        renderSuggestions(arr);
        els.searchState.textContent = `Tìm thấy ${arr.length} gợi ý.`;
      } else {
        hideSuggestions();
        els.searchState.textContent = 'Không tìm thấy model phù hợp.';
      }
    } else {
      if (arr.length) {
        renderRepairSuggestions(arr);
        els.repairSearchState.textContent = `Tìm thấy ${arr.length} gợi ý.`;
      } else {
        hideRepairSuggestions();
        els.repairSearchState.textContent = 'Không tìm thấy model phù hợp.';
      }
    }
  } catch (err) {
    const currentRequestId = tab === 'buyback' ? state._searchRequestId : state._repairSearchRequestId;
    if (currentRequestId === 0) return;
    console.error('[search]', err);
    const msg = 'Không tìm được dữ liệu: ' + err.message;
    if (tab === 'buyback') {
      els.searchState.textContent = msg;
    } else {
      els.repairSearchState.textContent = msg;
    }
  }
}

function handleSearchInput(tab) {
  const input = tab === 'buyback' ? els.searchInput : els.repairDeviceInput;
  const query = sanitizeText(input.value).trim();
  const timerKey = tab === 'buyback' ? '_searchTimer' : '_repairSearchTimer';

  if (!query) {
    if (tab === 'buyback') {
      state._searchRequestId++;
      els.searchState.textContent = 'Nhập tên máy để bắt đầu tra cứu.';
      hideSuggestions();
    } else {
      state._repairSearchRequestId++;
      els.repairSearchState.textContent = 'Nhập tên máy để bắt đầu tra cứu sửa chữa.';
      hideRepairSuggestions();
    }
    if (state[timerKey]) { clearTimeout(state[timerKey]); state[timerKey] = null; }
    return;
  }

  if (tab === 'repair' && state.searchIndexReady && state.searchIndex.length > 0) {
    if (state[timerKey]) clearTimeout(state[timerKey]);
    const arr = filterLocalIndex(query);
    if (arr.length) {
      renderRepairSuggestions(arr);
      els.repairSearchState.textContent = `Tìm thấy ${arr.length} gợi ý.`;
    } else {
      hideRepairSuggestions();
      els.repairSearchState.textContent = 'Không tìm thấy model phù hợp.';
    }
    return;
  }

  if (state[timerKey]) clearTimeout(state[timerKey]);
  if (tab === 'buyback' && state.searchIndexReady && state.searchIndex.length > 0) {
    const arr = filterLocalIndex(query);
    if (arr.length) {
      renderSuggestions(arr);
      els.searchState.textContent = `Tìm thấy ${arr.length} gợi ý.`;
    } else {
      hideSuggestions();
      els.searchState.textContent = 'Không tìm thấy model phù hợp.';
    }
    return;
  }
  state[timerKey] = setTimeout(() => doSearch(query, tab), 80);
}

function renderSuggestions(items) {
  if (!items.length) { hideSuggestions(); els.searchState.textContent = 'Không tìm thấy model phù hợp.'; return; }
  els.searchState.textContent = `Tìm thấy ${items.length} gợi ý.`;
  els.suggestions.innerHTML = items.map((item, index) => `
    <div class="suggestion-item" data-index="${index}" data-tab="buyback">
      <div class="suggestion-title">${escapeHtml(item.name)}</div>
      <div class="suggestion-meta">${escapeHtml(item.storage || '')} · ${formatVnd(item.priceBuy || 0)} · ${escapeHtml(item.brand)}</div>
    </div>
  `).join('');
  [...els.suggestions.querySelectorAll('.suggestion-item')].forEach((node) => {
    node.addEventListener('click', () => {
      const item = items[Number(node.dataset.index)];
      if (node.dataset.tab === 'repair') {
        repairSelectDevice(item);
      } else {
        selectBuybackDevice(item);
      }
    });
  });
  els.suggestions.classList.remove('hidden');
}

function hideSuggestions() {
  els.suggestions.classList.add('hidden');
  els.suggestions.innerHTML = '';
}

function loadSearchIndex() {
  if (!API_BASE || API_BASE.includes('PASTE_YOUR')) return;
  const url = `${API_BASE}?action=index`;
  fetch(url).then(res => res.json()).then(data => {
    if (Array.isArray(data) && data.length > 0) {
      state.searchIndex = data;
      state.searchIndexReady = true;
    }
  }).catch(() => {});
}

function filterLocalIndex(query) {
  const norm = normalizeKeyword(query);
  if (!norm) return [];
  const starts = [];
  const contains = [];
  const idx = state.searchIndex;
  for (let i = 0; i < idx.length; i++) {
    const item = idx[i];
    const n = item.nameNormalized || normalizeKeyword(item.name || '');
    if (!n) continue;
    if (n.indexOf(norm) === 0) starts.push(item);
    else if (n.indexOf(norm) > -1) contains.push(item);
    if (starts.length + contains.length >= 20) break;
  }
  return starts.concat(contains).slice(0, 20).map(item => ({
    brand: item.brand,
    name: item.name,
    storage: item.storage,
    priceBuy: item.priceBuy,
    supportPrice: item.supportPrice,
    warrantyPrice: item.warrantyPrice,
    priceSale: item.priceSale,
    priceSale95: item.priceSale95,
  }));
}

function renderRepairSuggestions(items) {
  if (!items.length) { hideRepairSuggestions(); els.repairSearchState.textContent = 'Không tìm thấy model phù hợp.'; return; }
  els.repairSearchState.textContent = `Tìm thấy ${items.length} gợi ý.`;
  els.repairSuggestions.innerHTML = items.map((item, index) => `
    <div class="suggestion-item" data-index="${index}" data-tab="repair">
      <div class="suggestion-title">${escapeHtml(item.name)}</div>
      <div class="suggestion-meta">${escapeHtml(item.storage || '')} · ${formatVnd(item.priceBuy || 0)} · ${escapeHtml(item.brand)}</div>
    </div>
  `).join('');
  [...els.repairSuggestions.querySelectorAll('.suggestion-item')].forEach((node) => {
    node.addEventListener('click', () => {
      const item = items[Number(node.dataset.index)];
      repairSelectDevice(item);
    });
  });
  els.repairSuggestions.classList.remove('hidden');
}

function hideRepairSuggestions() {
  els.repairSuggestions.classList.add('hidden');
  els.repairSuggestions.innerHTML = '';
}

// ================================================================
// BUYBACK DETAIL
// ================================================================
function getDetailCacheKey(item) {
  return `${item.brand}__${item.name}__${item.storage || ''}`;
}

async function selectBuybackDevice(item) {
  els.searchInput.value = item.name;
  hideSuggestions();

  const cacheKey = getDetailCacheKey(item);
  const cachedDetail = state.detailCache[cacheKey];

  state.detail = {
    deviceName: item.name,
    brandName: item.brand,
    storage: item.storage || '',
    priceBuy: Number(item.priceBuy || 0),
    supportPrice: Number(item.supportPrice || 0),
    warrantyPrice: Number(item.warrantyPrice || 0),
    priceSale: Number(item.priceSale || 0),
    priceSale95: Number(item.priceSale95 || 0),
    pinPrice: Number(item.pinPrice || 0),
    defects: cachedDetail ? (cachedDetail.defects || []) : [],
  };
  state.type = 'buy';
  state.color = 'dark';
  state.warranty = 'no';
  state.bodyCondition = '99';
  state.pinStatus = '85';
  state.selectedDefects = [];
  syncChipGroups();
  state.defectCollapseOpen = false;
  updateCollapseVisibility();
  render();

  if (cachedDetail) return;

  try {
    const url = `${API_BASE}?action=detail&brand=${encodeURIComponent(item.brand)}&name=${encodeURIComponent(item.name)}&storage=${encodeURIComponent(item.storage || '')}`;
    const res = await fetch(url);
    const detail = await res.json();
    const fullDetail = {
      deviceName: item.name,
      brandName: item.brand,
      storage: detail.storage || item.storage || '',
      priceBuy: Number(detail.priceBuy || item.priceBuy || 0),
      supportPrice: Number(detail.supportPrice || item.supportPrice || 0),
      warrantyPrice: Number(detail.warrantyPrice || item.warrantyPrice || 0),
      priceSale: Number(detail.priceSale || item.priceSale || 0),
      priceSale95: Number(detail.priceSale95 || item.priceSale95 || 0),
      pinPrice: Number(detail.pinPrice || 0),
      defects: detail.defectList || [],
    };
    state.detailCache[cacheKey] = fullDetail;
    state.detail = fullDetail;
    render();
  } catch (err) {}
}

function clearBuybackSearch() {
  els.searchInput.value = '';
  state.detail = null;
  state.selectedDefects = [];
  hideSuggestions();
  els.searchState.textContent = 'Nhập tên máy để bắt đầu tra cứu.';
  render();
}

function render() {
  if (state.activeTab !== 'buyback') return;
  if (!state.detail) {
    els.detailCard.classList.add('hidden');
    els.emptyState.classList.remove('hidden');
    return;
  }
  els.detailCard.classList.remove('hidden');
  els.emptyState.classList.add('hidden');
  els.deviceTitle.textContent = state.detail.deviceName;
  els.deviceMeta.textContent = `${state.detail.storage || ''} · ${state.detail.brandName}`;
  els.basePriceText.textContent = formatVnd(state.detail.priceBuy || 0);
  renderDefects();
  syncChatSummary();
  updatePrice();
}

function renderDefects() {
  const defects = state.detail.defects || [];
  if (!defects.length) {
    els.defectList.innerHTML = '';
    els.defectHint.textContent = 'Chưa có dữ liệu lỗi cho model này.';
    return;
  }
  els.defectHint.textContent = 'Chọn tối đa 3 lỗi.';
  if (state.selectedDefects.length > 0) {
    state.defectCollapseOpen = true;
    updateCollapseVisibility();
  }
  els.defectList.innerHTML = defects.map((defect, idx) => {
    const active = state.selectedDefects.some(d => d.name === defect.name);
    return `<button type="button" class="defect-pill ${active ? 'active' : ''}" data-index="${idx}"><span>${escapeHtml(defect.name)}</span><strong>- ${formatVnd(defect.price || 0)}</strong></button>`;
  }).join('');
  [...els.defectList.querySelectorAll('.defect-pill')].forEach((node) => node.addEventListener('click', () => toggleDefect(Number(node.dataset.index))));
}

function toggleDefect(index) {
  const defect = state.detail.defects[index];
  const existed = state.selectedDefects.find(d => d.name === defect.name);
  if (existed) {
    state.selectedDefects = state.selectedDefects.filter(d => d.name !== defect.name);
  } else {
    if (state.selectedDefects.length >= 3) {
      els.defectHint.textContent = 'Chỉ được chọn tối đa 3 lỗi.';
      return;
    }
    state.selectedDefects.push(defect);
    els.defectHint.textContent = 'Chọn tối đa 3 lỗi.';
  }
  renderDefects();
  updatePrice();
}

function toggleCollapse(type) {
  if (type === 'type') {
    state.typeCollapseOpen = !state.typeCollapseOpen;
    if (els.typeCollapse) els.typeCollapse.classList.toggle('open', state.typeCollapseOpen);
    if (els.typeArrow) els.typeArrow.textContent = state.typeCollapseOpen ? '▲' : '▼';
    return;
  }
  if (type === 'defect') {
    state.defectCollapseOpen = !state.defectCollapseOpen;
    if (els.defectCollapse) els.defectCollapse.classList.toggle('open', state.defectCollapseOpen);
    if (els.defectArrow) els.defectArrow.textContent = state.defectCollapseOpen ? '▲' : '▼';
    return;
  }
  if (type === 'repairResults') {
    state.repairResultsCollapseOpen = !state.repairResultsCollapseOpen;
    if (els.repairResultsCollapse) els.repairResultsCollapse.classList.toggle('open', state.repairResultsCollapseOpen);
    if (els.repairResultsArrow) els.repairResultsArrow.textContent = state.repairResultsCollapseOpen ? '▲' : '▼';
  }
}

function updateCollapseVisibility() {
  if (els.typeCollapse) els.typeCollapse.classList.toggle('open', state.typeCollapseOpen);
  if (els.typeArrow) els.typeArrow.textContent = state.typeCollapseOpen ? '▲' : '▼';
  if (els.defectCollapse) els.defectCollapse.classList.toggle('open', state.defectCollapseOpen);
  if (els.defectArrow) els.defectArrow.textContent = state.defectCollapseOpen ? '▲' : '▼';
  if (els.repairResultsCollapse) els.repairResultsCollapse.classList.toggle('open', state.repairResultsCollapseOpen);
  if (els.repairResultsArrow) els.repairResultsArrow.textContent = state.repairResultsCollapseOpen ? '▲' : '▼';
}

function updatePrice() {
  if (!state.detail) return;
  const breakdown = [];
  let total = Number(state.detail.priceBuy || 0);

  if (state.bodyCondition === '98') {
    const deduction98 = Number(state.detail.priceSale || 0);
    total -= deduction98;
    breakdown.push(`- Ngoại hình 98%: -${formatVnd(deduction98)}`);
  } else if (state.bodyCondition === '95') {
    const sale95 = Number(state.detail.priceSale95 || 0);
    const deduction95 = Number(state.detail.priceSale || 0) - sale95;
    total -= deduction95;
    breakdown.push(`- Ngoại hình 95%: -${formatVnd(deduction95)}`);
  }

  if (state.type === 'swap') {
    total += Number(state.detail.supportPrice || 0);
    breakdown.push(`+ Trợ giá thu đổi: +${formatVnd(state.detail.supportPrice || 0)}`);
  }
  if (state.color === 'light') {
    total += 400000;
    breakdown.push(`+ Màu sáng: +${formatVnd(400000)}`);
  }
  if (state.warranty === 'yes') {
    total += Number(state.detail.warrantyPrice || 0);
    breakdown.push(`+ BHMR: +${formatVnd(state.detail.warrantyPrice || 0)}`);
  }
  if (state.pinStatus === 'lt85') {
    const pinDeduction = Number(state.detail.pinPrice || 0);
    total -= pinDeduction;
    breakdown.push(`- Pin < 85%: -${formatVnd(pinDeduction)}`);
  }
  if (state.selectedDefects.length) {
    state.selectedDefects.forEach((defect) => {
      total -= Number(defect.price || 0);
      breakdown.push(`- ${defect.name}: -${formatVnd(defect.price || 0)}`);
    });
  }
  total = Math.max(0, Math.round(total / 1000) * 1000);
  els.finalPriceText.textContent = formatVnd(total);
  els.priceBreakdown.textContent = breakdown.join('\n');
}

function syncChipGroups() {
  syncChip(els.typeGroup, state.type);
  syncChip(els.colorGroup, state.color);
  syncChip(els.warrantyGroup, state.warranty);
  syncChip(els.bodyGroup, state.bodyCondition);
  syncChip(els.pinGroup, state.pinStatus);
}

function syncChip(container, value) {
  [...container.querySelectorAll('.chip')].forEach(chip => chip.classList.toggle('active', chip.dataset.value === value));
}

function calcBodyDeduction(salePrice) {
  const tier1 = Math.min(salePrice, 10000000) * 0.02;
  const tier2 = Math.max(0, Math.min(salePrice, 25000000) - 10000000) * 0.03;
  const tier3 = Math.max(0, salePrice - 25000000) * 0.02;
  const total = 200000 + tier1 + tier2 + tier3;
  return Math.round(total / 50000) * 50000;
}

function calcPinDeduction(basePrice) {
  if (basePrice <= 10000000) return 400000;
  if (basePrice <= 15000000) return 600000;
  if (basePrice <= 20000000) return 900000;
  if (basePrice <= 30000000) return 1200000;
  return 1500000;
}

// ================================================================
// REPAIR TAB
// ================================================================
async function repairSelectDevice(item) {
  els.repairDeviceInput.value = item.name;
  hideRepairSuggestions();

  const cacheKey = getDetailCacheKey(item);
  const cachedDetail = state.detailCache[cacheKey];

  state.repairDevice = item;
  state.repairDefects = cachedDetail ? (cachedDetail.defects || []) : [];
  state.repairSelected = null;
  state.repairDefectQuery = '';
  els.repairItemInput.value = '';
  els.repairResults.innerHTML = '';
  els.repairSelectedCard.classList.add('hidden');
  els.repairEmptyState.classList.add('hidden');
  state.repairResultsCollapseOpen = false;
  updateCollapseVisibility();

  els.repairDeviceTitle.textContent = item.name || '-';
  els.repairDeviceMeta.textContent = `${item.storage || ''} · ${item.brand}`;
  els.repairDeviceCard.classList.remove('hidden');

  if (cachedDetail) {
    els.repairCountText.textContent = state.repairDefects.length;
    els.repairItemInput.disabled = !state.repairDefects.length;
    els.repairItemState.textContent = state.repairDefects.length
      ? `Đã tải ${state.repairDefects.length} hạng mục sửa chữa. Gõ tên để tìm nhanh.`
      : 'Model này chưa có dữ liệu sửa chữa.';
    if (state.repairDefects.length) {
      state.repairResultsCollapseOpen = true;
      updateCollapseVisibility();
      renderRepairItems(state.repairDefects);
    }
    return;
  }

  els.repairCountText.textContent = '...';
  els.repairItemInput.disabled = true;
  els.repairItemState.textContent = 'Đang tải hạng mục sửa chữa...';

  try {
    const url = `${API_BASE}?action=detail&brand=${encodeURIComponent(item.brand)}&name=${encodeURIComponent(item.name)}&storage=${encodeURIComponent(item.storage || '')}`;
    const res = await fetch(url);
    const detail = await res.json();
    const defects = (detail.defectList || []).filter(d => d.price > 0);
    state.repairDefects = defects;
    state.detailCache[cacheKey] = {
      deviceName: item.name,
      brandName: item.brand,
      storage: detail.storage || item.storage || '',
      priceBuy: Number(detail.priceBuy || item.priceBuy || 0),
      supportPrice: Number(detail.supportPrice || item.supportPrice || 0),
      warrantyPrice: Number(detail.warrantyPrice || item.warrantyPrice || 0),
      priceSale: Number(detail.priceSale || item.priceSale || 0),
      priceSale95: Number(detail.priceSale95 || item.priceSale95 || 0),
      pinPrice: Number(detail.pinPrice || 0),
      defects,
    };

    els.repairCountText.textContent = defects.length;
    els.repairItemInput.disabled = false;
    els.repairItemState.textContent = defects.length
      ? `Đã tải ${defects.length} hạng mục sửa chữa. Gõ tên để tìm nhanh.`
      : 'Model này chưa có dữ liệu sửa chữa.';

    if (defects.length) {
      renderRepairItems(defects);
    }
  } catch (err) {
    els.repairCountText.textContent = '0';
    els.repairItemState.textContent = 'Không tải được dữ liệu sửa chữa: ' + err.message;
  }
}

function handleRepairDefectInput() {
  const query = sanitizeText(els.repairItemInput.value).trim();
  state.repairDefectQuery = query;

  if (!query) {
    renderRepairItems(state.repairDefects);
    els.repairItemState.textContent = state.repairDefects.length
      ? `Đã tải ${state.repairDefects.length} hạng mục sửa chữa.`
      : 'Model này chưa có dữ liệu sửa chữa.';
    return;
  }

  const normalized = normalizeKeyword(query);
  const filtered = state.repairDefects.filter(d => normalizeKeyword(d.name).indexOf(normalized) > -1);
  renderRepairItems(filtered);
  els.repairItemState.textContent = filtered.length
    ? `Tìm thấy ${filtered.length} hạng mục phù hợp.`
    : 'Không tìm thấy hạng mục sửa chữa phù hợp.';
}

function renderRepairItems(items) {
  if (!items.length) {
    els.repairResults.innerHTML = '';
    return;
  }
  els.repairResults.innerHTML = items.map((defect) => `
    <button type="button" class="repair-item" data-name="${escapeHtml(defect.name)}" data-price="${defect.price}">
      <span class="repair-item-name">${escapeHtml(defect.name)}</span>
      <span class="repair-item-price">${formatVnd(defect.price)}</span>
    </button>
  `).join('');
  [...els.repairResults.querySelectorAll('.repair-item')].forEach((node) => {
    node.addEventListener('click', () => {
      const name = node.dataset.name;
      const price = Number(node.dataset.price);
      repairSelectDefect(name, price);
    });
  });
}

function repairSelectDefect(name, price) {
  state.repairSelected = { name, price };
  els.repairItemTitle.textContent = name;
  els.repairItemMeta.textContent = state.repairDevice ? (state.repairDevice.name + (state.repairDevice.storage ? ' · ' + state.repairDevice.storage : '')) : '';
  els.repairPriceText.textContent = formatVnd(price);
  els.repairDeviceCard.classList.add('hidden');
  els.repairResults.innerHTML = '';
  els.repairSelectedCard.classList.remove('hidden');
  els.repairEmptyState.classList.add('hidden');
}


function clearRepairItem() {
  state.repairSelected = null;
  state.repairDefectQuery = '';
  els.repairItemInput.value = '';
  els.repairSelectedCard.classList.add('hidden');
  els.repairDeviceCard.classList.remove('hidden');
  els.repairEmptyState.classList.add('hidden');
  renderRepairItems(state.repairDefects);
  els.repairItemState.textContent = state.repairDefects.length
    ? `Đã tải ${state.repairDefects.length} hạng mục sửa chữa.`
    : 'Model này chưa có dữ liệu sửa chữa.';
}

function clearRepairDevice() {
  state._repairSearchRequestId++;
  if (state._repairSearchTimer) {
    clearTimeout(state._repairSearchTimer);
    state._repairSearchTimer = null;
  }
  els.repairDeviceInput.value = '';
  state.repairDevice = null;
  state.repairDefects = [];
  state.repairSelected = null;
  state.repairDefectQuery = '';
  els.repairItemInput.value = '';
  els.repairItemInput.disabled = true;
  els.repairItemState.textContent = 'Chọn model để hiện danh sách sửa chữa.';
  els.repairResults.innerHTML = '';
  els.repairDeviceCard.classList.add('hidden');
  els.repairSelectedCard.classList.add('hidden');
  els.repairEmptyState.classList.remove('hidden');
  hideRepairSuggestions();
  els.repairSearchState.textContent = 'Nhập tên máy để bắt đầu tra cứu sửa chữa.';
}

// ================================================================
// CHAT / LARK
// ================================================================
function openChatPanel() {
  state.chatPanelOpen = true;
  state.chatTab = state.activeTab === 'repair' ? 'repair' : 'buyback';
  els.chatPanel.classList.remove('hidden');
  switchChatTab(state.chatTab);
}

function closeChatPanel() {
  state.chatPanelOpen = false;
  els.chatPanel.classList.add('hidden');
}

function switchChatTab(tab) {
  state.chatTab = tab;
  els.chatBuybackTab.classList.toggle('active', tab === 'buyback');
  els.chatRepairTab.classList.toggle('active', tab === 'repair');
  if (tab === 'buyback') {
    els.chatFormBuyback.classList.remove('hidden');
    els.chatFormRepair.classList.add('hidden');
    if (els.chatBubbleText) els.chatBubbleText.textContent = 'Xin giá thu';
  } else {
    els.chatFormRepair.classList.remove('hidden');
    els.chatFormBuyback.classList.add('hidden');
    if (els.chatBubbleText) els.chatBubbleText.textContent = 'Xin giá sửa chữa';
  }
  syncChatSummary();
}

function syncChatSummary() {
  if (state.chatTab === 'repair') {
    if (!els.chatRepairDeviceName) return;
    els.chatRepairDeviceName.value = '';
    els.chatRepairStorage.value = '';
    return;
  }

  if (els.chatDeviceName) els.chatDeviceName.value = '';
  if (els.chatStorage) els.chatStorage.value = '';
  if (els.chatBodyCondition) els.chatBodyCondition.value = '';
  if (els.chatPinStatus) els.chatPinStatus.value = '';
  if (els.marketInput) els.marketInput.value = '';
  if (els.accessoriesInput) els.accessoriesInput.value = '';
  if (els.conditionInput) els.conditionInput.value = '';

  if (els.chatBuybackSummary) {
    const parts = ['Xin giá thu'];
    const deviceName = (state.detail && state.detail.deviceName) || '';
    const storage = (state.detail && state.detail.storage) || '';
    if (deviceName) parts.push(deviceName);
    if (storage) parts.push(storage);
    els.chatBuybackSummary.textContent = parts.join(' | ');
    els.chatBuybackSummary.classList.toggle('hidden', parts.length === 1);
  }
}

async function submitBuybackRequest(event) {
  event.preventDefault();
  try {
    showLoading(true);
    els.chatMessage.textContent = 'Đang gửi yêu cầu...';
    els.chatMessage.className = 'helper-text';
    const payload = {
      deviceName: sanitizeText(els.chatDeviceName.value),
      storage: sanitizeText(els.chatStorage.value),
      type: state.type,
      warranty: state.warranty,
      bodyCondition: sanitizeText(els.chatBodyCondition.value),
      pinStatus: sanitizeText(els.chatPinStatus ? els.chatPinStatus.value : ''),

      market: sanitizeText(els.marketInput.value),
      accessories: sanitizeText(els.accessoriesInput.value),
      condition: sanitizeText(els.conditionInput.value),
      priceBuy: Number(state.detail ? state.detail.priceBuy || 0 : 0),
      supportPrice: Number(state.detail ? state.detail.supportPrice || 0 : 0),
      warrantyPrice: Number(state.detail ? state.detail.warrantyPrice || 0 : 0),
      priceSale: Number(state.detail ? state.detail.priceSale || 0 : 0),
      priceSale95: Number(state.detail ? state.detail.priceSale95 || 0 : 0),
      selectedDefects: state.selectedDefects.map(d => ({ name: sanitizeText(d.name), price: Number(d.price || 0) })),
    };
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    els.chatMessage.textContent = 'Đã gửi yêu cầu xin giá thu thành công.';
    els.chatMessage.className = 'helper-text success-text';
  } catch (err) {
    els.chatMessage.textContent = err.message || 'Gửi yêu cầu thất bại.';
    els.chatMessage.className = 'helper-text error-text';
  } finally {
    showLoading(false);
  }
}

async function submitRepairRequest(event) {
  event.preventDefault();
  try {
    showLoading(true);
    els.chatRepairMessage.textContent = 'Đang gửi yêu cầu...';
    els.chatRepairMessage.className = 'helper-text';
    const payload = {
      deviceName: sanitizeText(els.chatRepairDeviceName.value),
      storage: sanitizeText(els.chatRepairStorage.value),
      repairDefects: sanitizeText(els.chatRepairDefects.value),
      repairNote: sanitizeText(els.chatRepairNote.value),
      mode: 'repair',
    };
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    els.chatRepairMessage.textContent = 'Đã gửi yêu cầu xin giá sửa chữa thành công.';
    els.chatRepairMessage.className = 'helper-text success-text';
  } catch (err) {
    els.chatRepairMessage.textContent = err.message || 'Gửi yêu cầu thất bại.';
    els.chatRepairMessage.className = 'helper-text error-text';
  } finally {
    showLoading(false);
  }
}

// ================================================================
// REQUESTS TAB
// ================================================================

async function loadRequests() {
  const status = (state.requestFilter && state.requestFilter.status) || 'all';
  const period = (state.requestFilter && state.requestFilter.period) || 'today';
  const requestId = ++state._requestsRequestId;
  els.requestFilterState.textContent = 'Đang tải danh sách phiếu...';
  try {
    const url = `${API_BASE}?action=requests`;
    const res = await fetch(url);
    const data = await res.json();
    if (requestId !== state._requestsRequestId) return;
    const arr = Array.isArray(data) ? data : [];
    state.requests = arr;
    const filtered = filterRequests(arr, status, period);
    if (filtered.length) {
      renderRequestCards(filtered);
      els.requestFilterState.textContent = `Hiện ${filtered.length} phiếu.`;
    } else {
      els.requestsList.innerHTML = '';
      els.requestsEmptyState.classList.remove('hidden');
      els.requestFilterState.textContent = 'Không có phiếu phù hợp với bộ lọc.';
    }
  } catch (err) {
    els.requestFilterState.textContent = 'Không tải được phiếu: ' + err.message;
  }
}

function filterRequests(requests, status, period) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);
  const start3Days = new Date(startToday);
  start3Days.setDate(start3Days.getDate() - 2);
  const startWeek = new Date(startToday);
  startWeek.setDate(startWeek.getDate() - 6);
  const startMonth = new Date(startToday);
  startMonth.setMonth(startMonth.getMonth() - 1);

  return requests.filter((req) => {
    const price = Number(req.price || 0);
    if (status === 'pending' && price > 0) return false;
    if (status === 'priced' && price <= 0) return false;

    if (period === 'all') return true;
    const requestDate = req.timestamp ? new Date(req.timestamp) : null;
    if (!requestDate || isNaN(requestDate.getTime())) return false;

    if (period === 'today') {
      return requestDate >= startToday;
    }
    if (period === 'yesterday') {
      return requestDate >= startYesterday && requestDate < startToday;
    }
    if (period === '3days') {
      return requestDate >= start3Days;
    }
    if (period === 'week') {
      return requestDate >= startWeek;
    }
    if (period === 'month') {
      return requestDate >= startMonth;
    }
    return true;
  }).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
}

function renderRequestCards(requests) {
  els.requestsEmptyState.classList.add('hidden');
  if (!requests.length) {
    els.requestsList.innerHTML = '';
    return;
  }
  els.requestsList.innerHTML = requests.map((req) => {
    const requestDate = req.timestamp ? new Date(req.timestamp) : null;
    const ts = requestDate ? requestDate.toLocaleString('vi-VN') : 'Không rõ';
    const priceValue = Number(req.price || 0);
    const priceDisplay = priceValue > 0 ? fmtVnd(priceValue) : 'Chưa có giá';
    const waitMs = requestDate ? (Date.now() - requestDate.getTime()) : 0;
    const isPending = priceValue <= 0;
    const isLate = isPending && waitMs > 10 * 60 * 1000;
    const waitText = requestDate ? formatWaitTime(waitMs) : 'Không rõ';
    return `
      <div class="request-card ${isLate ? 'request-card-late' : ''}" data-row="${req.rowIndex}" data-topic="${escapeHtml(req.topicMessageId)}">
        <div class="request-card-header">
          <div>
            <p class="eyebrow">Phiếu #${req.rowIndex}</p>
            <h3 class="request-card-title">${escapeHtml(req.deviceName)} · ${escapeHtml(req.storage)}</h3>
            <p class="request-card-time">${escapeHtml(ts)}</p>
            <p class="request-wait ${isLate ? 'request-wait-late' : ''}">${isPending ? 'Chờ phản hồi: ' + escapeHtml(waitText) : 'Đã phản hồi'}</p>
          </div>
          <div class="price-badge ${isLate ? 'price-badge-late' : ''}">
            <span>Giá đã nhập</span>
            <strong>${priceDisplay}</strong>
          </div>
        </div>
        <div class="request-card-body">
          <div class="request-row"><span class="request-row-label">Ngoại hình</span><span class="request-row-value">${escapeHtml(req.bodyCondition)}</span></div>
          <div class="request-row"><span class="request-row-label">Pin</span><span class="request-row-value">${escapeHtml(req.pinStatus)}</span></div>
          <div class="request-row"><span class="request-row-label">BHMR</span><span class="request-row-value">${escapeHtml(req.warranty)}</span></div>
          <div class="request-row"><span class="request-row-label">Phụ kiện</span><span class="request-row-value">${escapeHtml(req.accessories)}</span></div>
          <div class="request-row"><span class="request-row-label">Thị trường</span><span class="request-row-value">${escapeHtml(req.market)}</span></div>
        </div>
        <div class="request-card-actions">
          ${isPending ? `<button type="button" class="request-price-btn" data-row="${req.rowIndex}" data-topic="${escapeHtml(req.topicMessageId)}" data-topic-id="${escapeHtml(req.topicId)}" data-device="${escapeHtml(req.deviceName)}" data-storage="${escapeHtml(req.storage)}">Điền giá</button>` : ''}
        </div>
      </div>`;
  }).join('');

  [...els.requestsList.querySelectorAll('.request-price-btn')].forEach((btn) => {
    btn.addEventListener('click', () => {
      openPriceModal({
        rowIndex: btn.dataset.row,
        topicMessageId: btn.dataset.topic,
        topicId: btn.dataset.topicId,
        deviceName: btn.dataset.device,
        storage: btn.dataset.storage,
      });
    });
  });
}

function formatWaitTime(waitMs) {
  const totalMinutes = Math.max(0, Math.floor(waitMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}p`;
  return `${minutes}p`;
}


function openPriceModal(req) {
  state.editingRequest = req;
  state.priceModalOpen = true;
  els.priceModalTitle.textContent = (req.deviceName || '') + ' · ' + (req.storage || '');
  els.priceModalInfo.innerHTML = `
    <div class="request-row"><span class="request-row-label">Tên máy</span><span class="request-row-value">${escapeHtml(req.deviceName)}</span></div>
    <div class="request-row"><span class="request-row-label">Dung lượng</span><span class="request-row-value">${escapeHtml(req.storage)}</span></div>
    <div class="request-row"><span class="request-row-label">TopicMsgId</span><span class="request-row-value" style="font-size:11px">${escapeHtml(req.topicMessageId)}</span></div>
    <div class="request-row"><span class="request-row-label">TopicId</span><span class="request-row-value" style="font-size:11px">${escapeHtml(req.topicId)}</span></div>
    <div class="request-row"><span class="request-row-label">RowIndex</span><span class="request-row-value">${escapeHtml(req.rowIndex)}</span></div>
  `;
  els.priceInput.value = '';
  els.priceFormMessage.textContent = '';
  els.priceFormMessage.className = 'helper-text';
  els.priceModal.classList.remove('hidden');
  setTimeout(() => els.priceInput.focus(), 100);
}

function closePriceModal() {
  state.priceModalOpen = false;
  state.editingRequest = null;
  els.priceModal.classList.add('hidden');
  els.priceInput.value = '';
}

async function submitPrice(event) {
  event.preventDefault();
  const req = state.editingRequest;
  if (!req) return;
  const raw = sanitizeText(els.priceInput.value).trim();
  const price = Number(raw);
  if (!raw || isNaN(price) || price < 0) {
    els.priceFormMessage.textContent = 'Vui lòng nhập giá hợp lệ.';
    els.priceFormMessage.className = 'helper-text error-text';
    return;
  }
  showLoading(true);
  els.priceFormMessage.textContent = 'Đang lưu...';
  els.priceFormMessage.className = 'helper-text';
  try {
    const payload = {
      action: 'replyPrice',
      topicMessageId: req.topicMessageId,
      topicId: req.topicId,
      rowIndex: req.rowIndex,
      price: price,
    };
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    els.priceFormMessage.textContent = 'Đã lưu giá và gửi reply vào Lark.';
    els.priceFormMessage.className = 'helper-text success-text';
    setTimeout(() => {
      closePriceModal();
      loadRequests();
    }, 1200);
  } catch (err) {
    els.priceFormMessage.textContent = err.message || 'Lưu giá thất bại.';
    els.priceFormMessage.className = 'helper-text error-text';
  } finally {
    showLoading(false);
  }
}

// ================================================================
// UTILITIES
// ================================================================
function showLoading(show) {
  els.loadingOverlay.classList.toggle('hidden', !show);
}

function sanitizeText(value) {
  return String(value || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
}

function formatVnd(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function normalizeKeyword(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
