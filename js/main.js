/* Свадебное приглашение — интерактив: появление блоков, таймер, параллакс */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Появление элементов при прокрутке ---------- */
  // элементы, которые ещё не показаны; проверяются в общем обработчике прокрутки ниже
  let pending = $$('[data-r]');
  const revealVisible = (vh) => {
    if (!pending.length) return;
    pending = pending.filter((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top > vh * 0.93 || rect.bottom < 0) return true;
      el.classList.add('is-in');
      return false;
    });
  };
  if (reduceMotion) {
    pending.forEach((el) => el.classList.add('is-in'));
    pending = [];
  } else {
    // первый экран показываем сразу после загрузки, без ожидания прокрутки
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$('.hero [data-r]').forEach((el) => el.classList.add('is-in'));
      pending = pending.filter((el) => !el.closest('.hero'));
    }));
  }

  /* ---------- Таймер до свадьбы ---------- */
  const timer = document.querySelector('.cd');
  if (timer) {
    const target = new Date(timer.dataset.target).getTime();
    const out = {
      d: timer.querySelector('[data-cd="d"]'),
      h: timer.querySelector('[data-cd="h"]'),
      m: timer.querySelector('[data-cd="m"]'),
    };
    const labels = {
      d: timer.querySelector('[data-cd-label="d"]'),
      h: timer.querySelector('[data-cd-label="h"]'),
    };
    const forms = { d: ['день', 'дня', 'дней'], h: ['час', 'часа', 'часов'] };

    // склонение: 1 день, 2 дня, 5 дней
    const plural = (n, [one, few, many]) => {
      const n10 = n % 10;
      const n100 = n % 100;
      if (n10 === 1 && n100 !== 11) return one;
      if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
      return many;
    };
    const pad = (n) => String(n).padStart(2, '0');

    const set = (el, text, animate) => {
      if (!el || el.textContent === text) return;
      el.textContent = text;
      if (animate && !reduceMotion) {
        el.classList.remove('is-tick');
        void el.offsetWidth; // перезапуск анимации
        el.classList.add('is-tick');
      }
    };

    let first = true;
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      const totalMin = Math.floor(diff / 60000);
      const d = Math.floor(totalMin / 1440);
      const h = Math.floor((totalMin % 1440) / 60);
      const m = totalMin % 60;

      set(out.d, String(d), !first);
      set(out.h, pad(h), !first);
      set(out.m, pad(m), !first);
      set(labels.d, plural(d, forms.d), false);
      set(labels.h, plural(h, forms.h), false);

      if (diff === 0) {
        const title = document.getElementById('cd-title');
        if (title) title.textContent = 'Этот день настал!';
      }
      first = false;
    };
    update();
    setInterval(update, 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  }

  /* ---------- Эффект нажатия на кнопках (переходов пока нет) ---------- */
  $$('.btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (reduceMotion) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      // клик с клавиатуры приходит с нулевыми координатами — тогда из центра
      const x = e.clientX ? e.clientX - rect.left : rect.width / 2;
      const y = e.clientY ? e.clientY - rect.top : rect.height / 2;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  if (reduceMotion) return;

  /* ---------- Параллакс декора + прорисовка линии программы ---------- */
  const parallaxEls = $$('[data-px]').map((el) => ({
    el,
    k: parseFloat(el.dataset.px) || 0,
    inHero: Boolean(el.closest('.hero')),
  }));
  const path = document.querySelector('.prog__path');
  const pathHeart = document.querySelector('.prog__heart');

  // Точки пунктирной линии программы (координаты из path.svg, сверху вниз) —
  // по ним сердце едет вдоль линии при прокрутке.
  const PATH_POINTS = [[111.4,0.0],[111.3,3.8],[110.7,11.2],[109.6,18.7],[107.9,26.0],[105.6,33.1],[102.7,40.0],[99.2,46.7],[95.1,52.9],[90.4,58.8],[85.1,64.2],[79.3,68.9],[73.0,72.9],[66.2,76.1],[59.0,78.4],[55.4,79.1],[51.3,79.9],[43.4,82.0],[35.7,84.8],[28.4,88.5],[21.7,93.1],[15.8,98.7],[10.9,105.3],[7.4,112.7],[5.2,120.5],[4.7,128.7],[5.5,136.8],[7.8,144.7],[11.3,152.0],[15.8,158.8],[21.2,165.0],[27.4,170.3],[34.2,174.9],[41.4,178.7],[49.1,181.7],[56.9,183.9],[60.9,184.8],[64.8,185.6],[72.4,187.7],[79.7,190.5],[86.8,194.0],[93.3,198.3],[99.2,203.4],[104.3,209.5],[108.2,216.3],[110.6,223.8],[111.5,231.6],[110.7,239.4],[108.4,246.9],[104.7,253.8],[99.9,260.1],[94.3,265.5],[88.0,270.3],[81.3,274.3],[74.1,277.6],[66.8,280.3],[59.2,282.5],[55.4,283.3],[51.3,284.3],[43.3,286.8],[35.5,290.0],[28.2,294.0],[21.3,298.7],[15.0,304.3],[9.6,310.7],[5.2,317.8],[2.1,325.5],[0.6,333.8],[1.0,342.1],[3.2,350.2],[7.2,357.5],[12.4,364.0],[18.7,369.5],[25.6,374.2],[33.1,378.1],[40.8,381.4],[48.7,384.0],[56.8,386.2],[60.9,387.1],[64.7,388.0],[72.0,390.2],[79.1,393.0],[85.9,396.6],[92.2,400.9],[97.9,406.0],[102.8,411.9],[106.7,418.4],[109.5,425.6],[110.9,433.1],[111.0,440.7],[109.6,448.2],[106.9,455.4],[103.0,461.9],[98.1,467.8],[92.4,472.8],[86.0,477.1],[79.2,480.5],[72.0,483.3],[64.7,485.3],[60.9,486.1],[57.0,487.0],[49.5,489.7],[42.6,493.7],[36.7,498.9],[31.9,505.3],[28.3,512.4],[25.8,519.9],[24.2,527.7],[23.3,535.6],[23.0,543.6],[23.1,551.6],[23.4,559.5],[23.5,563.5]];
  const pathLengths = [0];
  for (let i = 1; i < PATH_POINTS.length; i += 1) {
    const dx = PATH_POINTS[i][0] - PATH_POINTS[i - 1][0];
    const dy = PATH_POINTS[i][1] - PATH_POINTS[i - 1][1];
    pathLengths.push(pathLengths[i - 1] + Math.hypot(dx, dy));
  }
  const pathTotal = pathLengths[pathLengths.length - 1];
  // точка на линии: t = 0 — начало, t = 1 — конец
  const pointOnPath = (t) => {
    const dist = Math.max(0, Math.min(1, t)) * pathTotal;
    let i = 1;
    while (i < pathLengths.length - 1 && pathLengths[i] < dist) i += 1;
    const seg = pathLengths[i] - pathLengths[i - 1] || 1;
    const k = (dist - pathLengths[i - 1]) / seg;
    const a = PATH_POINTS[i - 1];
    const b = PATH_POINTS[i];
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  };
  let ticking = false;

  const onFrame = () => {
    ticking = false;
    const vh = window.innerHeight;

    revealVisible(vh);

    parallaxEls.forEach(({ el, k, inHero }) => {
      const rect = el.parentElement.getBoundingClientRect();
      if (rect.bottom < -vh || rect.top > vh * 2) return;
      let offset;
      if (inHero) {
        // первый экран: в начале страницы всё стоит ровно по макету
        offset = -window.scrollY;
      } else {
        // остальные блоки: ровно по макету, когда элемент в центре экрана
        const elRect = el.getBoundingClientRect();
        const current = parseFloat(el.dataset.shift || '0');
        offset = elRect.top - current + elRect.height / 2 - vh / 2;
      }
      const shift = Math.max(-48, Math.min(48, offset * k));
      el.dataset.shift = shift.toFixed(1);
      el.style.translate = `0 ${shift.toFixed(1)}px`;
    });

    if (path) {
      const rect = path.getBoundingClientRect();
      const progress = (vh * 0.82 - rect.top) / rect.height;
      path.style.setProperty('--draw', Math.max(0, Math.min(1, progress)).toFixed(3));

      // сердце: в начале линии, когда она входит в экран, и в конце — когда её низ дошёл до середины
      if (pathHeart) {
        const t = (vh * 0.62 - rect.top) / (rect.height + vh * 0.12);
        const [x, y] = pointOnPath(t);
        pathHeart.style.setProperty('--hx', x.toFixed(1));
        pathHeart.style.setProperty('--hy', y.toFixed(1));
        // сердце проявляется вместе с первыми штрихами линии
        pathHeart.style.setProperty('--show', Math.max(0, Math.min(1, progress * 12)).toFixed(2));
      }
    }
  };
  const requestFrame = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onFrame);
  };
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame);
  window.addEventListener('load', requestFrame);
  requestFrame();

  /* ---------- Лёгкая реакция первого экрана на движение мыши ---------- */
  const hero = document.querySelector('.hero');
  if (hero && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 2 - 1).toFixed(3));
      hero.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 2 - 1).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--mx', 0);
      hero.style.setProperty('--my', 0);
    });
  }
})();
