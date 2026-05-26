/* =========================================================
   templates.js — Библиотека шаблонов и логика вставки
   Зависит от: state.js, helpers.js, ui.js
   ========================================================= */

/* -------------------------------------------------------
   Библиотека шаблонов
   ------------------------------------------------------- */

const TEMPLATE_LIBRARY = [
  {
    category: '🧭 Навигация',
    items: [
      {
        id: 'navbar',
        name: 'Navbar',
        preview: `
          <div class="tpv-row">
            <div class="tpv-rect" style="width:20px;height:14px;"></div>
            <div style="flex:1"></div>
            <div class="tpv-row" style="gap:4px;width:auto">
              <div class="tpv-bar w30" style="height:5px"></div>
              <div class="tpv-bar w30" style="height:5px"></div>
              <div class="tpv-bar w30" style="height:5px"></div>
            </div>
            <div style="flex:1"></div>
            <div class="tpv-btn" style="width:30px;height:14px;"></div>
          </div>`,
        html: `<nav style="display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-bottom:1px solid #eee;">
  <div class="ai-tpl-rect" style="width:80px;height:28px;"></div>
  <div style="display:flex;gap:20px;align-items:center;">
    <div class="ai-tpl-bar short"></div>
    <div class="ai-tpl-bar short"></div>
    <div class="ai-tpl-bar short"></div>
    <div class="ai-tpl-bar short"></div>
  </div>
  <div class="ai-tpl-btn" style="width:90px;height:34px;"></div>
</nav>`
      },
      {
        id: 'sidebar',
        name: 'Sidebar',
        preview: `
          <div class="tpv-row" style="gap:3px;align-items:stretch;">
            <div class="tpv-rect" style="width:14px;height:36px;"></div>
            <div class="tpv-col">
              <div class="tpv-bar"></div>
              <div class="tpv-bar w60"></div>
              <div class="tpv-bar"></div>
            </div>
          </div>`,
        html: `<div style="display:flex;gap:0;min-height:200px;">
  <aside style="width:200px;border-right:1px solid #eee;padding:16px;display:flex;flex-direction:column;gap:8px;">
    <div class="ai-tpl-bar"></div>
    <div class="ai-tpl-bar short"></div>
    <div class="ai-tpl-bar"></div>
    <div class="ai-tpl-bar short"></div>
    <div class="ai-tpl-bar"></div>
  </aside>
  <main style="flex:1;padding:16px;">
    <div class="ai-tpl-bar short"></div>
  </main>
</div>`
      },
      {
        id: 'tabs',
        name: 'Tabs',
        preview: `
          <div class="tpv-col">
            <div class="tpv-row" style="gap:3px">
              <div class="tpv-btn" style="width:24px;height:10px;"></div>
              <div class="tpv-btn" style="width:24px;height:10px;opacity:0.4"></div>
              <div class="tpv-btn" style="width:24px;height:10px;opacity:0.4"></div>
            </div>
            <div class="tpv-rect" style="width:100%;height:22px;"></div>
          </div>`,
        html: `<div>
  <div style="display:flex;border-bottom:2px solid #eee;gap:0;">
    <div class="ai-tpl-btn" style="width:80px;height:36px;border-radius:4px 4px 0 0;margin-bottom:-2px;"></div>
    <div class="ai-tpl-btn" style="width:80px;height:36px;border-radius:4px 4px 0 0;opacity:0.3;"></div>
    <div class="ai-tpl-btn" style="width:80px;height:36px;border-radius:4px 4px 0 0;opacity:0.3;"></div>
  </div>
  <div style="padding:16px;">
    <div class="ai-tpl-bar"></div>
    <div class="ai-tpl-bar short" style="margin-top:8px;"></div>
  </div>
</div>`
      },
      {
        id: 'breadcrumbs',
        name: 'Breadcrumbs',
        preview: `
          <div class="tpv-row" style="gap:3px">
            <div class="tpv-bar w30" style="height:5px"></div>
            <div style="color:rgba(99,102,241,0.5);font-size:8px">/</div>
            <div class="tpv-bar w30" style="height:5px"></div>
            <div style="color:rgba(99,102,241,0.5);font-size:8px">/</div>
            <div class="tpv-bar w30" style="height:5px;opacity:0.5"></div>
          </div>`,
        html: `<nav aria-label="breadcrumb" style="padding:8px 0;">
  <div style="display:flex;align-items:center;gap:8px;">
    <div class="ai-tpl-bar xs"></div>
    <span style="color:#aaa;font-size:12px">/</span>
    <div class="ai-tpl-bar xs"></div>
    <span style="color:#aaa;font-size:12px">/</span>
    <div class="ai-tpl-bar xs" style="opacity:0.5"></div>
  </div>
</nav>`
      },
    ]
  },
  {
    category: '🦸 Герои/Баннеры',
    items: [
      {
        id: 'hero-center',
        name: 'Hero (центр)',
        preview: `
          <div class="tpv-col" style="align-items:center;gap:3px">
            <div class="tpv-bar w60" style="height:8px"></div>
            <div class="tpv-bar w40" style="height:5px"></div>
            <div class="tpv-btn" style="width:35px;height:10px;margin-top:2px"></div>
          </div>`,
        html: `<section style="text-align:center;padding:64px 24px;display:flex;flex-direction:column;align-items:center;gap:16px;">
  <div class="ai-tpl-bar" style="width:320px;height:40px;"></div>
  <div class="ai-tpl-bar" style="width:480px;height:18px;"></div>
  <div class="ai-tpl-bar short" style="width:380px;height:18px;"></div>
  <div style="display:flex;gap:12px;margin-top:8px;">
    <div class="ai-tpl-btn" style="width:120px;height:42px;"></div>
    <div class="ai-tpl-btn" style="width:120px;height:42px;opacity:0.4;"></div>
  </div>
</section>`
      },
      {
        id: 'hero-split',
        name: 'Hero (split)',
        preview: `
          <div class="tpv-row" style="gap:3px;align-items:center">
            <div class="tpv-col" style="gap:3px">
              <div class="tpv-bar"></div>
              <div class="tpv-bar w60"></div>
              <div class="tpv-btn" style="width:30px;height:8px"></div>
            </div>
            <div class="tpv-img" style="width:28px;height:32px;flex-shrink:0">🖼</div>
          </div>`,
        html: `<section style="display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:32px;padding:48px 24px;">
  <div style="display:flex;flex-direction:column;gap:14px;">
    <div class="ai-tpl-bar" style="height:36px;"></div>
    <div class="ai-tpl-bar short"></div>
    <div class="ai-tpl-bar xs"></div>
    <div class="ai-tpl-btn" style="width:130px;height:40px;margin-top:8px;"></div>
  </div>
  <div class="ai-tpl-img" style="width:100%;height:200px;">🖼</div>
</section>`
      },
      {
        id: 'hero-banner',
        name: 'Баннер',
        preview: `
          <div class="tpv-rect" style="width:100%;height:36px;display:flex;align-items:center;justify-content:center;">
            <div class="tpv-bar w60" style="height:7px"></div>
          </div>`,
        html: `<div class="ai-tpl-img" style="width:100%;height:160px;border-radius:8px;">
  <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
    <div class="ai-tpl-bar" style="width:280px;height:28px;background:rgba(255,255,255,0.3);"></div>
    <div class="ai-tpl-btn" style="width:110px;height:36px;background:rgba(255,255,255,0.5);"></div>
  </div>
</div>`
      },
    ]
  },
  {
    category: '🃏 Карточки',
    items: [
      {
        id: 'card-grid-2',
        name: 'Grid 2 col',
        preview: `
          <div class="tpv-grid c2">
            <div class="tpv-card"><div class="tpv-bar"></div><div class="tpv-bar w60"></div></div>
            <div class="tpv-card"><div class="tpv-bar"></div><div class="tpv-bar w60"></div></div>
          </div>`,
        html: `<div class="ai-tpl-grid cols-2" style="padding:16px;">
  ${[1,2].map(() => `<div class="ai-tpl-card">
    <div class="ai-tpl-img" style="height:80px;">🖼</div>
    <div class="ai-tpl-bar" style="margin-top:8px;"></div>
    <div class="ai-tpl-bar short"></div>
    <div class="ai-tpl-bar xs"></div>
    <div class="ai-tpl-btn" style="width:80px;height:30px;margin-top:6px;"></div>
  </div>`).join('\n')}
</div>`
      },
      {
        id: 'card-grid-3',
        name: 'Grid 3 col',
        preview: `
          <div class="tpv-grid c3">
            <div class="tpv-card"><div class="tpv-bar"></div><div class="tpv-bar w60"></div></div>
            <div class="tpv-card"><div class="tpv-bar"></div><div class="tpv-bar w60"></div></div>
            <div class="tpv-card"><div class="tpv-bar"></div><div class="tpv-bar w60"></div></div>
          </div>`,
        html: `<div class="ai-tpl-grid cols-3" style="padding:16px;">
  ${[1,2,3].map(() => `<div class="ai-tpl-card">
    <div class="ai-tpl-img" style="height:70px;">🖼</div>
    <div class="ai-tpl-bar" style="margin-top:6px;"></div>
    <div class="ai-tpl-bar short"></div>
    <div class="ai-tpl-btn" style="width:70px;height:28px;margin-top:6px;"></div>
  </div>`).join('\n')}
</div>`
      },
      {
        id: 'feature-cards',
        name: 'Feature Cards',
        preview: `
          <div class="tpv-grid c3">
            ${[1,2,3].map(() => `<div class="tpv-card" style="align-items:center">
              <div class="tpv-circle" style="width:16px;height:16px"></div>
              <div class="tpv-bar w60"></div>
              <div class="tpv-bar xs"></div>
            </div>`).join('')}
          </div>`,
        html: `<div class="ai-tpl-grid cols-3" style="padding:16px;">
  ${[1,2,3].map(() => `<div class="ai-tpl-card" style="align-items:center;text-align:center;">
    <div class="ai-tpl-circle" style="width:48px;height:48px;"></div>
    <div class="ai-tpl-bar short" style="margin-top:10px;"></div>
    <div class="ai-tpl-bar xs"></div>
    <div class="ai-tpl-bar xs"></div>
  </div>`).join('\n')}
</div>`
      },
      {
        id: 'pricing',
        name: 'Pricing Cards',
        preview: `
          <div class="tpv-grid c3">
            ${[1,2,3].map((i) => `<div class="tpv-card" style="${i===2?'border:1px solid rgba(99,102,241,0.5)':''}">
              <div class="tpv-bar w40"></div>
              <div class="tpv-bar w60" style="height:8px"></div>
              <div class="tpv-btn" style="height:8px"></div>
            </div>`).join('')}
          </div>`,
        html: `<div class="ai-tpl-grid cols-3" style="padding:16px;align-items:start;">
  ${[1,2,3].map((i) => `<div class="ai-tpl-card" style="${i===2?'border-color:rgba(99,102,241,0.5);':''}" >
    <div class="ai-tpl-bar xs"></div>
    <div class="ai-tpl-bar" style="height:30px;margin:8px 0;"></div>
    <div class="ai-tpl-bar xs"></div>
    <div class="ai-tpl-bar xs"></div>
    <div class="ai-tpl-bar xs"></div>
    <div class="ai-tpl-btn" style="width:100%;height:36px;margin-top:12px;"></div>
  </div>`).join('\n')}
</div>`
      },
      {
        id: 'testimonials',
        name: 'Testimonials',
        preview: `
          <div class="tpv-grid c2">
            ${[1,2].map(() => `<div class="tpv-card">
              <div class="tpv-row"><div class="tpv-circle" style="width:12px;height:12px"></div><div class="tpv-bar w60"></div></div>
              <div class="tpv-bar xs"></div>
            </div>`).join('')}
          </div>`,
        html: `<div class="ai-tpl-grid cols-2" style="padding:16px;">
  ${[1,2,3,4].map(() => `<div class="ai-tpl-card">
    <div class="ai-tpl-bar xs"></div>
    <div class="ai-tpl-bar xs"></div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:10px;">
      <div class="ai-tpl-circle" style="width:32px;height:32px;flex-shrink:0;"></div>
      <div style="flex:1;">
        <div class="ai-tpl-bar xs"></div>
        <div class="ai-tpl-bar xs" style="width:50%;margin-top:4px;"></div>
      </div>
    </div>
  </div>`).join('\n')}
</div>`
      },
    ]
  },
  {
    category: '📝 Формы',
    items: [
      {
        id: 'contact-form',
        name: 'Contact Form',
        preview: `
          <div class="tpv-col">
            <div class="tpv-row"><div class="tpv-input" style="flex:1"></div><div class="tpv-input" style="flex:1"></div></div>
            <div class="tpv-input" style="width:100%"></div>
            <div class="tpv-rect" style="width:100%;height:20px"></div>
            <div class="tpv-btn" style="width:40px"></div>
          </div>`,
        html: `<form style="display:flex;flex-direction:column;gap:12px;max-width:480px;padding:16px;">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    <div style="display:flex;flex-direction:column;gap:4px;">
      <div class="ai-tpl-bar xs" style="width:60px;"></div>
      <div class="ai-tpl-input"></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;">
      <div class="ai-tpl-bar xs" style="width:60px;"></div>
      <div class="ai-tpl-input"></div>
    </div>
  </div>
  <div style="display:flex;flex-direction:column;gap:4px;">
    <div class="ai-tpl-bar xs" style="width:80px;"></div>
    <div class="ai-tpl-input"></div>
  </div>
  <div style="display:flex;flex-direction:column;gap:4px;">
    <div class="ai-tpl-bar xs" style="width:80px;"></div>
    <div class="ai-tpl-rect" style="height:80px;border:1px solid rgba(99,102,241,0.3);"></div>
  </div>
  <div class="ai-tpl-btn" style="width:120px;height:38px;"></div>
</form>`
      },
      {
        id: 'login-form',
        name: 'Login Form',
        preview: `
          <div class="tpv-col" style="align-items:center;gap:3px">
            <div class="tpv-bar w60" style="height:8px"></div>
            <div class="tpv-input" style="width:100%"></div>
            <div class="tpv-input" style="width:100%"></div>
            <div class="tpv-btn" style="width:100%;height:10px"></div>
          </div>`,
        html: `<div style="max-width:360px;margin:0 auto;padding:24px;border:1px solid rgba(99,102,241,0.2);border-radius:10px;">
  <div class="ai-tpl-bar" style="width:140px;height:24px;margin:0 auto 20px;"></div>
  <div style="display:flex;flex-direction:column;gap:12px;">
    <div style="display:flex;flex-direction:column;gap:4px;">
      <div class="ai-tpl-bar xs" style="width:50px;"></div>
      <div class="ai-tpl-input"></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;">
      <div class="ai-tpl-bar xs" style="width:60px;"></div>
      <div class="ai-tpl-input"></div>
    </div>
    <div class="ai-tpl-btn" style="width:100%;height:40px;margin-top:8px;"></div>
    <div class="ai-tpl-bar xs" style="width:140px;margin:0 auto;"></div>
  </div>
</div>`
      },
      {
        id: 'search-bar',
        name: 'Search Bar',
        preview: `
          <div class="tpv-row" style="gap:3px">
            <div class="tpv-input" style="flex:1"></div>
            <div class="tpv-btn" style="width:22px;height:14px"></div>
          </div>`,
        html: `<div style="display:flex;gap:8px;max-width:480px;padding:8px 0;">
  <div class="ai-tpl-input" style="flex:1;height:40px;"></div>
  <div class="ai-tpl-btn" style="width:80px;height:40px;flex-shrink:0;"></div>
</div>`
      },
      {
        id: 'newsletter',
        name: 'Newsletter',
        preview: `
          <div class="tpv-col" style="align-items:center;gap:3px">
            <div class="tpv-bar w40" style="height:7px"></div>
            <div class="tpv-row" style="gap:3px;width:100%">
              <div class="tpv-input" style="flex:1"></div>
              <div class="tpv-btn" style="width:28px"></div>
            </div>
          </div>`,
        html: `<section style="text-align:center;padding:40px 24px;border:1px solid rgba(99,102,241,0.2);border-radius:12px;">
  <div class="ai-tpl-bar" style="width:200px;height:24px;margin:0 auto 8px;"></div>
  <div class="ai-tpl-bar xs" style="width:320px;margin:0 auto 20px;"></div>
  <div style="display:flex;gap:8px;max-width:400px;margin:0 auto;">
    <div class="ai-tpl-input" style="flex:1;height:40px;"></div>
    <div class="ai-tpl-btn" style="width:110px;height:40px;flex-shrink:0;"></div>
  </div>
</section>`
      },
    ]
  },
  {
    category: '📄 Контент',
    items: [
      {
        id: 'text-image',
        name: 'Text + Image',
        preview: `
          <div class="tpv-row" style="gap:3px;align-items:center">
            <div class="tpv-col" style="gap:3px;flex:1">
              <div class="tpv-bar"></div>
              <div class="tpv-bar w60"></div>
              <div class="tpv-bar xs"></div>
            </div>
            <div class="tpv-img" style="width:28px;height:28px;flex-shrink:0">🖼</div>
          </div>`,
        html: `<section style="display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center;padding:32px 24px;">
  <div style="display:flex;flex-direction:column;gap:12px;">
    <div class="ai-tpl-bar" style="height:28px;"></div>
    <div class="ai-tpl-bar short"></div>
    <div class="ai-tpl-bar xs"></div>
    <div class="ai-tpl-bar xs"></div>
    <div class="ai-tpl-btn" style="width:110px;height:36px;margin-top:8px;"></div>
  </div>
  <div class="ai-tpl-img" style="width:100%;height:180px;border-radius:8px;">🖼</div>
</section>`
      },
      {
        id: 'faq',
        name: 'FAQ',
        preview: `
          <div class="tpv-col" style="gap:3px">
            ${[1,2,3].map(() => `<div class="tpv-card" style="padding:4px 6px;">
              <div class="tpv-row"><div class="tpv-bar" style="flex:1"></div><div style="font-size:8px;color:rgba(99,102,241,0.5)">+</div></div>
            </div>`).join('')}
          </div>`,
        html: `<section style="max-width:600px;display:flex;flex-direction:column;gap:8px;padding:16px;">
  ${[1,2,3,4].map(() => `<div class="ai-tpl-card" style="padding:12px 16px;">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div class="ai-tpl-bar" style="width:70%;"></div>
      <div class="ai-tpl-circle" style="width:20px;height:20px;flex-shrink:0;"></div>
    </div>
  </div>`).join('\n')}
</section>`
      },
      {
        id: 'stats',
        name: 'Stats Row',
        preview: `
          <div class="tpv-grid c3" style="gap:4px">
            ${[1,2,3].map(() => `<div class="tpv-col" style="align-items:center;gap:2px">
              <div class="tpv-bar w40" style="height:9px"></div>
              <div class="tpv-bar w60" style="height:4px"></div>
            </div>`).join('')}
          </div>`,
        html: `<section style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:32px 24px;text-align:center;">
  ${[1,2,3,4].map(() => `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
    <div class="ai-tpl-bar" style="width:80px;height:36px;"></div>
    <div class="ai-tpl-bar xs" style="width:100px;"></div>
  </div>`).join('\n')}
</section>`
      },
      {
        id: 'timeline',
        name: 'Timeline',
        preview: `
          <div class="tpv-row" style="align-items:stretch;gap:3px">
            <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
              <div class="tpv-circle" style="width:8px;height:8px"></div>
              <div style="flex:1;width:1px;background:rgba(99,102,241,0.3)"></div>
              <div class="tpv-circle" style="width:8px;height:8px"></div>
            </div>
            <div class="tpv-col" style="gap:6px">
              <div class="tpv-bar w40"></div>
              <div class="tpv-bar xs" style="margin-bottom:4px"></div>
              <div class="tpv-bar w40"></div>
              <div class="tpv-bar xs"></div>
            </div>
          </div>`,
        html: `<section style="padding:16px 24px;">
  ${[1,2,3].map(() => `<div style="display:flex;gap:16px;padding-bottom:20px;">
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div class="ai-tpl-circle" style="width:14px;height:14px;flex-shrink:0;"></div>
      <div style="width:2px;flex:1;background:rgba(99,102,241,0.2);margin-top:4px;"></div>
    </div>
    <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
      <div class="ai-tpl-bar xs" style="width:80px;"></div>
      <div class="ai-tpl-bar short"></div>
      <div class="ai-tpl-bar xs"></div>
    </div>
  </div>`).join('\n')}
</section>`
      },
    ]
  },
  {
    category: '🖼 Медиа',
    items: [
      {
        id: 'gallery-3',
        name: 'Gallery 3×2',
        preview: `
          <div class="tpv-grid c3" style="gap:2px">
            ${[1,2,3,4,5,6].map(() => `<div class="tpv-img" style="height:14px">🖼</div>`).join('')}
          </div>`,
        html: `<section style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:16px;">
  ${[1,2,3,4,5,6].map(() => `<div class="ai-tpl-img" style="height:120px;border-radius:6px;">🖼</div>`).join('\n')}
</section>`
      },
      {
        id: 'video-placeholder',
        name: 'Video',
        preview: `
          <div class="tpv-img" style="width:100%;height:32px;">
            ▶
          </div>`,
        html: `<div class="ai-tpl-img" style="width:100%;padding-top:56.25%;position:relative;border-radius:8px;">
  <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:32px;color:rgba(99,102,241,0.4);">▶</div>
</div>`
      },
      {
        id: 'carousel',
        name: 'Carousel',
        preview: `
          <div class="tpv-row" style="align-items:center;gap:2px">
            <div style="font-size:8px;color:rgba(99,102,241,0.4)">‹</div>
            <div class="tpv-img" style="flex:1;height:32px">🖼</div>
            <div style="font-size:8px;color:rgba(99,102,241,0.4)">›</div>
          </div>`,
        html: `<div style="position:relative;overflow:hidden;border-radius:8px;">
  <div class="ai-tpl-img" style="width:100%;height:200px;">🖼 Слайд 1</div>
  <div style="position:absolute;left:12px;top:50%;transform:translateY(-50%);">
    <div class="ai-tpl-btn" style="width:36px;height:36px;border-radius:50%;opacity:0.7;"></div>
  </div>
  <div style="position:absolute;right:12px;top:50%;transform:translateY(-50%);">
    <div class="ai-tpl-btn" style="width:36px;height:36px;border-radius:50%;opacity:0.7;"></div>
  </div>
  <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:6px;">
    ${[1,2,3].map(i => `<div class="ai-tpl-circle" style="width:8px;height:8px;${i===1?'':'opacity:0.4'}"></div>`).join('')}
  </div>
</div>`
      },
    ]
  },
  {
    category: '📌 Футер',
    items: [
      {
        id: 'footer-simple',
        name: 'Simple Footer',
        preview: `
          <div class="tpv-col" style="gap:2px">
            <div style="height:1px;background:rgba(99,102,241,0.2);width:100%"></div>
            <div class="tpv-row" style="justify-content:space-between">
              <div class="tpv-bar xs" style="width:40%"></div>
              <div class="tpv-row" style="gap:2px;width:auto">
                <div class="tpv-bar xs" style="width:16px"></div>
                <div class="tpv-bar xs" style="width:16px"></div>
              </div>
            </div>
          </div>`,
        html: `<footer style="border-top:1px solid rgba(99,102,241,0.2);padding:20px 24px;display:flex;align-items:center;justify-content:space-between;">
  <div class="ai-tpl-bar xs" style="width:160px;"></div>
  <div style="display:flex;gap:16px;">
    <div class="ai-tpl-bar xs" style="width:60px;"></div>
    <div class="ai-tpl-bar xs" style="width:60px;"></div>
    <div class="ai-tpl-bar xs" style="width:60px;"></div>
  </div>
  <div style="display:flex;gap:8px;">
    <div class="ai-tpl-circle" style="width:24px;height:24px;"></div>
    <div class="ai-tpl-circle" style="width:24px;height:24px;"></div>
    <div class="ai-tpl-circle" style="width:24px;height:24px;"></div>
  </div>
</footer>`
      },
      {
        id: 'footer-rich',
        name: 'Rich Footer',
        preview: `
          <div class="tpv-col" style="gap:2px">
            <div class="tpv-grid c3" style="gap:3px">
              ${[1,2,3].map(() => `<div class="tpv-col" style="gap:2px">
                <div class="tpv-bar xs" style="width:50%"></div>
                <div class="tpv-bar xs" style="opacity:0.5"></div>
                <div class="tpv-bar xs" style="opacity:0.5"></div>
              </div>`).join('')}
            </div>
            <div style="height:1px;background:rgba(99,102,241,0.2);width:100%;margin-top:3px"></div>
            <div class="tpv-bar xs" style="width:40%;margin:0 auto"></div>
          </div>`,
        html: `<footer style="padding:40px 24px 20px;border-top:1px solid rgba(99,102,241,0.15);">
  <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:24px;margin-bottom:32px;">
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div class="ai-tpl-rect" style="width:80px;height:28px;"></div>
      <div class="ai-tpl-bar xs"></div>
      <div class="ai-tpl-bar xs"></div>
      <div style="display:flex;gap:8px;margin-top:4px;">
        <div class="ai-tpl-circle" style="width:24px;height:24px;"></div>
        <div class="ai-tpl-circle" style="width:24px;height:24px;"></div>
        <div class="ai-tpl-circle" style="width:24px;height:24px;"></div>
      </div>
    </div>
    ${[1,2,3].map(() => `<div style="display:flex;flex-direction:column;gap:8px;">
      <div class="ai-tpl-bar xs" style="width:70%;"></div>
      <div class="ai-tpl-bar xs" style="opacity:0.6;"></div>
      <div class="ai-tpl-bar xs" style="opacity:0.6;"></div>
      <div class="ai-tpl-bar xs" style="opacity:0.6;"></div>
    </div>`).join('\n')}
  </div>
  <div style="border-top:1px solid rgba(99,102,241,0.1);padding-top:16px;display:flex;justify-content:space-between;">
    <div class="ai-tpl-bar xs" style="width:160px;"></div>
    <div class="ai-tpl-bar xs" style="width:120px;"></div>
  </div>
</footer>`
      },
    ]
  },
];

