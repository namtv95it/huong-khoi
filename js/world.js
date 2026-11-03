/**
 * World & Temple Sanctuary (Chánh Điện Thiền Môn)
 * Tái tạo tỉ mỉ không gian thiền tịnh trang nghiêm với:
 * - Tranh bích họa Phật giáo Taenghwa độ phân giải cao trên tường (tranh-tuong-phat.png)
 * - Tôn tượng Phật Thích Ca dát vàng uy nghi tọa thiền sắc nét (tuong-phat.png)
 * - Tùy chọn phông đại cảnh điện thờ toàn cảnh nguy nga (dien-tho.png)
 * - Sàn gỗ ván dài, đệm thiền vuông, bàn hương khói trầm bay thanh tịnh
 */

class TempleWorld {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.smokePool = [];
    this.cushionPositions = [];
    this.currentTheme = 'tranh-tuong';
    this.textureLoader = new THREE.TextureLoader();

    this.createHall();
    this.createMuralWall();
    this.createAltarAndBuddha();
    this.createMeditationMatsGrid();
    this.createLighting();
    this.createIncenseSmoke();
  }

  loadSharpTexture(url) {
    const tex = this.textureLoader.load(url);
    tex.encoding = THREE.sRGBEncoding;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    if (this.renderer && this.renderer.capabilities) {
      tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    }
    return tex;
  }

  createHall() {
    // 1. SÀN GỖ VÁN DÀI TỐI MÀU (Dark Wood Plank Floor)
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 1024;
    floorCanvas.height = 1024;
    const fctx = floorCanvas.getContext('2d');

    // Nền gỗ nâu đen
    fctx.fillStyle = '#221915';
    fctx.fillRect(0, 0, 1024, 1024);

    // Kẻ các đường rãnh ván gỗ chạy dọc
    const plankWidth = 64;
    fctx.strokeStyle = '#120d0b';
    fctx.lineWidth = 3;
    for (let x = 0; x < 1024; x += plankWidth) {
      fctx.fillStyle = (x / plankWidth) % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)';
      fctx.fillRect(x, 0, plankWidth, 1024);
      fctx.beginPath();
      fctx.moveTo(x, 0);
      fctx.lineTo(x, 1024);
      fctx.stroke();
    }

    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.encoding = THREE.sRGBEncoding;
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(4, 8);
    if (this.renderer && this.renderer.capabilities) {
      floorTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    }

    const floorGeo = new THREE.PlaneGeometry(36, 40);
    const floorMat = new THREE.MeshLambertMaterial({
      map: floorTex,
      roughness: 0.65
    });
    this.floor = new THREE.Mesh(floorGeo, floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    // 2. TƯỜNG SAU VÀ TRẦN GỖ (Back Wall & Beams)
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x8a847b });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(32, 14, 0.6), wallMat);
    backWall.position.set(0, 7, -10);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 14, 40), wallMat);
    leftWall.position.set(-16, 7, 0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // Xà gồ trần
    const beamMat = new THREE.MeshLambertMaterial({ color: 0x1f1410 });
    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(32, 0.6, 0.8), beamMat);
    topBeam.position.set(0, 11.2, -9.6);
    this.scene.add(topBeam);

    // 3. CỘT GỖ LIM LỚN PHÍA TRÁI (Left Pillars & Bracket System)
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x271913 });
    const pillarGeo = new THREE.CylinderGeometry(0.55, 0.6, 12, 16);
    const pillarLeft = new THREE.Mesh(pillarGeo, pillarMat);
    pillarLeft.position.set(-12, 6, -5);
    pillarLeft.castShadow = true;
    this.scene.add(pillarLeft);

    const bracketGroup = new THREE.Group();
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 1.2), beamMat);
    b1.position.set(0, 5.7, 0);
    bracketGroup.add(b1);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 1.0), beamMat);
    b2.position.set(0, 6.05, 0);
    bracketGroup.add(b2);
    pillarLeft.add(bracketGroup);
  }

  createMuralWall() {
    // NẠP HAI HÌNH ẢNH SẮC NÉT: BÍCH HỌA TAENGHWA VÀ ĐẠI CẢNH ĐIỆN THỜ
    this.texMural = this.loadSharpTexture('assets/image/tranh-tuong-phat.png');
    this.texDienTho = this.loadSharpTexture('assets/image/dien-tho.png');

    const muralGeo = new THREE.PlaneGeometry(17.6, 8.8);
    this.muralMat = new THREE.MeshLambertMaterial({
      map: this.texMural,
      roughness: 0.65
    });

    this.muralMesh = new THREE.Mesh(muralGeo, this.muralMat);
    this.muralMesh.position.set(0, 6.6, -9.6);
    this.muralMesh.receiveShadow = true;
    this.scene.add(this.muralMesh);

    // Khung gỗ mun bao quanh bức tranh
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x140c08 });
    this.frameBorder = new THREE.Mesh(new THREE.BoxGeometry(18.2, 9.4, 0.25), frameMat);
    this.frameBorder.position.set(0, 6.6, -9.75);
    this.scene.add(this.frameBorder);
  }

  setMuralTheme(theme) {
    if (theme === 'dien-tho') {
      this.currentTheme = 'dien-tho';
      this.muralMat.map = this.texDienTho;
      this.muralMat.needsUpdate = true;
      // Tỷ lệ ảnh điện thờ là 1672:941 (~16:9), tăng nhẹ chiều cao để giữ nguyên tỷ lệ không bị méo
      this.muralMesh.scale.set(1.0, 1.12, 1.0);
      return 'Điện Thờ Toàn Cảnh';
    } else {
      this.currentTheme = 'tranh-tuong';
      this.muralMat.map = this.texMural;
      this.muralMat.needsUpdate = true;
      this.muralMesh.scale.set(1.0, 1.0, 1.0);
      return 'Bích Họa Cổ Truyền';
    }
  }

  createAltarAndBuddha() {
    const altarGroup = new THREE.Group();
    altarGroup.position.set(0, 0, -9.2);

    const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x1c120e });

    // 1. BỤC KÊ BÀN THỜ GỖ MUN DÀI (Raised Altar Platform Dais)
    const dais = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.75, 3.2), darkWoodMat);
    dais.position.set(0, 0.38, 0.8);
    dais.receiveShadow = true;
    dais.castShadow = true;
    altarGroup.add(dais);

    // 2. TÔN TƯỢNG PHẬT THÍCH CA DÁT VÀNG UY NGHI SẮC NÉT (tuong-phat.png)
    const buddhaGroup = new THREE.Group();
    buddhaGroup.position.set(0, 0.75, 0.6);

    // Bệ đài sen gỗ mun viền đồng nâng đỡ tượng vững chãi
    const pedestalBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.65, 1.85, 0.25, 24),
      new THREE.MeshLambertMaterial({ color: 0x221712 })
    );
    pedestalBase.position.y = 0.125;
    pedestalBase.receiveShadow = true;
    buddhaGroup.add(pedestalBase);

    // Viền kim loại dát vàng quanh chân đế
    const goldTrim = new THREE.Mesh(
      new THREE.TorusGeometry(1.72, 0.04, 8, 24),
      new THREE.MeshLambertMaterial({ color: 0xd4a548 })
    );
    goldTrim.rotation.x = Math.PI / 2;
    goldTrim.position.y = 0.24;
    buddhaGroup.add(goldTrim);

    // Tấm hình Tượng Phật độ nét cao tách nền (Aspect Ratio 1086 : 1448 = 0.75)
    const buddhaTex = this.loadSharpTexture('assets/image/tuong-phat.png');
    const statueHeight = 4.2;
    const statueWidth = statueHeight * (1086 / 1448); // = 3.15
    const buddhaMat = new THREE.MeshStandardMaterial({
      map: buddhaTex,
      transparent: true,
      alphaTest: 0.06,
      roughness: 0.35,
      metalness: 0.2,
      side: THREE.DoubleSide
    });

    const buddhaGeo = new THREE.PlaneGeometry(statueWidth, statueHeight);
    this.buddhaMesh = new THREE.Mesh(buddhaGeo, buddhaMat);
    // Đặt tượng đứng trang nghiêm ngay trên đài sen
    this.buddhaMesh.position.set(0, statueHeight / 2 + 0.15, 0.05);
    this.buddhaMesh.castShadow = true;
    buddhaGroup.add(this.buddhaMesh);

    // Ánh hào quang kim sắc dịu nhẹ tỏa ra phía sau tôn tượng Phật
    const haloLight = new THREE.PointLight(0xffdf88, 1.25, 8);
    haloLight.position.set(0, 2.9, 0.35);
    buddhaGroup.add(haloLight);

    altarGroup.add(buddhaGroup);

    // 3. ĐỒ LỄ TRÊN BÀN THỜ (Candlesticks, Vases, Incense Table)
    this.createCandleStand(altarGroup, -2.4, 0.75, 1.2);
    this.createCandleStand(altarGroup, 2.4, 0.75, 1.2);

    this.createCeladonVase(altarGroup, -3.2, 0.75, 1.0);
    this.createCeladonVase(altarGroup, 3.2, 0.75, 1.0);

    // BÀN HƯƠNG GỖ BỐN CHÂN Ở CHÍNH GIỮA
    const tableGroup = new THREE.Group();
    tableGroup.position.set(0, 0, 2.6);

    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.9), darkWoodMat);
    tableTop.position.y = 0.95;
    tableGroup.add(tableTop);

    const legPositions = [
      [-0.68, 0.47, -0.34],
      [0.68, 0.47, -0.34],
      [-0.68, 0.47, 0.34],
      [0.68, 0.47, 0.34]
    ];
    legPositions.forEach(p => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.95, 8), darkWoodMat);
      leg.position.set(...p);
      tableGroup.add(leg);
    });

    // Bát hương đồng
    const burnerGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.16, 16);
    this.burner = new THREE.Mesh(burnerGeo, new THREE.MeshLambertMaterial({ color: 0x423326 }));
    this.burner.position.set(0, 1.03, 0);
    tableGroup.add(this.burner);

    // Lớp tro hương mịn trong bát hương
    const ashGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.02, 16);
    const ash = new THREE.Mesh(ashGeo, new THREE.MeshLambertMaterial({ color: 0x6e6862 }));
    ash.position.set(0, 1.10, 0);
    tableGroup.add(ash);

    // 3 nén nhang trong bát hương
    this.burnerSticksGroup = new THREE.Group();
    const stickMat = new THREE.MeshLambertMaterial({ color: 0x8b2518 });
    this.stickEmberMat = new THREE.MeshBasicMaterial({ color: 0xff4d1a });

    for (let i = -1; i <= 1; i++) {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 6), stickMat);
      stick.position.set(i * 0.045, 1.28, 0);
      stick.rotation.z = i * 0.04;
      this.burnerSticksGroup.add(stick);

      const ember = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), this.stickEmberMat);
      ember.position.set(i * 0.045, 1.49, 0);
      this.burnerSticksGroup.add(ember);
    }

    this.burnerLight = new THREE.PointLight(0xff5511, 0.8, 2.5);
    this.burnerLight.position.set(0, 1.50, 0);
    this.burnerSticksGroup.add(this.burnerLight);

    this.burnerSticksGroup.visible = false;
    tableGroup.add(this.burnerSticksGroup);

    altarGroup.add(tableGroup);
    this.scene.add(altarGroup);
  }

  plantIncenseInBurner() {
    this.burnerSticksGroup.visible = true;
    if (this.burnerLight) {
      this.burnerLight.intensity = 2.8;
      this.burnerLight.color.setHex(0xff7722);
    }
    setTimeout(() => {
      if (this.burnerLight) {
        this.burnerLight.intensity = 1.0;
        this.burnerLight.color.setHex(0xff5511);
      }
    }, 2800);

    // Thổi bùng khói trầm thơm ngát bay lên từ bát hương
    for (let i = 0; i < 35; i++) {
      const p = this.smokePool.find(x => !x.alive);
      if (p) {
        p.alive = true;
        p.age = Math.random() * 0.8;
        p.mesh.position.set(
          (Math.random() - 0.5) * 0.10,
          1.42,
          -6.6 + (Math.random() - 0.5) * 0.10
        );
        p.mesh.visible = true;
      }
    }
  }

  createCandleStand(parent, x, y, z) {
    const brassMat = new THREE.MeshLambertMaterial({ color: 0xd4a548 });
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.18, 0.45, 12), brassMat);
    stand.position.set(x, y + 0.22, z);
    parent.add(stand);

    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.55, 10),
      new THREE.MeshLambertMaterial({ color: 0xf5f3ea })
    );
    candle.position.set(x, y + 0.65, z);
    parent.add(candle);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.03, 0.09, 8),
      new THREE.MeshBasicMaterial({ color: 0xffaa33 })
    );
    flame.position.set(x, y + 0.96, z);
    parent.add(flame);
  }

  createCeladonVase(parent, x, y, z) {
    const celadonMat = new THREE.MeshLambertMaterial({ color: 0xb5d4c8, roughness: 0.3 });
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.52, 14), celadonMat);
    vase.position.set(x, y + 0.26, z);
    parent.add(vase);

    const flowerMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    for (let i = 0; i < 4; i++) {
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), flowerMat);
      bloom.position.set(x + (i - 1.5) * 0.06, y + 0.6 + (i % 2) * 0.06, z);
      parent.add(bloom);
    }
  }

  createMeditationMatsGrid() {
    const matMat = new THREE.MeshLambertMaterial({
      color: 0x484c47,
      roughness: 0.8
    });

    const matGeo = new THREE.BoxGeometry(1.25, 0.12, 1.25);
    const columns = [-3.8, 0, 3.8];
    const rows = [-3.8, -1.2, 1.5, 4.2];

    rows.forEach((z, rIdx) => {
      columns.forEach((x, cIdx) => {
        const mat = new THREE.Mesh(matGeo, matMat);
        mat.position.set(x, 0.06, z);
        mat.receiveShadow = true;
        this.scene.add(mat);

        this.cushionPositions.push({ x, z, rIdx, cIdx });
      });
    });
  }

  createLighting() {
    this.ambientLight = new THREE.AmbientLight(0xfff5ea, 0.7);
    this.scene.add(this.ambientLight);

    // Nắng xiên từ cửa sổ bên trái rọi bóng dài
    this.sunLight = new THREE.DirectionalLight(0xffecd4, 1.15);
    this.sunLight.position.set(-18, 14, -2);
    this.sunLight.target.position.set(0, 0, -2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 40;
    this.sunLight.shadow.camera.left = -16;
    this.sunLight.shadow.camera.right = 16;
    this.sunLight.shadow.camera.top = 16;
    this.sunLight.shadow.camera.bottom = -16;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Điểm sáng ấm áp tôn vinh tôn tượng Phật
    const buddhaLight = new THREE.PointLight(0xffdf80, 0.9, 12);
    buddhaLight.position.set(0, 4.5, -6.5);
    this.scene.add(buddhaLight);
  }

  createIncenseSmoke() {
    const smokeGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0xeeeeee,
      transparent: true,
      opacity: 0.35
    });

    for (let i = 0; i < 45; i++) {
      const p = new THREE.Mesh(smokeGeo, smokeMat.clone());
      p.visible = false;
      this.scene.add(p);
      this.smokePool.push({
        mesh: p,
        alive: false,
        age: 0,
        maxLife: 2.8 + Math.random() * 1.5
      });
    }
  }

  update(delta, camera) {
    // Ánh mắt từ bi của Đức Phật nhẹ nhàng hướng theo người chiêm bái
    if (this.buddhaMesh && camera) {
      const statuePos = new THREE.Vector3();
      this.buddhaMesh.getWorldPosition(statuePos);
      const dx = camera.position.x - statuePos.x;
      const dz = camera.position.z - statuePos.z;
      const targetYaw = Math.atan2(dx, dz);
      // Giới hạn xoay nhẹ trong khoảng ±18 độ để tượng luôn trang nghiêm và giữ trọn độ dày
      const clampedYaw = Math.max(-0.32, Math.min(0.32, targetYaw));
      this.buddhaMesh.rotation.y = THREE.MathUtils.lerp(this.buddhaMesh.rotation.y, clampedYaw, 0.08);
    }

    // Khói nhang bay nhẹ thanh tịnh
    if (Math.random() < 0.35) {
      const p = this.smokePool.find(x => !x.alive);
      if (p) {
        p.alive = true;
        p.age = 0;
        p.mesh.position.set(
          (Math.random() - 0.5) * 0.08,
          1.45,
          -6.6 + (Math.random() - 0.5) * 0.08
        );
        p.mesh.visible = true;
      }
    }

    this.smokePool.forEach(p => {
      if (p.alive) {
        p.age += delta;
        p.mesh.position.y += delta * 0.28;
        p.mesh.position.x += Math.sin(p.age * 2) * 0.005;
        const progress = p.age / p.maxLife;
        const scale = 1 + progress * 2.8;
        p.mesh.scale.set(scale, scale, scale);
        p.mesh.material.opacity = Math.max(0, (1 - progress) * 0.35);

        if (p.age >= p.maxLife) {
          p.alive = false;
          p.mesh.visible = false;
        }
      }
    });
  }
}

window.TempleWorld = TempleWorld;
