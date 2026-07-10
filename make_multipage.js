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
    <div class="mb-12 text-center md:text-left">
      <h1 class="text-4xl font-bold tracking-tight text-white mb-3">Каталог проверенных автомобилей</h1>
      <p class="text-base text-gray-400">Выберите подходящий автомобиль с прозрачной историей и быстрой доставкой из Европы</p>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="catalog-grid">
      <p class="text-gray-500 text-center col-span-3 py-12">Загрузка каталога...</p>
    </div>
  </section>
`;

const catalogScript = `
  const loadCars = async () => {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;
    try {
      const res = await fetch('/api/cars');
      const cars = await res.json();
      grid.innerHTML = cars.map(car => \`
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
        <p>Наш офис находится в Волгограде, но мы доставляем автомобили клиентам по всей территории Российской Федерации.</p>
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
      grid.innerHTML = team.map(m => \`
        <div class="team-card">
          <div class="team-img-wrapper">
            <img src="\${m.image}" alt="\${m.name}" class="team-img" loading="lazy" />
          </div>
          <h3 class="team-name">\${m.name}</h3>
        </div>
      \`).join('');
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
            Адрес: 400075, Волгоградская область, г. Волгоград, ул. Историческая, д. 140А, офис 1
          </p>
        </div>
      </div>
      
      <!-- Interactive Map container -->
      <div class="lg:col-span-2">
        <div class="rounded-2xl border border-white/5 overflow-hidden h-[450px] shadow-2xl relative">
          <!-- Embedded Yandex Map with dark mode invert filter -->
          <iframe 
            src="https://yandex.ru/map-widget/v1/?ll=44.4754%2C48.7490&z=16&mode=search&ol=geo&uri=ymapsbm1%3A%2F%2Fgeo%2Fru%2Fvolgograd%2F53070438" 
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
