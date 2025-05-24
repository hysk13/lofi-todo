import React, { useEffect } from 'react';

const Background = () => {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random()
    }));

    const drawStars = () => {
      stars.forEach(star => {
        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
        ctx.fill();
      });
    };

    const drawTrees = () => {
      ctx.fillStyle = '#0a0a0a';
      const groundY = canvas.height - 100;
      ctx.fillRect(0, groundY, canvas.width, 100);

      for (let i = 0; i < 20; i++) {
        const treeX = i * 60 + Math.random() * 30;
        const treeHeight = 60 + Math.random() * 40;
        ctx.fillStyle = '#0f0f0f';
        ctx.beginPath();
        ctx.moveTo(treeX, groundY);
        ctx.lineTo(treeX + 20, groundY - treeHeight);
        ctx.lineTo(treeX + 40, groundY);
        ctx.closePath();
        ctx.fill();
      }
    };

    const draw = () => {
      ctx.fillStyle = '#0d0d2b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawStars();
      drawTrees();
    };

    const loop = () => {
      draw();
      requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      document.body.removeChild(canvas);
    };
  }, []);

  return null;
};

export default Background;
