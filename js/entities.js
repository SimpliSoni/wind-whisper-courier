/* ==========================================================================
       4. LANDING ZONE FX, SLALOM RINGS & FESTIVAL BALLOONS
       ========================================================================== */
    const activeLandingFXGroup = new THREE.Group();
    scene.add(activeLandingFXGroup);

    const goldenBeaconPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(4.0, 4.0, 320, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xFFD166,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    activeLandingFXGroup.add(goldenBeaconPillar);

    const landingDome = new THREE.Mesh(
      new THREE.SphereGeometry(14.0, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshBasicMaterial({
        color: 0xFFD166,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        wireframe: true
      })
    );
    activeLandingFXGroup.add(landingDome);

    const rippleRings = [];
    for (let r = 0; r < 3; r++) {
      const rGeo = new THREE.RingGeometry(0.1, 14.0, 32);
      rGeo.rotateX(-Math.PI / 2);
      const rMesh = new THREE.Mesh(rGeo, new THREE.MeshBasicMaterial({
        color: 0xFFD166,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      }));
      activeLandingFXGroup.add(rMesh);
      rippleRings.push({ mesh: rMesh, offset: r * 0.33 });
    }

    const floatingCrestMarker = new THREE.Group();
    const crestRing = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.45, 12, 24), pal.goldSun);
    floatingCrestMarker.add(crestRing);
    const crestCore = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 0), pal.terracotta);
    floatingCrestMarker.add(crestCore);
    activeLandingFXGroup.add(floatingCrestMarker);

    // Sky Wind Rings Slalom Course
    const slalomCoords = [
      { x: -50, y: 56, z: 45 },
      { x: -28, y: 78, z: 18 },
      { x: -8, y: 98, z: -10 },
      { x: 45, y: 82, z: 25 },
      { x: 95, y: 72, z: 75 },
      { x: 135, y: 65, z: -35 },
      { x: 175, y: 78, z: -95 },
      { x: 140, y: 75, z: -150 },
      { x: 60, y: 70, z: -140 },
      { x: -20, y: 65, z: -110 },
      { x: -90, y: 55, z: -130 },
      { x: -160, y: 70, z: -40 },
      { x: -195, y: 82, z: 80 },
      { x: -130, y: 60, z: 120 },
      { x: -40, y: 45, z: 165 },
      { x: 15, y: 35, z: 180 }
    ];

    slalomCoords.forEach((coord, idx) => {
      const tRing = new THREE.Mesh(
        new THREE.TorusGeometry(6.8, 0.45, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xFFD166, transparent: true, opacity: 0.85 })
      );
      tRing.position.set(coord.x, coord.y, coord.z);
      tRing.lookAt(0, coord.y, 0);
      scene.add(tRing);
      windRings.push({ mesh: tRing, active: true, cooldown: 0, index: idx });
    });

    // Colorful Gouache Festival Balloons Collectibles
    const balloonColors = [0xE63946, 0xFFD166, 0x48CAE4, 0x52B788, 0xF4A261, 0x9B5DE5];
    const balloonCoords = [
      { x: -30, y: 48, z: 20 },
      { x: 30, y: 52, z: 10 },
      { x: -70, y: 62, z: -40 },
      { x: 80, y: 68, z: -80 },
      { x: 130, y: 55, z: 60 },
      { x: -140, y: 72, z: 60 },
      { x: -100, y: 85, z: -80 },
      { x: 60, y: 92, z: -40 },
      { x: -10, y: 42, z: 120 },
      { x: 90, y: 44, z: 160 },
      { x: -170, y: 58, z: -90 },
      { x: 160, y: 64, z: -160 }
    ];

    balloonCoords.forEach((bc, idx) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(bc.x, bc.y, bc.z);

      const bColor = balloonColors[idx % balloonColors.length];
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 12, 10),
        new THREE.MeshToonMaterial({ color: bColor, emissive: bColor, emissiveIntensity: 0.25 })
      );
      sphere.scale.set(1.0, 1.25, 1.0);
      bGroup.add(sphere);

      const knot = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.4, 6), new THREE.MeshBasicMaterial({ color: bColor }));
      knot.position.y = -2.1;
      knot.rotation.x = Math.PI;
      bGroup.add(knot);

      scene.add(bGroup);
      balloons.push({ group: bGroup, basePos: bGroup.position.clone(), popped: false, color: bColor });
    });

    // Golden Bread Coins
    const coinGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.35, 12);
    coinGeo.rotateX(Math.PI / 2);
    const coinMat = new THREE.MeshToonMaterial({ color: 0xFFD166, emissive: 0xF4A261, emissiveIntensity: 0.4 });

    for (let c = 0; c < 42; c++) {
      const angle = (c / 42) * Math.PI * 2;
      const r = 90 + Math.sin(c * 2) * 65;
      const y = 35 + Math.sin(c * 3) * 25;
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
      scene.add(coin);
      breadCoins.push({ mesh: coin, collected: false, basePos: coin.position.clone() });
    }

    // Origami Sparrows
    const sparrowLocations = [
      { id: 'sp1', x: 0, y: 112, z: -35, hint: 'High above the four clock faces where the golden weathervane spins.', name: 'Clocktower Crest' },
      { id: 'sp2', x: -210, y: 94, z: 150, hint: 'Resting on the red striped balcony of the Cape Lighthouse.', name: 'Cape Lighthouse' },
      { id: 'sp3', x: 190, y: 88, z: -130, hint: 'Perched between the spinning canvas sails of Breeze Hill Windmill.', name: 'Windmill Sails' },
      { id: 'sp4', x: -130, y: 48, z: -138, hint: 'Resting on the wooden bench at Miyazaki Memorial Point.', name: 'Miyazaki Point' },
      { id: 'sp5', x: 110, y: 48, z: 146, hint: "Tucked amidst the potted roses on Madame's sunlit porch.", name: "Madame's Manor" },
      { id: 'sp6', x: -75, y: 38, z: 68, hint: 'Perched on the brick chimney of the Guzior Bakery attic.', name: 'Bakery Attic' }
    ];

    sparrowLocations.forEach((sLoc) => {
      const spGroup = new THREE.Group();
      spGroup.position.set(sLoc.x, sLoc.y, sLoc.z);

      const birdBody = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 4), pal.sparkleGold);
      birdBody.rotation.x = Math.PI / 2;
      spGroup.add(birdBody);

      const wingL = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), pal.sparkleGold);
      wingL.rotation.y = Math.PI / 2;
      wingL.position.x = -0.6;
      spGroup.add(wingL);

      const wingR = wingL.clone();
      wingR.position.x = 0.6;
      spGroup.add(wingR);

      scene.add(spGroup);
      lostSparrows.push({ group: spGroup, found: false, data: sLoc });
    });

    // Seagulls
    for (let s = 0; s < 8; s++) {
      const gull = new THREE.Group();
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 4), pal.stuccoWhite);
      body.rotation.x = Math.PI / 2;
      gull.add(body);

      const wingL = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.5), pal.stuccoWhite);
      wingL.position.x = -0.9;
      gull.add(wingL);

      const wingR = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.5), pal.stuccoWhite);
      wingR.position.x = 0.9;
      gull.add(wingR);

      scene.add(gull);
      seagulls.push({
        group: gull,
        wingL: wingL,
        wingR: wingR,
        angle: (s / 8) * Math.PI * 2,
        dist: 125 + s * 14,
        speed: 0.25 + Math.random() * 0.1,
        alt: 65 + s * 4
      });
    }
