const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'rang-auto.ru', 'index.html');
const indexContent = fs.readFileSync(indexFile, 'utf8');

// Helper to extract HEAD content up to body tag
const headMatch = indexContent.match(/<head>([\s\S]*?)<\/head>/);
const headHtml = headMatch ? headMatch[1] : '';

// Helper to extract HEADER markup
const headerMatch = indexContent.match(/<header[^>]*>([\s\S]*?)<\/header>/);
let headerHtml = headerMatch ? headerMatch[1] : '';

// Helper to extract FOOTER markup
const footerMatch = indexContent.match(/<footer[^>]*>([\s\S]*?)<\/footer>/);
let footerHtml = footerMatch ? footerMatch[1] : '';

// Function to replace navigation links with page links
function cleanNavigation(html) {
  return html
    .replace(/href="#catalog-section"/g, 'href="/catalog"')
    .replace(/href="#reviews-section"/g, 'href="/reviews"')
    .replace(/href="#team-section"/g, 'href="/about"')
    .replace(/href="#footer-contacts"/g, 'href="/contacts"');
}

headerHtml = cleanNavigation(headerHtml);
footerHtml = cleanNavigation(footerHtml);

// Function to generate the full page HTML
function generatePage(title, activeNav, breadcrumb, bodyContent, scriptContent) {
  // Set active class on header nav link
  let pageHeader = headerHtml;
  if (activeNav) {
    const navRegex = new RegExp(`href="\\/${activeNav}"[^>]*>`, 'g');
    pageHeader = pageHeader.replace(navRegex, `href="/${activeNav}" class="nav-link active-nav-link"`);
  }

  // Active link styling helper
  const extraStyles = `
    <style>
      .active-nav-link {
        color: var(--accent) !important;
        font-weight: 700 !important;
      }
      .breadcrumb-container {
        padding: 24px 0 12px 0;
        font-size: 13px;
        color: var(--text-muted);
      }
      .breadcrumb-container a {
        color: var(--text-muted);
        text-decoration: none;
        transition: color 0.2s;
      }
      .breadcrumb-container a:hover {
        color: var(--accent);
      }
      .breadcrumb-separator {
        margin: 0 8px;
        opacity: 0.3;
      }
    </style>
  `;

  return `<!DOCTYPE html>
<html class="dm_sans_ae92e279-module___wC0Mq__variable dark" lang="ru">
<head>
  <title>${title}</title>
  ${headHtml}
  ${extraStyles}
</head>
<body class="min-h-screen flex flex-col">
  <header class="sticky top-0 z-50" style="background:var(--header-bg);backdrop-filter:blur(24px) saturate(1.4);-webkit-backdrop-filter:blur(24px) saturate(1.4);border-bottom:1px solid var(--header-border);box-shadow:none;transition:background 0.3s ease, box-shadow 0.3s ease">
    <div class="w-full pl-7 pr-4 sm:pr-6 lg:pr-8">
      <div class="site-header-bar relative flex items-center h-[74px]">
        ${pageHeader}
      </div>
    </div>
  </header>
  <main class="flex-1">
    <div id="main-content-wrapper" style="opacity:0;filter:blur(6px);transition:opacity 0.6s ease-out, filter 0.6s ease-out">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumbs -->
        <div class="breadcrumb-container">
          <a href="/">Главная</a>
          <span class="breadcrumb-separator">/</span>
          <span>${breadcrumb}</span>
        </div>
        
        <!-- Content -->
        ${bodyContent}
      </div>
    </div>
  </main>
  <footer class="mt-auto" style="border-top:1px solid var(--footer-border);background:var(--footer-bg)">
    ${footerHtml}
  </footer>
  
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      // Toggle behavior for mobile menu
      const mobileBtn = document.querySelector('.nav-mobile-btn');
      if (mobileBtn) {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.innerHTML = \`
          <div class="mobile-menu-content">
            <a class="mobile-nav-link" href="/catalog">Каталог</a>
            <a class="mobile-nav-link" href="/reviews">Отзывы</a>
            <a class="mobile-nav-link" href="/about">О компании</a>
            <a class="mobile-nav-link" href="/contacts">Контакты</a>
          </div>
        \`;
        document.body.appendChild(overlay);

        mobileBtn.addEventListener('click', () => {
          const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
          mobileBtn.setAttribute('aria-expanded', !expanded);
          overlay.classList.toggle('active');
          if (!expanded) {
            mobileBtn.innerHTML = \`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>\`;
          } else {
            mobileBtn.innerHTML = \`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>\`;
          }
        });

        overlay.querySelectorAll('.mobile-nav-link').forEach(link => {
          link.addEventListener('click', () => {
            mobileBtn.setAttribute('aria-expanded', 'false');
            overlay.classList.remove('active');
            mobileBtn.innerHTML = \`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>\`;
          });
        });
      }

      // Fade-in effect
      const wrapper = document.getElementById('main-content-wrapper');
      if (wrapper) {
        setTimeout(() => {
          wrapper.style.opacity = '1';
          wrapper.style.filter = 'none';
        }, 100);
      }
      
      // Page specific logic
      ${scriptContent}
    });
  </script>
</body>
</html>`;
}

