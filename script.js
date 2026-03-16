/**
 * ================================================================
 * AARON ESCABIAS · PORTFOLIO — script.js
 * Vanilla JS · Production Ready
 * ================================================================
 */

"use strict";

/* ================================================================
   1. CUSTOM CURSOR
================================================================ */
(function initCursor() {
  const cursor   = document.getElementById("cursor");
  const follower = document.getElementById("cursorFollower");

  if (!cursor || !follower) return;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  let mouseX = -100, mouseY = -100;
  let followerX = -100, followerY = -100;
  let rafId = null;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + "px";
    cursor.style.top  = mouseY + "px";
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + "px";
    follower.style.top  = followerY + "px";
    rafId = requestAnimationFrame(animateFollower);
  }

  animateFollower();

  // Hide cursor when leaving window
  document.addEventListener("mouseleave", () => {
    cursor.style.opacity   = "0";
    follower.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    cursor.style.opacity   = "1";
    follower.style.opacity = "1";
  });
})();

/* ================================================================
   2. PARTICLE CANVAS
================================================================ */
(function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let W, H, particles = [];
  let animFrame;

  const CONFIG = {
    count:        70,
    minRadius:    0.8,
    maxRadius:    2.2,
    minSpeed:     0.12,
    maxSpeed:     0.4,
    connectDist:  120,
    colors:       ["rgba(59,130,246,", "rgba(6,182,212,", "rgba(139,92,246,"],
    opacity:      0.6,
    lineOpacity:  0.12,
  };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }

    reset(randomY = false) {
      this.x     = Math.random() * W;
      this.y     = randomY ? Math.random() * H : H + 10;
      this.vx    = (Math.random() - 0.5) * (CONFIG.maxSpeed - CONFIG.minSpeed) + CONFIG.minSpeed * 0.5;
      this.vy    = -(Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed) + CONFIG.minSpeed);
      this.r     = Math.random() * (CONFIG.maxRadius - CONFIG.minRadius) + CONFIG.minRadius;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.y < -10 || this.x < -10 || this.x > W + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ")";
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < CONFIG.count; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectDist) {
          const alpha = (1 - dist / CONFIG.connectDist) * CONFIG.lineOpacity;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => { p.update(); p.draw(); });
    drawConnections();
    animFrame = requestAnimationFrame(loop);
  }

  resize();
  init();
  loop();

  const resizeObs = new ResizeObserver(() => {
    resize();
    init();
  });
  resizeObs.observe(document.body);

  // Pause particles when not visible for performance
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animFrame);
    } else {
      loop();
    }
  });
})();

/* ================================================================
   3. NAVBAR — scroll effect & active link
================================================================ */
(function initNavbar() {
  const navbar    = document.getElementById("navbar");
  const links     = document.querySelectorAll(".nav-link");
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.getElementById("navLinks");

  if (!navbar) return;

  // Scroll effect
  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Active section highlight
  const sections = document.querySelectorAll("section[id]");

  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((s) => sectionObs.observe(s));

  // Hamburger
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.classList.toggle("open");
      navLinks.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close on nav link click
    navLinks.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        navLinks.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });

    // Close on backdrop click / escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && hamburger.classList.contains("open")) {
        hamburger.classList.remove("open");
        navLinks.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }
})();