/* -------------------------------------------------------
   Переключение режима шаблонов
   ------------------------------------------------------- */

function toggleTemplatesPanel() {
  if (!shadowRoot) return;
  const panel = shadowRoot.querySelector('.templates-panel');
  if (!panel) return;

  const isVisible = panel.classList.contains('visible');
  if (isVisible) {
    _closeTemplatesPanel();
  } else {
    _openTemplatesPanel();
  }
}

function _openTemplatesPanel() {
  if (!shadowRoot) return;
  const panel = shadowRoot.querySelector('.templates-panel');
  if (!panel) return;
  panel.classList.add('visible');

  const btn = shadowRoot.getElementById('btn-toggle-templates');
  if (btn) { btn.className = 'btn-toggle-templates active'; btn.innerHTML = '<span>⏹</span> Шаблоны'; }

  updateMasterPanelUI();
}

function _closeTemplatesPanel() {
  if (!shadowRoot) return;
  const panel = shadowRoot.querySelector('.templates-panel');
  if (!panel) return;
  panel.classList.remove('visible');

  // Отменяем режим вставки
  if (isTemplateMode) _cancelInsertMode();

  const btn = shadowRoot.getElementById('btn-toggle-templates');
  if (btn) { btn.className = 'btn-toggle-templates'; btn.innerHTML = '<span>📐</span> Шаблоны'; }

  updateMasterPanelUI();
}