// -------------------------------------------------------------
// 1. CATALOG PAGE
// -------------------------------------------------------------
const catalogBody = `
  <section class="py-10">
    <div class="mb-8 text-center md:text-left">
      <h1 class="text-4xl font-bold tracking-tight text-white mb-3">Каталог проверенных автомобилей</h1>
      <p class="text-base text-gray-400">Выберите подходящий автомобиль с прозрачной историей и быстрой доставкой из Европы</p>
    </div>

    <!-- Interactive Filters Container -->
    <div class="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Search Input -->
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Поиск по маркам / моделям</label>
          <div class="relative">
            <input type="text" id="filter-search" placeholder="Например: BMW, Kia..." class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all pl-10" />
            <svg class="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        <!-- 2. Fuel Type Filter -->
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Тип топлива</label>
          <select id="filter-fuel" class="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-all">
            <option value="">Все типы топлива</option>
            <option value="бензин">Бензин</option>
            <option value="дизель">Дизель</option>
            <option value="гибрид">Гибрид</option>
            <option value="электро">Электро</option>
          </select>
        </div>

        <!-- 3. Transmission Filter -->
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Коробка передач</label>
          <select id="filter-transmission" class="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-all">
            <option value="">Все КПП</option>
            <option value="автомат">Автоматическая / Робот</option>
            <option value="механика">Механическая</option>
          </select>
        </div>

        <!-- 4. Max Price Filter -->
        <div>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Макс. цена (₽)</label>
          <input type="number" id="filter-price-max" placeholder="До..." class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all" />
        </div>
      </div>

      <!-- Bottom Status Bar -->
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-sm">
        <span class="text-gray-400">Найдено автомобилей: <strong class="text-white font-semibold" id="filter-count">0</strong></span>
        <button id="filter-reset-btn" class="text-xs text-red-400 hover:text-red-300 underline transition-all hidden">Сбросить фильтры</button>
      </div>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="catalog-grid">
      <p class="text-gray-500 text-center col-span-3 py-12">Загрузка каталога...</p>
    </div>
  </section>
`;

