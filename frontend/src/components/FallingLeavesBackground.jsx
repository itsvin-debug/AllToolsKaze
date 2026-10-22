import React, { useEffect, useRef } from 'react';

/**
 * FallingLeavesBackground
 * Animasi kelopak sakura (cherry blossom) berguguran terbawa angin.
 * Disesuaikan dengan warna live wallpaper wpanime.mp4.
 * Berjalan di latar belakang (z-0) di belakang kartu konten agar tidak menutupi teks/tombol.
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

    // Hormati preferensi aksesibilitas pengguna
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const isMobile = width < 768;
    // Jumlah kelopak proporsional agar tidak spam
    const petalCount = isMobile ? 14 : 24;

    // Palet warna kelopak sakura harmonis sesuai wallpaper anime
    const sakuraPalettes = [
      { fill: 'rgba(255, 183, 197, 0.82)', stroke: 'rgba(244, 114, 182, 0.40)' }, // Soft Sakura Pink
      { fill: 'rgba(254, 205, 211, 0.78)', stroke: 'rgba(251, 146, 170, 0.38)' }, // Delicate Blush
      { fill: 'rgba(253, 226, 236, 0.85)', stroke: 'rgba(249, 168, 212, 0.35)' }, // Pastel Cherry
      { fill: 'rgba(244, 114, 182, 0.65)', stroke: 'rgba(219, 39, 119, 0.45)' },  // Vibrant Rose Accent
      { fill: 'rgba(255, 241, 242, 0.88)', stroke: 'rgba(244, 143, 177, 0.35)' }, // White Sakura
      { fill: 'rgba(254, 215, 170, 0.70)', stroke: 'rgba(251, 146, 60, 0.30)' }   // Warm Peach Blossom
    ];

    class SakuraPetal {
      constructor(initialYRandom = true) {
        this.reset(initialYRandom);
      }

      reset(initialYRandom = false) {
        // Distribusi kelopak ke seluruh lebar layar secara merata
        if (initialYRandom) {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
        } else {
          // Masuk dari atas atau dari sisi kiri karena arah angin condong ke kanan bawah
          if (Math.random() < 0.65) {
            this.x = Math.random() * (width + 100) - 50;
            this.y = -25 - Math.random() * 30;
          } else {
            this.x = -30 - Math.random() * 20;
            this.y = Math.random() * (height * 0.75);
          }
        }

        this.size = 10 + Math.random() * 11; // 10px - 21px
        this.speedY = 0.7 + Math.random() * 1.1;
        this.speedX = 0.6 + Math.random() * 1.0;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.025;
        this.flip = Math.random() * Math.PI;
        this.flipSpeed = 0.018 + Math.random() * 0.025;
        this.oscillationSpeed = 0.012 + Math.random() * 0.02;
        this.oscillationOffset = Math.random() * Math.PI * 2;
        this.palette = sakuraPalettes[Math.floor(Math.random() * sakuraPalettes.length)];
        this.hasTipNotch = Math.random() > 0.35;
      }

      update(windForce, time) {
        this.y += this.speedY;
        this.x += this.speedX + windForce + Math.sin(time * this.oscillationSpeed + this.oscillationOffset) * 0.7;
        this.rotation += this.rotationSpeed;
        this.flip += this.flipSpeed;

        // Reset bila keluar dari batas bawah atau kanan layar
        if (this.y > height + 40 || this.x > width + 60) {
          this.reset(false);
        }
      }

      draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);

        // Efek kelopak berputar dan membalik di udara (3D flip)
        const scaleX = Math.cos(this.flip);
        context.scale(scaleX, 1);

        context.fillStyle = this.palette.fill;
        context.strokeStyle = this.palette.stroke;
        context.lineWidth = 0.8;

        const w = this.size * 0.55;
        const h = this.size;

        context.beginPath();
        context.moveTo(0, h * 0.6);

        if (this.hasTipNotch) {
          // Bentuk kelopak sakura dengan lekukan khas di bagian pucuk
          context.bezierCurveTo(-w * 0.9, h * 0.2, -w * 0.8, -h * 0.3, -w * 0.4, -h * 0.6);
          context.bezierCurveTo(-w * 0.2, -h * 0.5, -w * 0.1, -h * 0.48, 0, -h * 0.42);
          context.bezierCurveTo(w * 0.1, -h * 0.48, w * 0.2, -h * 0.5, w * 0.4, -h * 0.6);
          context.bezierCurveTo(w * 0.8, -h * 0.3, w * 0.9, h * 0.2, 0, h * 0.6);
        } else {
          // Bentuk kelopak oval melengkung halus
          context.bezierCurveTo(-w * 0.85, h * 0.2, -w * 0.75, -h * 0.5, 0, -h * 0.6);
          context.bezierCurveTo(w * 0.75, -h * 0.5, w * 0.85, h * 0.2, 0, h * 0.6);
        }

        context.closePath();
        context.fill();
        context.stroke();

        // Guratan halus kelopak bunga
        context.beginPath();
        context.moveTo(0, h * 0.45);
        context.quadraticCurveTo(0, 0, 0, -h * 0.3);
        context.strokeStyle = this.palette.stroke;
        context.lineWidth = 0.6;
        context.stroke();

        context.restore();
      }
    }

    const petals = Array.from({ length: petalCount }, () => new SakuraPetal(true));

    let time = 0;
    let windForce = 0.6;
    let targetWindForce = 0.6;
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

      time += 0.04;

      // Hembusan angin lembut yang berubah berkala
      if (Date.now() - lastWindChange > 3500) {
        targetWindForce = 0.4 + Math.random() * 0.9;
        lastWindChange = Date.now();
      }
      windForce += (targetWindForce - windForce) * 0.02;

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
      className="fixed inset-0 pointer-events-none z-0 opacity-75"
      style={{ willChange: 'transform' }}
    />
  );
}