/* ================================================================
   4. TYPING EFFECT
================================================================ */
(function initTyping() {
  const el = document.getElementById("typingText");
  if (!el) return;

  const phrases = [
    "Estudiante de DAM",
    "Apasionado del Clean Code",
    "Java Developer en formación",
    "Frontend Explorer",
    "Future Full-Stack Developer",
    "SQL Enthusiast",
  ];

  let phraseIdx  = 0;
  let charIdx    = 0;
  let isDeleting = false;
  let timeoutId  = null;

  const TYPE_SPEED   = 70;
  const DELETE_SPEED = 35;
  const PAUSE_END    = 2000;
  const PAUSE_START  = 400;

  function type() {
    const current = phrases[phraseIdx];

    if (isDeleting) {
      charIdx--;
      el.textContent = current.slice(0, charIdx);

      if (charIdx === 0) {
        isDeleting  = false;
        phraseIdx   = (phraseIdx + 1) % phrases.length;
        timeoutId   = setTimeout(type, PAUSE_START);
        return;
      }

      timeoutId = setTimeout(type, DELETE_SPEED);
    } else {
      charIdx++;
      el.textContent = current.slice(0, charIdx);

      if (charIdx === current.length) {
        isDeleting = true;
        timeoutId  = setTimeout(type, PAUSE_END);
        return;
      }

      timeoutId = setTimeout(type, TYPE_SPEED);
    }
  }

  // Respect reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = phrases[0];
    return;
  }

  timeoutId = setTimeout(type, 600);
})();

/* ================================================================
   5. SCROLL-REVEAL (IntersectionObserver)
================================================================ */
(function initScrollReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger children in grids
          entry.target.style.transitionDelay =
            entry.target.dataset.delay || "";
          entry.target.classList.add("show");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  // Stagger siblings in grid containers
  const grids = document.querySelectorAll(".skills-grid, .projects-grid, .about-traits");
  grids.forEach((grid) => {
    const children = grid.querySelectorAll(".reveal");
    children.forEach((child, i) => {
      child.dataset.delay = i * 0.08 + "s";
      child.style.transitionDelay = i * 0.08 + "s";
    });
  });

  els.forEach((el) => obs.observe(el));
})();

/* ================================================================
   6. SKILL BARS ANIMATION
================================================================ */
(function initSkillBars() {
  const cards = document.querySelectorAll(".skill-card");
  if (!cards.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target.querySelector(".skill-bar-fill");
          if (fill) {
            const width = fill.dataset.width || "0";
            // Small delay so the card reveal animation completes first
            setTimeout(() => {
              fill.style.width = width + "%";
            }, 300);
          }
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  cards.forEach((card) => obs.observe(card));
})();

/* ================================================================
   7. COUNTER ANIMATION (Hero stats)
================================================================ */
(function initCounters() {
  const counters = document.querySelectorAll(".stat-number[data-target]");
  if (!counters.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const dur    = 1200;
        const step   = dur / target;
        let   count  = 0;

        const tick = setInterval(() => {
          count++;
          el.textContent = count;
          if (count >= target) {
            el.textContent = target;
            clearInterval(tick);
          }
        }, step);

        obs.unobserve(el);
      });
    },
    { threshold: 0.8 }
  );

  counters.forEach((c) => obs.observe(c));
})();

/* ================================================================
   8. MAGNETIC BUTTONS
================================================================ */
(function initMagnetic() {
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  const btns = document.querySelectorAll("[data-magnetic]");

  btns.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect   = btn.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) * 0.35;
      const dy     = (e.clientY - cy) * 0.35;
      btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-2px)`;
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
})();

/* ================================================================
    9. CONTACT FORM
================================================================ */
(function initForm() {
  const form    = document.getElementById("contactForm");
  const submit  = document.getElementById("formSubmit");
  const success = document.getElementById("formSuccess");

  if (!form) return;

  function validate() {
    let isValid = true;
    const fields = [
      { id: "contact-name",    msg: "El nombre es obligatorio." },
      { id: "contact-email",   msg: "El email es obligatorio.", type: "email" },
      { id: "contact-subject", msg: "El asunto es obligatorio." },
      { id: "contact-message", msg: "El mensaje es obligatorio." },
    ];

    fields.forEach(({ id, msg, type }) => {
      const input = document.getElementById(id);
      const error = input.parentElement.querySelector(".form-error");
      if (!input) return;

      input.classList.remove("error");
      if (error) error.textContent = "";

      const val = input.value.trim();
      if (!val) {
        input.classList.add("error");
        if (error) error.textContent = msg;
        isValid = false;
        return;
      }

      if (type === "email") {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(val)) {
          input.classList.add("error");
          if (error) error.textContent = "Introduce un email válido.";
          isValid = false;
        }
      }
    });
    return isValid;
  }

  // Live validation
  form.querySelectorAll(".form-input").forEach((input) => {
    input.addEventListener("blur", () => {
      if (!input.value.trim()) input.classList.add("error");
    });
    input.addEventListener("input", () => {
      if (input.value.trim()) {
        input.classList.remove("error");
        const error = input.parentElement.querySelector(".form-error");
        if (error) error.textContent = "";
      }
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    submit.classList.add("loading");
    submit.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form),
      });

      if (response.ok) {
        // OPCIÓN A: Redirigir a success.html (tu idea original)
        window.location.href = "success.html";
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.errors?.[0]?.message || "Error al enviar");
      }
    } catch (err) {
      submit.classList.remove("loading");
      submit.disabled = false;

      if (success) {
        success.hidden = false;
        success.style.display = "flex";
        // Estilos de error corregidos
        success.style.background = "rgba(248,113,113,0.15)";
        success.style.color = "#f87171";
        
        // CORRECCIÓN AQUÍ: Eliminamos las barras invertidas innecesarias
        success.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" 
               stroke="currentColor" stroke-width="2.5" 
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>${err.message}</span>
        `;

        setTimeout(() => {
          success.hidden = true;
          success.style.display = "none";
        }, 6000);
      }
    }
  });
})();

