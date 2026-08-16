/* ═══════════════════════════════════════════════════════════════════════
       WARDROBE SHOP SYSTEM
    ═══════════════════════════════════════════════════════════════════════ */
    const SHOP_ITEMS = {
      characters: [
        { id:'kiki',   name:'Kiki',    lore:'The original witch courier of Port Koriko.',          art:'🧙‍♀️', premium:false, price:0,   currency:'free'     },
        { id:'tombo',  name:'Tombo',   lore:'Aviation obsessed with big red goggles.',             art:'🥽',  premium:false, price:300, currency:'stamps'   },
        { id:'osono',  name:'Osono',   lore:'Koriko\'s warmest baker, flour on her apron.',        art:'👩‍🍳', premium:false, price:500, currency:'stamps'   },
        { id:'ursula', name:'Ursula',  lore:'Forest painter who found magic in the trees.',        art:'🎨',  premium:true,  price:150, currency:'feathers' },
        { id:'jiji',   name:'Jiji',    lore:'Kiki\'s witty black cat takes flight solo.',          art:'🐱',  premium:true,  price:300, currency:'feathers' },
      ],
      brooms: [
        { id:'classic',  name:'Classic Bristle', lore:'The trusty broom, worn smooth by ten thousand flights.', art:'🧹', premium:false, price:0,   currency:'free'     },
        { id:'flower',   name:'Peony Glider',    lore:'Woven with dried peonies for good fortune.',             art:'🌸', premium:false, price:200, currency:'stamps'   },
        { id:'bamboo',   name:'Bamboo Racer',    lore:'Lightweight bamboo shafts for maximum speed feel.',      art:'🎋', premium:false, price:400, currency:'stamps'   },
        { id:'crystal',  name:'Crystal Wing',    lore:'Translucent shaft that hums with wind magic.',           art:'💎', premium:true,  price:120, currency:'feathers' },
        { id:'storm',    name:'Storm Rider',     lore:'Forged from driftwood of a legendary typhoon.',         art:'⛈️', premium:true,  price:220, currency:'feathers' },
      ],
      trails: [
        { id:'none',      name:'None',             lore:'Clean skies — let the world speak.',                   art:'🌀', premium:false, price:0,   currency:'free'     },
        { id:'blossoms',  name:'Cherry Blossoms',  lore:'Petals dance in your wake like a Ghibli scene.',      art:'🌸', premium:false, price:150, currency:'stamps'   },
        { id:'leaves',    name:'Autumn Leaves',    lore:'Warm amber and russet follow your every turn.',       art:'🍂', premium:false, price:250, currency:'stamps'   },
        { id:'stars',     name:'Golden Stars',     lore:'Tiny gold motes that shimmer like sunlit ocean.',     art:'⭐', premium:true,  price:80,  currency:'feathers' },
        { id:'sparkle',   name:'Witch Sparkle',    lore:'Pure witch-light — the mark of a true courier.',     art:'✨', premium:true,  price:180, currency:'feathers' },
      ],
    };

    // Persistence via localStorage
    const SS = {
      load(k, def) { try { return JSON.parse(localStorage.getItem('wwc_' + k)) ?? def; } catch { return def; } },
      save(k, v)   { try { localStorage.setItem('wwc_' + k, JSON.stringify(v)); } catch {} }
    };

    let shopOwned    = SS.load('owned',    { characters:['kiki'], brooms:['classic'], trails:['none'] });
    let shopEquipped = SS.load('equipped', { character:'kiki', broom:'classic', trail:'none' });
    let feathers     = SS.load('feathers', 0);

    // Pending confirm state
    let confirmPending = null;

    function shopSave() {
      SS.save('owned', shopOwned);
      SS.save('equipped', shopEquipped);
      SS.save('feathers', feathers);
    }

    function updateFeatherUI() {
      const el = document.getElementById('ui-feathers');
      const sb = document.getElementById('shop-feathers-bal');
      const ss = document.getElementById('shop-stamps-bal');
      if (el) el.textContent = feathers;
      if (sb) sb.textContent = feathers;
      if (ss) ss.textContent = totalStamps;
    }

    function shopShowSuccess(msg) {
      const t = document.getElementById('shop-success-toast');
      if (!t) return;
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2600);
    }

    function renderShopGrid(category, gridId) {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      grid.innerHTML = '';
      const items = SHOP_ITEMS[category];
      const owned = shopOwned[category] || [];
      const equipped = shopEquipped[category === 'characters' ? 'character' : category === 'brooms' ? 'broom' : 'trail'];

      items.forEach(item => {
        const isOwned    = owned.includes(item.id);
        const isEquipped = equipped === item.id;

        const card = document.createElement('div');
        card.className = 'shop-item-card' + (isEquipped ? ' equipped' : '') + (isOwned && !isEquipped ? ' owned' : '');

        const artBg = item.premium ? 'premium-art' : '';
        const premiumBadge = item.premium ? '<span class="item-premium-star">✨ PREMIUM</span>' : '';
        const equippedBadge = isEquipped ? '<span class="item-equipped-badge">✔ EQUIPPED</span>' : '';

        let priceHtml = '';
        let btnHtml = '';

        if (item.currency === 'free') {
          priceHtml = '<span class="price-free">🌿 Free</span>';
        } else if (item.currency === 'stamps') {
          priceHtml = `<span class="price-stamps">🥖 ${item.price}</span>`;
        } else {
          priceHtml = `<span class="price-feathers">✨ ${item.price}</span>`;
        }

        if (isEquipped) {
          btnHtml = '<button class="btn-shop-action btn-shop-equipped" disabled>✔ Equipped</button>';
        } else if (isOwned) {
          btnHtml = `<button class="btn-shop-action btn-shop-equip" onclick="shopEquip('${category}','${item.id}')">Equip</button>`;
        } else if (item.currency === 'free') {
          btnHtml = `<button class="btn-shop-action btn-shop-equip" onclick="shopEquip('${category}','${item.id}')">Equip Free</button>`;
        } else if (item.currency === 'stamps') {
          btnHtml = `<button class="btn-shop-action btn-shop-buy-stamps" onclick="shopBuyConfirm('${category}','${item.id}')">Buy — 🥖 ${item.price}</button>`;
        } else {
          btnHtml = `<button class="btn-shop-action btn-shop-buy-feathers" onclick="shopBuyConfirm('${category}','${item.id}')">Buy — ✨ ${item.price}</button>`;
        }

        card.innerHTML = `
          <div class="shop-item-art ${artBg}">
            ${premiumBadge}${equippedBadge}
            <span>${item.art}</span>
          </div>
          <div class="shop-item-info">
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-lore">${item.lore}</div>
            <div class="shop-item-price">${priceHtml}</div>
            ${btnHtml}
          </div>
        `;
        grid.appendChild(card);
      });
    }

    function shopEquip(category, id) {
      const key = category === 'characters' ? 'character' : category === 'brooms' ? 'broom' : 'trail';
      // Auto-own free items
      if (!shopOwned[category].includes(id)) shopOwned[category].push(id);
      shopEquipped[key] = id;
      shopSave();
      renderAllShopGrids();
      const item = SHOP_ITEMS[category].find(i => i.id === id);
      shopShowSuccess(`✔ ${item.name} equipped!`);
    }

    function shopBuyConfirm(category, id) {
      const item = SHOP_ITEMS[category].find(i => i.id === id);
      if (!item) return;
      confirmPending = { category, id, item };

      document.getElementById('confirm-art').textContent = item.art;
      document.getElementById('confirm-title').textContent = `Unlock ${item.name}`;
      document.getElementById('confirm-sub').textContent = item.lore;

      if (item.currency === 'stamps') {
        document.getElementById('confirm-price-icon').textContent = '🥖';
        document.getElementById('confirm-price-val').textContent = item.price + ' Bread Stamps';
      } else {
        document.getElementById('confirm-price-icon').textContent = '✨';
        document.getElementById('confirm-price-val').textContent = item.price + ' Golden Feathers';
      }

      document.getElementById('shop-confirm-modal').classList.add('open');
    }

    function shopCompletePurchase() {
      if (!confirmPending) return;
      const { category, id, item } = confirmPending;

      if (item.currency === 'stamps') {
        if (totalStamps < item.price) {
          document.getElementById('shop-confirm-modal').classList.remove('open');
          shopShowSuccess(`❌ Need ${item.price - totalStamps} more 🥖`);
          confirmPending = null;
          return;
        }
        totalStamps -= item.price;
        document.getElementById('ui-stamps').textContent = totalStamps;
      } else {
        if (feathers < item.price) {
          document.getElementById('shop-confirm-modal').classList.remove('open');
          shopShowSuccess(`❌ Need ${item.price - feathers} more ✨`);
          confirmPending = null;
          return;
        }
        feathers -= item.price;
        updateFeatherUI();
      }

      shopOwned[category].push(id);
      const key = category === 'characters' ? 'character' : category === 'brooms' ? 'broom' : 'trail';
      shopEquipped[key] = id;
      shopSave();
      document.getElementById('shop-confirm-modal').classList.remove('open');
      renderAllShopGrids();
      updateFeatherUI();
      shopShowSuccess(`✨ ${item.name} unlocked & equipped!`);
      confirmPending = null;
      sound.playBadgeUnlocked && sound.playBadgeUnlocked();
    }

    function shopBuyFeatherBundle(feathersAmt, price, name) {
      document.getElementById('feathers-store-modal').classList.remove('open');
      // Simulate purchase (demo)
      feathers += feathersAmt;
      shopSave();
      updateFeatherUI();
      renderAllShopGrids();
      shopShowSuccess(`✨ +${feathersAmt} Golden Feathers added! (Demo)`);
    }

    function renderAllShopGrids() {
      renderShopGrid('characters', 'shop-chars-grid');
      renderShopGrid('brooms', 'shop-brooms-grid');
      renderShopGrid('trails', 'shop-trails-grid');
      updateFeatherUI();
    }

    // ── Shop wiring ──────────────────────────────────────────────────────────
    // Sub-tab switching
    document.querySelectorAll('.shop-sub-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shop-sub-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.shop-section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.getAttribute('data-shop-tab');
        const el = document.getElementById(target);
        if (el) el.classList.add('active');
      });
    });

    // Confirm modal buttons
    document.getElementById('btn-confirm-buy').addEventListener('click', shopCompletePurchase);
    document.getElementById('btn-confirm-cancel').addEventListener('click', () => {
      document.getElementById('shop-confirm-modal').classList.remove('open');
      confirmPending = null;
    });

    // Feathers store open/close
    document.getElementById('btn-open-feathers-store').addEventListener('click', () => {
      document.getElementById('feathers-store-modal').classList.add('open');
    });
    document.getElementById('btn-close-fstore').addEventListener('click', () => {
      document.getElementById('feathers-store-modal').classList.remove('open');
    });

    // Feather bundle clicks
    document.querySelectorAll('.fstore-bundle').forEach(b => {
      b.addEventListener('click', () => {
        shopBuyFeatherBundle(
          parseInt(b.dataset.feathers),
          parseFloat(b.dataset.price),
          b.dataset.name
        );
      });
    });

    // Close modals on backdrop click
    document.getElementById('shop-confirm-modal').addEventListener('click', function(e) {
      if (e.target === this) { this.classList.remove('open'); confirmPending = null; }
    });
    document.getElementById('feathers-store-modal').addEventListener('click', function(e) {
      if (e.target === this) this.classList.remove('open');
    });

    // Refresh shop bal when wardrobe tab is opened
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.getAttribute('data-tab') === 'tab-wardrobe') {
          renderAllShopGrids();
        }
      });
    });

    // ── Global Shop Opener & HUD Wiring ──────────────────────────────────────
    window.openWardrobeShop = function(targetShopTab = null) {
      const grandMenuModal = document.getElementById('grand-menu-modal');
      if (grandMenuModal) grandMenuModal.classList.add('open');

      // Switch to tab-wardrobe in journal modal
      document.querySelectorAll('.tab-btn').forEach(b => {
        if (b.dataset.tab === 'tab-wardrobe') b.classList.add('active');
        else b.classList.remove('active');
      });
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      const wardrobeTab = document.getElementById('tab-wardrobe');
      if (wardrobeTab) wardrobeTab.style.display = 'block';

      // Optional sub-tab switch (e.g. characters, brooms, trails)
      if (targetShopTab) {
        document.querySelectorAll('.shop-sub-tab').forEach(b => {
          if (b.getAttribute('data-shop-tab') === targetShopTab) b.classList.add('active');
          else b.classList.remove('active');
        });
        document.querySelectorAll('.shop-section').forEach(s => s.classList.remove('active'));
        const sec = document.getElementById(targetShopTab);
        if (sec) sec.classList.add('active');
      }

      renderAllShopGrids();
      if (typeof sound !== 'undefined' && sound.playCoin) sound.playCoin();
    };

    // Quick access button on top HUD bar
    const btnTopShop = document.getElementById('btn-top-shop-open');
    if (btnTopShop) {
      btnTopShop.addEventListener('click', () => openWardrobeShop());
    }

    // Clicking top currency badges
    const btnTopStamps = document.getElementById('btn-top-stamps');
    if (btnTopStamps) {
      btnTopStamps.addEventListener('click', () => openWardrobeShop());
    }

    const btnTopFeathers = document.getElementById('btn-top-feathers');
    if (btnTopFeathers) {
      btnTopFeathers.addEventListener('click', () => {
        document.getElementById('feathers-store-modal').classList.add('open');
        if (typeof sound !== 'undefined' && sound.playCoin) sound.playCoin();
      });
    }

    // Initial render
    renderAllShopGrids();
