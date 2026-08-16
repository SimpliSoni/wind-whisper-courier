/* ==========================================================================
       5. CHARACTER RIG: KIKI & JIJI
       ========================================================================== */
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);

    const kikiDressMat = new THREE.MeshToonMaterial({ color: 0x1D2D44 });
    const kikiSkinMat = new THREE.MeshToonMaterial({ color: 0xFFD3B6 });
    const kikiRibbonMat = new THREE.MeshToonMaterial({ color: 0xD90429 });
    const kikiHairMat = new THREE.MeshToonMaterial({ color: 0x2B1E16 });
    const jijiFurMat = new THREE.MeshToonMaterial({ color: 0x111111 });
    const broomWoodMat = new THREE.MeshToonMaterial({ color: 0x8D5B4C });
    const broomStrawMat = new THREE.MeshToonMaterial({ color: 0xDEB887 });

    const broomGroup = new THREE.Group();
    playerGroup.add(broomGroup);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 4.8, 8), broomWoodMat);
    shaft.rotateX(Math.PI / 2);
    shaft.castShadow = true;
    broomGroup.add(shaft);

    const bristles = new THREE.Mesh(new THREE.ConeGeometry(0.68, 2.2, 10), broomStrawMat);
    bristles.rotateX(-Math.PI / 2);
    bristles.position.set(0, 0.1, -2.6);
    bristles.castShadow = true;
    broomGroup.add(bristles);

    const basket = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.95), pal.woodLight);
    basket.position.set(0, 0.45, 1.8);
    broomGroup.add(basket);

    const parcelMesh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), pal.stuccoPeach);
    parcelMesh.position.set(0, 0.72, 1.8);
    broomGroup.add(parcelMesh);

    const kikiGroup = new THREE.Group();
    kikiGroup.position.set(0, 0.4, 0.2);
    playerGroup.add(kikiGroup);

    const dress = new THREE.Mesh(new THREE.ConeGeometry(0.82, 1.6, 10), kikiDressMat);
    dress.position.y = 0.8;
    dress.castShadow = true;
    kikiGroup.add(dress);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.46, 12, 10), kikiSkinMat);
    head.position.set(0, 1.85, 0.05);
    head.castShadow = true;
    kikiGroup.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), kikiHairMat);
    hair.position.set(0, 1.95, -0.05);
    kikiGroup.add(hair);

    const bowGroup = new THREE.Group();
    bowGroup.position.set(0, 2.4, -0.05);
    const bowL = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 4), kikiRibbonMat);
    bowL.rotateZ(Math.PI / 3);
    bowL.position.x = -0.4;
    bowGroup.add(bowL);

    const bowR = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 4), kikiRibbonMat);
    bowR.rotateZ(-Math.PI / 3);
    bowR.position.x = 0.4;
    bowGroup.add(bowR);
    bowGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), kikiRibbonMat));
    kikiGroup.add(bowGroup);

    const jijiGroup = new THREE.Group();
    jijiGroup.position.set(0, 0.7, 1.6);
    broomGroup.add(jijiGroup);

    const jijiBody = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), jijiFurMat);
    jijiGroup.add(jijiBody);

    const jijiHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), jijiFurMat);
    jijiHead.position.set(0, 0.24, 0.05);
    jijiGroup.add(jijiHead);

    const earGeo = new THREE.ConeGeometry(0.07, 0.16, 3);
    const earL = new THREE.Mesh(earGeo, jijiFurMat);
    earL.position.set(-0.09, 0.38, 0.05);
    jijiGroup.add(earL);

    const earR = new THREE.Mesh(earGeo, jijiFurMat);
    earR.position.set(0.09, 0.38, 0.05);
    jijiGroup.add(earR);

    // Particles: Sakura Petals & Sparkle Trail
    const petalCount = 180;
    const petalGeo = new THREE.BufferGeometry();
    const petalPos = new Float32Array(petalCount * 3);
    const petalVels = [];

    for (let i = 0; i < petalCount; i++) {
      petalPos[i * 3] = (Math.random() - 0.5) * 450;
      petalPos[i * 3 + 1] = 10 + Math.random() * 90;
      petalPos[i * 3 + 2] = (Math.random() - 0.5) * 450;
      petalVels.push({
        vx: -0.25 - Math.random() * 0.3,
        vy: -0.06 - Math.random() * 0.08,
        vz: 0.15 + Math.random() * 0.2,
        sway: Math.random() * Math.PI * 2
      });
    }
    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPos, 3));
    scene.add(new THREE.Points(petalGeo, new THREE.PointsMaterial({ color: 0xFFAFCC, size: 1.6, transparent: true, opacity: 0.85 })));

    const sparkleCount = 140;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePos = new Float32Array(sparkleCount * 3);
    const sparkleLifes = new Float32Array(sparkleCount);
    for (let i = 0; i < sparkleCount; i++) {
      sparklePos[i * 3] = 0;
      sparklePos[i * 3 + 1] = -500;
      sparklePos[i * 3 + 2] = 0;
      sparkleLifes[i] = 0;
    }
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
    const sparkleTrail = new THREE.Points(sparkleGeo, new THREE.PointsMaterial({
      color: 0xFFD166,
      size: 2.5,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    }));
    scene.add(sparkleTrail);
    let nextSparkleIdx = 0;
