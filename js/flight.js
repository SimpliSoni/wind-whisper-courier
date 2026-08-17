/* ==========================================================================
       6. FLIGHT DYNAMICS & LOGISTICS
       ========================================================================== */
    const flight = {
      state: 'pickup', // 'pickup', 'flying', 'landed'
      position: new THREE.Vector3(-75, 35.4, 69.5),
      quaternion: new THREE.Quaternion(),
      velocity: new THREE.Vector3(0, 0, 0),
      speed: 0.0,
      baseSpeed: 24.0,
      maxSpeed: 64.0,
      minSpeed: 4.0,
      takeoffImmunityTimer: 0.0,

      pitchInput: 0,
      yawInput: 0,
      rollInput: 0,
      isThrusting: false,
      isBraking: false,

      isBarrelRolling: false,
      barrelRollTime: 0,
      barrelRollDir: 1,

      pitchRate: 2.4,
      rollRate: 3.1,
      gravityDiveBoost: 22.0,
      liftConversion: 16.0,
      dragCoeff: 0.38,
      difficulty: 'cozy',
      warmthDecayMult: 0.65,
      stuntsCount: 0,
      balloonsPopped: 0,
      totalDeliveries: 0,

      currentRingCombo: 0,
      bestRingCombo: 0,
      inUpdraft: false,
      updraftsCount: 0,
      inSlipstream: false,
      boundaryWarnTimer: 0,
      equippedBroom: 'willow',
      isPhotoMode: false
    };

    playerGroup.position.copy(flight.position);

    const camRig = {
      mode: 'third_person',
      followDist: 7.5,
      minDist: 3.5,
      maxDist: 14.0,
      orbitX: 0,
      orbitY: 0.15,
      inactivityTimer: 0,
      currentPos: new THREE.Vector3(-75, 38, 80),
      currentLookTarget: new THREE.Vector3(-75, 35, 69),
      currentFov: 55,
      targetFov: 55
    };

    function resolveCollisions(pos, vel, dt) {
      if (flight.state !== 'flying') return;
      const isTakeoff = flight.takeoffImmunityTimer > 0;
      const playerRadius = isTakeoff ? 0.8 : 1.2;
      let collided = false;

      worldColliders.forEach(col => {
        if (col.type === 'box') {
          const closestX = Math.max(col.min.x, Math.min(pos.x, col.max.x));
          const closestY = Math.max(col.min.y, Math.min(pos.y, col.max.y));
          const closestZ = Math.max(col.min.z, Math.min(pos.z, col.max.z));
          const distSq = (pos.x - closestX) ** 2 + (pos.y - closestY) ** 2 + (pos.z - closestZ) ** 2;

          if (distSq < playerRadius * playerRadius) {
            const dist = Math.sqrt(distSq) || 0.001;
            const normX = (pos.x - closestX) / dist;
            const normY = Math.max(0.4, (pos.y - closestY) / dist);
            const normZ = (pos.z - closestZ) / dist;
            const penetration = playerRadius - dist;

            pos.x += normX * penetration;
            pos.y += normY * penetration + 0.25;
            pos.z += normZ * penetration;

            if (!isTakeoff) {
              const vDotN = vel.x * normX + vel.y * normY + vel.z * normZ;
              if (vDotN < 0) {
                vel.x -= vDotN * normX;
                vel.y = Math.max(vel.y, 2.0);
                vel.z -= vDotN * normZ;
              }
              collided = true;
            }
          }
        } else if (col.type === 'cylinder') {
          const dx = pos.x - col.center.x;
          const dz = pos.z - col.center.z;
          const dXZ = Math.hypot(dx, dz);
          const topY = col.center.y + col.height / 2;
          const botY = col.center.y - col.height / 2;

          if (dXZ < col.radius + playerRadius && pos.y > botY && pos.y < topY + playerRadius) {
            if (pos.y > topY) {
              pos.y = topY + playerRadius + 0.2;
              if (vel.y < 0) vel.y = 0;
            } else {
              const pushX = (dx / (dXZ || 1)) * (col.radius + playerRadius - dXZ);
              const pushZ = (dz / (dXZ || 1)) * (col.radius + playerRadius - dXZ);
              pos.x += pushX;
              pos.z += pushZ;
              pos.y += 0.2;
              if (!isTakeoff) collided = true;
            }
          }
        }
      });

      if (collided && !isTakeoff) {
        flight.speed = Math.max(flight.minSpeed + 6.0, flight.speed * 0.95);
      }
    }

    const keys = {};
    window.addEventListener('keydown', e => {
      keys[e.code] = true;
      if (e.code === 'KeyC') toggleCameraMode();
      if (e.code === 'KeyP') togglePhotoMode();
      if (e.code === 'Escape' || e.code === 'Tab') {
        e.preventDefault();
        if (typeof toggleGrandMenuModal === 'function') toggleGrandMenuModal();
        else if (window.toggleGrandMenuModal) window.toggleGrandMenuModal();
      }
      if (e.code === 'KeyM' || e.code === 'KeyJ') {
        if (typeof toggleGrandMenuModal === 'function') toggleGrandMenuModal();
        else if (window.toggleGrandMenuModal) window.toggleGrandMenuModal();
      }
      if (e.code === 'KeyB') {
        if (window.openWardrobeShop) window.openWardrobeShop();
      }
      if (e.code === 'KeyQ') triggerBarrelRoll(-1);
      if (e.code === 'KeyE') triggerBarrelRoll(1);
      if (e.code === 'Space') {
        // If welcome screen is open, dismiss it and launch
        const ws = document.getElementById('welcome-screen');
        if (ws && ws.style.display !== 'none' && window.getComputedStyle(ws).display !== 'none' && parseFloat(window.getComputedStyle(ws).opacity || '1') > 0.05) {
          ws.style.opacity = '0';
          setTimeout(() => { ws.style.display = 'none'; }, 600);
          sound.init();
          sound.playUpdraft();
        }
        if (flight.state === 'pickup') {
          if (typeof launchFromGround === 'function') launchFromGround();
          else if (window.launchFromGround) window.launchFromGround();
        }
      }
      sound.init();
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });

    let isDragging = false;
    let prevMouseX = 0, prevMouseY = 0;

    window.addEventListener('mousedown', e => {
      if (flight.isPhotoMode) {
        togglePhotoMode();
        return;
      }
      if (e.target.closest('.interactive') || 
          e.target.closest('.modal-backdrop-full') || 
          e.target.closest('#welcome-screen') || 
          e.target.closest('#pickup-action-banner') || 
          e.target.closest('button') || 
          e.target.closest('.action-hud-btn')) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      camRig.orbitX -= dx * 0.006;
      camRig.orbitY = Math.max(-0.4, Math.min(1.1, camRig.orbitY - dy * 0.006));
      camRig.inactivityTimer = 0;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    window.addEventListener('wheel', e => {
      camRig.followDist = Math.max(camRig.minDist, Math.min(camRig.maxDist, camRig.followDist + Math.sign(e.deltaY) * 0.8));
    }, { passive: true });

    // Touch Joystick (Mobile)
    const mobileJoy = document.getElementById('mobile-joystick');
    const mobileThumb = document.getElementById('mobile-thumb');
    let joyOrigin = null;

    if (mobileJoy && mobileThumb) {
      mobileJoy.addEventListener('touchstart', e => {
        const rect = mobileJoy.getBoundingClientRect();
        joyOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        sound.init();
      }, { passive: true });

      mobileJoy.addEventListener('touchmove', e => {
        if (!joyOrigin) return;
        const touch = e.touches[0];
        const dx = touch.clientX - joyOrigin.x;
        const dy = touch.clientY - joyOrigin.y;
        const dist = Math.min(48, Math.hypot(dx, dy));
        const angle = Math.atan2(dy, dx);

        mobileThumb.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
        flight.yawInput = -Math.cos(angle) * (dist / 48);
        flight.pitchInput = -Math.sin(angle) * (dist / 48);
      }, { passive: true });

      mobileJoy.addEventListener('touchend', () => {
        joyOrigin = null;
        mobileThumb.style.transform = 'translate(0, 0)';
        flight.yawInput = 0;
        flight.pitchInput = 0;
      });
    }

    const btnPropel = document.getElementById('btn-propel');
    const btnAirbrake = document.getElementById('btn-airbrake');
    const btnToggleCam = document.getElementById('btn-toggle-cam');
    const btnMountLaunch = document.getElementById('btn-mount-launch');

    // Central Mount Broom & Launch Button
    if (btnMountLaunch) {
      const handleMountClick = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        sound.init();
        if (typeof launchFromGround === 'function') {
          launchFromGround();
        } else if (window.launchFromGround) {
          window.launchFromGround();
        }
      };
      btnMountLaunch.addEventListener('click', handleMountClick);
      btnMountLaunch.addEventListener('mousedown', (e) => { e.stopPropagation(); });
      btnMountLaunch.addEventListener('touchstart', (e) => { e.stopPropagation(); }, { passive: true });
    }

    // Propel / Boost / Launch Button
    if (btnPropel) {
      const handlePropelPress = (e) => {
        if (e) e.preventDefault();
        sound.init();
        if (flight.state === 'pickup') {
          if (typeof launchFromGround === 'function') {
            launchFromGround();
          } else if (window.launchFromGround) {
            window.launchFromGround();
          }
        } else {
          flight.isThrusting = true;
        }
      };
      const handlePropelRelease = (e) => {
        if (e) e.preventDefault();
        flight.isThrusting = false;
      };

      btnPropel.addEventListener('mousedown', handlePropelPress);
      btnPropel.addEventListener('mouseup', handlePropelRelease);
      btnPropel.addEventListener('touchstart', handlePropelPress, { passive: false });
      btnPropel.addEventListener('touchend', handlePropelRelease);
      btnPropel.addEventListener('click', (e) => {
        if (flight.state === 'pickup') handlePropelPress(e);
      });
    }

    // Airbrake & Land Button
    if (btnAirbrake) {
      const handleBrakePress = (e) => {
        if (e) e.preventDefault();
        sound.init();
        flight.isBraking = true;
        sound.playBrake();
        if (typeof checkProximityLanding === 'function') {
          checkProximityLanding();
        } else if (window.checkProximityLanding) {
          window.checkProximityLanding();
        }
      };
      const handleBrakeRelease = (e) => {
        if (e) e.preventDefault();
        flight.isBraking = false;
      };

      btnAirbrake.addEventListener('mousedown', handleBrakePress);
      btnAirbrake.addEventListener('mouseup', handleBrakeRelease);
      btnAirbrake.addEventListener('touchstart', handleBrakePress, { passive: false });
      btnAirbrake.addEventListener('touchend', handleBrakeRelease);
    }

    if (btnToggleCam) {
      btnToggleCam.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        toggleCameraMode();
      });
    }

    function triggerBarrelRoll(direction = 1) {
      if (flight.isBarrelRolling || flight.state !== 'flying') return;
      flight.isBarrelRolling = true;
      flight.barrelRollTime = 0;
      flight.barrelRollDir = direction;
      flight.speed = Math.min(flight.maxSpeed, flight.speed + 14.0);
      flight.stuntsCount++;
      sound.playBarrelRoll();

      if (typeof checkBadgeUnlock === 'function') checkBadgeUnlock('acrobat');
      else if (window.checkBadgeUnlock) window.checkBadgeUnlock('acrobat');

      const announcer = document.getElementById('stunt-announcer');
      if (announcer) {
        announcer.textContent = 'BARREL ROLL! ✨';
        announcer.classList.add('pop');
        setTimeout(() => announcer.classList.remove('pop'), 800);
      }
    }

    function toggleCameraMode() {
      camRig.mode = camRig.mode === 'third_person' ? 'first_person' : 'third_person';
      const fpV = document.getElementById('fp-vignette');
      if (camRig.mode === 'first_person') {
        if (fpV) fpV.classList.add('active');
        if (typeof kikiGroup !== 'undefined') kikiGroup.visible = false;
      } else {
        if (fpV) fpV.classList.remove('active');
        if (typeof kikiGroup !== 'undefined') kikiGroup.visible = true;
      }
    }

    function togglePhotoMode() {
      flight.isPhotoMode = !flight.isPhotoMode;
      const ui = document.getElementById('ui-layer');
      const photoInd = document.getElementById('photo-mode-indicator');
      if (flight.isPhotoMode) {
        if (ui) ui.style.opacity = '0';
        if (photoInd) photoInd.style.display = 'flex';
      } else {
        if (ui) ui.style.opacity = '1';
        if (photoInd) photoInd.style.display = 'none';
      }
    }

    window.toggleCameraMode = toggleCameraMode;
    window.togglePhotoMode = togglePhotoMode;
    window.triggerBarrelRoll = triggerBarrelRoll;