const catalogScript = `
  let allCars = [];

  const filterSearch = document.getElementById('filter-search');
  const filterFuel = document.getElementById('filter-fuel');
  const filterTransmission = document.getElementById('filter-transmission');
  const filterPriceMax = document.getElementById('filter-price-max');
  const filterResetBtn = document.getElementById('filter-reset-btn');
  const filterCount = document.getElementById('filter-count');
  const grid = document.getElementById('catalog-grid');

  const renderCars = (carsToRender) => {
    if (!grid) return;
    if (filterCount) filterCount.textContent = carsToRender.length;

    const isFiltered = (filterSearch && filterSearch.value.trim() !== '') || (filterFuel && filterFuel.value !== '') || (filterTransmission && filterTransmission.value !== '') || (filterPriceMax && filterPriceMax.value.trim() !== '');
    if (filterResetBtn) {
      if (isFiltered) {
        filterResetBtn.classList.remove('hidden');
      } else {
        filterResetBtn.classList.add('hidden');
      }
    }

    if (carsToRender.length === 0) {
      grid.innerHTML = \`
        <div class="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-16 px-4 card-dark rounded-2xl border border-white/5">
          <svg class="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <p class="text-lg font-medium text-white mb-1">По вашему запросу ничего не найдено</p>
          <p class="text-sm text-gray-400 mb-4">Попробуйте изменить параметры поиска или сбросить фильтры</p>
          <button id="inline-reset-btn" class="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl text-xs uppercase tracking-wider transition-all">Сбросить фильтры</button>
        </div>
      \`;
      const inlineReset = document.getElementById('inline-reset-btn');
      if (inlineReset) inlineReset.addEventListener('click', resetFilters);
      return;
    }

    grid.innerHTML = carsToRender.map(car => \`
      <div class="h-full">
        <a class="group flex flex-col h-full card-dark rounded-2xl overflow-hidden" href="#car-\${car.id}">
          <div class="relative overflow-hidden" style="aspect-ratio:16/10;background:var(--gallery-empty-bg)">
            <img alt="\${car.make} \${car.model}" class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" src="\${car.image}" />
            <span class="fuel-tag" data-fuel="\${car.fuel}">\${car.fuel}</span>
          </div>
          <div class="flex flex-col flex-1 p-5">
            <h3 class="text-[17px] font-semibold leading-snug truncate" style="color:var(--text-heading)">
              \${car.make} \${car.model}
            </h3>
            <p class="text-[13px] font-medium mt-1" style="color:var(--text-muted)">
              \${car.year} г. · \${car.bodyType}
            </p>
            <div class="flex flex-wrap gap-2 mt-3.5">
              <span class="spec-chip">\${car.mileage}</span>
              <span class="spec-chip">\${car.engine}</span>
              <span class="spec-chip">\${car.hp}</span>
              <span class="spec-chip">\${car.transmission}</span>
            </div>
            <div class="flex items-center justify-between mt-auto pt-4">
              <span class="text-[18px] font-bold leading-none" style="color:var(--text-heading)">
                \${car.price}
              </span>
              <span class="featured-cta">
                Смотреть
                <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" viewBox="0 0 24 24" width="14">
                  <path d="M9 5l7 7-7 7"></path>
                </svg>
              </span>
            </div>
          </div>
        </a>
      </div>
    \`).join('');
  };

  const applyFilters = () => {
    const searchVal = filterSearch ? filterSearch.value.trim().toLowerCase() : '';
    const fuelVal = filterFuel ? filterFuel.value.trim().toLowerCase() : '';
    const transVal = filterTransmission ? filterTransmission.value.trim().toLowerCase() : '';
    const maxPriceVal = filterPriceMax ? parseFloat(filterPriceMax.value) : NaN;

    const filtered = allCars.filter(car => {
      if (searchVal) {
        const fullTitle = \`\${car.make} \${car.model}\`.toLowerCase();
        if (!fullTitle.includes(searchVal)) return false;
      }
      if (fuelVal) {
        const carFuel = (car.fuel || '').toLowerCase();
        if (!carFuel.includes(fuelVal)) return false;
      }
      if (transVal) {
        const carTrans = (car.transmission || '').toLowerCase();
        if (transVal === 'автомат') {
          if (!carTrans.includes('автомат') && !carTrans.includes('робот')) return false;
        } else if (transVal === 'механика') {
          if (!carTrans.includes('механич')) return false;
        } else if (!carTrans.includes(transVal)) {
          return false;
        }
      }
      if (!isNaN(maxPriceVal) && maxPriceVal > 0) {
        const rawPriceStr = (car.price || '').toString().replace(/\\D/g, '');
        const numPrice = parseFloat(rawPriceStr);
        if (!isNaN(numPrice) && numPrice > maxPriceVal) return false;
      }
      return true;
    });

    renderCars(filtered);
  };

  const resetFilters = () => {
    if (filterSearch) filterSearch.value = '';
    if (filterFuel) filterFuel.value = '';
    if (filterTransmission) filterTransmission.value = '';
    if (filterPriceMax) filterPriceMax.value = '';
    applyFilters();
  };

  if (filterSearch) filterSearch.addEventListener('input', applyFilters);
  if (filterFuel) filterFuel.addEventListener('change', applyFilters);
  if (filterTransmission) filterTransmission.addEventListener('change', applyFilters);
  if (filterPriceMax) filterPriceMax.addEventListener('input', applyFilters);
  if (filterResetBtn) filterResetBtn.addEventListener('click', resetFilters);

  const loadCars = async () => {
    if (!grid) return;
    try {
      const res = await fetch('/api/cars');
      allCars = await res.json();
      applyFilters();
    } catch (err) {
      console.error('Ошибка загрузки автомобилей:', err);
      grid.innerHTML = '<p class="text-gray-400 text-center col-span-3">Не удалось загрузить каталог автомобилей.</p>';
    }
  };
  loadCars();
`;