/* ================================================================
   10. SMOOTH SCROLL for anchor links
================================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;

      e.preventDefault();
      const navH   = parseInt(getComputedStyle(document.documentElement)
                       .getPropertyValue("--nav-h"), 10) || 68;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();

/* ================================================================
   11. BACK TO TOP button visibility
================================================================ */
(function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;

  // Button is always visible in footer, but we can add extra polish
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ================================================================
   12. PAGE LOAD SEQUENCE
================================================================ */
(function initLoadSequence() {
  // Force hero animations to replay on load
  const heroAnimEls = document.querySelectorAll(".animate-fade-up, .animate-fade-left");
  heroAnimEls.forEach((el) => {
    el.style.animationPlayState = "paused";
  });

  window.addEventListener("load", () => {
    heroAnimEls.forEach((el) => {
      el.style.animationPlayState = "running";
    });
  });
})();

/* ================================================================
   13. TERMINAL TYPEWRITER (About section)
================================================================ */
(function initTerminalEffect() {
  const outputs = document.querySelectorAll(".terminal-output");
  if (!outputs.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const terminalObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const lines = entry.target.querySelectorAll(".terminal-line, .terminal-output");
        lines.forEach((line, i) => {
          line.style.opacity   = "0";
          line.style.transform = "translateX(-8px)";

          setTimeout(() => {
            line.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            line.style.opacity    = "1";
            line.style.transform  = "translateX(0)";
          }, i * 120);
        });

        terminalObs.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  const terminalBody = document.querySelector(".terminal-body");
  if (terminalBody) terminalObs.observe(terminalBody);
})();

/* ================================================================
   14. SKILL CARD GLOW FOLLOWS MOUSE
================================================================ */
(function initCardGlow() {
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  const cards = document.querySelectorAll(".skill-card, .project-card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width)  * 100;
      const y    = ((e.clientY - rect.top)  / rect.height) * 100;

      card.style.setProperty("--mouse-x", x + "%");
      card.style.setProperty("--mouse-y", y + "%");

      const glow = card.querySelector(".skill-card-glow");
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(6, 182, 212, 0.1) 0%, transparent 60%)`;
      }
    });
  });
})();

/* ================================================================
   15. PERFORMANCE — Defer non-critical init
================================================================ */
if ("requestIdleCallback" in window) {
  requestIdleCallback(() => {
    // Pre-warm CSS transitions on cards
    document.querySelectorAll(".skill-card, .project-card").forEach((card) => {
      card.style.willChange = "transform";
    });
  });
}

console.log(
  "%c⬡ Aarón Escabias Portfolio %c · Made with ♥ and Vanilla JS",
  "background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold;",
  "color: #9ca3af; padding: 6px;"
);