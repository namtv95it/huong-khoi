/**
 * ChibiNun - Bé Chú Tiểu Chibi Dễ Thương
 * Thiết kế theo hình ảnh mẫu:
 *  - Đầu tròn to trọc nhẵn (chiếm ~45% chiều cao)
 *  - Mắt nhắm cười hình cánh cung (half-moon eyes)
 *  - Má phúng phính hồng ửng
 *  - Áo tràng xám xanh đậm slate-blue, tay áo thụng
 *  - Dép lào mỏng
 *  - Nâng cấp: Động tác cầm 3 nén nhang cháy đỏ và cắm hương vào bát bình hương
 */

class ChibiNun {
  constructor(scene, isPlayer = true, name = "Bé Tiểu", initialPos = { x: 0, y: 0, z: 0 }) {
    this.scene = scene;
    this.isPlayer = isPlayer;
    this.name = name;
    this.group = new THREE.Group();
    this.group.position.set(initialPos.x, initialPos.y, initialPos.z);

    // --- Trạng thái nhân vật ---
    this.isMoving          = false;
    this.isSitting         = false;
    this.isPraying         = false;
    this.isJoyful          = false;
    this.isHoldingIncense  = false;
    this.isPlanting        = false;
    this.plantTimer        = 0;
    this.hasInsertedSticks = false;

    this.walkCycle   = 0;
    this.idleCycle   = Math.random() * Math.PI * 2;
    this.joyTimer    = 0;
    this.glanceTimer = 3 + Math.random() * 5;
    this.glanceCycle = 0;
    this.isGlancing  = false;
    this.glanceDir   = 1;

    this.speed         = 3.8;
    this.rotationSpeed = 8.0;

    // --- Bảng màu ---
    this.colors = {
      skin:       0xfde8c8,   // Da nâu ấm sáng
      blush:      0xe87878,   // Má hồng đào
      robe:       0x7a8fa0,   // Áo tràng xám xanh (vừa đủ đậm, khớp ảnh mẫu)
      robeDark:   0x5c6e7c,   // Bóng áo / viền cổ
      robeHem:    0x6a7d8c,   // Gấu áo
      eyes:       0x2e1f12,   // Mắt nâu đen
      sandal:     0x3a2a1a,   // Quai dép tối
      sandalBase: 0x9a7850,   // Đế dép da
    };

    this.createModel();
    this.scene.add(this.group);
  }

  // ==================== XÂY DỰNG MÔ HÌNH ====================
  createModel() {
    this.bodyGroup = new THREE.Group();
    this.group.add(this.bodyGroup);

    const skinMat      = new THREE.MeshLambertMaterial({ color: this.colors.skin });
    const robeMat      = new THREE.MeshLambertMaterial({ color: this.colors.robe });
    const robeDarkMat  = new THREE.MeshLambertMaterial({ color: this.colors.robeDark });
    const robeHemMat   = new THREE.MeshLambertMaterial({ color: this.colors.robeHem });
    const blushMat     = new THREE.MeshBasicMaterial({ color: this.colors.blush, transparent: true, opacity: 0.70 });
    const eyeMat       = new THREE.MeshBasicMaterial({ color: this.colors.eyes });
    const sandalMat    = new THREE.MeshLambertMaterial({ color: this.colors.sandal });
    const sandalBaseMat= new THREE.MeshLambertMaterial({ color: this.colors.sandalBase });

    // ── 1. THÂN ÁO TRÀNG ──
    const robeGeo = new THREE.CylinderGeometry(0.25, 0.50, 0.72, 20);
    this.robeMesh = new THREE.Mesh(robeGeo, robeMat);
    this.robeMesh.position.y = 0.50;
    this.robeMesh.castShadow = true;
    this.bodyGroup.add(this.robeMesh);

    // Viền cổ áo
    const neckBandGeo = new THREE.CylinderGeometry(0.185, 0.200, 0.08, 16);
    const neckBand = new THREE.Mesh(neckBandGeo, robeDarkMat);
    neckBand.position.y = 0.84;
    this.bodyGroup.add(neckBand);

    // Gấu áo phía dưới
    const hemGeo = new THREE.CylinderGeometry(0.505, 0.505, 0.065, 20);
    this.hemMesh = new THREE.Mesh(hemGeo, robeHemMat);
    this.hemMesh.position.y = 0.175;
    this.bodyGroup.add(this.hemMesh);

    // ── 2. ĐẦU TRÒN TRỌC NHẴN ──
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.05, 0);
    this.bodyGroup.add(this.headGroup);

