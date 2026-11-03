/**
 * Main Game Controller: Nhập Vai Bé Chú Tiểu Chibi Dạo Chùa & Tĩnh Tọa
 * - Điều khiển bé chú tiểu đi lại tự do trong chánh điện (WASD / Mũi tên / Joystick cảm ứng)
 * - Tiến lại đệm để ngồi thiền kiết già, đến bàn thờ để dâng hương cầu an
 * - Tự động đi đến trước bát hương và chuyển góc cận cảnh điện ảnh khi thắp hương
 * - Cắm 3 nén hương trầm vào bát bình hương với khói trầm bay nghi ngút
 */

class GameApp {
  constructor() {
    this.container = document.getElementById('game-container');
    this.fellows = [];
    this.currentZone = null;

    // Trạng thái thắp hương & góc máy cận cảnh
    this.isAutoWalking = false;
    this.autoWalkTarget = new THREE.Vector3(0, 0, -5.45);
    this.cameraMode = 'follow'; // 'follow' | 'cinematic_incense'
    this.curCamLookAt = new THREE.Vector3(0, 1.2, 0);

    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    this.initThree();
    this.initWorldAndCharacters();
    this.initCameraControls();
    this.initInputs();
    this.initMinimalUI();
    this.initMobileJoystick();

    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a120e);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Cấu hình chuẩn màu điện ảnh & tăng cường độ nét sắc sảo
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.updateNameTagPosition();
    });
  }

  initWorldAndCharacters() {
    // 1. Dựng chánh điện và bích họa Taenghwa
    this.world = new TempleWorld(this.scene, this.renderer);

    // 2. NHÂN VẬT CHÍNH: Bé Chú Tiểu Chibi
    this.player = new ChibiNun(this.scene, true, "Bé Tiểu", { x: 0, y: 0, z: 2.5 });
    this.player.group.rotation.y = Math.PI; // Hướng mặt về phía tôn tượng Phật

    // 3. Hai vị tiểu đồng tu ngồi thiền hai bên (AI Fellow Monks)
    const leftFellow = new ChibiNun(this.scene, false, "Thanh Tâm", { x: -3.8, y: 0.06, z: -1.2 });
    leftFellow.group.rotation.y = Math.PI;
    leftFellow.isSitting = true;
    this.fellows.push(leftFellow);

    const rightFellow = new ChibiNun(this.scene, false, "An Nhiên", { x: 3.8, y: 0.06, z: -1.2 });
    rightFellow.group.rotation.y = Math.PI;
    rightFellow.isSitting = true;
    this.fellows.push(rightFellow);
  }

  initCameraControls() {
    this.camTarget = new THREE.Vector3(0, 1.2, 0);
    this.camDistance = 5.2;
    this.camPhi = 0.28;
    this.camTheta = Math.PI;

    this.isMouseDown = false;
    this.prevMousePos = { x: 0, y: 0 };
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isMouseDown) return;
      const dx = e.clientX - this.prevMousePos.x;
      const dy = e.clientY - this.prevMousePos.y;

      this.camTheta -= dx * 0.005;
      this.camPhi = Math.max(-0.25, Math.min(1.35, this.camPhi + dy * 0.005));
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    dom.addEventListener('wheel', (e) => {
      this.camDistance = Math.max(2.2, Math.min(12.0, this.camDistance + e.deltaY * 0.005));
    }, { passive: true });

    // Touch vuốt xoay camera trên điện thoại
    let touchStartX = 0;
    let touchStartY = 0;
    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1 && e.touches[0].clientX > window.innerWidth * 0.35) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    dom.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && e.touches[0].clientX > window.innerWidth * 0.35) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        this.camTheta -= dx * 0.006;
        this.camPhi = Math.max(-0.25, Math.min(1.35, this.camPhi + dy * 0.006));
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });
  }

  initInputs() {
    window.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.up = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.down = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'Space':
        case 'KeyC':
          e.preventDefault();
          this.toggleSit();
          break;
        case 'KeyE':
          if (this.currentZone === 'cushion') {
            this.toggleSit();
          } else if (this.currentZone === 'incense') {
            this.actionIncense();
          }
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.up = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.down = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
      }
    });
  }

  initMinimalUI() {
    this.nameTag = document.getElementById('player-nametag');
    this.nameText = document.getElementById('nametag-text');
    this.promptBox = document.getElementById('interact-prompt');
    this.promptIcon = document.getElementById('prompt-icon');
    this.promptAction = document.getElementById('prompt-action');
    this.promptKey = document.getElementById('prompt-key');

    // Nút ngồi thiền / đứng dậy
    const btnSit = document.getElementById('btn-sit-minimal');
    btnSit.addEventListener('click', () => this.toggleSit());

    // Nút thắp hương
    const btnIncense = document.getElementById('btn-incense-minimal');
    btnIncense.addEventListener('click', () => this.actionIncense());

    // Nút đóng modal thắp hương
    const btnCloseIncense = document.getElementById('btn-close-incense');
    if (btnCloseIncense) {
      btnCloseIncense.addEventListener('click', () => {
        this.cancelIncense();
      });
    }

    // Nút cắm hương dâng lời nguyện
    const btnSubmitPrayer = document.getElementById('btn-submit-prayer');
    if (btnSubmitPrayer) {
      btnSubmitPrayer.addEventListener('click', () => {
        const wish = document.getElementById('prayer-input').value.trim();
        this.completePrayerOffering(wish);
      });
    }

    document.querySelectorAll('.wish-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('prayer-input').value = chip.getAttribute('data-wish');
      });
    });

    // Nút Đổi Phông Cảnh (Bích Họa / Điện Thờ)
    const btnTheme = document.getElementById('btn-theme-minimal');
    const themeText = document.getElementById('theme-text');
    if (btnTheme) {
      btnTheme.addEventListener('click', () => {
        const nextTheme = (this.world.currentTheme === 'dien-tho') ? 'tranh-tuong' : 'dien-tho';
        const label = this.world.setMuralTheme(nextTheme);
        if (themeText) {
          themeText.textContent = (nextTheme === 'dien-tho') ? 'Cảnh: Điện Thờ' : 'Cảnh: Bích Họa';
        }
        this.showToast('✨ Đã chuyển sang: ' + label);
      });
    }

    // Nút Bật / Tắt nhạc nền chùa chiền
    const btnSound = document.getElementById('btn-soundscape-minimal');
    const soundIcon = document.getElementById('sound-icon');
    const soundText = document.getElementById('sound-text');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const isPlaying = window.zenAudio.toggleSoundscape();
        if (isPlaying) {
          btnSound.classList.add('active');
          if (soundIcon) soundIcon.textContent = '🎵';
          if (soundText) soundText.textContent = 'Nhạc Chùa: Bật';
          this.showToast('Đang phát nhạc nền chùa chiền 🎶');
        } else {
          btnSound.classList.remove('active');
          if (soundIcon) soundIcon.textContent = '🔇';
          if (soundText) soundText.textContent = 'Nhạc Chùa: Tắt';
          this.showToast('Đã dừng phát nhạc');
        }
      });
    }

    // Click vào nametag để đổi tên nhân vật
    if (this.nameTag) {
      this.nameTag.addEventListener('click', () => {
        const newName = prompt('Nhập tên chú tiểu của bạn:', this.nameText.textContent);
        if (newName && newName.trim()) {
          this.nameText.textContent = newName.trim();
          this.player.name = newName.trim();
        }
      });
    }

    // Click vào prompt gợi ý
    if (this.promptBox) {
      this.promptBox.addEventListener('click', () => {
        if (this.currentZone === 'cushion') this.toggleSit();
        else if (this.currentZone === 'incense') this.actionIncense();
      });
    }

    // Tự động phát nhạc nền sau khi người dùng chạm/nhấp chuột lần đầu
    window.addEventListener('click', () => {
      window.zenAudio.initContext();
      if (!window.zenAudio.isPlaying) {
        window.zenAudio.startSoundscape();
        if (btnSound) btnSound.classList.add('active');
        if (soundIcon) soundIcon.textContent = '🎵';
        if (soundText) soundText.textContent = 'Nhạc Chùa: Bật';
      }
    }, { once: true });
  }

  initMobileJoystick() {
    const base = document.getElementById('joystick-base');
    const stick = document.getElementById('joystick-stick');
    if (!base || !stick) return;

    let touchId = null;
    const maxRadius = 45;

    base.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      this.updateJoystick(touch.clientX, touch.clientY, maxRadius, stick);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          this.updateJoystick(e.changedTouches[i].clientX, e.changedTouches[i].clientY, maxRadius, stick);
          break;
        }
      }
    }, { passive: false });

    const endTouch = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchId = null;
          stick.style.transform = 'translate(-50%, -50%)';
          this.keys.up = false;
          this.keys.down = false;
          this.keys.left = false;
          this.keys.right = false;
          break;
        }
      }
    };

    window.addEventListener('touchend', endTouch);
    window.addEventListener('touchcancel', endTouch);
  }

  updateJoystick(clientX, clientY, maxRadius, stickEl) {
    const base = document.getElementById('joystick-base');
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    stickEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

    const deadZone = 10;
    this.keys.left = dx < -deadZone;
    this.keys.right = dx > deadZone;
    this.keys.up = dy < -deadZone;
    this.keys.down = dy > deadZone;
  }

  toggleSit() {
    if (this.player.isSitting) {
      this.standUp();
    } else {
      this.sitDown();
    }
  }

  sitDown() {
    this.player.isSitting = true;

    // Tìm đệm gần nhất hoặc ngồi lên đệm trung tâm
    let targetX = 0;
    let targetZ = -1.2;

    const pPos = this.player.group.position;
    let minD = 999;
    this.world.cushionPositions.forEach(c => {
      const d = Math.hypot(pPos.x - c.x, pPos.z - c.z);
      if (d < minD) {
        minD = d;
        targetX = c.x;
        targetZ = c.z;
      }
    });

    this.player.group.position.set(targetX, 0.08, targetZ);
    this.player.group.rotation.y = Math.PI; // Hướng mặt về tượng Phật

    const btnSitText = document.getElementById('sit-btn-text');
    const btnSit = document.getElementById('btn-sit-minimal');
    if (btnSitText) btnSitText.textContent = 'Đứng Dậy';
    if (btnSit) btnSit.classList.add('active');

    this.promptBox.classList.add('hidden');
    window.zenAudio.playSingingBowl();
    this.showToast('Bé chú tiểu đã ngồi kiết già tĩnh tọa an nhiên 🙏');
  }

  standUp() {
    if (!this.player.isSitting) return;
    this.player.isSitting = false;
    this.player.group.position.y = 0;
    this.player.group.position.z += 0.45; // Bước nhẹ ra khỏi đệm

    const btnSitText = document.getElementById('sit-btn-text');
    const btnSit = document.getElementById('btn-sit-minimal');
    if (btnSitText) btnSitText.textContent = 'Ngồi Thiền';
    if (btnSit) btnSit.classList.remove('active');

    this.showToast('Bé chú tiểu đã đứng dậy tiếp tục dạo bước quanh chùa');
  }

  // TÍNH NĂNG THẮP HƯƠNG DÂNG LỄ (Đi đến trước bát hương & Cận cảnh cắm hương)
  actionIncense() {
    if (this.player.isSitting) {
      this.standUp();
    }

    const curPos = this.player.group.position;
    const distToAltarSpot = Math.hypot(curPos.x - 0, curPos.z - (-5.45));

    if (distToAltarSpot < 0.35) {
      this.startCloseUpOffering();
    } else {
      this.isAutoWalking = true;
      this.autoWalkTarget.set(0, 0, -5.45);
      this.showToast('Bé chú tiểu đang bước đến trước bát hương... 🕯️');
    }
  }

  startCloseUpOffering() {
    this.isAutoWalking = false;
    this.player.group.position.set(0, 0, -5.45);
    this.player.group.rotation.y = Math.PI; // Hướng mặt trang nghiêm về tượng Phật
    this.player.setHoldingIncense(true); // Cầm 3 nén hương trầm cháy đỏ trên tay
    this.cameraMode = 'cinematic_incense';

    const modalIncense = document.getElementById('modal-incense');
    if (modalIncense) {
      modalIncense.classList.remove('hidden');
    }
    this.showToast('✨ Hãy gửi gắm ước nguyện và cắm hương vào bát bình hương');
  }

  cancelIncense() {
    const modalIncense = document.getElementById('modal-incense');
    if (modalIncense) modalIncense.classList.add('hidden');
    this.isAutoWalking = false;
    this.player.setHoldingIncense(false);
    this.player.isPraying = false;
    this.cameraMode = 'follow';
    this.showToast('Đã dừng thắp hương');
  }

  completePrayerOffering(wish) {
    const modalIncense = document.getElementById('modal-incense');
    if (modalIncense) modalIncense.classList.add('hidden');

    this.showToast(wish ? 'Đang dâng hương: "' + wish + '"... 🙏' : 'Đang kính cẩn cắm 3 nén hương vào bát... 🙏');

    // Kích hoạt hoạt ảnh: vươn tay cắm hương -> vái 3 lần -> lùi lại 2 bước (không nhảy)
    this.player.triggerPlantIncense(
      () => {
        // Nén nhang cắm thẳng đứng vào bát hương
        this.world.plantIncenseInBurner();
        window.zenAudio.playIncenseChime();
        window.zenAudio.playSingingBowl();
        this.showToast('✨ Đã cắm 3 nén tâm hương an lành vào bát bình hương 🙏');
      },
      () => {
        // Sau khi đã vái 3 lần và bước lùi lại trang nghiêm
        this.showToast('Bé chú tiểu đã kính cẩn vái 3 lần tạ lễ và lùi lại an nhiên 🙏');
        setTimeout(() => {
          this.cameraMode = 'follow';
          this.player.isPraying = false;
          this.player.setHoldingIncense(false);
        }, 1400);
      }
    );
  }

  // Kiểm tra vị trí để hiện bảng gợi ý tương tác
  checkProximity() {
    if (this.player.isSitting || this.isAutoWalking || this.cameraMode === 'cinematic_incense') {
      this.promptBox.classList.add('hidden');
      return;
    }

    const pos = this.player.group.position;
    const distToAltar = Math.hypot(pos.x, pos.z - (-6.6));

    let nearCushion = false;
    this.world.cushionPositions.forEach(c => {
      if (Math.hypot(pos.x - c.x, pos.z - c.z) < 1.35) {
        nearCushion = true;
      }
    });

    if (distToAltar < 1.8) {
      this.currentZone = 'incense';
      this.promptIcon.textContent = '🕯️';
      this.promptAction.textContent = 'Thắp Hương Dâng Lễ';
      this.promptKey.textContent = 'Nhấn [E] hoặc Chạm vào đây';
      this.promptBox.classList.remove('hidden');
    } else if (nearCushion) {
      this.currentZone = 'cushion';
      this.promptIcon.textContent = '🧘';
      this.promptAction.textContent = 'Ngồi Xuống Tĩnh Tọa';
      this.promptKey.textContent = 'Nhấn [C], [E] hoặc Chạm để Ngồi';
      this.promptBox.classList.remove('hidden');
    } else {
      this.currentZone = null;
      this.promptBox.classList.add('hidden');
    }
  }

  updateNameTagPosition() {
    if (!this.nameTag || !this.player) return;

    if (this.cameraMode === 'cinematic_incense') {
      this.nameTag.style.display = 'none';
      return;
    }

    const headWorldPos = new THREE.Vector3();
    this.player.headMesh.getWorldPosition(headWorldPos);
    headWorldPos.y += 0.45;

    const screenPos = headWorldPos.project(this.camera);

    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

    if (screenPos.z > 1.0) {
      this.nameTag.style.display = 'none';
    } else {
      this.nameTag.style.display = 'flex';
      this.nameTag.style.left = `${x}px`;
      this.nameTag.style.top = `${y}px`;
    }
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // Xử lý di chuyển
    let isMoving = false;
    let targetAngle = null;

    if (this.isAutoWalking) {
      const curPos = this.player.group.position;
      const dx = this.autoWalkTarget.x - curPos.x;
      const dz = this.autoWalkTarget.z - curPos.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 0.08) {
        const speed = this.player.speed * 0.95;
        curPos.x += (dx / dist) * speed * delta;
        curPos.z += (dz / dist) * speed * delta;
        targetAngle = Math.atan2(dx, dz);
        isMoving = true;
      } else {
        this.startCloseUpOffering();
      }
    } else {
      let moveX = 0;
      let moveZ = 0;

      if (!this.player.isPlanting && !this.player.isHoldingIncense) {
        if (this.keys.up) moveZ -= 1;
        if (this.keys.down) moveZ += 1;
        if (this.keys.left) moveX -= 1;
        if (this.keys.right) moveX += 1;
      }

      isMoving = (moveX !== 0 || moveZ !== 0);

      if (isMoving) {
        if (this.player.isSitting) {
          this.standUp();
        }

        const moveLen = Math.hypot(moveX, moveZ);
        moveX /= moveLen;
        moveZ /= moveLen;

        const camAngle = this.camTheta;
        const worldMoveX = moveX * Math.cos(camAngle) + moveZ * Math.sin(camAngle);
        const worldMoveZ = -moveX * Math.sin(camAngle) + moveZ * Math.cos(camAngle);

        const newX = this.player.group.position.x + worldMoveX * this.player.speed * delta;
        const newZ = this.player.group.position.z + worldMoveZ * this.player.speed * delta;

        this.player.group.position.x = Math.max(-10, Math.min(10, newX));
        this.player.group.position.z = Math.max(-6.5, Math.min(8.5, newZ));

        targetAngle = Math.atan2(worldMoveX, worldMoveZ);
      }
    }

    // Cập nhật hoạt ảnh nhân vật
    this.player.update(delta, isMoving, targetAngle);
    this.fellows.forEach(f => f.update(delta));
    this.world.update(delta, this.camera);
    this.checkProximity();

    // Camera bám theo nhân vật hoặc chuyển sang cận cảnh điện ảnh
    if (this.cameraMode === 'cinematic_incense') {
      const targetCamPos = new THREE.Vector3(1.40, 1.40, -4.60);
      const targetLookAt = new THREE.Vector3(-0.08, 1.05, -6.30);

      this.camera.position.lerp(targetCamPos, delta * 3.2);
      if (!this.curCamLookAt) this.curCamLookAt = this.camTarget.clone();
      this.curCamLookAt.lerp(targetLookAt, delta * 3.2);
      this.camera.lookAt(this.curCamLookAt);
    } else {
      const pPos = this.player.group.position;
      this.camTarget.x += (pPos.x - this.camTarget.x) * (delta * 5.0);
      this.camTarget.y += (pPos.y + 1.1 - this.camTarget.y) * (delta * 5.0);
      this.camTarget.z += (pPos.z - this.camTarget.z) * (delta * 5.0);

      const camX = this.camTarget.x + this.camDistance * Math.sin(this.camTheta) * Math.cos(this.camPhi);
      const camY = this.camTarget.y + this.camDistance * Math.sin(this.camPhi);
      const camZ = this.camTarget.z + this.camDistance * Math.cos(this.camTheta) * Math.cos(this.camPhi);

      const clampedCamY = Math.max(0.35, camY);
      const targetCamPos = new THREE.Vector3(camX, clampedCamY, camZ);
      this.camera.position.lerp(targetCamPos, delta * 4.5);
      if (!this.curCamLookAt) this.curCamLookAt = this.camTarget.clone();
      this.curCamLookAt.lerp(this.camTarget, delta * 5.0);
      this.camera.lookAt(this.curCamLookAt);
    }

    this.updateNameTagPosition();
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
});
