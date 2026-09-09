const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   1. 커서 글로우
   ========================================================= */
(function cursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || prefersReducedMotion) return;

  window.addEventListener('pointermove', (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
})();

/* =========================================================
   2. 전체 페이지 배경 뉴럴 네트워크 캔버스
   - 뷰포트에 고정되어 스크롤해도 항상 보임
   - 마우스 근처에서 점들의 움직임이 살짝 빨라짐
   ========================================================= */
(function networkCanvas() {
  const canvas = document.getElementById('networkCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, dpr;
  let points = [];
  const mouse = { x: null, y: null, radius: 220 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initPoints();
  }

  function initPoints() {
    const count = Math.min(80, Math.floor((width * height) / 15000));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    for (const p of points) {
      // 마우스 근처일수록 속도를 살짝 높여서 인터랙션을 바로 체감할 수 있게 함
      let speedBoost = 1;
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const proximity = 1 - dist / mouse.radius;
          speedBoost = 1 + proximity * 2.2;
          // 아주 살짝 마우스 반대 방향으로 밀어내는 힘도 추가
          if (dist > 0.001) {
            p.x += (dx / dist) * proximity * 0.6;
            p.y += (dy / dist) * proximity * 0.6;
          }
        }
      }

      p.x += p.vx * speedBoost;
      p.y += p.vy * speedBoost;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    }

    // 연결선 — 뚜렷하게 보이는 회색
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.strokeStyle = `rgba(150, 150, 160, ${(1 - dist / 150) * 0.45})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
    }

    // 점 — 크기 확대
    for (const p of points) {
      ctx.fillStyle = 'rgba(236, 236, 238, 0.85)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!prefersReducedMotion) requestAnimationFrame(step);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('pointerleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  resize();
  step();
  if (prefersReducedMotion) {
    step(); // 정적인 프레임 한 번만 그리기
  }
})();

/* =========================================================
   3. 점 네비게이션 — 스크롤 위치에 따라 활성 표시
   ========================================================= */
(function dotNav() {
  const links = document.querySelectorAll('.dot-nav__item');
  const sections = Array.from(links).map((link) =>
    document.querySelector(link.getAttribute('href'))
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = `#${entry.target.id}`;
          links.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === id);
          });
        }
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((section) => section && observer.observe(section));
})();

/* =========================================================
   4. AI 개념 카드 — 클릭하면 펼쳐짐
   ========================================================= */
(function conceptCards() {
  document.querySelectorAll('.concept-card').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-open');
    });
  });
})();
