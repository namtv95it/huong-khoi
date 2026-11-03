/**
 * Canvas Procedural Painter: Tạo bức đại bích họa Phật giáo (Taenghwa Mural)
 * Tái hiện bức tranh tường chùa cổ trang nghiêm với Phật Thích Ca và nhị vị Bồ Tát.
 */

function createTempleMuralTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // 1. NỀN GẤM CỔ (Rich Dark Brocade Background)
  const bgGrad = ctx.createRadialGradient(1024, 512, 100, 1024, 512, 1100);
  bgGrad.addColorStop(0, '#2d1f18');
  bgGrad.addColorStop(0.5, '#1e1410');
  bgGrad.addColorStop(1, '#110b08');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mây ngũ sắc Phật giáo uốn lượn (Buddhist Mandala Clouds)
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const rad = 80 + Math.random() * 160;
    const cloudGrad = ctx.createRadialGradient(x, y, 10, x, y, rad);
    cloudGrad.addColorStop(0, 'rgba(45, 75, 55, 0.25)');
    cloudGrad.addColorStop(0.5, 'rgba(110, 50, 35, 0.15)');
    cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = cloudGrad;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. VÒNG HÀO QUANG TRUNG TÂM (Central Mandala Halo)
  const cx = 1024;
  const cy = 410;

  // Vòng sáng ngoài cùng (Tia lửa hào quang chư Phật)
  for (let r = 380; r > 120; r -= 25) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (r > 320) {
      ctx.fillStyle = 'rgba(70, 95, 65, 0.45)';
    } else if (r > 240) {
      ctx.fillStyle = 'rgba(155, 60, 45, 0.55)';
    } else if (r > 180) {
      ctx.fillStyle = 'rgba(215, 150, 55, 0.65)';
    } else {
      ctx.fillStyle = 'rgba(80, 115, 95, 0.75)';
    }
    ctx.fill();
    ctx.strokeStyle = 'rgba(240, 200, 100, 0.35)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Cánh hoa sen trong vòng hào quang (Lotus petals mandala)
  const petalCount = 24;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const px = cx + Math.cos(angle) * 230;
    const py = cy + Math.sin(angle) * 230;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 45, 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(235, 175, 80, 0.85)' : 'rgba(185, 65, 50, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#ffeaa7';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Đĩa hào quang kim sắc đỉnh đầu Phật
  const innerHalo = ctx.createRadialGradient(cx, cy, 20, cx, cy, 150);
  innerHalo.addColorStop(0, '#fff4d0');
  innerHalo.addColorStop(0.6, '#e0a540');
  innerHalo.addColorStop(1, '#8b5a1a');
  ctx.fillStyle = innerHalo;
  ctx.beginPath();
  ctx.arc(cx, cy, 145, 0, Math.PI * 2);
  ctx.fill();

  // 3. HỌA HÌNH HAI VỊ BỒ TÁT HAI BÊN (Left & Right Flanking Bodhisattvas)
  function drawBodhisattva(bx, by, flip = false) {
    ctx.save();
    ctx.translate(bx, by);
    if (flip) ctx.scale(-1, 1);

    // Hào quang tròn sau đầu Bồ Tát
    const bHalo = ctx.createRadialGradient(0, -180, 10, 0, -180, 120);
    bHalo.addColorStop(0, 'rgba(230, 190, 110, 0.85)');
    bHalo.addColorStop(0.5, 'rgba(130, 45, 35, 0.7)');
    bHalo.addColorStop(1, 'rgba(30, 50, 40, 0.4)');
    ctx.fillStyle = bHalo;
    ctx.beginPath();
    ctx.arc(0, -180, 115, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e5b95a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Dải lụa thiên y uốn lượn (Celestial Silk Scarves)
    ctx.strokeStyle = 'rgba(215, 160, 60, 0.75)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-60, -120);
    ctx.bezierCurveTo(-140, -40, -160, 120, -110, 260);
    ctx.bezierCurveTo(-70, 380, -130, 480, -90, 520);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(165, 55, 45, 0.7)';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(50, -110);
    ctx.bezierCurveTo(130, -30, 150, 130, 100, 280);
    ctx.bezierCurveTo(70, 390, 120, 490, 80, 530);
    ctx.stroke();

    // Thân và y phục gấm hoa Bồ Tát
    ctx.fillStyle = '#b3392b';
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.lineTo(-75, 420);
    ctx.lineTo(75, 420);
    ctx.closePath();
    ctx.fill();

    // Họa tiết hoa văn áo
    ctx.strokeStyle = '#ecc968';
    ctx.lineWidth = 3;
    for (let y = -40; y < 400; y += 35) {
      ctx.beginPath();
      ctx.arc(0, y, 35 + (y + 40) * 0.1, 0, Math.PI);
      ctx.stroke();
    }

    // Gương mặt từ bi và vương miện Bảo Quan
    ctx.fillStyle = '#fce4c8';
    ctx.beginPath();
    ctx.ellipse(0, -165, 38, 52, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mũ miện Phật
    ctx.fillStyle = '#e8b84b';
    ctx.beginPath();
    ctx.moveTo(-35, -200);
    ctx.lineTo(0, -260);
    ctx.lineTo(35, -200);
    ctx.closePath();
    ctx.fill();

    // Cành hoa sen nâng niu trên tay Bồ Tát
    ctx.strokeStyle = '#4b7d55';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(25, -50);
    ctx.quadraticCurveTo(60, -90, 75, -145);
    ctx.stroke();

    ctx.fillStyle = '#f8a5b5';
    ctx.beginPath();
    ctx.arc(78, -150, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Vẽ Bồ Tát bên trái & bên phải
  drawBodhisattva(370, 480, false);
  drawBodhisattva(1678, 480, true);

  // 4. KHUNG TRANH GỖ MUN VIỀN ĐỒNG (Heavy Lacquer Frame Border)
  ctx.strokeStyle = '#0a0604';
  ctx.lineWidth = 36;
  ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

  ctx.strokeStyle = 'rgba(215, 170, 75, 0.7)';
  ctx.lineWidth = 8;
  ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  return texture;
}

window.createTempleMuralTexture = createTempleMuralTexture;

