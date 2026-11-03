/**
 * Temple Zen Audio Engine
 * Sử dụng file nhạc nền chùa chiền của bạn: assets/music/bg_m_01.mp3
 * - Nhạc nền lặp vô tận (loop), âm lượng vừa phải, thanh tịnh
 * - Có nút bật/tắt tiện lợi
 * - Vẫn giữ tiếng chime nhẹ khi dâng hương
 */

class ZenAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;

    // Sử dụng file nhạc nền trực tiếp do bạn cung cấp
    this.bgmAudio = new Audio('assets/music/bg_m_01.mp3');
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0.65;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // TIẾNG CHIME NHẸ KHI DÂNG HƯƠNG (Incense Chime)
    playIncenseChime() {
      this.initContext();
      if (!this.ctx) return;
      const notes = [440.00, 523.25, 659.25, 783.99];
      const t = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.12);

        gain.gain.setValueAtTime(0.0001, t + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.12, t + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.12 + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + idx * 0.12);
        osc.stop(t + idx * 0.12 + 1.9);
      });
    }

    // PHÁT NHẠC NỀN CHÙA CHIỀN (bg_m_01.mp3)
    startSoundscape() {
      this.initContext();
      if (this.isPlaying) return;
      this.isPlaying = true;

      try {
        this.bgmAudio.play().catch(e => {
          console.log("Cần tương tác của người dùng để phát audio:", e);
        });
      } catch (e) {
        console.error(e);
      }
    }

    // DỪNG NHẠC NỀN
    stopSoundscape() {
        if (this.bgmAudio) {
          this.bgmAudio.pause();
        }
        this.isPlaying = false;
      }

      // BẬT / TẮT NHẠC
      toggleSoundscape() {
        if (this.isPlaying) {
          this.stopSoundscape();
          return false;
        } else {
          this.startSoundscape();
          return true;
        }
      }
    }

    window.zenAudio = new ZenAudioEngine();
