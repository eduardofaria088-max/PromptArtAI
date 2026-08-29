document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('promptInput');
  const btnClearPrompt = document.getElementById('btnClearPrompt');
  const btnEnhance = document.getElementById('btnEnhance');
  const charCounter = document.getElementById('charCounter');
  const btnGenerate = document.getElementById('btnGenerate');
  const statusArea = document.getElementById('statusArea');
  const statusMessage = document.getElementById('statusMessage');
  const resultsSection = document.getElementById('resultsSection');
  const resultsGrid = document.getElementById('resultsGrid');
  const galleryGrid = document.getElementById('galleryGrid');
  const btnClearGallery = document.getElementById('btnClearGallery');
  const viewerModal = document.getElementById('viewerModal');
  const modalImage = document.getElementById('modalImage');
  const modalPrompt = document.getElementById('modalPrompt');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnModalDownload = document.getElementById('btnModalDownload');
  let activeModalItem = null;
  const config = { ratio: '1:1', quality: 'standard', count: 1 };
  promptInput.addEventListener('input', () => { charCounter.textContent = promptInput.value.length + ' caracteres'; });
  btnClearPrompt.addEventListener('click', () => { promptInput.value = ''; charCounter.textContent = '0 caracteres'; });
  btnEnhance.addEventListener('click', () => {
    if (!promptInput.value.trim()) return;
    promptInput.value = ImageGenerator.enhancePrompt(promptInput.value);
    charCounter.textContent = promptInput.value.length + ' caracteres';
  });
  function setupChips(containerSelector, configKey) {
    const chips = document.querySelectorAll(containerSelector + ' .chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        config[configKey] = chip.dataset[configKey] || chip.dataset.ratio || chip.dataset.quality || parseInt(chip.dataset.count);
      });
    });
  }
  setupChips('.ratios', 'ratio');
  setupChips('.qualities', 'quality');
  setupChips('.counts', 'count');
  btnGenerate.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) { alert("Por favor, escreva uma descrição antes de gerar."); return; }
    setLoading(true, "Criando sua imagem...");
    resultsGrid.innerHTML = '';
    resultsSection.classList.add('hidden');
    try {
      const count = parseInt(config.count);
      const promises = [];
      for (let i = 0; i < count; i++) { promises.push(ImageGenerator.generateImage(prompt, config)); }
      const results = await Promise.all(promises);
      resultsSection.classList.remove('hidden');
      results.forEach(item => renderImageCard(item, resultsGrid, false));
    } catch (error) {
      alert("Não foi possível gerar a imagem agora. Verifique sua conexão e tente novamente.");
      console.error(error);
    } finally { setLoading(false); }
  });
  function setLoading(isLoading, message = "") {
    btnGenerate.disabled = isLoading;
    if (isLoading) {
      statusMessage.textContent = message;
      statusArea.classList.remove('hidden');
    } else { statusArea.classList.add('hidden'); }
  }
  function renderImageCard(item, container, isGallery = false) {
    const card = document.createElement('div'); card.className = 'img-card';
    const img = document.createElement('img'); img.src = item.url; img.alt = item.prompt; img.onclick = () => openModal(item);
    const actions = document.createElement('div'); actions.className = 'img-actions';
    const btnDownload = createIconButton('⬇', 'Baixar', () => { DownloadManager.download(item.blob || item.url, 'promptart-' + Date.now() + '.jpg'); });
    const btnSave = createIconButton('💾', 'Salvar', async () => {
      await StorageManager.saveImage(item);
      btnSave.textContent = '✅'; btnSave.disabled = true; loadGallery();
    });
    const btnVar = createIconButton('🔄', 'Variação', async () => {
      setLoading(true, "Gerando variação...");
      try {
        const newItem = await ImageGenerator.generateImage(item.prompt, config);
        renderImageCard(newItem, resultsGrid, false);
      } catch (e) { alert("Erro ao gerar variação."); } finally { setLoading(false); }
    });
    const btnDelete = createIconButton('🗑️', 'Excluir', async () => {
      if (confirm("Deseja excluir esta imagem?")) { await StorageManager.deleteImage(item.id); loadGallery(); }
    });
    actions.appendChild(btnDownload);
    if (!isGallery) actions.appendChild(btnSave);
    actions.appendChild(btnVar);
    if (isGallery) actions.appendChild(btnDelete);
    card.appendChild(img); card.appendChild(actions); container.appendChild(card);
  }
  function createIconButton(icon, title, onClick) {
    const btn = document.createElement('button'); btn.className = 'btn-icon'; btn.innerHTML = icon; btn.title = title; btn.onclick = onClick; return btn;
  }
  async function loadGallery() {
    galleryGrid.innerHTML = '';
    const items = await StorageManager.getGallery();
    items.forEach(item => {
      if (item.blob) { item.url = URL.createObjectURL(item.blob); }
      renderImageCard(item, galleryGrid, true);
    });
  }
  btnClearGallery.addEventListener('click', async () => {
    if (confirm("Tem certeza que deseja apagar todas as imagens da galeria?")) { await StorageManager.clearAll(); loadGallery(); }
  });
  function openModal(item) {
    activeModalItem = item; modalImage.src = item.url; modalPrompt.textContent = item.prompt; viewerModal.classList.remove('hidden');
  }
  btnCloseModal.addEventListener('click', () => viewerModal.classList.add('hidden'));
  btnModalDownload.addEventListener('click', () => { if (activeModalItem) { DownloadManager.download(activeModalItem.blob || activeModalItem.url); } });
  loadGallery();
});
