/**
 * Chibi Little Monk (Bé Chú Tiểu / Tiểu Sư Cô Chibi)
 * Giữ nguyên 100% thiết kế nhân vật chibi đáng yêu nguyên bản:
 * - Đầu tròn má hồng ửng, đôi mắt to long lanh, miệng cười chúm chím
 * - Áo tràng lam truyền thống với tay áo thụng mềm mại
 * - Chuỗi tràng hạt gỗ đeo cổ rủ trước ngực
 * - Dáng đi lon ton lúc lắc siêu dễ thương (Cute Waddling Animation)
 * - Tọa thiền kiết già an nhiên & chắp tay búp sen dâng hương
 */

class ChibiNun {
    constructor(scene, isPlayer = true, name = "Bé Tiểu", initialPos = { x: 0, y: 0, z: 0 }) {
      this.scene = scene;
      this.isPlayer = isPlayer;
      this.name = name;
      this.group = new THREE.Group();
      this.group.position.set(initialPos.x, initialPos.y, initialPos.z);

      // Trạng thái nhân vật
      this.isMoving = false;
      this.isSitting = false;
      this.isPraying = false;
      this.walkCycle = 0;
      this.idleCycle = Math.random() * Math.PI * 2;

      this.speed = 3.8;
      this.rotationSpeed = 8.0;

    this.colors = {
      skin: 0xffe0bd,
      blush: 0xff9999,
      robe: 0x8da5b5,       // Áo tràng lam truyền thống nguyên bản
      robeTrim: 0x728999,
      belt: 0xd9822b,       // Đai lưng cam đất
      eyes: 0x221a15,
      beads: 0x5a3d28,      // Chuỗi tràng hạt gỗ mun
      shoe: 0x2b2b2b
    };

      this.createModel();
      this.scene.add(this.group);
    }

    createModel() {
      this.bodyGroup = new THREE.Group();
      this.group.add(this.bodyGroup);

      const skinMat = new THREE.MeshLambertMaterial({ color: this.colors.skin });
      const robeMat = new THREE.MeshLambertMaterial({ color: this.colors.robe });
      const robeTrimMat = new THREE.MeshLambertMaterial({ color: this.colors.robeTrim });
      const blushMat = new THREE.MeshBasicMaterial({ color: this.colors.blush, transparent: true, opacity: 0.65 });
      const eyeMat = new THREE.MeshBasicMaterial({ color: this.colors.eyes });
      const shoeMat = new THREE.MeshLambertMaterial({ color: this.colors.shoe });
      const beltMat = new THREE.MeshLambertMaterial({ color: this.colors.belt });
      const beadMat = new THREE.MeshLambertMaterial({ color: this.colors.beads });

      // 1. THÂN & ÁO TRÀNG LAM (Robe Body)
      const robeGeo = new THREE.CylinderGeometry(0.32, 0.52, 0.75, 16);
      this.robeMesh = new THREE.Mesh(robeGeo, robeMat);
      this.robeMesh.position.y = 0.52;
      this.robeMesh.castShadow = true;
      this.bodyGroup.add(this.robeMesh);

      // Cổ áo chữ V đặc trưng áo tràng
      const collarGeo = new THREE.TorusGeometry(0.28, 0.04, 8, 16, Math.PI);
      this.collar = new THREE.Mesh(collarGeo, robeTrimMat);
      this.collar.position.set(0, 0.88, 0.12);
      this.collar.rotation.x = Math.PI * 0.4;
      this.bodyGroup.add(this.collar);

      // Đai lưng vải
      const beltGeo = new THREE.CylinderGeometry(0.38, 0.39, 0.1, 16);
      this.belt = new THREE.Mesh(beltGeo, beltMat);
      this.belt.position.y = 0.58;
      this.bodyGroup.add(this.belt);

      // Chuỗi tràng hạt gỗ đeo cổ rủ xuống ngực
      this.createPrayerBeads(beadMat);

      // 2. ĐẦU TRÒN CHIBI ĐÁNG YÊU (Chibi Head)
      this.headGroup = new THREE.Group();
      this.headGroup.position.set(0, 1.05, 0);
      this.bodyGroup.add(this.headGroup);

      const headGeo = new THREE.SphereGeometry(0.48, 24, 20);
      headGeo.scale(1.0, 0.95, 0.95);
      this.headMesh = new THREE.Mesh(headGeo, skinMat);
      this.headMesh.castShadow = true;
      this.headGroup.add(this.headMesh);

      // Hai tai nhỏ xinh
      const earGeo = new THREE.SphereGeometry(0.1, 12, 10);
      earGeo.scale(0.5, 1, 0.8);
      const leftEar = new THREE.Mesh(earGeo, skinMat);
      leftEar.position.set(-0.47, 0, 0);
      this.headGroup.add(leftEar);
      const rightEar = leftEar.clone();
      rightEar.position.x = 0.47;
      this.headGroup.add(rightEar);

      // Đôi mắt to tròn lấp lánh (Sparkling anime eyes)
      const eyeGeo = new THREE.SphereGeometry(0.065, 12, 12);
      eyeGeo.scale(0.8, 1.2, 0.3);
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.16, 0.03, 0.44);
      this.headGroup.add(leftEye);
      const rightEye = leftEye.clone();
      rightEye.position.x = 0.16;
      this.headGroup.add(rightEye);