fs.writeFileSync(
  path.join(__dirname, 'rang-auto.ru', 'catalog.html'),
  generatePage('Каталог автомобилей — Автоспутник', 'catalog', 'Каталог', catalogBody, catalogScript),
  'utf8'
);

// -------------------------------------------------------------
// 2. REVIEWS PAGE
// -------------------------------------------------------------
const reviewsBody = `
  <section class="py-10">
    <div class="mb-12 text-center md:text-left">
      <h1 class="text-4xl font-bold tracking-tight text-white mb-3">Отзывы наших клиентов</h1>
      <p class="text-base text-gray-400">Мы ценим доверие наших клиентов и помогаем привезти качественные автомобили</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="reviews-grid">
      <p class="text-gray-500 text-center col-span-2 py-12">Загрузка отзывов...</p>
    </div>

    <!-- Video Modal Overlay -->
    <div id="video-modal" class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center opacity-0 pointer-events-none transition-all duration-300">
      <button class="absolute top-6 right-6 text-white/70 hover:text-white hover:scale-110 transition-all" id="close-modal-btn">
        <svg fill="none" height="32" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="32">
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
      </button>
      <div class="w-full max-w-4xl aspect-video px-4" id="modal-media-container">
      </div>
    </div>
  </section>
`;

const reviewsScript = `
  const videoModal = document.getElementById('video-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');

  const openVideoModal = (url) => {
    if (!videoModal) return;
    const container = document.getElementById('modal-media-container');
    if (!container) return;
    
    container.innerHTML = '';
    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('embed');
    
    if (isYoutube) {
      const iframe = document.createElement('iframe');
      iframe.id = 'modal-iframe';
      iframe.className = 'w-full h-full rounded-2xl border border-white/10 shadow-2xl';
      iframe.src = url;
      iframe.frameBorder = '0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      container.appendChild(iframe);
    } else {
      const video = document.createElement('video');
      video.className = 'w-full h-full rounded-2xl border border-white/10 shadow-2xl';
      video.src = url;
      video.controls = true;
      video.autoplay = true;
      container.appendChild(video);
    }
    
    videoModal.classList.remove('pointer-events-none', 'opacity-0');
    videoModal.classList.add('opacity-100');
  };

  const closeVideoModal = () => {
    if (!videoModal) return;
    videoModal.classList.add('pointer-events-none', 'opacity-0');
    videoModal.classList.remove('opacity-100');
    const container = document.getElementById('modal-media-container');
    if (container) container.innerHTML = '';
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeVideoModal);
  }
  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }

  const loadReviews = async () => {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;
    try {
      const res = await fetch('/api/reviews');
      const reviews = await res.json();
      grid.innerHTML = reviews.map(r => {
        const hasVideo = r.videoUrl && r.videoUrl.trim().length > 0;
        return \`
          <div class="bg-[#111218] border border-white/5 p-6 rounded-2xl flex flex-col h-full hover:border-white/10 transition-all duration-300">
            <div class="flex items-center gap-3.5 mb-4">
              <div class="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center text-red-500 font-bold border border-red-500/10">
                \${r.name.charAt(0)}
              </div>
              <div>
                <h4 class="font-bold text-white leading-snug">\${r.name}</h4>
                <p class="text-xs text-gray-500 mt-0.5">\${r.carModel} · \${r.date}</p>
              </div>
            </div>
            
            <p class="text-sm leading-relaxed text-gray-300 flex-1 mb-4">\${r.text || ''}</p>
            
            \${r.mediaUrl ? \`
            <div class="relative rounded-xl overflow-hidden aspect-video border border-white/5 group \${hasVideo ? 'cursor-pointer video-card' : ''}" \${hasVideo ? \`data-video="\${r.videoUrl}"\` : ''}>
              <img src="\${r.mediaUrl}" alt="Отзыв \${r.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
              \${hasVideo ? \`
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-all">
                <div class="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transform group-hover:scale-110 transition-transform">
                  <svg fill="currentColor" width="20" height="20" viewBox="0 0 24 24" class="ml-1">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>\` : ''}
            </div>\` : ''}
          </div>
        \`;
      }).join('');

      document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
          const videoUrl = card.getAttribute('data-video');
          openVideoModal(videoUrl);
        });
      });
    } catch (err) {
      console.error('Ошибка загрузки отзывов:', err);
      grid.innerHTML = '<p class="text-gray-400 text-center col-span-2">Не удалось загрузить отзывы.</p>';
    }
  };
  loadReviews();
`;