    const headGeo = new THREE.SphereGeometry(0.46, 28, 22);
    headGeo.scale(1.0, 0.98, 0.97);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headMesh.castShadow = true;
    this.headGroup.add(this.headMesh);

    // Tai nhỏ 2 bên
    const earGeo = new THREE.SphereGeometry(0.10, 12, 10);
    earGeo.scale(0.50, 1.0, 0.70);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.45, 0.0, 0.0);
    this.headGroup.add(leftEar);
    const rightEar = leftEar.clone();
    rightEar.position.x = 0.45;
    this.headGroup.add(rightEar);

    // ── MẮT NHẮM CƯỜI ──
    this._buildClosedEyes(eyeMat);

    // Lông mày cong nhẹ
    const browGeo = new THREE.TorusGeometry(0.052, 0.009, 6, 14, Math.PI * 0.70);
    const browMat = new THREE.MeshBasicMaterial({ color: 0x4a3020 });
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.155, 0.20, 0.43);
    leftBrow.rotation.set(0.05, 0, Math.PI * 0.07);
    this.headGroup.add(leftBrow);
    const rightBrow = leftBrow.clone();
    rightBrow.position.x = 0.155;
    rightBrow.rotation.z = -Math.PI * 0.07;
    this.headGroup.add(rightBrow);

    // Mũi chấm nhỏ
    const noseMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.026, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xd4906a })
    );
    noseMesh.position.set(0, 0.02, 0.455);
    noseMesh.scale.set(1.15, 0.80, 0.55);
    this.headGroup.add(noseMesh);

    // Miệng cười chúm chím
    const mouthGeo = new THREE.TorusGeometry(0.048, 0.010, 8, 14, Math.PI * 0.62);
    this.mouth = new THREE.Mesh(mouthGeo, new THREE.MeshBasicMaterial({ color: 0xb05840 }));
    this.mouth.position.set(0, -0.130, 0.44);
    this.mouth.rotation.set(0.10, 0, Math.PI);
    this.headGroup.add(this.mouth);

    // Má hồng ửng
    const blushGeo = new THREE.CircleGeometry(0.088, 18);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.255, -0.065, 0.415);
    leftBlush.rotation.set(0.08, -0.30, 0);
    this.headGroup.add(leftBlush);
    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.255, -0.065, 0.415);
    rightBlush.rotation.set(0.08, 0.30, 0);
    this.headGroup.add(rightBlush);

    // ── 3. TAY ÁO THỤNG ──
    this.leftArm  = this._buildArm(-1, robeMat, skinMat);
    this.rightArm = this._buildArm(1,  robeMat, skinMat);
    this.bodyGroup.add(this.leftArm);
    this.bodyGroup.add(this.rightArm);

    // ── 4. CHÂN + DÉP LÀO ──
    this.leftLeg  = this._buildLeg(-1, robeDarkMat, sandalMat, sandalBaseMat, skinMat);
    this.rightLeg = this._buildLeg(1,  robeDarkMat, sandalMat, sandalBaseMat, skinMat);
    this.group.add(this.leftLeg);
    this.group.add(this.rightLeg);

    // ── 5. CỤM 3 NÉN HƯƠNG TRẦM CẦM TAY KHI DÂNG HƯƠNG ──
    this._buildHeldIncense();

    // ── 6. BÓNG ĐỔ GIẢ ──
    const shadowMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.44, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.20 })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.010;
    this.group.add(shadowMesh);
  }

  _buildClosedEyes(eyeMat) {
    const makeEye = (side) => {
      const arc = new THREE.TorusGeometry(0.058, 0.015, 8, 16, Math.PI * 0.82);
      const eye = new THREE.Mesh(arc, eyeMat);
      eye.position.set(side * 0.165, 0.098, 0.44);
      eye.rotation.set(0.06, side * 0.04, Math.PI);
      this.headGroup.add(eye);
      return eye;
    };
    this.leftEyeArc  = makeEye(-1);
    this.rightEyeArc = makeEye(1);
  }

  _buildArm(side, robeMat, skinMat) {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 0.34, 0.78, 0.02);

    const sleeveGeo = new THREE.CylinderGeometry(0.09, 0.15, 0.30, 12);
    const sleeve = new THREE.Mesh(sleeveGeo, robeMat);
    sleeve.position.y = -0.13;
    sleeve.castShadow = true;
    armGroup.add(sleeve);

    const handGeo = new THREE.SphereGeometry(0.078, 12, 10);
    handGeo.scale(1.05, 0.88, 1.0);
    const hand = new THREE.Mesh(handGeo, new THREE.MeshLambertMaterial({ color: this.colors.skin }));
    hand.position.set(0, -0.295, 0.04);
    armGroup.add(hand);

    return armGroup;
  }

  _buildLeg(side, pantMat, sandalMat, sandalBaseMat, skinMat) {
    const legGroup = new THREE.Group();
    legGroup.position.set(side * 0.145, 0.17, 0);

    const legGeo = new THREE.CylinderGeometry(0.082, 0.076, 0.20, 10);
    const legMesh = new THREE.Mesh(legGeo, pantMat);
    legMesh.position.y = 0.02;
    legGroup.add(legMesh);

    const footGeo = new THREE.SphereGeometry(0.078, 10, 8);
    footGeo.scale(1.20, 0.60, 1.50);
    const foot = new THREE.Mesh(footGeo, skinMat);
    foot.position.set(0, -0.102, 0.058);
    legGroup.add(foot);

    const soleGeo = new THREE.BoxGeometry(0.148, 0.022, 0.228);
    const sole = new THREE.Mesh(soleGeo, sandalBaseMat);
    sole.position.set(0, -0.148, 0.058);
    legGroup.add(sole);

    const strapGeo = new THREE.BoxGeometry(0.150, 0.018, 0.036);
    const strap = new THREE.Mesh(strapGeo, sandalMat);
    strap.position.set(0, -0.122, 0.020);
    legGroup.add(strap);

    return legGroup;
  }

  // ── 3 NÉN HƯƠNG TRẦM TRÊN TAY BÉ CHÚ TIỂU ──
  _buildHeldIncense() {
    this.heldIncenseGroup = new THREE.Group();
    const stickMat = new THREE.MeshLambertMaterial({ color: 0x8b2518 });
    const emberMat = new THREE.MeshBasicMaterial({ color: 0xff3b00 });

    for (let i = -1; i <= 1; i++) {
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.007, 0.007, 0.44, 6),
        stickMat
      );
      stick.position.set(i * 0.035, 0.22, 0);
      stick.rotation.z = i * 0.04;
      this.heldIncenseGroup.add(stick);

      const ember = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 6, 6),
        emberMat
      );
      ember.position.set(i * 0.035, 0.44, 0);
      this.heldIncenseGroup.add(ember);
    }

    // Đốm sáng ấm áp tỏa ra từ 3 nén nhang đỏ
    this.heldIncenseLight = new THREE.PointLight(0xff5511, 0.9, 2.0);
    this.heldIncenseLight.position.set(0, 0.44, 0);
    this.heldIncenseGroup.add(this.heldIncenseLight);

    this.heldIncenseGroup.visible = false;
    this.bodyGroup.add(this.heldIncenseGroup);
  }

  setHoldingIncense(val) {
    this.isHoldingIncense = val;
    if (this.heldIncenseGroup) {
      this.heldIncenseGroup.visible = val;
    }
    if (!val) {
      this._restoreStandingPose();
    }
  }

  triggerPlantIncense(onSticksInserted, onPlantFinished) {
    this.isPlanting = true;
    this.plantTimer = 0;
    this.hasInsertedSticks = false;
    this.onSticksInserted = onSticksInserted;
    this.onPlantFinished = onPlantFinished;
  }

  // ==================== VÒNG LẶP HOẠT ẢNH ====================
  update(delta, isMoving = false, targetAngle = null) {
    this.isMoving = isMoving;

    if (targetAngle !== null) {
      let diff = targetAngle - this.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff >  Math.PI) diff -= Math.PI * 2;
      this.group.rotation.y += diff * Math.min(1, delta * this.rotationSpeed);
    }

    if (this.isJoyful) { this._animJoyful(delta);  return; }
    if (this.isPlanting) { this._animPlanting(delta); return; }
    if (this.isHoldingIncense) { this._animHoldingIncense(delta); return; }
    if (this.isSitting) { this._animSitting(delta); return; }
    if (this.isPraying) { this._animPraying(delta); return; }
    if (this.isMoving)  { this._animWalking(delta); }
    else                { this._animIdle(delta); }
  }

  // ── 1. DI CHUYỂN LON TON ──
  _animWalking(delta) {
    this.walkCycle += delta * 10.5;
    this._restoreStandingPose();

    const swing = Math.sin(this.walkCycle);
    const lift  = Math.max(0, Math.cos(this.walkCycle));

    this.leftLeg.position.z  = swing * 0.185;
    this.rightLeg.position.z = -swing * 0.185;
    this.leftLeg.position.y  = 0.17 + lift * 0.085;
    this.rightLeg.position.y = 0.17 + Math.max(0, -Math.cos(this.walkCycle)) * 0.085;
    this.leftLeg.rotation.x  = -swing * 0.20;
    this.rightLeg.rotation.x = swing * 0.20;

    this.bodyGroup.position.y = Math.abs(swing) * 0.045 + 0.005;
    this.bodyGroup.rotation.z = swing * 0.09;
    this.bodyGroup.rotation.y = Math.cos(this.walkCycle * 0.5) * 0.04;

    this.leftArm.rotation.x  = swing * 0.48;
    this.leftArm.rotation.z  = 0.06;
    this.rightArm.rotation.x = -swing * 0.48;
    this.rightArm.rotation.z = -0.06;

    this.headGroup.rotation.z = -swing * 0.065;
    this.headGroup.position.y = 1.05 + Math.abs(swing) * 0.020;
  }

  // ── 2. ĐỨNG YÊN / IDLE ──
  _animIdle(delta) {
    this.idleCycle += delta * 1.9;
    this._restoreStandingPose();

    this.leftLeg.position.set(-0.145, 0.17, 0);
    this.rightLeg.position.set(0.145, 0.17, 0);
    this.leftLeg.rotation.set(0, 0, 0);
    this.rightLeg.rotation.set(0, 0, 0);

    const breath = Math.sin(this.idleCycle) * 0.016;
    this.bodyGroup.position.y = breath;
    this.headGroup.position.y = 1.05 + breath * 0.5;

    this.leftArm.rotation.x  = Math.sin(this.idleCycle * 0.80) * 0.050;
    this.rightArm.rotation.x = Math.cos(this.idleCycle * 0.80) * 0.050;

    // Ngó nghiêng ngẫu nhiên
    this.glanceTimer -= delta;
    if (this.glanceTimer <= 0 && !this.isGlancing) {
      this.isGlancing  = true;
      this.glanceCycle = 0;
      this.glanceDir   = Math.random() > 0.5 ? 1 : -1;
      this.glanceTimer = 4.0 + Math.random() * 5.0;
    }
    if (this.isGlancing) {
      this.glanceCycle += delta * 2.6;
      const t = Math.sin(this.glanceCycle) * Math.exp(-this.glanceCycle * 0.35);
      this.headGroup.rotation.y = this.glanceDir * t * 0.50;
      if (this.glanceCycle > Math.PI * 1.8) {
        this.isGlancing = false;
        this.headGroup.rotation.y = 0;
      }
    }
  }

  // ── 3. CẦM HƯƠNG CHÁY TRƯỚC NGỰC (Cận cảnh thắp hương) ──
  _animHoldingIncense(delta) {
    this.idleCycle += delta * 2.0;
    this._restoreStandingPose();

    const breath = Math.sin(this.idleCycle) * 0.012;
    this.bodyGroup.position.y = breath;

    // Hai tay nâng niu 3 nén hương thơm trước ngực
    this.leftArm.position.set(-0.16, 0.77, 0.18);
    this.leftArm.rotation.set(Math.PI * 0.38, 0.16, -Math.PI * 0.20);
    this.rightArm.position.set(0.16, 0.77, 0.18);
    this.rightArm.rotation.set(Math.PI * 0.38, -0.16, Math.PI * 0.20);

    // 3 nén hương cháy đỏ tỏa ánh sáng
    this.heldIncenseGroup.visible = true;
    this.heldIncenseGroup.position.set(0, 0.72 + breath * 0.5, 0.28);
    this.heldIncenseGroup.rotation.set(-0.10, 0, Math.sin(this.idleCycle) * 0.018);

    // Chú tiểu nghiêng đầu nhìn nén hương lòng
    this.headGroup.rotation.x = 0.14;
    this.headGroup.position.y = 1.05 + breath * 0.4;
  }

  // ── 4. ĐỘNG TÁC CẮM HƯƠNG VÀO BÁT -> VÁI 3 LẦN -> BƯỚC LÙI LẠI TRANG NGHIÊM ──
  _animPlanting(delta) {
    this.plantTimer += delta;
    const dur = 5.8; // Thời lượng nghi lễ dâng hương từ tốn, trang nghiêm
    const progress = Math.min(1.0, this.plantTimer / dur);

    // Giai đoạn 1 (0 -> 1.6s): Vươn dài hai tay qua mặt bàn cắm 3 nén hương vào bát (đầu giữ trên cao, không cắm mặt vào bàn)
    if (progress < 0.28) {
      const p = progress / 0.28;
      const ease = Math.sin(p * Math.PI * 0.5);

      // Thân người chỉ hơi cúi nhẹ 6 độ, đầu ở độ cao Y = 1.05 (mặt bàn Y = 0.95), tuyệt đối không chạm bàn
      this.bodyGroup.position.set(0, 0, 0.05 * ease);
      this.bodyGroup.rotation.set(-0.06 * ease, 0, 0);
      this.headGroup.position.set(0, 1.05, 0);
      this.headGroup.rotation.set(0.06 * ease, 0, 0);

      // Hai tay áo thụng vươn dài ra phía trước qua mặt bàn để cắm hương
      this.leftArm.position.set(-0.16 + 0.04 * ease, 0.80 - 0.02 * ease, 0.22 + 0.45 * ease);
      this.leftArm.rotation.set(Math.PI * (0.38 + 0.14 * ease), 0.06, -0.04);
      this.rightArm.position.set(0.16 - 0.04 * ease, 0.80 - 0.02 * ease, 0.22 + 0.45 * ease);
      this.rightArm.rotation.set(Math.PI * (0.38 + 0.14 * ease), -0.06, 0.04);

      // 3 nén hương đi từ ngực tới thẳng bát hương
      this.heldIncenseGroup.visible = true;
      this.heldIncenseGroup.position.set(0, 0.74 + 0.18 * ease, 0.28 + 0.58 * ease);
      this.heldIncenseGroup.rotation.set(-0.10 * (1 - ease), 0, 0);
    }
    // Giai đoạn 2 (1.6s -> 2.2s): Nén hương cắm ngập vào bát, thu hai tay về ngực chắp thành búp sen
    else if (progress < 0.38) {
      if (!this.hasInsertedSticks) {
        this.hasInsertedSticks = true;
        this.heldIncenseGroup.visible = false;
        if (this.onSticksInserted) this.onSticksInserted();
      }

      const p = (progress - 0.28) / 0.10;
      const ease = Math.sin(p * Math.PI * 0.5);

      // Thân người đứng thẳng trang nghiêm
      this.bodyGroup.position.set(0, 0, 0.05 * (1 - ease));
      this.bodyGroup.rotation.set(-0.06 * (1 - ease), 0, 0);
      this.headGroup.position.set(0, 1.05, 0);
      this.headGroup.rotation.set(0.06 * (1 - ease), 0, 0);

      // Thu hai tay về trước ngực thành tư thế Búp Sen Chắp (Anjali Mudra)
      const armX = 0.12 * (1 - ease) + 0.13 * ease;
      const armY = 0.78 * (1 - ease) + 0.79 * ease;
      const armZ = 0.67 * (1 - ease) + 0.22 * ease;
      this.leftArm.position.set(-armX, armY, armZ);
      this.leftArm.rotation.set(Math.PI * 0.52 * (1 - ease) + Math.PI * 0.40 * ease, 0.06 * (1 - ease) + 0.18 * ease, -0.04 * (1 - ease) - Math.PI * 0.28 * ease);
      this.rightArm.position.set(armX, armY, armZ);
      this.rightArm.rotation.set(Math.PI * 0.52 * (1 - ease) + Math.PI * 0.40 * ease, -0.06 * (1 - ease) - 0.18 * ease, 0.04 * (1 - ease) + Math.PI * 0.28 * ease);
    }
    // Giai đoạn 3 (2.2s -> 4.5s): Đứng chắp tay vái 3 lần cung kính, trang nghiêm
    else if (progress < 0.80) {
      const p = (progress - 0.38) / 0.42;
      // 3 nhịp vái xá lạy: chu kỳ sin chạy đúng 3 lần
      const bowCurve = Math.max(0, Math.sin(p * Math.PI * 6.0));
      const easeBow = bowCurve * 0.24; // Góc cúi xá lễ trang trọng

      this.bodyGroup.position.set(0, -easeBow * 0.03, 0);
      this.bodyGroup.rotation.set(-easeBow * 0.45, 0, 0);
      this.headGroup.rotation.set(easeBow * 0.75, 0, 0);

      // Giữ chặt hai bàn tay chắp sen trước ngực
      this.leftArm.position.set(-0.13, 0.79, 0.22);
      this.leftArm.rotation.set(Math.PI * 0.40, 0.18, -Math.PI * 0.28);
      this.rightArm.position.set(0.13, 0.79, 0.22);
      this.rightArm.rotation.set(Math.PI * 0.40, -0.18, Math.PI * 0.28);
    }
    // Giai đoạn 4 (4.5s -> 5.8s): Bước lùi lại 2 bước cung kính (không nhảy lên)
    else {
      const p = (progress - 0.80) / 0.20;
      const ease = Math.sin(p * Math.PI * 0.5);

      this.bodyGroup.position.set(0, 0, 0);
      this.bodyGroup.rotation.set(0, 0, 0);
      this.headGroup.rotation.set(0, 0, 0);

      // Hai tay vẫn chắp sen thanh tịnh
      this.leftArm.position.set(-0.13, 0.79, 0.22);
      this.leftArm.rotation.set(Math.PI * 0.40, 0.18, -Math.PI * 0.28);
      this.rightArm.position.set(0.13, 0.79, 0.22);
      this.rightArm.rotation.set(Math.PI * 0.40, -0.18, Math.PI * 0.28);

      // Động tác bước lùi 2 bước
      const stepWalk = Math.sin(p * Math.PI * 4.0);
      this.leftLeg.position.z = stepWalk * 0.07;
      this.rightLeg.position.z = -stepWalk * 0.07;

      // Di chuyển vị trí chú tiểu lùi lại từ -5.45 về -4.90
      this.group.position.z = -5.45 + 0.55 * ease;
    }

    if (progress >= 1.0) {
      this.isPlanting = false;
      this.isHoldingIncense = false;
      this.isPraying = true;
      this.leftLeg.position.set(-0.145, 0.17, 0);
      this.rightLeg.position.set(0.145, 0.17, 0);
      if (this.onPlantFinished) this.onPlantFinished();
    }
  }

  // ── 5. NGỒI THIỀN KIẾT GIÀ ──
  _animSitting(delta) {
    this.idleCycle += delta * 1.6;
    const breath = Math.sin(this.idleCycle) * 0.008;

    this.bodyGroup.position.set(0, breath, 0);
    this.bodyGroup.rotation.set(0.04, 0, 0);

    this.robeMesh.scale.set(1.42, 0.50, 1.34);
    this.robeMesh.position.set(0, 0.25, 0.03);
    this.hemMesh.scale.set(1.38, 1, 1.30);
    this.hemMesh.position.set(0, 0.13, 0.03);

    this.headGroup.position.set(0, 0.72, 0.04);
    this.headGroup.rotation.set(0.06, 0, 0);

    this.leftLeg.position.set(-0.210, 0.055, 0.195);
    this.leftLeg.rotation.set(0.16, 0.40, Math.PI * 0.43);
    this.rightLeg.position.set(0.210, 0.055, 0.195);
    this.rightLeg.rotation.set(0.16, -0.40, -Math.PI * 0.43);

    this.leftArm.position.set(-0.30, 0.49, 0.10);
    this.leftArm.rotation.set(0.60, 0.14, -0.28);
    this.rightArm.position.set(0.30, 0.49, 0.10);
    this.rightArm.rotation.set(0.60, -0.14, 0.28);
  }

  // ── 6. DÂNG HƯƠNG CHẮP TAY ──
  _animPraying(delta) {
    this.idleCycle += delta * 1.8;
    this._restoreStandingPose();

    const rock = Math.sin(this.idleCycle) * 0.012;
    this.bodyGroup.position.y = rock;
    this.bodyGroup.rotation.x = 0.22;

    this.headGroup.rotation.x = 0.18;
    this.headGroup.position.y = 1.04;

    this.leftArm.position.set(-0.16, 0.82, 0.20);
    this.leftArm.rotation.set(Math.PI * 0.38, 0.22, -Math.PI * 0.30);
    this.rightArm.position.set(0.16, 0.82, 0.20);
    this.rightArm.rotation.set(Math.PI * 0.38, -0.22, Math.PI * 0.30);

    this.leftLeg.position.set(-0.145, 0.17, 0);
    this.rightLeg.position.set(0.145, 0.17, 0);
    this.leftLeg.rotation.set(0, 0, 0);
    this.rightLeg.rotation.set(0, 0, 0);
  }

  // ── 7. VUI MỪNG NHÚN NHẢY ──
  triggerJoyful() {
    this.isJoyful = true;
    this.joyTimer = 0;
  }

  _animJoyful(delta) {
    this.joyTimer += delta;
    const t = this.joyTimer;

    const bounce = Math.max(0, Math.sin(t * Math.PI / 0.34)) * 0.20;
    this.group.position.y = bounce;
    this.bodyGroup.position.y = 0;

    const armUp = Math.max(0, Math.sin(t * Math.PI / 0.34));
    this.leftArm.rotation.set(-Math.PI * 0.33 * armUp, 0.20, -0.32 * armUp);
    this.rightArm.rotation.set(-Math.PI * 0.33 * armUp, -0.20, 0.32 * armUp);

    this.headGroup.rotation.z = Math.sin(t * 14) * 0.11;

    if (t >= 1.10) {
      this.isJoyful = false;
      this.group.position.y = 0;
      this.headGroup.rotation.z = 0;
      this._restoreStandingPose();
    }
  }

  // ── PHỤC HỒI TƯ THẾ ĐỨNG THẲNG ──
  _restoreStandingPose() {
    this.robeMesh.scale.set(1, 1, 1);
    this.robeMesh.position.set(0, 0.50, 0);
    this.hemMesh.scale.set(1, 1, 1);
    this.hemMesh.position.set(0, 0.175, 0);

    this.leftArm.position.set(-0.34, 0.78, 0.02);
    this.rightArm.position.set(0.34, 0.78, 0.02);
    this.leftArm.rotation.set(0, 0, 0);
    this.rightArm.rotation.set(0, 0, 0);

    this.headGroup.rotation.set(0, 0, 0);
    this.bodyGroup.rotation.set(0, 0, 0);
    this.bodyGroup.position.set(0, 0, 0);
    this.headGroup.position.set(0, 1.05, 0);

    if (this.heldIncenseGroup) {
      this.heldIncenseGroup.visible = this.isHoldingIncense;
    }
  }
}

window.ChibiNun = ChibiNun;