/* -------------------------------------------------------
   Режим вставки шаблона
   ------------------------------------------------------- */

function _startInsertMode(templateData) {
  isTemplateMode      = true;
  insertingTemplateData = templateData;

  // Показываем подсказку
  const hint = shadowRoot && shadowRoot.querySelector('.tp-insert-hint');
  if (hint) {
    hint.classList.add('active');
    hint.innerHTML = `🎯 Кликните на контейнер, в который хотите вставить <strong>${templateData.name}</strong>. <em>Esc — отменить</em>`;
  }

  // Помечаем карточку как активную
  if (shadowRoot) {
    shadowRoot.querySelectorAll('.tp-card').forEach(c => c.classList.remove('inserting'));
    const card = shadowRoot.querySelector(`[data-tpl-id="${templateData.id}"]`);
    if (card) card.classList.add('inserting');
  }

  document.addEventListener('click',   _onInsertClick,   true);
  document.addEventListener('mouseover', _onInsertHover, true);
  document.addEventListener('mouseout',  _onInsertLeave, true);
  document.addEventListener('keydown',  _onInsertKeyDown, true);

  document.body.style.cursor = 'crosshair';
  showToastNotification(`Выберите контейнер для «${templateData.name}»`);
}

function _cancelInsertMode() {
  isTemplateMode        = false;
  insertingTemplateData = null;

  document.removeEventListener('click',    _onInsertClick,   true);
  document.removeEventListener('mouseover', _onInsertHover,  true);
  document.removeEventListener('mouseout',  _onInsertLeave,  true);
  document.removeEventListener('keydown',  _onInsertKeyDown, true);

  document.body.style.cursor = 'default';

  const hint = shadowRoot && shadowRoot.querySelector('.tp-insert-hint');
  if (hint) hint.classList.remove('active');

  if (shadowRoot) {
    shadowRoot.querySelectorAll('.tp-card').forEach(c => c.classList.remove('inserting'));
  }
}

