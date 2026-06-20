// ========================================
// Portfolio Main JavaScript
// Inspired by mattwilldev.com
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initParticleBackground();
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initBackToTop();
  initSmoothScroll();
  initProjectVideoHover();
  initProjectTabs();
});

// ========================================
// Particle Background Canvas
// ========================================
function initParticleBackground() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = -9999;
  let mouseY = -9999;
  let isMouseOnScreen = false;

  const CONFIG = {
    particleDensity: 12000,       // lower = more particles
    baseSpeed: 0.25,
    particleMinRadius: 0.8,
    particleMaxRadius: 2,
    baseOpacity: 0.15,
    connectionDistance: 140,       // base connection range
    mouseRadius: 200,             // mouse influence radius
    mouseGlowRadius: 250,         // glow circle radius
    lineBaseOpacity: 0.06,
    lineMouseBoost: 0.25,         // extra line opacity near mouse
    particleMouseGlow: 0.9,       // max particle opacity near mouse
    particleMouseScale: 2.5,      // max particle scale near mouse
    mouseAttraction: 0.015,       // gentle pull toward mouse
  };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(
      Math.floor((canvas.width * canvas.height) / CONFIG.particleDensity),
      200
    );
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * CONFIG.baseSpeed,
        vy: (Math.random() - 0.5) * CONFIG.baseSpeed,
        radius: Math.random() * (CONFIG.particleMaxRadius - CONFIG.particleMinRadius) + CONFIG.particleMinRadius,
        baseOpacity: Math.random() * CONFIG.baseOpacity + 0.03,
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw mouse glow — radial light under cursor
    if (isMouseOnScreen) {
      const glowGrad = ctx.createRadialGradient(
        mouseX, mouseY, 0,
        mouseX, mouseY, CONFIG.mouseGlowRadius
      );
      glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      glowGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.015)');
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(
        mouseX - CONFIG.mouseGlowRadius,
        mouseY - CONFIG.mouseGlowRadius,
        CONFIG.mouseGlowRadius * 2,
        CONFIG.mouseGlowRadius * 2
      );
    }

    // Update & draw particles
    particles.forEach((p, i) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;

      // Mouse distance
      const mdx = p.x - mouseX;
      const mdy = p.y - mouseY;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      const mouseProximity = Math.max(0, 1 - mDist / CONFIG.mouseRadius);

      // Calculate current opacity & radius based on mouse proximity
      const currentOpacity = p.baseOpacity + mouseProximity * (CONFIG.particleMouseGlow - p.baseOpacity);
      const currentRadius = p.radius + mouseProximity * (CONFIG.particleMouseScale - p.radius);

      // Draw particle with glow when near mouse
      if (mouseProximity > 0.1) {
        // Outer glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${mouseProximity * 0.06})`;
        ctx.fill();
      }

      // Core particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
      ctx.fill();

      // Connect to nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectionDistance) {
          // Calculate line midpoint distance to mouse
          const midX = (p.x + p2.x) / 2;
          const midY = (p.y + p2.y) / 2;
          const midDx = midX - mouseX;
          const midDy = midY - mouseY;
          const midDist = Math.sqrt(midDx * midDx + midDy * midDy);
          const midMouseProximity = Math.max(0, 1 - midDist / CONFIG.mouseRadius);

          const distFactor = 1 - dist / CONFIG.connectionDistance;
          const lineOpacity = CONFIG.lineBaseOpacity * distFactor + midMouseProximity * CONFIG.lineMouseBoost * distFactor;

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
          ctx.lineWidth = 0.5 + midMouseProximity * 0.8;
          ctx.stroke();
        }
      }

      // Mouse interaction: gentle attraction toward mouse
      if (isMouseOnScreen && mDist < CONFIG.mouseRadius && mDist > 1) {
        const force = mouseProximity * CONFIG.mouseAttraction;
        p.vx -= (mdx / mDist) * force;
        p.vy -= (mdy / mDist) * force;
      }

      // Speed limit & damping
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 1.5) {
        p.vx = (p.vx / speed) * 1.5;
        p.vy = (p.vy / speed) * 1.5;
      }
      p.vx *= 0.998;
      p.vy *= 0.998;

      // Ensure minimum movement
      if (speed < 0.1) {
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;
      }
    });

    requestAnimationFrame(drawParticles);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseOnScreen = true;
  });

  document.addEventListener('mouseleave', () => {
    isMouseOnScreen = false;
    mouseX = -9999;
    mouseY = -9999;
  });

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  resize();
  createParticles();
  drawParticles();
}


// ========================================
// Scroll Progress Bar
// ========================================
function initScrollProgress() {
  const progressBar = document.getElementById('scrollProgress');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
  });
}

// ========================================
// Navbar Scroll Effect
// ========================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('.section');

  window.addEventListener('scroll', () => {
    // Add scrolled class
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active section highlighting
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });
}

// ========================================
// Mobile Menu Toggle
// ========================================
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobileBtn');
  const navLinks = document.getElementById('navLinks');

  mobileBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');

    const spans = mobileBtn.querySelectorAll('span');
    if (navLinks.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const spans = mobileBtn.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });
}

// ========================================
// Scroll Animations (Intersection Observer)
// ========================================
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  document.querySelectorAll('.stagger-children').forEach(el => observer.observe(el));
}

// ========================================
// Back to Top Button
// ========================================
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ========================================
// Smooth Scroll for Anchor Links
// ========================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = 0;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ========================================
// Project Video Hover Control
// ========================================
function initProjectVideoHover() {
  const video = document.getElementById('projectVideo');
  if (!video) return;

  const container = video.closest('.project-screenshot');
  if (!container) return;

  container.addEventListener('mouseenter', () => {
    video.play().catch(err => {
      console.log("Video play was prevented:", err);
    });
  });

  container.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
  });
}

// ========================================
// Project Tabs Control
// ========================================
function initProjectTabs() {
  const tabs = document.querySelectorAll('.project-tab-btn');
  const cards = document.querySelectorAll('.project-card[data-tab-content]');

  if (tabs.length === 0 || cards.length === 0) return;

  // Initialize: Add 'show' class to initially active card
  cards.forEach(card => {
    if (card.classList.contains('active')) {
      card.classList.add('show');
    }
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      // Update active tab button
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Switch cards
      cards.forEach(card => {
        const cardTab = card.getAttribute('data-tab-content');

        if (cardTab === targetTab) {
          card.classList.add('active');
          // Add 'show' with a small delay to trigger CSS transition after display: block
          setTimeout(() => {
            card.classList.add('show');
          }, 20);
        } else {
          card.classList.remove('show');
          card.classList.remove('active');
        }
      });
    });
  });
}
