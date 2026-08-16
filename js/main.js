/* ==========================================================================
       8. MAIN ANIMATION & GAMEPLAY LOOP
       ========================================================================== */
    const clock = new THREE.Clock();
    const speedLines = document.getElementById('speed-lines');
    const boundaryMist = document.getElementById('boundary-mist');
    const hudSpeed = document.getElementById('hud-speed-val');
    const hudAlt = document.getElementById('hud-alt-val');
    const buffBox = document.getElementById('buff-tags-box');
    const waypointTracker = document.getElementById('waypoint-tracker');
    const waypointDistTxt = document.getElementById('waypoint-dist-txt');
    const waypointArrowSymbol = document.getElementById('waypoint-arrow-symbol');
    const hudTimerEl = document.getElementById('hud-quest-timer');
    const prominentTimerTxt = document.getElementById('prominent-timer-txt');
    const prominentTimerCapsule = document.getElementById('prominent-delivery-timer');
    const timerCircle = document.getElementById('hud-timer-circle');
    const timerBonusPill = document.getElementById('timer-bonus-pill');
    const hudWarmthFill = document.getElementById('hud-warmth-fill');
    const boundaryToast = document.getElementById('boundary-toast');
    const helperBubble = document.getElementById('flight-helper-bubble');
    const helperText = document.getElementById('helper-text');
    const hudStepDist = document.getElementById('hud-step-dist');

    let deliveryCooldown = 0;

    function animate() {
      requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      if (flight.state === 'flying') {
        if (flight.takeoffImmunityTimer > 0) {
          flight.takeoffImmunityTimer -= dt;
          flight.position.y += (flight.takeoffImmunityTimer / 4.5) * 14.0 * dt;
        }

        let pitchCtrl = flight.pitchInput;
        let rollCtrl = flight.rollInput;
        let yawCtrl = flight.yawInput;

        if (keys['KeyW'] || keys['ArrowUp']) pitchCtrl += 1.0;
        if (keys['KeyS'] || keys['ArrowDown']) pitchCtrl -= 1.0;
        if (keys['KeyA'] || keys['ArrowLeft']) { rollCtrl += 1.0; yawCtrl += 0.8; }
        if (keys['KeyD'] || keys['ArrowRight']) { rollCtrl += 1.0; yawCtrl -= 0.8; }

        const isThrust = keys['Space'] || flight.isThrusting;
        const isBrake = keys['ShiftLeft'] || keys['ShiftRight'] || flight.isBraking;

        sound.setThrust(isThrust);

        const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(flight.quaternion);
        const pitchAngle = fwd.y;

        if (pitchAngle < -0.1) {
          flight.speed = Math.min(flight.maxSpeed, flight.speed + (-pitchAngle) * flight.gravityDiveBoost * dt);
          if (flight.speed > 70) checkBadgeUnlock('speed_demon');
        } else if (pitchAngle > 0.1) {
          flight.speed = Math.max(flight.minSpeed, flight.speed - pitchAngle * flight.liftConversion * dt);
        } else {
          flight.speed = THREE.MathUtils.lerp(flight.speed, flight.baseSpeed, flight.dragCoeff * dt);
        }

        if (isThrust) flight.speed = Math.min(flight.maxSpeed * 1.25, flight.speed + 28.0 * dt);
        if (isBrake) flight.speed = Math.max(flight.minSpeed, flight.speed - 36.0 * dt);

        if (flight.isBarrelRolling) {
          flight.barrelRollTime += dt * 4.2;
          const rollStep = flight.barrelRollDir * 4.2 * Math.PI * 2 * dt;
          const rollRot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -rollStep);
          flight.quaternion.multiply(rollRot);

          if (flight.barrelRollTime >= Math.PI * 2) flight.isBarrelRolling = false;
        } else {
          const pitchDelta = pitchCtrl * flight.pitchRate * dt;
          const rollDelta = rollCtrl * flight.rollRate * dt;
          const yawDelta = yawCtrl * (flight.pitchRate * 0.85) * dt;

          const rotDelta = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitchDelta, yawDelta, -rollDelta, 'YXZ'));
          flight.quaternion.multiply(rotDelta);

          if (Math.abs(rollCtrl) < 0.05) {
            const euler = new THREE.Euler().setFromQuaternion(flight.quaternion, 'YXZ');
            euler.z = THREE.MathUtils.lerp(euler.z, 0, 4.0 * dt);
            flight.quaternion.setFromEuler(euler);
          }
        }

        const currentFwd = new THREE.Vector3(0, 0, -1).applyQuaternion(flight.quaternion);
        flight.velocity.copy(currentFwd).multiplyScalar(flight.speed);
        flight.position.addScaledVector(flight.velocity, dt);

        questTimer = Math.max(0, questTimer - dt);
        const warmthDecay = (flight.speed > 35 ? 1.4 : 1.0) * flight.warmthDecayMult;
        parcelWarmth = Math.max(0, parcelWarmth - dt * warmthDecay * 1.8);

        let inUpdraftNow = false;
        updrafts.forEach(draft => {
          const dXZ = Math.hypot(flight.position.x - draft.position.x, flight.position.z - draft.position.z);
          if (dXZ < draft.radius && flight.position.y >= draft.position.y && flight.position.y <= draft.position.y + draft.height) {
            flight.position.y += 20.0 * dt;
            flight.speed = Math.min(flight.maxSpeed, flight.speed + 10.0 * dt);
            parcelWarmth = Math.min(100, parcelWarmth + 24.0 * dt);
            inUpdraftNow = true;
          }
        });

        if (inUpdraftNow && !flight.inUpdraft) {
          sound.playUpdraft();
          flight.inUpdraft = true;
          flight.updraftsCount++;
          if (flight.updraftsCount >= 3) checkBadgeUnlock('chimney_surfer');
          spawnFloatingText('🔥 Warmth +25%!', window.innerWidth / 2, window.innerHeight * 0.35);
        } else if (!inUpdraftNow) {
          flight.inUpdraft = false;
        }

        resolveCollisions(flight.position, flight.velocity, dt);

        const distFromTown = Math.hypot(flight.position.x, flight.position.z);
        if (distFromTown > 285) {
          boundaryMist.classList.add('active');
          boundaryToast.classList.add('show');
          flight.boundaryWarnTimer = 1.8;

          const toCenter = new THREE.Vector3(-flight.position.x, 0, -flight.position.z).normalize();
          flight.position.addScaledVector(toCenter, 24.0 * dt);
          flight.position.y += 12.0 * dt;

          const steerEuler = new THREE.Euler(0, 1.2 * dt, 0, 'YXZ');
          flight.quaternion.multiply(new THREE.Quaternion().setFromEuler(steerEuler));
        } else {
          boundaryMist.classList.remove('active');
          if (flight.boundaryWarnTimer > 0) {
            flight.boundaryWarnTimer -= dt;
            if (flight.boundaryWarnTimer <= 0) boundaryToast.classList.remove('show');
          }
        }

        if (flight.position.y < 1.4) {
          flight.position.y = 1.4;
          flight.speed = Math.max(flight.minSpeed, flight.speed * 0.92);
        }
        if (flight.position.y > 185) flight.position.y = 185;

        const isLowSea = flight.position.y <= 4.5 && flight.position.y >= 1.2;
        flight.inSlipstream = isLowSea;
        if (isLowSea) flight.speed = Math.min(flight.maxSpeed * 1.35, flight.speed + 18.0 * dt);
      }

      // Wind Rings Slalom
      windRings.forEach(ring => {
        const d = flight.position.distanceTo(ring.mesh.position);
        if (d < 7.5 && ring.cooldown <= 0) {
          flight.currentRingCombo++;
          if (flight.currentRingCombo > flight.bestRingCombo) {
            flight.bestRingCombo = flight.currentRingCombo;
            if (flight.bestRingCombo >= 4) checkBadgeUnlock('slalom_ace');
          }
          flight.speed = Math.min(flight.maxSpeed * 1.4, flight.speed + 24.0);
          questTimer = Math.min(maxQuestTimer + 15, questTimer + 3.0);
          sound.playRingCollect(1.0 + flight.currentRingCombo * 0.05);

          totalStamps += 5;
          document.getElementById('ui-stamps').textContent = totalStamps;

          ring.cooldown = 3.5;
          ring.mesh.scale.set(1.4, 1.4, 1.4);

          if (timerBonusPill) {
            timerBonusPill.classList.add('pop');
            setTimeout(() => timerBonusPill.classList.remove('pop'), 900);
          }

          spawnFloatingText('+3s ⏱️', window.innerWidth / 2, window.innerHeight * 0.3);

          const announcer = document.getElementById('stunt-announcer');
          announcer.textContent = `COMBO ${flight.currentRingCombo}x! ⭕`;
          announcer.classList.add('pop');
          setTimeout(() => announcer.classList.remove('pop'), 800);
        }

        if (ring.cooldown > 0) {
          ring.cooldown -= dt;
          ring.mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 4 * dt);
        }
        ring.mesh.rotation.z += 0.8 * dt;
      });

      // Festival Balloons Collectibles
      balloons.forEach(balloon => {
        if (!balloon.popped) {
          balloon.group.position.y = balloon.basePos.y + Math.sin(time * 2.5 + balloon.basePos.x) * 1.2;
          const d = flight.position.distanceTo(balloon.group.position);
          if (d < 5.2 && flight.state === 'flying') {
            balloon.popped = true;
            balloon.group.visible = false;
            flight.balloonsPopped++;
            if (flight.balloonsPopped >= 5) checkBadgeUnlock('balloon_popper');
            totalStamps += 10;
            document.getElementById('ui-stamps').textContent = totalStamps;
            sound.playPop();
            spawnFloatingText('🎈 Balloon Pop! (+10🥖)', window.innerWidth / 2, window.innerHeight * 0.35);
            triggerConfettiBurst();
            updateCourierRank();
          }
        }
      });

      // Bread Coins
      breadCoins.forEach(coin => {
        if (!coin.collected) {
          coin.mesh.rotation.z += 2.4 * dt;
          const d = flight.position.distanceTo(coin.mesh.position);
          if (d < 5.0 && flight.state === 'flying') {
            coin.collected = true;
            coin.mesh.visible = false;
            totalStamps += 5;
            document.getElementById('ui-stamps').textContent = totalStamps;
            sound.playCoin();
            spawnFloatingText('+5 🥖', window.innerWidth / 2, window.innerHeight * 0.35);
            updateCourierRank();
          }
        }
      });

      // Sparrows
      let nearSparrow = false;
      lostSparrows.forEach(sparrow => {
        if (!sparrow.found) {
          const d = flight.position.distanceTo(sparrow.group.position);
          if (d < 45) nearSparrow = true;
          if (d < 7.5 && flight.state === 'flying') {
            sparrow.found = true;
            sparrow.group.visible = false;
            foundSparrowsCount++;
            document.getElementById('ui-sparrows').textContent = `${foundSparrowsCount}/6`;
            if (foundSparrowsCount >= 3) checkBadgeUnlock('sparrow_whisperer');
            sound.playSparrowFound();
            totalStamps += 25;
            document.getElementById('ui-stamps').textContent = totalStamps;
            renderGrandMenu();
            updateCourierRank();
            spawnFloatingText('🕊️ Sparrow Found! (+25🥖)', window.innerWidth / 2, window.innerHeight * 0.25);
          }
        }
        sparrow.group.rotation.y += 1.5 * dt;
      });

      // Player Sync & Character Flutter
      playerGroup.position.copy(flight.position);
      playerGroup.quaternion.copy(flight.quaternion);

      const flutter = Math.sin(time * 24 + flight.speed * 0.4) * (0.06 + (flight.speed / flight.maxSpeed) * 0.16);
      bowGroup.rotation.x = flutter;

      // Camera Rig
      if (camRig.mode === 'third_person') {
        camRig.inactivityTimer += dt;
        if (camRig.inactivityTimer > 1.5 && !isDragging) {
          camRig.orbitX = THREE.MathUtils.lerp(camRig.orbitX, 0, 2.5 * dt);
          camRig.orbitY = THREE.MathUtils.lerp(camRig.orbitY, 0.15, 2.5 * dt);
        }

        const camOffset = new THREE.Vector3(0, 1.8, camRig.followDist);
        camOffset.applyAxisAngle(new THREE.Vector3(1, 0, 0), camRig.orbitY);
        camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), camRig.orbitX);
        camOffset.applyQuaternion(flight.quaternion);

        const targetPos = new THREE.Vector3().copy(flight.position).add(camOffset);
        camRig.currentPos.lerp(targetPos, 8.5 * dt);
        camera.position.copy(camRig.currentPos);

        const lookAtTarget = new THREE.Vector3().copy(flight.position).add(new THREE.Vector3(0, 0.5, 0));
        camRig.currentLookTarget.lerp(lookAtTarget, 12.0 * dt);
        camera.lookAt(camRig.currentLookTarget);

        const speedRatio = (flight.speed - flight.minSpeed) / (flight.maxSpeed - flight.minSpeed);
        camRig.targetFov = 55 + speedRatio * 20;
        camera.fov = THREE.MathUtils.lerp(camera.fov, camRig.targetFov, 4.0 * dt);
        camera.updateProjectionMatrix();

      } else {
        const eyePos = new THREE.Vector3(0, 1.35, 0.6).applyQuaternion(flight.quaternion).add(flight.position);
        camera.position.copy(eyePos);
        const fwdLook = new THREE.Vector3(0, 0, -10).applyQuaternion(flight.quaternion).add(eyePos);
        camera.lookAt(fwdLook);
        camera.fov = 75;
        camera.updateProjectionMatrix();
      }

      // VFX & Audio Speed Sync
      const normSpeed = (flight.speed - flight.minSpeed) / (flight.maxSpeed - flight.minSpeed);
      sound.updateSpeed(normSpeed);
      speedLines.style.opacity = Math.max(0, (normSpeed - 0.45) * 1.8);

      if (flight.isThrusting || flight.speed > 32 || flight.isBarrelRolling) {
        const sSpawn = new THREE.Vector3(0, 0, -2.4).applyQuaternion(flight.quaternion).add(flight.position);
        sparklePos[nextSparkleIdx * 3] = sSpawn.x + (Math.random() - 0.5) * 0.4;
        sparklePos[nextSparkleIdx * 3 + 1] = sSpawn.y + (Math.random() - 0.5) * 0.4;
        sparklePos[nextSparkleIdx * 3 + 2] = sSpawn.z + (Math.random() - 0.5) * 0.4;
        sparkleLifes[nextSparkleIdx] = 1.0;
        nextSparkleIdx = (nextSparkleIdx + 1) % sparkleCount;
      }

      for (let i = 0; i < sparkleCount; i++) {
        if (sparkleLifes[i] > 0) {
          sparkleLifes[i] -= dt * 2.2;
          sparklePos[i * 3 + 1] -= dt * 1.4;
          if (sparkleLifes[i] <= 0) sparklePos[i * 3 + 1] = -500;
        }
      }
      sparkleGeo.attributes.position.needsUpdate = true;

      // Petals & Seagulls
      const pArr = petalGeo.attributes.position.array;
      for (let i = 0; i < petalCount; i++) {
        pArr[i * 3] += petalVels[i].vx + Math.sin(time + petalVels[i].sway) * 0.1;
        pArr[i * 3 + 1] += petalVels[i].vy;
        pArr[i * 3 + 2] += petalVels[i].vz;
        if (pArr[i * 3 + 1] < 0) {
          pArr[i * 3 + 1] = 90;
          pArr[i * 3] = flight.position.x + (Math.random() - 0.5) * 320;
          pArr[i * 3 + 2] = flight.position.z + (Math.random() - 0.5) * 320;
        }
      }
      petalGeo.attributes.position.needsUpdate = true;

      seagulls.forEach(sg => {
        sg.angle += sg.speed * dt;
        sg.group.position.set(Math.cos(sg.angle) * sg.dist, sg.alt + Math.sin(time * 2 + sg.angle) * 3, Math.sin(sg.angle) * sg.dist);
        sg.group.rotation.y = -sg.angle - Math.PI / 2;
        const flap = Math.sin(time * 8 + sg.angle) * 0.4;
        sg.wingL.rotation.z = flap;
        sg.wingR.rotation.z = -flap;
      });

      animatedBlades.forEach(rotor => { rotor.rotation.z += 1.4 * dt; });

      // Landing Zone FX
      goldenBeaconPillar.rotation.y += 0.4 * dt;
      landingDome.rotation.y += 0.6 * dt;
      floatingCrestMarker.rotation.y += 1.6 * dt;
      floatingCrestMarker.position.y = 6.0 + Math.sin(time * 3.5) * 0.8;

      rippleRings.forEach(rObj => {
        const progress = ((time * 0.8 + rObj.offset) % 1.0);
        rObj.mesh.scale.set(0.1 + progress * 1.2, 0.1 + progress * 1.2, 1);
        rObj.mesh.material.opacity = (1.0 - progress) * 0.8;
      });

      // Waypoint & Guidance Updates
      if (deliveryCooldown > 0) deliveryCooldown -= dt;

      const curTarget = dropZones.find(t => t.id === activeQuest.targetId);
      const isAnyModalOpen = document.getElementById('celeb-backdrop').classList.contains('open') || 
                             grandMenuModal.classList.contains('open') || 
                             flight.isPhotoMode;

      if (curTarget && flight.state === 'flying' && !isAnyModalOpen) {
        const dist = flight.position.distanceTo(curTarget.position);
        waypointDistTxt.textContent = `${Math.round(dist)}m`;
        hudStepDist.textContent = `${Math.round(dist)}m`;

        const targetWorldPos = curTarget.position.clone().add(new THREE.Vector3(0, 4, 0));
        const screenPos = targetWorldPos.project(camera);
        const isBehind = screenPos.z > 1.0;

        let sx = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
        let sy = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;

        const margin = 50;
        const isOffscreen = isBehind || sx < margin || sx > window.innerWidth - margin || sy < margin || sy > window.innerHeight - margin;

        if (isOffscreen) {
          if (isBehind) {
            sx = window.innerWidth - sx;
            sy = window.innerHeight - sy;
          }
          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2;
          const angle = Math.atan2(sy - cy, sx - cx);

          sx = cx + Math.cos(angle) * (window.innerWidth / 2 - margin);
          sy = cy + Math.sin(angle) * (window.innerHeight / 2 - margin);

          waypointArrowSymbol.textContent = '➔';
          waypointArrowSymbol.style.display = 'inline-block';
          waypointArrowSymbol.style.transform = `rotate(${angle}rad)`;
        } else {
          waypointArrowSymbol.style.display = 'none';
        }

        waypointTracker.style.opacity = '1';
        waypointTracker.style.left = `${sx}px`;
        waypointTracker.style.top = `${sy}px`;

        helperBubble.classList.remove('hidden');
        if (dist < 24) {
          helperText.innerHTML = `🛬 Landing Runway ahead! Press <kbd>SHIFT</kbd> to Touchdown!`;
        } else if (nearSparrow) {
          helperText.innerHTML = `🕊️ Jiji senses a Golden Sparrow nearby!`;
        } else if (flight.inUpdraft) {
          helperText.innerHTML = `🔥 Thermal Chimney! Freshness Restored!`;
        } else if (flight.speed < 10) {
          helperText.innerHTML = `Hold <kbd>SPACE</kbd> for Sparkle Boost!`;
        } else {
          helperText.innerHTML = `Fly towards the Golden Light Pillar!`;
        }

        if (dist < curTarget.radius && deliveryCooldown <= 0) {
          deliveryCooldown = 4.0;
          executeTouchdown(curTarget);
        }
      } else {
        waypointTracker.style.opacity = '0';
        if (flight.state === 'pickup' && !isAnyModalOpen) {
          helperBubble.classList.remove('hidden');
          helperText.innerHTML = `📦 Parcel ready! Press <kbd>SPACE</kbd> or click <strong>MOUNT BROOM</strong>!`;
        } else {
          helperBubble.classList.add('hidden');
        }
      }

      // Timer Display
      const minutes = Math.floor(questTimer / 60);
      const seconds = Math.floor(questTimer % 60);
      const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      hudTimerEl.textContent = `${Math.ceil(questTimer)}s`;

      if (flight.state === 'pickup') {
        prominentTimerTxt.textContent = `${formattedTime}`;
        prominentTimerCapsule.classList.remove('urgent');
        if (timerCircle) timerCircle.style.strokeDashoffset = '0';
      } else if (flight.state === 'flying') {
        prominentTimerTxt.textContent = formattedTime;
        const progressRatio = Math.max(0, Math.min(1, questTimer / maxQuestTimer));
        const circumference = 113.1;
        if (timerCircle) {
          timerCircle.style.strokeDashoffset = `${circumference * (1 - progressRatio)}`;
          if (progressRatio < 0.25) {
            timerCircle.style.stroke = '#D90429';
            prominentTimerCapsule.classList.add('urgent');
          } else if (progressRatio < 0.5) {
            timerCircle.style.stroke = '#F4A261';
            prominentTimerCapsule.classList.remove('urgent');
          } else {
            timerCircle.style.stroke = '#52B788';
            prominentTimerCapsule.classList.remove('urgent');
          }
        }
      } else if (flight.state === 'landed') {
        prominentTimerTxt.textContent = 'DELIVERED!';
        prominentTimerCapsule.classList.remove('urgent');
      }

      // Telemetry
      hudWarmthFill.style.width = `${Math.max(0, parcelWarmth)}%`;
      hudSpeed.textContent = Math.round(flight.speed * 1.85);
      hudAlt.textContent = `ALT ${Math.round(flight.position.y)}m`;

      let buffHTML = '';
      if (flight.currentRingCombo > 0) buffHTML += `<div class="buff-pill combo">⭕ ${flight.currentRingCombo}x Ring Combo</div>`;
      if (flight.isBarrelRolling) buffHTML += `<div class="buff-pill">✨ Barrel Roll</div>`;
      if (flight.inUpdraft) buffHTML += `<div class="buff-pill updraft">🔥 Updraft</div>`;
      if (flight.inSlipstream) buffHTML += `<div class="buff-pill">🌊 Sea Glide</div>`;
      buffBox.innerHTML = buffHTML;

      renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    setQuest(0);
    animate();
