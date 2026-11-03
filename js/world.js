/**
 * World & Temple Sanctuary (Chánh Điện Thiền Môn)
 * Tái tạo tỉ mỉ từng chi tiết theo bức ảnh mẫu:
 * - Bức đại bích họa Phật giáo Taenghwa phía sau
 * - Tượng Phật Thích Ca dát vàng uy nghi tọa thiền
 * - Sàn gỗ tối màu dài tít tắp theo phối cảnh
 * - Mảng lưới đệm thiền vuông (Bangseok) xếp ngay ngắn
 * - Ánh nắng xiên từ cửa sổ bên trái rọi bóng dài trên sàn và tường
 */

class TempleWorld {
  constructor(scene) {
    this.scene = scene;
    this.smokePool = [];
    this.cushionPositions = [];

    this.createHall();
    this.createMuralWall();
    this.createAltarAndBuddha();
    this.createMeditationMatsGrid();
    this.createLighting();
    this.createIncenseSmoke();
  }

    createHall() {
      // 1. SÀN GỖ VÁN DÀI TỐI MÀU (Dark Wood Plank Floor)
      // Tạo texture ván gỗ chạy dọc theo chiều sâu
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
        // Tô sắc thái gỗ hơi lệch nhau giữa các thanh ván
        fctx.fillStyle = (x / plankWidth) % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.04)';
        fctx.fillRect(x, 0, plankWidth, 1024);
        fctx.beginPath();
        fctx.moveTo(x, 0);
        fctx.lineTo(x, 1024);
        fctx.stroke();
      }

      const floorTex = new THREE.CanvasTexture(floorCanvas);
      floorTex.wrapS = THREE.RepeatWrapping;
      floorTex.wrapT = THREE.RepeatWrapping;
      floorTex.repeat.set(4, 8);

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
      const wallMat = new THREE.MeshLambertMaterial({ color: 0x8a847b }); // Tông màu vách tường xám ấm
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(32, 14, 0.6), wallMat);
      backWall.position.set(0, 7, -10);
      backWall.receiveShadow = true;
      this.scene.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 14, 40), wallMat);
      leftWall.position.set(-16, 7, 0);
      leftWall.receiveShadow = true;
      this.scene.add(leftWall);

      // Xà gồ gỗ trên trần chạy ngang dọc
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

      // Cụm đấu củng gỗ đầu cột (Gongpo bracket)
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
      // ĐẠI BÍCH HỌA PHẬT GIÁO (The Iconic Taenghwa Mural)
      const muralTex = window.createTempleMuralTexture();
      const muralGeo = new THREE.PlaneGeometry(17.5, 8.8);
      const muralMat = new THREE.MeshLambertMaterial({
        map: muralTex,
        roughness: 0.7
      });

      const muralMesh = new THREE.Mesh(muralGeo, muralMat);
      muralMesh.position.set(0, 6.6, -9.6);
      muralMesh.receiveShadow = true;
      this.scene.add(muralMesh);

      // Khung gỗ mun bao quanh bức bích họa
      const frameMat = new THREE.MeshLambertMaterial({ color: 0x140c08 });
      const frameBorder = new THREE.Mesh(new THREE.BoxGeometry(18.2, 9.4, 0.25), frameMat);
      frameBorder.position.set(0, 6.6, -9.75);
      this.scene.add(frameBorder);
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

        // 2. TƯỢNG PHẬT THÍCH CA DÁT VÀNG UY NGHIÊM (Golden Buddha Statue)
        const goldMat = new THREE.MeshLambertMaterial({
      color: 0xdfb040,
          emissive: 0x3d2a08,
          roughness: 0.35
        });

        const buddhaGroup = new THREE.Group();
        buddhaGroup.position.set(0, 0.75, 0.6);

        // Tòa sen nâng đỡ (Lotus Throne)
        const throneGeo = new THREE.CylinderGeometry(1.65, 1.8, 0.45, 24);
        const throne = new THREE.Mesh(throneGeo, goldMat);
        throne.position.y = 0.22;
        buddhaGroup.add(throne);

          // Cánh sen vàng tỏa tròn
          const petalGeo = new THREE.SphereGeometry(0.3, 10, 10);
          petalGeo.scale(0.9, 1.4, 0.35);
          for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const petal = new THREE.Mesh(petalGeo, goldMat);
            petal.position.set(Math.cos(angle) * 1.65, 0.35, Math.sin(angle) * 1.65);
            petal.rotation.y = -angle + Math.PI / 2;
            petal.rotation.x = 0.35;
            buddhaGroup.add(petal);
          }

          // Thân tượng Phật ngồi kiết già
          const bodyGeo = new THREE.CylinderGeometry(0.65, 1.05, 1.6, 18);
          const body = new THREE.Mesh(bodyGeo, goldMat);
          body.position.y = 1.35;
          body.scale.set(1.15, 1.0, 0.95);
          body.castShadow = true;
          buddhaGroup.add(body);

          // Hai chân xếp bằng kiết già
          const legsGeo = new THREE.TorusGeometry(0.95, 0.38, 12, 24, Math.PI);
          const legs = new THREE.Mesh(legsGeo, goldMat);
          legs.position.set(0, 0.8, 0.3);
          legs.rotation.x = Math.PI * 0.5;
          buddhaGroup.add(legs);

          // TAY PHẢI GIƠ LÊN THỦ ẤN THUYẾT PHÁP (Vitarka Mudra - Y hệt ảnh mẫu!)
          const armGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.75, 10);
          const rightArm = new THREE.Mesh(armGeo, goldMat);
          rightArm.position.set(0.65, 1.6, 0.35);
          rightArm.rotation.set(-0.6, 0.2, -0.4);
          buddhaGroup.add(rightArm);

          // Bàn tay phải nâng lên ngực hướng lòng bàn tay ra ngoài
          const palm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.26, 0.08), goldMat);
          palm.position.set(0.65, 1.95, 0.6);
          palm.rotation.set(0.1, -0.2, -0.1);
          buddhaGroup.add(palm);

          // Tay trái đặt an nhiên trong lòng (Left Hand on Lap)
          const leftArm = new THREE.Mesh(armGeo, goldMat);
          leftArm.position.set(-0.48, 1.15, 0.45);
          leftArm.rotation.set(0.6, -0.1, 0.4);
          buddhaGroup.add(leftArm);

          // Đầu tượng Phật & nhục kế Ushnisha
          const headGeo = new THREE.SphereGeometry(0.52, 20, 20);
          headGeo.scale(0.95, 1.1, 0.95);
          const head = new THREE.Mesh(headGeo, goldMat);
          head.position.y = 2.65;
          buddhaGroup.add(head);

          const ushnisha = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14), goldMat);
          ushnisha.position.y = 3.22;
          buddhaGroup.add(ushnisha);

        altarGroup.add(buddhaGroup);

          // 3. ĐỒ LỄ TRÊN BÀN THỜ (Candlesticks, Vases, Incense Table)
          // Đôi chân nến đồng và nến trắng cao (White Candles on Brass Stands)
          this.createCandleStand(altarGroup, -2.4, 0.75, 1.2);
          this.createCandleStand(altarGroup, 2.4, 0.75, 1.2);

          // Đôi bình gốm ngọc bích hoa sen trắng (Celadon Vases with White Lotus)
          this.createCeladonVase(altarGroup, -3.2, 0.75, 1.0);
          this.createCeladonVase(altarGroup, 3.2, 0.75, 1.0);

          // BÀN HƯƠNG GỖ BỐN CHÂN NHỎ Ở CHÍNH GIỮA (Small Incense Table - Y hệt ảnh)
          const tableGroup = new THREE.Group();
          tableGroup.position.set(0, 0, 2.6);

          const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.9), darkWoodMat);
          tableTop.position.y = 0.95;
          tableGroup.add(tableTop);

    // Bốn chân bàn gỗ mảnh
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

            // Bát hương đồng đặt trên bàn nhỏ
            const burnerGeo = new THREE.CylinderGeometry(0.22, 0.16, 0.16, 16);
            const burner = new THREE.Mesh(burnerGeo, new THREE.MeshLambertMaterial({ color: 0x423326 }));
            burner.position.set(0, 1.03, 0);
            tableGroup.add(burner);

    // 3 nén nhang đỏ đang cháy âm ỉ
    for (let i = -1; i <= 1; i++) {
            const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.4, 6), new THREE.MeshLambertMaterial({ color: 0x8b2518 }));
            stick.position.set(i * 0.04, 1.25, 0);
            tableGroup.add(stick);

              const ember = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff4d1a }));
              ember.position.set(i * 0.04, 1.45, 0);
              tableGroup.add(ember);
            }

            altarGroup.add(tableGroup);
            this.scene.add(altarGroup);
          }

            createCandleStand(parent, x, y, z) {
              const brassMat = new THREE.MeshLambertMaterial({ color: 0xd4a548 });
              const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.18, 0.45, 12), brassMat);
              stand.position.set(x, y + 0.22, z);
              parent.add(stand);

              // Cây nến trắng cao (White Candle)
              const candle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.55, 10),
                new THREE.MeshLambertMaterial({ color: 0xf5f3ea })
              );
              candle.position.set(x, y + 0.65, z);
              parent.add(candle);

              // Tim nến và ánh lửa dịu
              const flame = new THREE.Mesh(
                new THREE.ConeGeometry(0.03, 0.09, 8),
                new THREE.MeshBasicMaterial({ color: 0xffaa33 })
              );
              flame.position.set(x, y + 0.96, z);
              parent.add(flame);
            }

              createCeladonVase(parent, x, y, z) {
                // Bình gốm ngọc bích nhạt (Pale Celadon Ceramic)
                const celadonMat = new THREE.MeshLambertMaterial({ color: 0xb5d4c8, roughness: 0.3 });
                const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.52, 14), celadonMat);
                vase.position.set(x, y + 0.26, z);
                parent.add(vase);

                // Cụm hoa sen trắng thanh nhã cắm trong bình
                const flowerMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
                for (let i = 0; i < 4; i++) {
                  const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), flowerMat);
                  bloom.position.set(x + (i - 1.5) * 0.06, y + 0.6 + (i % 2) * 0.06, z);
                  parent.add(bloom);
                }
              }

  // TẠO LƯỚI ĐỆM THIỀN VUÔNG (Bangseok Meditation Mats Grid)
  createMeditationMatsGrid() {
                    // Tông màu đệm xám than / xanh rêu thẫm y hệt trong ảnh
                    const matMat = new THREE.MeshLambertMaterial({
                      color: 0x484c47,
                      roughness: 0.8
                    });

                    const matGeo = new THREE.BoxGeometry(1.25, 0.12, 1.25);

                    // Bố trí 3 cột đệm vuông, nhiều hàng chạy dọc theo căn phòng
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
                      // Ánh sáng môi trường dịu nhẹ tự nhiên
                      this.ambientLight = new THREE.AmbientLight(0xfff5ea, 0.65);
                      this.scene.add(this.ambientLight);

                      // NẮNG XIÊN TỪ CỬA SỔ PHÍA TRÁI (Slanted Sunbeam from Left Window - Tạo bóng y hệt ảnh)
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

                      // Điểm sáng vàng ấm áp tôn vinh tôn tượng Phật
                      const buddhaLight = new THREE.PointLight(0xffdf80, 0.85, 12);
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

                            update(delta) {
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
