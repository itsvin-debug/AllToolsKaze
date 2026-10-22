import React, { useEffect, useRef } from 'react';

/**
 * FallingLeavesBackground
 * Animasi kelopak bunga sakura anime berguguran lembut terbawa angin sepoi-sepoi.
 * Selalu berada di lapisan latar belakang (z-0) di balik seluruh card dan konten (z-10),
 * warna kelopak senada dengan live wallpaper wpanime.mp4, tersebar merata secara acak
 * di seluruh layar, ringan, 60 FPS, dan ramah baterai mobile.
 */
export default function FallingLeavesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Aksesibilitas: hormati pengguna dengan prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const isMobile = width < 768;
    // Kepadatan kelopak: sedikit ramai dan merata, tidak spamming
    const petalCount = isMobile ? 24 : 42;

    // Palet warna kelopak bunga sakura senada dengan video wpanime.mp4
    const sakuraPalettes = [
      { fill: 'rgba(255, 183, 197, 0.78)', stroke: 'rgba(244, 114, 182, 0.45)' }, // Sakura pink klasik
      { fill: 'rgba(254, 205, 211, 0.82)', stroke: 'rgba(251, 113, 133, 0.40)' }, // Blush petal lembut
      { fill: 'rgba(251, 143, 175, 0.72)', stroke: 'rgba(244, 63, 94, 0.35)' },  // Rose petal segar
      { fill: 'rgba(255, 241, 242, 0.88)', stroke: 'rgba(251, 182, 206, 0.55)' }, // Putih semburat pink
      { fill: 'rgba(244, 114, 182, 0.68)', stroke: 'rgba(225, 29, 72, 0.35)' },  // Sakura aksen terang
      { fill: 'rgba(245, 208, 254, 0.68)', stroke: 'rgba(216, 70, 239, 0.30)' }, // Lavender pink lembut
    ];

    class SakuraPetal {
      constructor(isInitial = true) {
        this.reset(isInitial);
      }

      reset(isInitial = false) {
        // Tersebar merata di seluruh layar saat pertama kali dimuat
        if (isInitial) {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
        } else {
          // Masuk secara acak dari tepi atas atau tepi kiri terbawa angin
          if (Math.random() > 0.35) {
            this.x = Math.random() * (width + 120) - 60;
            this.y = -20 - Math.random() * 30;
          } else {
            this.x = -20 - Math.random() * 20;
            this.y = Math.random() * (height * 0.75);
          }
        }

        // Ukuran proporsional kelopak sakura
        this.size = 9 + Math.random() * 11;
        this.speedY = 0.8 + Math.random() * 1.1;
        this.speedX = 0.6 + Math.random() * 1.0;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.03;
        this.flip = Math.random() * Math.PI;
        this.flipSpeed = 0.018 + Math.random() * 0.025;
        this.oscillationSpeed = 0.012 + Math.random() * 0.02;
        this.oscillationOffset = Math.random() * Math.PI * 2;
        this.palette = sakuraPalettes[Math.floor(Math.random() * sakuraPalettes.length)];
      }

      update(windForce, time) {
        this.y += this.speedY;
        this.x += this.speedX + windForce + Math.sin(time * this.oscillationSpeed + this.oscillationOffset) * 0.65;
        this.rotation += this.rotationSpeed;
        this.flip += this.flipSpeed;

        // Reset saat kelopak keluar dari area bawah atau kanan layar
        if (this.y > height + 35 || this.x > width + 50) {
          this.reset(false);
        }
      }

      draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);

        // Efek kelopak berputar dan membalik secara 3D di udara
        const scaleX = Math.cos(this.flip);
        context.scale(scaleX, 1);

        context.fillStyle = this.palette.fill;
        context.strokeStyle = this.palette.stroke;
        context.lineWidth = 0.8;

        // Bentuk kelopak bunga sakura berlekuk anggun
        context.beginPath();
        context.moveTo(0, -this.size);
        context.bezierCurveTo(this.size * 0.52, -this.size * 0.65, this.size * 0.74, -this.size * 0.08, this.size * 0.38, this.size * 0.65);
        context.bezierCurveTo(this.size * 0.18, this.size * 0.95, 0, this.size, 0, this.size);
        context.bezierCurveTo(0, this.size, -this.size * 0.18, this.size * 0.95, -this.size * 0.38, this.size * 0.65);
        context.bezierCurveTo(-this.size * 0.74, -this.size * 0.08, -this.size * 0.52, -this.size * 0.65, 0, -this.size);
        context.closePath();
        context.fill();
        context.stroke();

        // Garis lekuk lembut di bagian tengah kelopak
        context.beginPath();
        context.moveTo(0, -this.size * 0.6);
        context.lineTo(0, this.size * 0.5);
        context.strokeStyle = this.palette.stroke;
        context.lineWidth = 0.6;
        context.stroke();

        context.restore();
      }
    }

    const petals = Array.from({ length: petalCount }, () => new SakuraPetal(true));

    let time = 0;
    let windForce = 0.75;
    let targetWindForce = 0.75;
    let lastWindChange = Date.now();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    let isDocumentVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isDocumentVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.05;

      // Hembusan angin lembut yang berubah berkala
      if (Date.now() - lastWindChange > 3500) {
        targetWindForce = 0.45 + Math.random() * 1.0;
        lastWindChange = Date.now();
      }
      windForce += (targetWindForce - windForce) * 0.015;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < petals.length; i++) {
        petals[i].update(windForce, time);
        petals[i].draw(ctx);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 opacity-85"
      style={{ willChange: 'transform' }}
    />
  );
}
