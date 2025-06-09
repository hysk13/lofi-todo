import React, { useEffect, useRef } from 'react';

const Background = () => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg';
    document.body.appendChild(canvas);
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');

    // Resize canvas and keep dimensions in closure
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Store window size to avoid accessing global inside loop
    let width = canvas.width;
    let height = canvas.height;
    const updateSize = () => {
      width = canvas.width;
      height = canvas.height;
    };

    // Stars, clouds, buildings initialization
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      twinkle: Math.random() * 0.015 + 0.005,
    }));

    const clouds = Array.from({ length: 4 }, () => ({
      x: Math.random() * width,
      y: Math.random() * 200 + 30,
      speed: 0.15 + Math.random() * 0.1,
      size: 80 + Math.random() * 40,
    }));

    const cityBuildings = Array.from({ length: 25 }, (_, i) => ({
      x: i * 80 + Math.random() * 30,
      width: 40 + Math.random() * 40,
      height: 60 + Math.random() * 100,
      windows: Array.from({ length: 6 }, () => Math.random() < 0.3),
    }));

    let frame = 0;

    // Precompute gradients outside the animation loop where possible
    let skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#0b0b2a');
    skyGradient.addColorStop(1, '#1a1a3f');

    const drawSky = () => {
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height);
    };

    const drawStars = () => {
      stars.forEach((star) => {
        star.alpha += star.twinkle * (Math.random() > 0.5 ? 1 : -1);
        star.alpha = Math.max(0.3, Math.min(1, star.alpha));
        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const drawMoon = () => {
      const x = width - 150;
      const y = 100;
      const r = 45;

      // Cache radial gradient for moon glow
      const glow = ctx.createRadialGradient(x, y, 10, x, y, 100);
      glow.addColorStop(0, '#fffacd');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 100, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#fffacd';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();
    };

    const drawClouds = () => {
      clouds.forEach((cloud) => {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#cccccc';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(cloud.x + i * 30, cloud.y, cloud.size * 0.3, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        cloud.x += cloud.speed;
        if (cloud.x > width + 150) {
          cloud.x = -200;
          cloud.y = Math.random() * 200 + 30;
        }
      });
    };

    const drawCity = () => {
      const groundY = height - 160;
      ctx.fillStyle = '#0e0e1a';
      ctx.fillRect(0, groundY, width, 160);

      cityBuildings.forEach((building) => {
        ctx.fillStyle = '#1a1a2d';
        ctx.fillRect(building.x, groundY - building.height, building.width, building.height);
        ctx.fillStyle = '#ffffaa';
        building.windows.forEach((lit, i) => {
          if (lit) {
            const wx = building.x + 5 + (i % 2) * 15;
            const wy = groundY - building.height + 10 + Math.floor(i / 2) * 15;
            ctx.fillRect(wx, wy, 8, 8);
          }
        });
      });

      // Antenna light blinking
      ctx.fillStyle = frame % 120 < 60 ? '#ff4444' : '#882222';
      ctx.beginPath();
      ctx.arc(width - 200, groundY - 120, 4, 0, 2 * Math.PI);
      ctx.fill();
    };

    const drawRooftop = () => {
      const baseY = height - 80;
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, baseY, width, 80);
      ctx.fillStyle = '#1e1e1e';
      ctx.fillRect(0, baseY, width, 10);

      // Air conditioner
      ctx.fillStyle = '#2d2d2d';
      ctx.fillRect(60, baseY - 40, 40, 30);
      ctx.fillStyle = '#444';
      ctx.fillRect(65, baseY - 35, 30, 10);

      // Mug
      ctx.fillStyle = '#dddddd';
      ctx.fillRect(130, baseY - 30, 14, 20);
      ctx.beginPath();
      ctx.arc(144, baseY - 20, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Steam
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(135 + i * 3, baseY - 30);
        ctx.bezierCurveTo(
          135 + i * 3,
          baseY - 45 - frame % 20,
          130 + i * 3,
          baseY - 55 - frame % 20,
          135 + i * 3,
          baseY - 70 - frame % 20
        );
        ctx.stroke();
      }

      // Cat
      ctx.fillStyle = '#3a3a3a';
      ctx.beginPath();
      ctx.arc(200, baseY - 15, 10, 0, Math.PI * 2); // body
      ctx.arc(190, baseY - 25, 6, 0, Math.PI * 2); // head
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(185, baseY - 30);
      ctx.lineTo(187, baseY - 36);
      ctx.lineTo(189, baseY - 30);
      ctx.fill();

      // Tail swaying
      const tailOffset = Math.sin(frame / 30) * 5;
      ctx.beginPath();
      ctx.moveTo(210, baseY - 15);
      ctx.quadraticCurveTo(215 + tailOffset, baseY - 10, 220, baseY - 25);
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    const draw = () => {
      drawSky();
      drawStars();
      drawMoon();
      drawClouds();
      drawCity();
      drawRooftop();
      frame++;
    };

    const loop = () => {
      updateSize(); // update size variables if canvas resized
      draw();
      animationFrameId.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId.current);
      if (canvasRef.current) {
        document.body.removeChild(canvasRef.current);
      }
    };
  }, []);

  return null;
};

export default Background;