fs.writeFileSync(
  path.join(__dirname, 'rang-auto.ru', 'reviews.html'),
  generatePage('Отзывы клиентов — Автоспутник', 'reviews', 'Отзывы', reviewsBody, reviewsScript),
  'utf8'
);

// -------------------------------------------------------------
// 3. ABOUT PAGE
// -------------------------------------------------------------
const aboutBody = `
  <section class="py-10">
    <div class="mb-12 text-center md:text-left">
      <h1 class="text-4xl font-bold tracking-tight text-white mb-3">О компании «Автоспутник»</h1>
      <p class="text-base text-gray-400">Ваш надежный партнер по подбору и доставке качественных автомобилей из Европы.</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-center">
      <div class="text-gray-300 space-y-5 leading-relaxed">
        <p>Мы специализируемся на профессиональном поиске, проверке технического состояния и безопасной логистике легковых автомобилей из Германии, Швеции и других стран Евросоюза.</p>
        <p><strong>ООО «Автоспутник»</strong> — это команда экспертов, гарантирующая юридическую чистоту сделки, точную оценку состояния кузова и двигателя, а также полное таможенное оформление «под ключ».</p>
        <p>Наш офис находится в г. Лида, но мы доставляем автомобили клиентам по всей территории Российской Федерации.</p>
      </div>
      <div class="rounded-2xl border border-white/5 overflow-hidden aspect-[4/3] bg-white/5 relative">
        <div class="absolute inset-0 bg-gradient-to-tr from-black/80 to-transparent z-10"></div>
        <img src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80" alt="About us image" class="w-full h-full object-cover">
      </div>
    </div>
    
    <!-- Team Section -->
    <div class="border-t border-white/5 pt-12">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold tracking-tight text-white mb-2">Наша команда</h2>
        <p class="text-sm text-gray-400">Профессионалы, готовые помочь вам на каждом этапе покупки автомобиля</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-10 justify-items-center mb-10" id="team-grid">
        <p class="text-gray-500 text-center col-span-5 py-8">Загрузка списка команды...</p>
      </div>
    </div>
  </section>
`;

