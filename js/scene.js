/* ==========================================================================
       2. THREE.JS SCENE, GOUACHE SKY DOME & ATMOSPHERE
       ========================================================================== */
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xD8EEF8, 0.0016);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2400);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xCDE8FE, 0.95);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xFFF3D6, 0x388E3C, 0.65);
    scene.add(hemisphereLight);

    const sunLight = new THREE.DirectionalLight(0xFFF0D6, 1.55);
    sunLight.position.set(160, 260, 120);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.near = 10;
    sunLight.shadow.far = 800;
    const sDist = 320;
    sunLight.shadow.camera.left = -sDist;
    sunLight.shadow.camera.right = sDist;
    sunLight.shadow.camera.top = sDist;
    sunLight.shadow.camera.bottom = -sDist;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Rich Watercolor & Gouache Sky Dome
    function buildGouacheSky() {
      const vertexShader = `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
      const fragmentShader = `
        varying vec3 vWorldPosition;
        void main() {
          vec3 dir = normalize(vWorldPosition);
          float h = dir.y;

          // Multi-layer Ghibli Gouache Color Palette
          vec3 zenith = vec3(0.0, 0.42, 0.72);      // Rich cerulean blue
          vec3 midSky = vec3(0.28, 0.79, 0.92);      // Bright turquoise/azure
          vec3 horizon = vec3(1.0, 0.89, 0.82);     // Warm peach sun haze
          vec3 sunsetGlow = vec3(0.98, 0.68, 0.45); // Golden horizon glow
          vec3 seaHaze = vec3(0.12, 0.58, 0.54);    // Coastal sea-foam mist

          vec3 col;
          if (h > 0.35) {
            col = mix(midSky, zenith, (h - 0.35) / 0.65);
          } else if (h > 0.04) {
            float t = (h - 0.04) / 0.31;
            col = mix(horizon, midSky, t);
          } else if (h > -0.15) {
            float t = (h + 0.15) / 0.19;
            col = mix(seaHaze, horizon, t);
          } else {
            col = seaHaze;
          }

          // Subtle Gouache Sun Halo Scattering
          vec3 sunDir = normalize(vec3(0.5, 0.7, 0.4));
          float sunDot = max(0.0, dot(dir, sunDir));
          col += vec3(1.0, 0.92, 0.75) * pow(sunDot, 6.0) * 0.38;
          col += vec3(1.0, 0.6, 0.3) * pow(sunDot, 2.0) * 0.14;

          gl_FragColor = vec4(col, 1.0);
        }
      `;
      const skyGeo = new THREE.SphereGeometry(1900, 32, 24);
      const skyMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
        depthWrite: false
      });
      scene.add(new THREE.Mesh(skyGeo, skyMat));
    }
    buildGouacheSky();

    // Multi-tier Painterly Cumulus Clouds
    const clouds = new THREE.Group();
    scene.add(clouds);

    function buildCumulusClouds() {
      const cloudMat = new THREE.MeshToonMaterial({
        color: 0xFFFDF8,
        emissive: 0xFFEEDD,
        emissiveIntensity: 0.15
      });
      const puffGeo = new THREE.SphereGeometry(18, 10, 8);

      for (let c = 0; c < 22; c++) {
        const cluster = new THREE.Group();
        const angle = (c / 22) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const dist = 320 + Math.random() * 450;
        const baseAlt = 85 + Math.random() * 65;

        cluster.position.set(Math.cos(angle) * dist, baseAlt, Math.sin(angle) * dist);

        const puffsInCluster = 5 + Math.floor(Math.random() * 4);
        for (let p = 0; p < puffsInCluster; p++) {
          const puff = new THREE.Mesh(puffGeo, cloudMat);
          puff.position.set(
            (p - puffsInCluster / 2) * 14 + (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 14
          );
          const sc = 0.8 + Math.random() * 0.9;
          puff.scale.set(sc * 1.2, sc * 0.85, sc);
          cluster.add(puff);
        }
        clouds.add(cluster);
      }
    }
    buildCumulusClouds();

    // Ocean Plane with Ghibli Watercolor Reflections
    const oceanGeo = new THREE.PlaneGeometry(3600, 3600, 64, 64);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x1D8A99,
      roughness: 0.18,
      metalness: 0.22,
      flatShading: true
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    scene.add(oceanMesh);