function _onInsertHover(e) {
  if (!isTemplateMode) return;
  if (_isExtensionEl(e.target)) return;
  if (e.target === document.body || e.target === document.documentElement) return;
  e.target.classList.add('ai-selector-template-target');
}

function _onInsertLeave(e) {
  if (!isTemplateMode) return;
  if (e.target) e.target.classList.remove('ai-selector-template-target');
}

function _onInsertClick(e) {
  if (!isTemplateMode || !insertingTemplateData) return;
  if (_isExtensionEl(e.target)) return;

  e.preventDefault();
  e.stopPropagation();

  const container = e.target === document.body || e.target === document.documentElement
    ? document.body
    : e.target;

  container.classList.remove('ai-selector-template-target');

  _insertTemplate(insertingTemplateData, container);
  _cancelInsertMode();
  _updateTemplatesCopyBtn();
}

function _onInsertKeyDown(e) {
  if (e.key === 'Escape') {
    _cancelInsertMode();
    showToastNotification('Вставка отменена');
  }
}

/* -------------------------------------------------------
   Вставка шаблона в DOM
   ------------------------------------------------------- */

function _insertTemplate(templateData, container) {
  // Создаём wrapper с wireframe-стилями
  const wrapper = document.createElement('div');
  wrapper.className = 'ai-selector-template-block';
  wrapper.dataset.tplInstance = templateData.id;

  // Подпись
  const label = document.createElement('div');
  label.className   = 'ai-selector-template-label';
  label.textContent = `[${templateData.name.toUpperCase()}]`;
  wrapper.appendChild(label);

  // Внутренняя разметка шаблона
  const inner = document.createElement('div');
  inner.style.cssText = 'width:100%;pointer-events:none;';
  inner.innerHTML     = templateData.html;
  wrapper.appendChild(inner);

  // Кнопка удаления
  const removeBtn = document.createElement('button');
  removeBtn.className   = 'ai-selector-template-remove';
  removeBtn.textContent = '✕ Удалить';
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const instanceId = wrapper.dataset.instanceId;
    insertedTemplates = insertedTemplates.filter(t => t.id !== instanceId);
    wrapper.remove();
    _updateTemplatesCopyBtn();
    showToastNotification('Шаблон удалён');
  });
  wrapper.appendChild(removeBtn);

  // Регистрируем
  const instanceId = `tpl-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  wrapper.dataset.instanceId = instanceId;

  insertedTemplates.push({
    id:       instanceId,
    label:    templateData.name,
    selector: getUniqueCssSelector(container),
    container
  });

  container.appendChild(wrapper);

  showToastNotification(`Шаблон «${templateData.name}» вставлен`);
  _updateTemplatesCopyBtn();
}

/* -------------------------------------------------------
   Копирование промпта по шаблонам
   ------------------------------------------------------- */

async function copyTemplatesPrompt() {
  if (!insertedTemplates.length) return;

  let prompt = `URL: ${window.location.href}\n\n`;
  prompt += `📐 ШАБЛОНЫ ДЛЯ РЕАЛИЗАЦИИ:\n`;
  prompt += `На странице добавлены следующие wireframe-шаблоны. Пожалуйста, реализуй каждый из них в стиле данного сайта.\n\n`;

  insertedTemplates.forEach((t, i) => {
    const container = t.container;
    let containerDesc = t.selector;
    if (container && container !== document.body) {
      const containerHtml = container.outerHTML;
      const shortHtml = containerHtml.length > 400
        ? containerHtml.substring(0, 300) + '\n...'
        : containerHtml;
      prompt += `${i + 1}. Шаблон: **${t.label}**\n`;
      prompt += `   Вставить внутрь: \`${containerDesc}\`\n`;
      prompt += `   HTML контейнера:\n\`\`\`html\n${shortHtml}\n\`\`\`\n\n`;
    } else {
      prompt += `${i + 1}. Шаблон: **${t.label}**\n`;
      prompt += `   Вставить в: \`${containerDesc}\`\n\n`;
    }
  });

  prompt += `\nЗадача:\n`;
  prompt += `1. Удалить все wireframe-блоки (элементы с классом \`ai-selector-template-block\`).\n`;
  prompt += `2. Реализовать каждый шаблон в виде полноценного HTML/CSS-блока, используя дизайн-систему данного сайта.\n`;
  prompt += `3. Убедиться, что блоки визуально согласованы с остальным содержимым страницы.`;

  try {
    await navigator.clipboard.writeText(prompt.trim());
    showToastNotification(`Промпт скопирован (${insertedTemplates.length} шаблонов)`);

    const btn = shadowRoot?.querySelector('.tp-copy-btn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '<span>✅</span> Скопировано!';
      btn.style.background    = 'linear-gradient(135deg,rgba(16,185,129,0.3),rgba(5,150,105,0.3))';
      btn.style.borderColor   = '#10b981';
      btn.style.color         = '#34d399';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background  = '';
        btn.style.borderColor = '';
        btn.style.color       = '';
      }, 1500);
    }
  } catch(err) {
    console.error('AI Annotator: ошибка копирования', err);
    alert('Не удалось скопировать. Предоставьте разрешение буфера обмена.');
  }
}

