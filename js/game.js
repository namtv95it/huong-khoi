/**
 * Main Game Controller: Nhập Vai Bé Chú Tiểu Chibi Dạo Chùa & Tĩnh Tọa
 * - Điều khiển bé chú tiểu đi lại tự do trong chánh điện (WASD / Mũi tên / Joystick cảm ứng)
 * - Tiến lại đệm để ngồi thiền kiết già, đến bàn thờ để dâng hương cầu an
 * - Không gian bích họa Phật giáo Taenghwa và tượng Phật Thích Ca uy nghi
 * - Hoàn toàn không còn chức năng gõ mõ
 */

class GameApp {
  constructor() {
    this.container = document.getElementById('game-container');
    this.fellows = [];
    this.currentZone = null;

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

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    this.world = new TempleWorld(this.scene);

    // 2. NHÂN VẬT CHÍNH: Bé Chú Tiểu Chibi (Người chơi điều khiển)
    // Khởi đầu đứng ở lối vào giữa các hàng đệm
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
      // Mở rộng tối đa góc quay ngửa lên ngắm trần/tượng Phật và nhìn chúi từ trên cao xuống
      this.camPhi = Math.max(-0.25, Math.min(1.35, this.camPhi + dy * 0.005));

      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    dom.addEventListener('wheel', (e) => {
      this.camDistance = Math.max(2.2, Math.min(12.0, this.camDistance + e.deltaY * 0.005));
    }, { passive: true });

    // Touch vuốt xoay camera trên màn hình cảm ứng
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
    const modalIncense = document.getElementById('modal-incense');
    btnIncense.addEventListener('click', () => this.actionIncense());

    document.getElementById('btn-close-incense').addEventListener('click', () => {
      modalIncense.classList.add('hidden');
      this.player.isPraying = false;
    });

    document.getElementById('btn-submit-prayer').addEventListener('click', () => {
      const wish = document.getElementById('prayer-input').value.trim();
      modalIncense.classList.add('hidden');
      this.completePrayerOffering(wish);
    });

    document.querySelectorAll('.wish-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('prayer-input').value = chip.getAttribute('data-wish');
      });
    });

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
      if (touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchId = null;
          stick.style.transform = `translate(-50%, -50%)`;
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

  updateJoystick(touchX, touchY, maxRadius, stick) {
    const rect = document.getElementById('joystick-base').getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touchX - centerX;
    let dy = touchY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

    const threshold = 12;
    this.keys.left = dx < -threshold;
    this.keys.right = dx > threshold;
    this.keys.up = dy < -threshold;
    this.keys.down = dy > threshold;
  }

  // TÍNH NĂNG NGỒI THIỀN / ĐỨNG DẬY
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

    // Đặt bé chú tiểu ngồi kiết già lên mặt đệm
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

  // TÍNH NĂNG THẮP HƯƠNG DÂNG LỄ
  actionIncense() {
    this.player.isPraying = true;
    document.getElementById('modal-incense').classList.remove('hidden');
  }

  completePrayerOffering(wish) {
    window.zenAudio.playIncenseChime();
    window.zenAudio.playSingingBowl();

    this.showToast(wish ? `Đã dâng hương: "${wish}"` : "Đã kính cẩn dâng 3 nén tâm hương an lành 🙏");

    setTimeout(() => {
      this.player.isPraying = false;
    }, 2800);
  }

  // Kiểm tra vị trí để hiện bảng gợi ý tương tác
  checkProximity() {
    if (this.player.isSitting) {
      this.promptBox.classList.add('hidden');
      return;
    }

    const pos = this.player.group.position;

    // Gần bàn hương trước bàn thờ (x: 0, z: -6.6)
    const distToAltar = Math.hypot(pos.x, pos.z - (-6.6));

    // Gần bất kỳ đệm thiền nào
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
    let moveX = 0;
    let moveZ = 0;

    if (this.keys.up) moveZ -= 1;
    if (this.keys.down) moveZ += 1;
    if (this.keys.left) moveX -= 1;
    if (this.keys.right) moveX += 1;

    const isMoving = (moveX !== 0 || moveZ !== 0);
    let targetAngle = null;

    if (isMoving) {
      if (this.player.isSitting) {
        this.standUp();
      }

      const moveLen = Math.hypot(moveX, moveZ);
      moveX /= moveLen;
      moveZ /= moveLen;

      // Xoay hướng di chuyển theo góc camera
      const camAngle = this.camTheta;
      const worldMoveX = moveX * Math.cos(camAngle) + moveZ * Math.sin(camAngle);
      const worldMoveZ = -moveX * Math.sin(camAngle) + moveZ * Math.cos(camAngle);

      const newX = this.player.group.position.x + worldMoveX * this.player.speed * delta;
      const newZ = this.player.group.position.z + worldMoveZ * this.player.speed * delta;

      // Giới hạn trong khuôn viên chánh điện
      this.player.group.position.x = Math.max(-10, Math.min(10, newX));
      this.player.group.position.z = Math.max(-6.5, Math.min(8.5, newZ));

      targetAngle = Math.atan2(worldMoveX, worldMoveZ);
    }

    // Cập nhật hoạt ảnh nhân vật
    this.player.update(delta, isMoving, targetAngle);
    this.fellows.forEach(f => f.update(delta));
    this.world.update(delta);
    this.checkProximity();

    // Camera bám theo nhân vật mượt mà
    const pPos = this.player.group.position;
    this.camTarget.x += (pPos.x - this.camTarget.x) * (delta * 5.0);
    this.camTarget.y += (pPos.y + 1.1 - this.camTarget.y) * (delta * 5.0);
    this.camTarget.z += (pPos.z - this.camTarget.z) * (delta * 5.0);

    const camX = this.camTarget.x + this.camDistance * Math.sin(this.camTheta) * Math.cos(this.camPhi);
    const camY = this.camTarget.y + this.camDistance * Math.sin(this.camPhi);
    const camZ = this.camTarget.z + this.camDistance * Math.cos(this.camTheta) * Math.cos(this.camPhi);

    // Đảm bảo camera không bị thụt xuống dưới mặt sàn
    const clampedCamY = Math.max(0.35, camY);
    this.camera.position.set(camX, clampedCamY, camZ);
    this.camera.lookAt(this.camTarget);

    this.updateNameTagPosition();
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new GameApp();
});
