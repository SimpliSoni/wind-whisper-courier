/* ==========================================================================
       3. PALETTE, ADVANCED COLLISION RESOLVER & WORLD ARCHIPELAGO
       ========================================================================== */
    const pal = {
      terracotta: new THREE.MeshToonMaterial({ color: 0xE76F51 }),
      terracottaDark: new THREE.MeshToonMaterial({ color: 0xB84A39 }),
      coralRoof: new THREE.MeshToonMaterial({ color: 0xF25C54 }),
      stuccoCream: new THREE.MeshToonMaterial({ color: 0xFDF0D5 }),
      stuccoPeach: new THREE.MeshToonMaterial({ color: 0xF4A261 }),
      stuccoWhite: new THREE.MeshToonMaterial({ color: 0xFFFDF9 }),
      woodDark: new THREE.MeshToonMaterial({ color: 0x6F4E37 }),
      woodLight: new THREE.MeshToonMaterial({ color: 0xB08968 }),
      emeraldGrass: new THREE.MeshToonMaterial({ color: 0x52B788 }),
      stoneCobble: new THREE.MeshToonMaterial({ color: 0xD8C3A5 }),
      goldSun: new THREE.MeshToonMaterial({ color: 0xFFD166, emissive: 0xF4A261, emissiveIntensity: 0.5 }),
      foliageGreen: new THREE.MeshToonMaterial({ color: 0x40916C }),
      foliagePink: new THREE.MeshToonMaterial({ color: 0xFFAFCC }),
      awningRed: new THREE.MeshToonMaterial({ color: 0xD90429 }),
      sparkleGold: new THREE.MeshBasicMaterial({ color: 0xFFD166 })
    };

    const worldColliders = [];
    const updrafts = [];
    const dropZones = [];
    const windRings = [];
    const lostSparrows = [];
    const breadCoins = [];
    const balloons = [];
    const animatedBlades = [];
    const seagulls = [];

    function addBoxCollider(center, size) {
      worldColliders.push({
        type: 'box',
        min: new THREE.Vector3(center.x - size.x / 2, center.y - size.y / 2, center.z - size.z / 2),
        max: new THREE.Vector3(center.x + size.x / 2, center.y + size.y / 2, center.z + size.z / 2),
        center: center.clone(),
        size: size.clone()
      });
    }

    function addCylinderCollider(center, radius, height) {
      worldColliders.push({
        type: 'cylinder',
        center: center.clone(),
        radius: radius,
        height: height
      });
    }

    function createIsland(x, z, radius, height) {
      const islandGeo = new THREE.CylinderGeometry(radius * 0.88, radius * 1.15, height, 20, 4);
      const island = new THREE.Mesh(islandGeo, pal.emeraldGrass);
      island.position.set(x, height * 0.45, z);
      island.receiveShadow = true;
      island.castShadow = true;
      scene.add(island);

      const shoreGeo = new THREE.CylinderGeometry(radius * 1.16, radius * 1.25, 4, 20);
      const shore = new THREE.Mesh(shoreGeo, pal.stoneCobble);
      shore.position.set(x, 1.2, z);
      scene.add(shore);

      addCylinderCollider(new THREE.Vector3(x, height * 0.45, z), radius * 0.90, height * 0.88);
      return island;
    }

    createIsland(0, 0, 175, 26);
    createIsland(0, -35, 95, 52);
    createIsland(190, -130, 85, 46);
    createIsland(-210, 150, 75, 40);
    createIsland(-75, 65, 70, 22);
    createIsland(125, 150, 48, 26);
    createIsland(-130, -140, 55, 44);

    function createVilla(x, y, z, width, height, depth, rotY = 0, wallMat = pal.stuccoCream, roofMat = pal.terracotta) {
      const villa = new THREE.Group();
      villa.position.set(x, y, z);
      villa.rotation.y = rotY;

      const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
      wall.position.y = height / 2;
      wall.castShadow = true;
      wall.receiveShadow = true;
      villa.add(wall);

      const roofH = height * 0.38;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(width, depth) * 0.82, roofH, 4), roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = height + roofH / 2;
      roof.castShadow = true;
      villa.add(roof);

      const cx = width * 0.28;
      const cz = depth * 0.22;
      const cy = height + roofH * 0.65;
      const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.8, 1.6), pal.terracottaDark);
      chimney.position.set(cx, cy, cz);
      villa.add(chimney);

      scene.add(villa);

      updrafts.push({
        position: new THREE.Vector3(x + cx, y + cy + 2, z + cz),
        radius: 8.5,
        height: 65.0
      });

      addBoxCollider(new THREE.Vector3(x, y + height / 2, z), new THREE.Vector3(width * 0.95, height, depth * 0.95));
      return villa;
    }

    function createTree(x, y, z, isPink = false) {
      const tree = new THREE.Group();
      tree.position.set(x, y, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 4, 6), pal.woodDark);
      trunk.position.y = 2;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2 + Math.random() * 1.5, 1), isPink ? pal.foliagePink : pal.foliageGreen);
      foliage.position.y = 5.6;
      foliage.castShadow = true;
      tree.add(foliage);

      scene.add(tree);
      addCylinderCollider(new THREE.Vector3(x, y + 2, z), 1.6, 4);
    }

    const villasConfig = [
      { x: -35, y: 26, z: -12, w: 15, h: 13, d: 11, r: 0.25, wall: pal.stuccoCream, roof: pal.coralRoof },
      { x: 40, y: 26, z: -18, w: 17, h: 15, d: 13, r: -0.35, wall: pal.stuccoPeach, roof: pal.terracotta },
      { x: -55, y: 26, z: 22, w: 13, h: 11, d: 15, r: 0.55, wall: pal.stuccoWhite, roof: pal.coralRoof },
      { x: 48, y: 26, z: 28, w: 16, h: 14, d: 12, r: -0.2, wall: pal.stuccoCream, roof: pal.terracotta },
      { x: -12, y: 26, z: 50, w: 18, h: 12, d: 13, r: 0.1, wall: pal.stuccoPeach, roof: pal.coralRoof },
      { x: 22, y: 26, z: 65, w: 15, h: 13, d: 15, r: 0.75, wall: pal.stuccoWhite, roof: pal.terracotta },
      { x: 65, y: 26, z: -45, w: 13, h: 17, d: 11, r: -0.65, wall: pal.stuccoPeach, roof: pal.coralRoof }
    ];
    villasConfig.forEach(v => createVilla(v.x, v.y, v.z, v.w, v.h, v.d, v.r, v.wall, v.roof));

    for (let t = 0; t < 35; t++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 40 + Math.random() * 105;
      createTree(Math.cos(angle) * r, 26, Math.sin(angle) * r, Math.random() > 0.55);
    }

    function addLandingPlatformRunway(group, sizeX, sizeZ, altitude) {
      const padGeo = new THREE.BoxGeometry(sizeX, 0.4, sizeZ);
      const padMesh = new THREE.Mesh(padGeo, pal.stoneCobble);
      padMesh.position.set(0, altitude, 0);
      group.add(padMesh);

      const lanternMat = new THREE.MeshBasicMaterial({ color: 0xFFD166 });
      const postMat = pal.woodDark;

      const corners = [
        { x: -sizeX * 0.46, z: -sizeZ * 0.46 },
        { x: sizeX * 0.46, z: -sizeZ * 0.46 },
        { x: -sizeX * 0.46, z: sizeZ * 0.46 },
        { x: sizeX * 0.46, z: sizeZ * 0.46 }
      ];

      corners.forEach(c => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 2.2, 6), postMat);
        post.position.set(c.x, altitude + 1.1, c.z);
        group.add(post);

        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), lanternMat);
        lamp.position.set(c.x, altitude + 2.3, c.z);
        group.add(lamp);
      });
    }

    // 1. Guzior Bakery
    function buildBakery() {
      const bakery = new THREE.Group();
      bakery.position.set(-75, 22, 65);

      const shop = new THREE.Mesh(new THREE.BoxGeometry(17, 13, 15), pal.stuccoPeach);
      shop.position.y = 6.5;
      shop.castShadow = true;
      bakery.add(shop);

      const awning = new THREE.Mesh(new THREE.BoxGeometry(15, 0.7, 4.5), pal.awningRed);
      awning.position.set(0, 5.5, 9.2);
      awning.rotation.x = 0.22;
      bakery.add(awning);

      const sign = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.65, 8, 24), pal.goldSun);
      sign.position.set(0, 9.8, 8.2);
      sign.castShadow = true;
      bakery.add(sign);

      addLandingPlatformRunway(bakery, 16, 12, 13.0);
      scene.add(bakery);

      dropZones.push({
        id: 'bakery',
        name: 'Guzior Bakery Porch',
        icon: '🥖',
        position: new THREE.Vector3(-75, 35.4, 69.5),
        landingY: 35.4,
        radius: 20.0
      });

      addBoxCollider(new THREE.Vector3(-75, 27, 65), new THREE.Vector3(16, 10, 14));
    }
    buildBakery();

    // 2. Grand Clock Tower
    function buildClockTower() {
      const tower = new THREE.Group();
      tower.position.set(0, 52, -35);

      const shaft = new THREE.Mesh(new THREE.BoxGeometry(16, 56, 16), pal.stuccoWhite);
      shaft.position.y = 28;
      shaft.castShadow = true;
      tower.add(shaft);

      addLandingPlatformRunway(tower, 24, 24, 52.0);

      const clockMat = new THREE.MeshBasicMaterial({ color: 0xFFF8E7 });
      for (let a = 0; a < 4; a++) {
        const cFace = new THREE.Mesh(new THREE.CircleGeometry(4.4, 24), clockMat);
        cFace.rotation.y = (Math.PI / 2) * a;
        cFace.position.set(0, 44, 0);
        cFace.translateZ(8.2);
        tower.add(cFace);
      }

      const spire = new THREE.Mesh(new THREE.ConeGeometry(10, 24, 4), pal.terracotta);
      spire.rotation.y = Math.PI / 4;
      spire.position.y = 65;
      spire.castShadow = true;
      tower.add(spire);

      scene.add(tower);

      dropZones.push({
        id: 'clocktower',
        name: 'Grand Clock Tower Balcony',
        icon: '🥐',
        position: new THREE.Vector3(0, 104.4, -35),
        landingY: 104.4,
        radius: 22.0
      });

      addCylinderCollider(new THREE.Vector3(0, 72, -35), 7.5, 44);
    }
    buildClockTower();

    // 3. Madame's Seaside Manor
    function buildMadamesManor() {
      const manor = new THREE.Group();
      manor.position.set(110, 32, 140);

      const mainHouse = new THREE.Mesh(new THREE.BoxGeometry(18, 14, 16), pal.stuccoWhite);
      mainHouse.position.y = 7;
      mainHouse.castShadow = true;
      manor.add(mainHouse);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(14, 8, 4), pal.coralRoof);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 17;
      manor.add(roof);

      addLandingPlatformRunway(manor, 20, 16, 14.0);
      scene.add(manor);

      dropZones.push({
        id: 'manor',
        name: "Madame's Seaside Manor Porch",
        icon: '🥧',
        position: new THREE.Vector3(110, 46.4, 146),
        landingY: 46.4,
        radius: 22.0
      });

      addBoxCollider(new THREE.Vector3(110, 38, 140), new THREE.Vector3(16, 12, 14));
    }
    buildMadamesManor();

    // 4. Breeze Hill Windmills
    function buildWindmills() {
      const wm = new THREE.Group();
      wm.position.set(190, 46, -130);

      const tower = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 9.5, 34, 12), pal.stuccoCream);
      tower.position.y = 17;
      tower.castShadow = true;
      wm.add(tower);

      const cap = new THREE.Mesh(new THREE.ConeGeometry(7.5, 9, 12), pal.terracottaDark);
      cap.position.y = 38;
      wm.add(cap);

      const hub = new THREE.Group();
      hub.position.set(0, 33, 6.8);
      const bladeGeo = new THREE.BoxGeometry(1.8, 28, 0.4);
      const sailMat = new THREE.MeshToonMaterial({ color: 0xFFFDF8 });

      for (let b = 0; b < 4; b++) {
        const blade = new THREE.Mesh(bladeGeo, sailMat);
        blade.rotation.z = (Math.PI / 2) * b;
        blade.position.y = 0;
        blade.castShadow = true;
        hub.add(blade);
      }
      wm.add(hub);
      animatedBlades.push(hub);

      addLandingPlatformRunway(wm, 18, 18, 34.0);
      scene.add(wm);

      dropZones.push({
        id: 'windmill',
        name: 'Windmill Elder Terrace',
        icon: '🍵',
        position: new THREE.Vector3(190, 80.4, -130),
        landingY: 80.4,
        radius: 24.0
      });

      addCylinderCollider(new THREE.Vector3(190, 60, -130), 8, 34);
    }
    buildWindmills();

    // 5. Cape Lighthouse
    function buildLighthouse() {
      const lh = new THREE.Group();
      lh.position.set(-210, 40, 150);

      const colWhite = pal.stuccoWhite;
      const colRed = pal.awningRed;
      for (let s = 0; s < 5; s++) {
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(4.5 - s * 0.4, 5.0 - s * 0.4, 8, 12),
          s % 2 === 0 ? colRed : colWhite
        );
        ring.position.y = 4 + s * 8;
        ring.castShadow = true;
        lh.add(ring);
      }

      const lampH = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 6, 12), pal.goldSun);
      lampH.position.y = 43;
      lh.add(lampH);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 5, 12), pal.terracottaDark);
      roof.position.y = 48;
      lh.add(roof);

      addLandingPlatformRunway(lh, 22, 22, 40.0);
      scene.add(lh);

      dropZones.push({
        id: 'lighthouse',
        name: 'Cape Lighthouse Platform',
        icon: '✨',
        position: new THREE.Vector3(-210, 80.4, 150),
        landingY: 80.4,
        radius: 24.0
      });

      addCylinderCollider(new THREE.Vector3(-210, 60, 150), 5.5, 42);
    }
    buildLighthouse();

    // 6. Miyazaki Memorial Point
    function buildMiyazakiPoint() {
      const pt = new THREE.Group();
      pt.position.set(-130, 44, -140);

      const gazebo = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 1.2, 8), pal.stoneCobble);
      gazebo.position.y = 0.6;
      pt.add(gazebo);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(9.5, 5, 8), pal.coralRoof);
      roof.position.y = 7.5;
      pt.add(roof);

      for (let p = 0; p < 6; p++) {
        const angle = (p / 6) * Math.PI * 2;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 6, 6), pal.woodDark);
        post.position.set(Math.cos(angle) * 7.2, 3.6, Math.sin(angle) * 7.2);
        pt.add(post);
      }

      addLandingPlatformRunway(pt, 18, 18, 1.0);
      scene.add(pt);

      dropZones.push({
        id: 'miyazaki_point',
        name: 'Hayao Miyazaki Memorial Point',
        icon: '📐',
        position: new THREE.Vector3(-130, 45.4, -140),
        landingY: 45.4,
        radius: 22.0
      });
    }
    buildMiyazakiPoint();

    // 7. Port Koriko Harbor
    function buildHarbor() {
      const hb = new THREE.Group();
      hb.position.set(45, 1.2, 180);

      const pier = new THREE.Mesh(new THREE.BoxGeometry(22, 1.4, 55), pal.woodDark);
      pier.position.set(0, 0.7, 0);
      pier.castShadow = true;
      hb.add(pier);

      for (let p = 0; p < 8; p++) {
        const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 4.5, 6), pal.woodDark);
        postL.position.set(-10.5, -0.8, -24 + p * 7);
        hb.add(postL);
        const postR = postL.clone();
        postR.position.x = 10.5;
        hb.add(postR);
      }

      addLandingPlatformRunway(hb, 20, 24, 1.6);
      scene.add(hb);

      dropZones.push({
        id: 'harbor',
        name: 'Grand Harbor Festival Pier',
        icon: '🍓',
        position: new THREE.Vector3(45, 6.0, 185),
        landingY: 6.0,
        radius: 24.0
      });
    }
    buildHarbor();