function _updateTemplatesCopyBtn() {
  if (!shadowRoot) return;
  const btn = shadowRoot.querySelector('.tp-copy-btn');
  if (btn) {
    btn.disabled = insertedTemplates.length === 0;
    const countSpan = btn.querySelector('.tpl-count');
    if (countSpan) countSpan.textContent = insertedTemplates.length > 0 ? ` (${insertedTemplates.length})` : '';
  }
}

/* -------------------------------------------------------
   Построение HTML Templates Panel
   ------------------------------------------------------- */

function buildTemplatesPanel() {
  if (!shadowRoot) return;
  const panel = shadowRoot.querySelector('.templates-panel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="tp-header">
      <div class="tp-title">📐 Шаблоны</div>
      <button class="tp-close" id="tp-close-btn">✕</button>
    </div>
    <div class="tp-insert-hint"></div>
    <div class="tp-categories"></div>
    <div class="tp-actions">
      <button class="tp-copy-btn" disabled>
        <span>📋</span> Скопировать агенту<span class="tpl-count"></span>
      </button>
    </div>
  `;

  const categoriesEl = panel.querySelector('.tp-categories');

  TEMPLATE_LIBRARY.forEach(cat => {
    const catDiv = document.createElement('div');
    catDiv.className = 'tp-category';

    const catHeader = document.createElement('div');
    catHeader.className   = 'tp-cat-header';
    catHeader.innerHTML   = `${cat.category} <span class="tp-cat-arrow">▼</span>`;
    catDiv.appendChild(catHeader);

    const catBody = document.createElement('div');
    catBody.className = 'tp-cat-body';

    catHeader.addEventListener('click', () => {
      const collapsed = catBody.classList.toggle('collapsed');
      catHeader.querySelector('.tp-cat-arrow').textContent = collapsed ? '▶' : '▼';
    });

    cat.items.forEach(tpl => {
      const card = document.createElement('div');
      card.className = 'tp-card';
      card.dataset.tplId = tpl.id;
      card.innerHTML = `
        <div class="tp-card-preview">${tpl.preview}</div>
        <div class="tp-card-name">${tpl.name}</div>
      `;
      card.addEventListener('click', () => {
        if (insertingTemplateData && insertingTemplateData.id === tpl.id) {
          _cancelInsertMode();
          showToastNotification('Вставка отменена');
        } else {
          if (isTemplateMode) _cancelInsertMode();
          _startInsertMode(tpl);
        }
      });
      catBody.appendChild(card);
    });

    catDiv.appendChild(catBody);
    categoriesEl.appendChild(catDiv);
  });

  // Закрытие
  panel.querySelector('#tp-close-btn').addEventListener('click', _closeTemplatesPanel);

  // Кнопка копирования
  panel.querySelector('.tp-copy-btn').addEventListener('click', copyTemplatesPrompt);
}