const aboutScript = `
  // Setup custom team styles
  const style = document.createElement('style');
  style.innerHTML = \`
    .team-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .team-img-wrapper {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), border-color 0.3s ease;
      background: rgba(255,255,255,0.02);
    }
    .team-card:hover .team-img-wrapper {
      transform: scale(1.08);
      border-color: var(--accent);
    }
    .team-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .team-name {
      font-size: 15px;
      font-weight: 600;
      color: var(--text-heading);
      margin-top: 16px;
      line-height: 1.4;
      max-width: 180px;
    }
  \`;
  document.head.appendChild(style);

  const loadTeam = async () => {
    const grid = document.getElementById('team-grid');
    if (!grid) return;
    try {
      const res = await fetch('/api/managers');
      const team = await res.json();
      grid.innerHTML = team.map(m => {
        let linksHtml = '';
        const telegrams = (m.telegram || '').split(',').map(s => s.trim()).filter(Boolean);
        const whatsapps = (m.whatsapp || '').split(',').map(s => s.trim()).filter(Boolean);
        
        if (telegrams.length > 0 || whatsapps.length > 0) {
          let buttons = [];
          const maxLen = Math.max(telegrams.length, whatsapps.length);
          for (let i = 0; i < maxLen; i++) {
            if (telegrams[i]) {
              buttons.push(\`
                <a href="\${telegrams[i]}" target="_blank" title="Telegram" style="display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; background:rgba(0,136,204,0.12); color:#0088cc; transition:all 0.2s;" onmouseover="this.style.background='#0088cc';this.style.color='#fff';" onmouseout="this.style.background='rgba(0,136,204,0.12)';this.style.color='#0088cc';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
              \`);
            }
            if (whatsapps[i]) {
              const secUrl = whatsapps[i];
              const isMax = secUrl.includes('max.ru');
              const isWa = secUrl.includes('wa.me') || secUrl.includes('whatsapp.com');
              
              if (isMax) {
                buttons.push(\`
                  <a href="\${secUrl}" target="_blank" title="Max Chat" style="display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; background:rgba(255,42,53,0.12); color:var(--accent); transition:all 0.2s;" onmouseover="this.style.background='var(--accent)';this.style.color='#fff';" onmouseout="this.style.background='rgba(255,42,53,0.12)';this.style.color='var(--accent)';">
                    <svg width="14" height="14" viewBox="0 0 42 42" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.47 41.88c-4.11 0-6.02-.6-9.34-3-2.1 2.7-8.75 4.81-9.04 1.2 0-2.71-.6-5-1.28-7.5C1 29.5.08 26.07.08 21.1.08 9.23 9.82.3 21.36.3c11.55 0 20.6 9.37 20.6 20.91a20.6 20.6 0 0 1-20.49 20.67m.17-31.32c-5.62-.29-10 3.6-10.97 9.7-.8 5.05.62 11.2 1.83 11.52.58.14 2.04-1.04 2.95-1.95a10.4 10.4 0 0 0 5.08 1.81 10.7 10.7 0 0 0 11.19-9.97 10.7 10.7 0 0 0-10.08-11.1Z"/></svg>
                  </a>
                \`);
              } else if (isWa) {
                buttons.push(\`
                  <a href="\${secUrl}" target="_blank" title="WhatsApp" style="display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:50%; background:rgba(37,211,102,0.12); color:#25D366; transition:all 0.2s;" onmouseover="this.style.background='#25D366';this.style.color='#fff';" onmouseout="this.style.background='rgba(37,211,102,0.12)';this.style.color='#25D366';">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>
                \`);
              }
            }
          }
          
          linksHtml = \`
            <div style="display:flex; gap:10px; margin-top:12px; justify-content:center; flex-wrap:wrap;">
              \${buttons.join('')}
            </div>
          \`;
        }
        
        let imgStyle = '';
        if (m.name.indexOf('Попова') !== -1 || m.name.indexOf('Венедиктова') !== -1 || m.name.indexOf('Иванкин') !== -1) {
          imgStyle = 'style="object-position: center 20%;"';
        }
        
        return \`
          <div class="team-card">
            <div class="team-img-wrapper">
              <img src="\${m.image}" alt="\${m.name}" class="team-img" \${imgStyle} loading="lazy" />
            </div>
            <h3 class="team-name">\${m.name}</h3>
            \${m.role ? \`<p style="font-size:12px; color:var(--text-secondary); margin-top:4px; max-width:180px; min-height:18px;">\${m.role}</p>\` : ''}
            \${linksHtml}
          </div>
        \`;
      }).join('');
    } catch (err) {
      console.error('Ошибка загрузки команды:', err);
      grid.innerHTML = '<p class="text-gray-400 text-center col-span-5">Не удалось загрузить список сотрудников.</p>';
    }
  };
  loadTeam();
`;

