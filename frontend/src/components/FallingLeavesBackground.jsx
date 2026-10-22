import React, { useEffect, useRef } from 'react';

/**
 * FallingLeavesBackground
 * Animasi daun berguguran terbawa hembusan angin untuk latar belakang Kuro Studio.
 * Ringan, estetis (anime autumn / sakura aesthetic), 60 FPS, dan ramah baterai perangkat mobile.
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

    // Deteksi reduced motion untuk aksesibilitas (antislop-human)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const isMobile = width < 768;
    const leafCount = isMobile ? 18 : 32;

    // Palet warna daun anime: perpaduan maple autumn, amber keemasan, dan sakura lembut
    const leafPalettes = [
      { fill: 'rgba(238, 108, 77, 0.65)', stroke: 'rgba(180, 50, 30, 0.45)' },   // Orange Maple
      { fill: 'rgba(244, 162, 97, 0.65)', stroke: 'rgba(200, 110, 50, 0.45)' },  // Amber Autumn
      { fill: 'rgba(231, 111, 81, 0.60)', stroke: 'rgba(160, 40, 20, 0.40)' },   // Coral Terracotta
      { fill: 'rgba(242, 132, 130, 0.55)', stroke: 'rgba(200, 80, 80, 0.35)' },  // Soft Sakura Leaf
      { fill: 'rgba(246, 189, 96, 0.60)', stroke: 'rgba(190, 130, 40, 0.40)' },  // Golden Ochre
      { fill: 'rgba(132, 165, 157, 0.50)', stroke: 'rgba(70, 110, 100, 0.35)' }, // Gentle Sage Green
    ];

    class Leaf {
      constructor(initialYRandom = true) {
        this.reset(initialYRandom);
      }

      reset(initialYRandom = false) {
        this.x = Math.random() * (width + 200) - 100;
        this.y = initialYRandom ? Math.random() * height : -40 - Math.random() * 40;
        this.size = 11 + Math.random() * 12; // 11px - 23px
        this.speedY = 0.8 + Math.random() * 1.3;
        this.speedX = 0.6 + Math.random() * 1.2; // hembusan angin ke kanan
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.035;
        this.flip = Math.random() * Math.PI;
        this.flipSpeed = 0.02 + Math.random() * 0.03;
        this.oscillationSpeed = 0.015 + Math.random() * 0.025;
        this.oscillationDistance = 25 + Math.random() * 35;
        this.oscillationOffset = Math.random() * Math.PI * 2;
        this.palette = leafPalettes[Math.floor(Math.random() * leafPalettes.length)];
        this.type = Math.random() > 0.4 ? 'maple' : 'oval';
      }

      update(windForce, time) {
        this.y += this.speedY;
        this.x += this.speedX + windForce + Math.sin(time * this.oscillationSpeed + this.oscillationOffset) * 0.6;
        this.rotation += this.rotationSpeed;
        this.flip += this.flipSpeed;

        // Reset jika sudah melewati batas bawah atau kanan
        if (this.y > height + 50 || this.x > width + 120) {
          this.reset(false);
          this.x = Math.random() * (width * 0.7) - 80;
        }
      }

      draw(context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        
        // Efek daun berputar 3D membalik di udara
        const scaleX = Math.cos(this.flip);
        context.scale(scaleX, 1);

        context.fillStyle = this.palette.fill;
        context.strokeStyle = this.palette.stroke;
        context.lineWidth = 1;

        if (this.type === 'maple') {
          // Bentuk daun maple Jepang / musim gugur berkontur halus
          context.beginPath();
          context.moveTo(0, -this.size);
          context.bezierCurveTo(this.size * 0.45, -this.size * 0.6, this.size * 0.8, -this.size * 0.2, this.size * 0.6, 0);
          context.bezierCurveTo(this.size * 0.9, this.size * 0.4, this.size * 0.5, this.size * 0.8, 0, this.size);
          context.bezierCurveTo(-this.size * 0.5, this.size * 0.8, -this.size * 0.9, this.size * 0.4, -this.size * 0.6, 0);
          context.bezierCurveTo(-this.size * 0.8, -this.size * 0.2, -this.size * 0.45, -this.size * 0.6, 0, -this.size);
          context.closePath();
          context.fill();
          context.stroke();

          // Tulang tengah daun
          context.beginPath();
          context.moveTo(0, -this.size * 0.8);
          context.lineTo(0, this.size * 0.9);
          context.strokeStyle = this.palette.stroke;
          context.lineWidth = 0.8;
          context.stroke();
        } else {
          // Bentuk daun oval lembut / sakura
          context.beginPath();
          context.ellipse(0, 0, this.size * 0.5, this.size * 0.9, 0, 0, Math.PI * 2);
          context.fill();
          context.stroke();

          context.beginPath();
          context.moveTo(0, -this.size * 0.7);
          context.lineTo(0, this.size * 0.7);
          context.stroke();
        }

        context.restore();
      }
    }

    const leaves = Array.from({ length: leafCount }, () => new Leaf(true));

    let time = 0;
    let windForce = 0.8;
    let targetWindForce = 0.8;
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

      // Variasi hembusan angin berkala (dinamis seperti angin sepoi-sepoi)
      if (Date.now() - lastWindChange > 3000) {
        targetWindForce = 0.5 + Math.random() * 1.2;
        lastWindChange = Date.now();
      }
      windForce += (targetWindForce - windForce) * 0.015;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < leaves.length; i++) {
        leaves[i].update(windForce, time);
        leaves[i].draw(ctx);
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
      className="fixed inset-0 pointer-events-none z-[1] opacity-80"
      style={{ willChange: 'transform' }}
    />
  );
}
