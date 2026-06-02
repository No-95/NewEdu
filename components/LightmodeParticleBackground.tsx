'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  trail: { x: number; y: number; opacity: number }[];
  color: string;
  hue: number;
}

export const LightmodeParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationIdRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles with warm tones for lightmode1
    const particleCount = 60;
    const particles: Particle[] = [];
    const colors = [
      { rgb: '166, 42, 38', hue: 2 },
      { rgb: '197, 90, 74', hue: 10 },
      { rgb: '224, 186, 148', hue: 28 },
      { rgb: '243, 225, 203', hue: 33 },
      { rgb: '255, 255, 255', hue: 0 },
    ];

    for (let i = 0; i < particleCount; i++) {
      const colorChoice = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.2 + 0.8,
        opacity: Math.random() * 0.4 + 0.5,
        trail: [],
        color: colorChoice.rgb,
        hue: colorChoice.hue,
      });
    }

    particlesRef.current = particles;

    const animate = () => {
      // Create trail effect with semi-transparent overlay instead of clearRect
      ctx.fillStyle = 'rgba(255, 250, 240, 0.16)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background on first frame
      if (animationIdRef.current === undefined) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#fffaf0');
        gradient.addColorStop(0.45, '#f5e8d8');
        gradient.addColorStop(1, '#ffffff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const mouse = mouseRef.current;

      // Update and draw particles
      particles.forEach((particle) => {
        // Mouse interaction - particles move away from cursor
        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = 100;

        if (distance < mouseInfluence) {
          const force = (mouseInfluence - distance) / mouseInfluence;
          particle.vx += (dx / distance) * force * 0.2;
          particle.vy += (dy / distance) * force * 0.2;
        }

        // Apply slight velocity damping only when influenced by mouse
        if (distance < mouseInfluence) {
          particle.vx *= 0.98;
          particle.vy *= 0.98;
        }

        // Ensure particles maintain minimum velocity for continuous movement
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const minSpeed = 0.15;
        if (speed < minSpeed && speed > 0) {
          particle.vx = (particle.vx / speed) * minSpeed;
          particle.vy = (particle.vy / speed) * minSpeed;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Add current position to trail
        particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity });
        if (particle.trail.length > 10) {
          particle.trail.shift();
        }

        // Draw trail
        particle.trail.forEach((point, index) => {
          const trailOpacity = (index / particle.trail.length) * point.opacity * 0.3;
          const trailRadius = particle.radius * (index / particle.trail.length) * 0.8;

          ctx.fillStyle = `rgba(${particle.color}, ${trailOpacity})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, trailRadius, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw main particle with subtle gradient
        const particleGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius
        );
        particleGradient.addColorStop(0, `rgba(${particle.color}, ${particle.opacity})`);
        particleGradient.addColorStop(1, `rgba(${particle.color}, ${particle.opacity * 0.7})`);

        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const lineOpacity = 0.25 * (1 - distance / 120);

            // Create gradient line between particles
            const lineGradient = ctx.createLinearGradient(
              particles[i].x,
              particles[i].y,
              particles[j].x,
              particles[j].y
            );
            lineGradient.addColorStop(0, `rgba(${particles[i].color}, ${lineOpacity})`);
            lineGradient.addColorStop(1, `rgba(${particles[j].color}, ${lineOpacity})`);

            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'linear-gradient(135deg, #fffaf0 0%, #f5e8d8 45%, #ffffff 100%)' }}
    />
  );
};
