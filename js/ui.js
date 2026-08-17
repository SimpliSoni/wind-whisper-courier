/* ==========================================================================
       7. GOALS, BADGES & COURIER RANK PROGRESSION
       ========================================================================== */
    const campaignQuests = [
      {
        chapter: 1,
        id: 'q1',
        title: 'Hot Morning Brioche',
        icon: '🥐',
        pickupId: 'bakery',
        pickupName: 'Guzior Bakery Porch',
        targetId: 'clocktower',
        targetName: 'Grand Clock Tower Balcony',
        desc: 'Pick up steaming brioche and land gracefully on the clocktower balcony.',
        baseTime: 60,
        quote: '"Ah, still steaming hot and crisp! The wind truly brought a blessing today."',
        stamps: 40
      },
      {
        chapter: 2,
        id: 'q2',
        title: "Madame's Pot Pie",
        icon: '🥧',
        pickupId: 'clocktower',
        pickupName: 'Grand Clock Tower Balcony',
        targetId: 'manor',
        targetName: "Madame's Seaside Manor Porch",
        desc: "Madame baked her fish pie. Catch chimney smoke updrafts to maintain warmth!",
        baseTime: 65,
        quote: '"Oh, look how warm and crisp the crust is! You are an absolute angel on a broomstick."',
        stamps: 50
      },
      {
        chapter: 3,
        id: 'q3',
        title: "Mountain Mint Tea",
        icon: '🍵',
        pickupId: 'manor',
        pickupName: "Madame's Seaside Manor Porch",
        targetId: 'windmill',
        targetName: 'Windmill Elder Terrace',
        desc: 'Elder Jiro has requested soothing herbal tea on the high breezy ridge.',
        baseTime: 60,
        quote: '"Such aromatic mountain mint! Your flying is as graceful as a swallow, child."',
        stamps: 55
      },
      {
        chapter: 4,
        id: 'q4',
        title: 'Beacon Optical Prism',
        icon: '✨',
        pickupId: 'windmill',
        pickupName: 'Windmill Elder Terrace',
        targetId: 'lighthouse',
        targetName: 'Cape Lighthouse Platform',
        desc: 'Deliver a freshly ground optical lens to keep shipping lanes safe.',
        baseTime: 60,
        quote: '"Splendid! With this prism, the coastal light will guide every fisherman safely home."',
        stamps: 60
      },
      {
        chapter: 5,
        id: 'q5',
        title: "Tombo's Aviation Blueprint",
        icon: '📐',
        pickupId: 'lighthouse',
        pickupName: 'Cape Lighthouse Platform',
        targetId: 'miyazaki_point',
        targetName: 'Hayao Miyazaki Memorial Point',
        desc: 'Fly out to the scenic bluff where Tombo tests his flying-bicycle.',
        baseTime: 60,
        quote: '"You flew all the way out here! Listen to the sea wind... it really does feel like magic."',
        stamps: 75
      },
      {
        chapter: 6,
        id: 'q6',
        title: 'Festival Jubilee Cake',
        icon: '🍓',
        pickupId: 'miyazaki_point',
        pickupName: 'Hayao Miyazaki Memorial Point',
        targetId: 'harbor',
        targetName: 'Grand Harbor Festival Pier',
        desc: 'The grand finale delivery! Glide across the open bay to deliver the cake.',
        baseTime: 65,
        quote: '"By the sea, that was flawless! Not a single strawberry shifted out of place! Master Courier!"',
        stamps: 100
      }
    ];

    const badges = [
      { id: 'first_flight', title: 'First Flight', icon: '🥐', desc: 'Complete your first delivery contract to Clocktower.', reward: 30, unlocked: false },
      { id: 'chimney_surfer', title: 'Chimney Surfer', icon: '🔥', desc: 'Catch 3 thermal chimney smoke updrafts in flight.', reward: 40, unlocked: false },
      { id: 'speed_demon', title: 'Speed Demon', icon: '⚡', desc: 'Reach 70+ KTS in a steep gravity dive.', reward: 50, unlocked: false },
      { id: 'slalom_ace', title: 'Slalom Ace', icon: '⭕', desc: 'Achieve a 4x or higher Sky Ring combo chain.', reward: 50, unlocked: false },
      { id: 'balloon_popper', title: 'Festival Popper', icon: '🎈', desc: 'Pop 5 festival balloons hovering over the town.', reward: 45, unlocked: false },
      { id: 'sparrow_whisperer', title: 'Sparrow Whisperer', icon: '🕊️', desc: 'Discover 3 hidden golden origami sparrows.', reward: 60, unlocked: false },
      { id: 'piping_hot', title: 'Piping Hot & Fresh', icon: '🥧', desc: 'Deliver a parcel with over 85% freshness intact.', reward: 55, unlocked: false },
      { id: 'acrobat', title: 'Master Acrobat', icon: '🌪️', desc: 'Perform 4 acrobatic barrel rolls in the air.', reward: 50, unlocked: false }
    ];

    let currentQuestIdx = 0;
    let activeQuest = campaignQuests[0];
    let questTimer = 60;
    let maxQuestTimer = 60;
    let parcelWarmth = 100.0;
    let totalStamps = 120;
    let foundSparrowsCount = 0;

    function updateCourierRank() {
      const score = flight.totalDeliveries * 30 + totalStamps + foundSparrowsCount * 25 + flight.balloonsPopped * 10;
      let rankName = 'Rank 1 Apprentice';
      if (score > 600) rankName = 'Rank 5 Master Witch';
      else if (score > 400) rankName = 'Rank 4 Ace Flier';
      else if (score > 250) rankName = 'Rank 3 Senior Courier';
      else if (score > 120) rankName = 'Rank 2 Town Courier';

      document.getElementById('rank-text-val').textContent = rankName;
    }

    function checkBadgeUnlock(badgeId) {
      const b = badges.find(x => x.id === badgeId);
      if (b && !b.unlocked) {
        b.unlocked = true;
        totalStamps += b.reward;
        document.getElementById('ui-stamps').textContent = totalStamps;
        sound.playBadgeUnlocked();
        showBadgeToast(b);
        renderBadges();
        updateCourierRank();
      }
    }

    function showBadgeToast(badge) {
      const container = document.getElementById('badge-toast-container');
      const toast = document.createElement('div');
      toast.className = 'badge-toast';
      toast.innerHTML = `
        <div style="font-size: 24px;">${badge.icon}</div>
        <div>
          <div style="font-size: 9.5px; font-weight: 800; color: var(--terracotta-sun);">BADGE UNLOCKED!</div>
          <strong style="font-size: 12px; color: var(--ink-navy);">${badge.title}</strong>
          <div style="font-size: 10.5px; color: var(--ink-muted);">+${badge.reward} Bread Stamps 🥖</div>
        </div>
      `;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 3800);
    }

    function applyDifficulty(mode) {
      flight.difficulty = mode;
      document.querySelectorAll('.diff-card-btn').forEach(b => b.classList.remove('selected'));

      if (mode === 'cozy') {
        maxQuestTimer = Math.round(activeQuest.baseTime * 1.35);
        flight.warmthDecayMult = 0.5;
        const c1 = document.getElementById('menu-diff-cozy'); if (c1) c1.classList.add('selected');
      } else if (mode === 'brisk') {
        maxQuestTimer = activeQuest.baseTime;
        flight.warmthDecayMult = 1.0;
        const c2 = document.getElementById('menu-diff-brisk'); if (c2) c2.classList.add('selected');
      } else if (mode === 'gale') {
        maxQuestTimer = Math.round(activeQuest.baseTime * 0.55);
        flight.warmthDecayMult = 1.8;
        const c3 = document.getElementById('menu-diff-gale'); if (c3) c3.classList.add('selected');
      }
      questTimer = maxQuestTimer;
    }

    window.selectDifficulty = function(mode) {
      applyDifficulty(mode);
    };

    function spawnFloatingText(text, x, y) {
      const el = document.createElement('div');
      el.className = 'floating-popup-txt';
      el.textContent = text;
      el.style.left = `${x || window.innerWidth / 2}px`;
      el.style.top = `${y || window.innerHeight / 2}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1200);
    }

    function triggerConfettiBurst() {
      const confLayer = document.getElementById('confetti-layer');
      confLayer.innerHTML = '';
      const colors = ['#FFD166', '#F4A261', '#E76F51', '#52B788', '#80CED7', '#F25C54'];
      for (let i = 0; i < 48; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'absolute';
        conf.style.width = `${6 + Math.random() * 8}px`;
        conf.style.height = `${6 + Math.random() * 8}px`;
        conf.style.background = colors[Math.floor(Math.random() * colors.length)];
        conf.style.left = '50%';
        conf.style.top = '40%';
        conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        conf.style.transform = `translate(${(Math.random() - 0.5) * 600}px, ${(Math.random() - 0.5) * 450}px) rotate(${Math.random() * 360}deg)`;
        conf.style.transition = `all ${0.8 + Math.random() * 0.8}s cubic-bezier(0.25, 1, 0.5, 1)`;
        confLayer.appendChild(conf);
        setTimeout(() => conf.remove(), 2000);
      }
    }

    function renderBadges() {
      const container = document.getElementById('badges-container-list');
      if (!container) return;
      container.innerHTML = '';
      let unlockedCount = 0;

      badges.forEach(b => {
        if (b.unlocked) unlockedCount++;
        const card = document.createElement('div');
        card.className = `badge-card ${b.unlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
          <div class="badge-icon-box">${b.icon}</div>
          <div class="badge-details">
            <div class="badge-title">
              <span>${b.title}</span>
              ${b.unlocked ? '<span style="color: var(--spring-grass); font-size: 11px;">✓ Unlocked</span>' : ''}
            </div>
            <div class="badge-desc">${b.desc}</div>
          </div>
          <div class="badge-reward">+${b.reward} 🥖</div>
        `;
        container.appendChild(card);
      });

      document.getElementById('badges-unlocked-count').textContent = `${unlockedCount}/${badges.length} Unlocked`;
    }

    function renderGrandMenu() {
      renderBadges();

      const campaignListEl = document.getElementById('campaign-quest-list');
      if (campaignListEl) {
        campaignListEl.innerHTML = '';
        campaignQuests.forEach((q, idx) => {
          const isCurrent = idx === currentQuestIdx;
          const isCompleted = idx < currentQuestIdx;
          const card = document.createElement('div');
          card.className = `quest-item-card ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`;
          card.onclick = () => { setQuest(idx); toggleGrandMenuModal(); };
          card.innerHTML = `
            <div>
              <div style="font-size: 9.5px; font-weight: 800; color: var(--terracotta-sun);">CHAPTER ${q.chapter} ${isCompleted ? '✓ COMPLETED' : (isCurrent ? '• ACTIVE' : '')}</div>
              <strong style="font-size: 13px; color: var(--ink-navy);">${q.icon} ${q.title}</strong>
              <div style="font-size: 11px; color: var(--ink-muted); margin-top: 2px;">${q.desc}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11.5px; font-weight: 800; color: var(--terracotta-dark);">+${q.stamps} 🥖</div>
              <div style="font-size: 9.5px; color: var(--ink-muted);">${q.baseTime}s</div>
            </div>
          `;
          campaignListEl.appendChild(card);
        });
      }

      const sparrowHintsEl = document.getElementById('sparrow-hints-list');
      if (sparrowHintsEl) {
        sparrowHintsEl.innerHTML = '';
        lostSparrows.forEach(sp => {
          const card = document.createElement('div');
          card.className = `sparrow-card ${sp.found ? 'found' : ''}`;
          card.innerHTML = `
            <div style="font-size: 22px;">${sp.found ? '🕊️' : '❓'}</div>
            <div>
              <strong style="font-size: 12px; color: var(--ink-navy);">${sp.data.name} ${sp.found ? '(Found!)' : ''}</strong>
              <div style="font-size: 10.5px; color: var(--ink-muted);">${sp.found ? 'Discovered in all its golden luster!' : sp.data.hint}</div>
            </div>
          `;
          sparrowHintsEl.appendChild(card);
        });
      }

      const bestComboEl = document.getElementById('journal-combo-best');
      if (bestComboEl) bestComboEl.textContent = `${flight.bestRingCombo}x`;
    }

    function setQuest(idx) {
      currentQuestIdx = idx % campaignQuests.length;
      activeQuest = campaignQuests[currentQuestIdx];
      applyDifficulty(flight.difficulty);
      parcelWarmth = 100.0;
      flight.stuntsCount = 0;
      flight.state = 'pickup';
      flight.speed = 0.0;
      flight.velocity.set(0, 0, 0);

      // Station player cleanly on foot at pickup location
      const pickupZone = dropZones.find(t => t.id === activeQuest.pickupId);
      if (pickupZone) {
        flight.position.copy(pickupZone.position);
        flight.position.y = pickupZone.landingY + 0.4;
      }

      // Orient forward towards target
      const targetZone = dropZones.find(t => t.id === activeQuest.targetId);
      if (targetZone) {
        activeLandingFXGroup.position.copy(targetZone.position);
        goldenBeaconPillar.position.set(0, 160, 0);
        landingDome.position.set(0, 0, 0);
        floatingCrestMarker.position.set(0, 6.0, 0);

        const lookDir = new THREE.Vector3().subVectors(targetZone.position, flight.position).normalize();
        const yaw = Math.atan2(-lookDir.x, -lookDir.z);
        flight.quaternion.setFromEuler(new THREE.Euler(0, yaw, 0, 'YXZ'));
      }

      document.getElementById('hud-quest-tag').textContent = `CHAPTER ${activeQuest.chapter}/6`;
      document.getElementById('hud-quest-icon').textContent = activeQuest.icon;
      document.getElementById('hud-quest-name').textContent = activeQuest.title;
      document.getElementById('hud-dest-label').textContent = activeQuest.targetName;
      document.getElementById('hud-warmth-fill').style.width = '100%';
      document.getElementById('waypoint-name-txt').textContent = activeQuest.targetName;
      document.getElementById('waypoint-icon-box').textContent = activeQuest.icon;

      // Show interactive pickup banner
      document.getElementById('pickup-banner-icon').textContent = activeQuest.icon;
      document.getElementById('pickup-banner-title').textContent = `${activeQuest.title} Ready!`;
      document.getElementById('pickup-banner-desc').textContent = activeQuest.desc;
      document.getElementById('pickup-action-banner').classList.add('show');

      renderGrandMenu();
    }

    function launchFromGround() {
      if (flight.state !== 'pickup') return;
      flight.state = 'flying';
      flight.speed = 28.0;
      flight.takeoffImmunityTimer = 4.5;

      flight.position.y += 8.0;

      const currentEuler = new THREE.Euler().setFromQuaternion(flight.quaternion, 'YXZ');
      currentEuler.x = 0.22;
      flight.quaternion.setFromEuler(currentEuler);

      document.getElementById('pickup-action-banner').classList.remove('show');

      sound.playPickup();
      sound.playUpdraft();
      spawnFloatingText('🚀 TAKEOFF! Sky Lift Active!', window.innerWidth / 2, window.innerHeight * 0.35);
    }

    // Touchdown & Scorecard Completion
    function executeTouchdown(targetZone) {
      if (flight.state === 'landed') return;
      flight.state = 'landed';
      flight.speed = 0;
      flight.velocity.set(0, 0, 0);

      flight.totalDeliveries++;
      flight.position.x = targetZone.position.x;
      flight.position.z = targetZone.position.z;
      flight.position.y = targetZone.landingY + 0.4;

      const timeRatio = questTimer / maxQuestTimer;
      let grade = 'B';
      let gradeMult = 1.0;

      if (timeRatio > 0.45 && parcelWarmth > 75) {
        grade = 'S';
        gradeMult = 1.8;
      } else if (timeRatio > 0.25 && parcelWarmth > 50) {
        grade = 'A';
        gradeMult = 1.35;
      }

      if (flight.difficulty === 'gale') gradeMult *= 2.5;

      const earnedStamps = Math.round(activeQuest.stamps * gradeMult);
      totalStamps += earnedStamps;
      document.getElementById('ui-stamps').textContent = totalStamps;

      if (currentQuestIdx === 0) checkBadgeUnlock('first_flight');
      if (parcelWarmth > 85) checkBadgeUnlock('piping_hot');

      updateCourierRank();

      document.getElementById('celeb-grade').textContent = grade;
      document.getElementById('celeb-grade').style.color = grade === 'S' ? '#D90429' : (grade === 'A' ? '#E76F51' : '#2A9D8F');
      document.getElementById('celeb-dest-name').textContent = `Delivered to ${activeQuest.targetName}`;
      document.getElementById('celeb-quote-msg').textContent = activeQuest.quote;
      document.getElementById('score-time-val').textContent = `${Math.ceil(questTimer)}s`;
      document.getElementById('score-warmth-val').textContent = `${Math.round(parcelWarmth)}%`;
      document.getElementById('score-bonus-val').textContent = `${flight.currentRingCombo}x (${flight.stuntsCount})`;
      document.getElementById('celeb-reward-txt').textContent = `+${earnedStamps} Golden Bread Stamps 🥖`;

      // Hide in-flight clutter before showing modal
      document.getElementById('waypoint-tracker').style.opacity = '0';
      document.getElementById('flight-helper-bubble').classList.add('hidden');
      document.getElementById('celeb-backdrop').classList.add('open');

      triggerConfettiBurst();
      sound.playDeliveryFanfare();
    }

    function checkProximityLanding() {
      const curTarget = dropZones.find(t => t.id === activeQuest.targetId);
      if (curTarget && flight.state === 'flying') {
        const dist = flight.position.distanceTo(curTarget.position);
        if (dist < curTarget.radius + 15.0) {
          executeTouchdown(curTarget);
        }
      }
    }

    document.getElementById('btn-start-next-mission').addEventListener('click', () => {
      document.getElementById('celeb-backdrop').classList.remove('open');
      setQuest(currentQuestIdx + 1);
    });

    const grandMenuModal = document.getElementById('grand-menu-modal');

    document.getElementById('btn-open-main-menu').addEventListener('click', toggleGrandMenuModal);
    document.getElementById('btn-brand-menu').addEventListener('click', toggleGrandMenuModal);
    document.getElementById('btn-close-grand-menu').addEventListener('click', toggleGrandMenuModal);
    document.getElementById('quest-card-hud').addEventListener('click', () => {
      openGrandMenuTab('tab-campaign');
    });

    function toggleGrandMenuModal() {
      renderGrandMenu();
      grandMenuModal.classList.toggle('open');
    }

    function openGrandMenuTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
      if (targetBtn) targetBtn.classList.add('active');
      const targetContent = document.getElementById(tabId);
      if (targetContent) targetContent.style.display = 'block';
      renderGrandMenu();
      grandMenuModal.classList.add('open');
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).style.display = 'block';
      });
    });

    window.selectBroomType = function(type) {
      flight.equippedBroom = type;
      document.querySelectorAll('#broom-card-willow, #broom-card-oak, #broom-card-stardust').forEach(c => {
        c.style.background = 'white';
        c.style.borderColor = 'var(--border-parchment)';
      });
      const activeCard = document.getElementById(`broom-card-${type}`);
      if (activeCard) {
        activeCard.style.background = '#FFE8D6';
        activeCard.style.borderColor = 'var(--terracotta-sun)';
      }

      if (type === 'willow') { flight.baseSpeed = 24.0; flight.maxSpeed = 64.0; flight.pitchRate = 2.4; }
      if (type === 'oak') { flight.baseSpeed = 30.0; flight.maxSpeed = 74.0; flight.pitchRate = 2.0; }
      if (type === 'stardust') { flight.baseSpeed = 26.0; flight.maxSpeed = 68.0; flight.pitchRate = 2.3; }
      spawnFloatingText(`🧹 Equipped ${type.toUpperCase()} Broom!`, window.innerWidth / 2, window.innerHeight * 0.35);
    };

    document.getElementById('btn-herb-infusion').addEventListener('click', function() {
      this.textContent = 'Infused! (+25% Glide)';
      spawnFloatingText('🌿 Lavender Infusion Active!', window.innerWidth / 2, window.innerHeight * 0.35);
    });

    document.getElementById('btn-herb-tea').addEventListener('click', function() {
      this.textContent = 'Tea Brewed (Warmth +)';
      parcelWarmth = 100.0;
      spawnFloatingText('🍃 Chamomile Tea Restored Warmth!', window.innerWidth / 2, window.innerHeight * 0.35);
    });

    document.getElementById('btn-herb-jasmine').addEventListener('click', function() {
      this.textContent = 'Petals Scattered ✨';
      spawnFloatingText('🌸 Star Jasmine Petals Trail Active!', window.innerWidth / 2, window.innerHeight * 0.35);
    });

    document.getElementById('btn-menu-audio-toggle').addEventListener('click', () => {
      const on = sound.toggleAudio();
      document.getElementById('menu-audio-label').textContent = on ? '🔊 Audio: ON' : '🔈 Audio: OFF';
    });

    // Music toggle listeners removed — SFX only



    let textureEnabled = true;
    document.getElementById('btn-toggle-texture').addEventListener('click', () => {
      textureEnabled = !textureEnabled;
      const overlay = document.getElementById('watercolor-canvas-overlay');
      if (textureEnabled) {
        overlay.classList.remove('disabled');
        document.getElementById('texture-label').textContent = '🎨 Filter: ON';
      } else {
        overlay.classList.add('disabled');
        document.getElementById('texture-label').textContent = '🎨 Filter: OFF';
      }
    });

    document.getElementById('btn-trigger-photo').addEventListener('click', () => {
      grandMenuModal.classList.remove('open');
      togglePhotoMode();
    });

    document.getElementById('photo-mode-indicator').addEventListener('click', togglePhotoMode);

    // ── Welcome Screen: PLAY → Difficulty → Launch ──
    function wsDiffSelect(btn) {
      document.querySelectorAll('.ws-diff-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    }
    window.wsDiffSelect = wsDiffSelect;

    document.getElementById('btn-show-difficulty').addEventListener('click', function () {
      this.style.display = 'none';
      document.getElementById('ws-difficulty-panel').classList.add('visible');
    });

    document.getElementById('btn-start-game').addEventListener('click', () => {
      const ws = document.getElementById('welcome-screen');
      if (ws) {
        ws.style.opacity = '0';
        setTimeout(() => { ws.style.display = 'none'; }, 600);
      }
      sound.init();
      sound.playUpdraft();
      launchFromGround();
    });

    // Expose all primary game loop/control helpers to window
    window.launchFromGround = launchFromGround;
    window.checkProximityLanding = checkProximityLanding;
    window.checkBadgeUnlock = checkBadgeUnlock;
    window.toggleGrandMenuModal = toggleGrandMenuModal;
    window.spawnFloatingText = spawnFloatingText;
    window.setQuest = setQuest;
    window.executeTouchdown = executeTouchdown;