fs.writeFileSync(
  path.join(__dirname, 'rang-auto.ru', 'about.html'),
  generatePage('О компании — Автоспутник', 'about', 'О компании', aboutBody, aboutScript),
  'utf8'
);

// -------------------------------------------------------------
// 4. CONTACTS PAGE
// -------------------------------------------------------------
const contactsBody = `
  <section class="py-10">
    <div class="mb-12 text-center md:text-left">
      <h1 class="text-4xl font-bold tracking-tight text-white mb-3">Контактная информация</h1>
      <p class="text-base text-gray-400">Мы всегда на связи. Свяжитесь с нами удобным способом или посетите наш офис.</p>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
      <!-- Contact details -->
      <div class="lg:col-span-1 space-y-8 bg-[#111218] border border-white/5 rounded-2xl p-8 h-fit">
        <div>
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Наш телефон</h3>
          <a href="tel:+74951780549" class="text-xl font-bold text-white hover:text-red-500 transition-colors">+7 (495) 178-05-49</a>
        </div>
        
        <div>
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Электронная почта</h3>
          <a href="mailto:avtosputnickv@ya.ru" class="text-xl font-bold text-white hover:text-red-500 transition-colors">avtosputnickv@ya.ru</a>
        </div>
        
        <div>
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Режим работы</h3>
          <p class="text-base text-gray-300 leading-relaxed">
            Будние дни: 8:00 – 18:00<br>
            Суббота: 9:00 – 15:00<br>
            <span class="text-xs text-gray-500">(по московскому времени)</span>
          </p>
        </div>
        
        <div>
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Юридические данные</h3>
          <p class="text-sm text-gray-400 leading-relaxed">
            ООО «Автоспутник»<br>
            ИНН: 3443140210<br>
            ОГРН: 1183443013115<br>
            Юридический адрес: 400075, Волгоградская область, г. Волгоград, ул. Историческая, д. 140А, офис 1<br>
            Адрес офиса: г. Лида
          </p>
        </div>
      </div>
      
      <!-- Interactive Map container -->
      <div class="lg:col-span-2">
        <div class="rounded-2xl border border-white/5 overflow-hidden h-[450px] shadow-2xl relative">
          <!-- Embedded Yandex Map with dark mode invert filter -->
          <iframe 
            src="https://yandex.ru/map-widget/v1/?text=%D0%9B%D0%B8%D0%B4%D0%B0&z=13" 
            width="100%" 
            height="100%" 
            frameborder="0" 
            style="border:0; filter: invert(90%) hue-rotate(180deg); opacity: 0.85;"
            allowfullscreen="true">
          </iframe>
        </div>
      </div>
    </div>
  </section>
`;

fs.writeFileSync(
  path.join(__dirname, 'rang-auto.ru', 'contacts.html'),
  generatePage('Контакты — Автоспутник', 'contacts', 'Контакты', contactsBody, ''),
  'utf8'
);

// -------------------------------------------------------------
// 5. UPDATE HOMEPAGE (index.html) links
// -------------------------------------------------------------
let updatedIndex = indexContent;
updatedIndex = cleanNavigation(updatedIndex);

fs.writeFileSync(indexFile, updatedIndex, 'utf8');

console.log('Successfully completed multi-page migration!');