      // Đốm sáng trong mắt
      const sparkleGeo = new THREE.SphereGeometry(0.02, 8, 8);
      const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const leftSparkle = new THREE.Mesh(sparkleGeo, sparkleMat);
      leftSparkle.position.set(-0.14, 0.06, 0.46);
      this.headGroup.add(leftSparkle);
      const rightSparkle = leftSparkle.clone();
      rightSparkle.position.x = 0.18;
      this.headGroup.add(rightSparkle);

      // Đôi má hồng ửng dễ thương
      const blushGeo = new THREE.CircleGeometry(0.08, 16);
      const leftBlush = new THREE.Mesh(blushGeo, blushMat);
      leftBlush.position.set(-0.25, -0.09, 0.42);
      leftBlush.rotation.y = -0.3;
      this.headGroup.add(leftBlush);
      const rightBlush = new THREE.Mesh(blushGeo, blushMat);
      rightBlush.position.set(0.25, -0.09, 0.42);
      rightBlush.rotation.y = 0.3;
      this.headGroup.add(rightBlush);

      // Miệng cười chúm chím
      const mouthGeo = new THREE.TorusGeometry(0.045, 0.012, 8, 12, Math.PI);
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0x9e433d });
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.position.set(0, -0.15, 0.45);
      mouth.rotation.x = Math.PI * 0.15;
      mouth.rotation.z = Math.PI;
      this.headGroup.add(mouth);

      // 3. TAY ÁO THỤNG & BÀN TAY (Arms & Wide Sleeves)
      this.leftArm = this.createArm(-1, robeMat, skinMat);
      this.bodyGroup.add(this.leftArm);
      this.rightArm = this.createArm(1, robeMat, skinMat);
      this.bodyGroup.add(this.rightArm);

      // 4. CHÂN & HÀI VẢI (Legs & Shoes)
      this.leftLeg = new THREE.Group();
      this.leftLeg.position.set(-0.16, 0.22, 0);
      const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 10);
      const legMesh = new THREE.Mesh(legGeo, robeTrimMat);
      const shoeGeo = new THREE.BoxGeometry(0.14, 0.1, 0.22);
      const shoe = new THREE.Mesh(shoeGeo, shoeMat);
      shoe.position.set(0, -0.12, 0.04);
      this.leftLeg.add(legMesh);
      this.leftLeg.add(shoe);
      this.group.add(this.leftLeg);

      this.rightLeg = this.leftLeg.clone();
      this.rightLeg.position.x = 0.16;
      this.group.add(this.rightLeg);

      // Bóng đổ giả dưới chân
      const shadowGeo = new THREE.CircleGeometry(0.48, 20);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.25
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.015;
      this.group.add(shadow);
    }

    createArm(side, robeMat, skinMat) {
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 0.38, 0.8, 0);

      const sleeveGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.35, 12);
      const sleeve = new THREE.Mesh(sleeveGeo, robeMat);
      sleeve.position.y = -0.16;
      sleeve.castShadow = true;
      armGroup.add(sleeve);

      const handGeo = new THREE.SphereGeometry(0.08, 12, 10);
      const hand = new THREE.Mesh(handGeo, skinMat);
      hand.position.set(0, -0.34, 0.04);
      armGroup.add(hand);

      return armGroup;
    }

    createPrayerBeads(beadMat) {
      this.beadsGroup = new THREE.Group();
      const count = 18;
      const radius = 0.22;
      const beadGeo = new THREE.SphereGeometry(0.026, 8, 8);

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const bead = new THREE.Mesh(beadGeo, beadMat);
        bead.position.set(
          Math.cos(angle) * radius,
          -Math.sin(angle) * radius * 1.35,
          Math.sin(angle) * 0.08
        );
        this.beadsGroup.add(bead);
      }
      this.beadsGroup.position.set(0, 0.72, 0.22);
      this.beadsGroup.rotation.x = 0.35;
      this.bodyGroup.add(this.beadsGroup);
    }

      // Animation Update Loop
      update(delta, isMoving = false, targetAngle = null) {
        this.isMoving = isMoving;

        // Xoay hướng nhân vật mượt mà
        if (targetAngle !== null) {
          let diff = targetAngle - this.group.rotation.y;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          this.group.rotation.y += diff * Math.min(1, delta * this.rotationSpeed);
        }

        // 1. KHI DI CHUYỂN (Cute Waddling Animation)
        if (this.isMoving && !this.isSitting) {
          this.walkCycle += delta * 11;

          // Khôi phục tỉ lệ áo đứng
          this.restoreStandingPose();

          this.leftLeg.position.z = Math.sin(this.walkCycle) * 0.18;
          this.rightLeg.position.z = -Math.sin(this.walkCycle) * 0.18;
          this.leftLeg.position.y = 0.22 + Math.max(0, Math.cos(this.walkCycle) * 0.08);
          this.rightLeg.position.y = 0.22 + Math.max(0, -Math.cos(this.walkCycle) * 0.08);

          // Thân lắc lư lon ton sang hai bên
          this.bodyGroup.position.y = Math.abs(Math.sin(this.walkCycle)) * 0.06;
          this.bodyGroup.rotation.z = Math.sin(this.walkCycle * 0.5) * 0.1;
          this.bodyGroup.rotation.y = Math.cos(this.walkCycle * 0.5) * 0.06;

          if (!this.isPraying) {
            this.leftArm.rotation.x = Math.sin(this.walkCycle) * 0.55;
            this.rightArm.rotation.x = -Math.sin(this.walkCycle) * 0.55;
            this.leftArm.rotation.z = 0.1;
            this.rightArm.rotation.z = -0.1;
          }
          this.headGroup.rotation.z = -Math.sin(this.walkCycle * 0.5) * 0.08;
        }
        // 2. KHI ĐỨNG YÊN (Idle Breathing)
        else if (!this.isSitting) {
          this.idleCycle += delta * 2.2;
          this.restoreStandingPose();

          this.leftLeg.position.set(-0.16, 0.22, 0);
          this.rightLeg.position.set(0.16, 0.22, 0);
          this.leftLeg.rotation.set(0, 0, 0);
          this.rightLeg.rotation.set(0, 0, 0);

          const breath = Math.sin(this.idleCycle) * 0.02;
          this.bodyGroup.position.y = breath;
          this.headGroup.position.y = 1.05 + breath * 0.5;

          if (!this.isPraying) {
            this.leftArm.rotation.x = Math.sin(this.idleCycle * 0.8) * 0.06;
            this.rightArm.rotation.x = Math.cos(this.idleCycle * 0.8) * 0.06;
          }
        }
        // 3. KHI NGỒI THIỀN KIẾT GIÀ TRÊN ĐỆM (Sitting Meditation)
        else if (this.isSitting) {
          this.idleCycle += delta * 1.8;
          const breath = Math.sin(this.idleCycle) * 0.01;

          this.bodyGroup.position.set(0, breath, 0);
          this.bodyGroup.rotation.set(0.04, 0, 0);

          // Tà áo tràng xòe rộng phủ xuống mặt đệm
          this.robeMesh.scale.set(1.42, 0.52, 1.35);
          this.robeMesh.position.set(0, 0.26, 0.04);
          this.belt.scale.set(1.36, 1, 1.25);
          this.belt.position.set(0, 0.36, 0.04);
          this.collar.position.set(0, 0.62, 0.13);
          this.beadsGroup.position.set(0, 0.48, 0.22);

          this.headGroup.position.set(0, 0.74, 0.06);

          // Chân bắt chéo kiết già lộ nhẹ 2 mũi hài vải ở trước đệm
          this.leftLeg.position.set(-0.24, 0.06, 0.22);
          this.leftLeg.rotation.set(0.18, 0.45, Math.PI * 0.45);
          this.rightLeg.position.set(0.24, 0.06, 0.22);
          this.rightLeg.rotation.set(0.18, -0.45, -Math.PI * 0.45);

          // Hai tay buông thư thủ ấn thiền định trên đùi
          this.leftArm.position.set(-0.34, 0.52, 0.12);
          this.leftArm.rotation.set(0.65, 0.15, -0.32);
          this.rightArm.position.set(0.34, 0.52, 0.12);
          this.rightArm.rotation.set(0.65, -0.15, 0.32);
        }

        // 4. CHẮP TAY BÚP SEN (Lotus Mudra when Praying / Bowing)
        if (this.isPraying) {
          this.leftArm.rotation.set(Math.PI * 0.42, 0, -Math.PI * 0.35);
          this.rightArm.rotation.set(Math.PI * 0.42, 0, Math.PI * 0.35);
          this.bodyGroup.rotation.x = 0.2;
          this.headGroup.rotation.x = 0.18;
        }
      }

      restoreStandingPose() {
        this.robeMesh.scale.set(1, 1, 1);
        this.robeMesh.position.set(0, 0.52, 0);
        this.belt.scale.set(1, 1, 1);
        this.belt.position.set(0, 0.58, 0);
        this.collar.position.set(0, 0.88, 0.12);
        this.beadsGroup.position.set(0, 0.72, 0.22);

        this.leftArm.position.set(-0.38, 0.8, 0);
        this.rightArm.position.set(0.38, 0.8, 0);
        this.headGroup.position.set(0, 1.05, 0);
      }
    }

    window.ChibiNun = ChibiNun;
