try {
  if (localStorage.getItem('portfolio-theme') === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  }
} catch (e) {}

document.addEventListener('DOMContentLoaded', () => {

  // Keep pointer/scroll effects to one visual update per browser frame. This
  // prevents stacked mousemove handlers from overwhelming slower devices.
  const rafThrottle = (callback) => {
    let frame = 0;
    let latestEvent;
    return (event) => {
      latestEvent = event;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        callback(latestEvent);
      });
    };
  };

  // ---- persistent light / dark theme toggle (homepage control) ----
  const themeToggle = document.getElementById('themeToggle');
  function syncThemeToggle() {
    if (!themeToggle) return;
    const isDark = document.documentElement.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  syncThemeToggle();
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      if (isDark) delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = 'dark';
      try {
        localStorage.setItem('portfolio-theme', isDark ? 'light' : 'dark');
      } catch (e) {}
      syncThemeToggle();
    });
  }

  // ---- hero load-in stagger (homepage only) ----
  const bigHero = document.getElementById('bigHero');
  if (bigHero) {
    requestAnimationFrame(() => {
      setTimeout(() => bigHero.classList.add('loaded'), 60);
    });
  }

  // ---- page transition: fade out on internal nav clicks ----
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    const isInternal = href && !href.startsWith('#') && !href.startsWith('http')
      && !href.startsWith('mailto:') && !href.startsWith('tel:') && a.target !== '_blank';
    if (!isInternal) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(() => { window.location.href = href; }, 260);
    });
  });

  // ---- mobile hamburger menu toggle ----
  function wireToggle(btnId, listId) {
    const btn = document.getElementById(btnId);
    const list = document.getElementById(listId);
    if (!btn || !list) return;
    btn.addEventListener('click', () => {
      const isOpen = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      btn.textContent = isOpen ? '✕' : '☰';
    });
    // close menu when a link inside it is clicked
    list.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        list.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = '☰';
      });
    });
  }
  wireToggle('navToggle', 'navLinks');
  wireToggle('bhNavToggle', 'bhNavLinks');

  // ---- scroll progress bar ----
  const progress = document.getElementById('scrollProgress');
  if (progress) {
    const updateScrollProgress = rafThrottle(() => {
      const h = document.documentElement;
      const range = Math.max(h.scrollHeight - h.clientHeight, 1);
      const scrolled = h.scrollTop / range * 100;
      progress.style.width = scrolled + '%';
    });
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  }

  // ---- fade-up reveal ----
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));

  // ---- 3D flip-in reveal (case card, proof grid) ----
  const items3d = document.querySelectorAll('.reveal-3d');
  const io3d = new IntersectionObserver((entries) => {
    entries.forEach((e, idx) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), idx * 90);
        io3d.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items3d.forEach(el => io3d.observe(el));

  // ---- animated number counters ----
  const counters = document.querySelectorAll('[data-count]');
  const reduceCounterMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counterGroups = new Map();

  function counterText(el, value) {
    const raw = el.dataset.count || '0';
    const decimals = (raw.split('.')[1] || '').length;
    const suffix = el.dataset.suffix || '';
    const fixed = Number(value).toFixed(decimals);
    const number = el.dataset.format === 'comma'
      ? Number(fixed).toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        })
      : fixed;
    return number + suffix;
  }

  function counterStartValue(el, target) {
    const decimals = ((el.dataset.count || '').split('.')[1] || '').length;
    return decimals === 0 ? Math.max(1, Math.round(target * .12)) : target * .12;
  }

  function animateCounter(el) {
    if (el.dataset.counterStarted === 'true') return;
    el.dataset.counterStarted = 'true';
    const target = Number(el.dataset.count);
    const finalText = counterText(el, target);
    const startValue = counterStartValue(el, target);
    const startText = counterText(el, startValue);
    el.style.setProperty('--counter-width', `${Math.max(finalText.length, startText.length)}ch`);

    if (reduceCounterMotion || !Number.isFinite(target)) {
      el.textContent = finalText;
      return;
    }

    // Home counters should feel as immediate as the Work metrics. The shorter
    // homepage timing also avoids a slow final-digit settling impression.
    const duration = document.body.classList.contains('home-page') ? 1050 : 1400;
    let elapsed = 0;
    let previousFrame;
    el.textContent = startText;

    function tick(now) {
      if (previousFrame === undefined) previousFrame = now;
      // Clamp unusually long frames so recording, tab scheduling or a brief
      // device slowdown cannot make a counter jump straight to its result.
      elapsed += Math.min(now - previousFrame, 34);
      previousFrame = now;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = startValue + (target - startValue) * eased;
      el.textContent = progress === 1 ? finalText : counterText(el, value);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  counters.forEach((el) => {
    // A card is the trigger unit: paired values inside one card stay perfectly
    // synchronized, while stacked phone cards animate only as each is reached.
    const group = el.closest('.stat, .qf, .bh-badge') || el;
    if (!counterGroups.has(group)) counterGroups.set(group, []);
    counterGroups.get(group).push(el);
    const startText = counterText(el, counterStartValue(el, Number(el.dataset.count)));
    const finalText = counterText(el, Number(el.dataset.count));
    el.style.setProperty('--counter-width', `${Math.max(finalText.length, startText.length)}ch`);
    // Keep the exact HTML value visible until this card actually begins. This
    // removes the apparent pause between a placeholder and the first frame.
  });

  const ioCount = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      (counterGroups.get(entry.target) || []).forEach(animateCounter);
      ioCount.unobserve(entry.target);
    });
  }, { threshold: 0.25 });
  counterGroups.forEach((_, group) => ioCount.observe(group));

  // ---- animated bar chart (silhouette by k, work page) ----
  const bars = document.querySelectorAll('.bar-fill');
  const ioBars = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const h = e.target.dataset.height;
        e.target.style.setProperty('--h', h + '%');
        e.target.classList.add('grow');
        ioBars.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(el => ioBars.observe(el));

  // ---- 3D mouse-tilt for the contact-page globe ----
  const globeScene = document.getElementById('globeScene');
  const globeInner = document.getElementById('globeInner');
  if (globeScene && globeInner) {
    globeScene.addEventListener('pointermove', rafThrottle((e) => {
      const rect = globeScene.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      globeInner.style.animationPlayState = 'paused';
      globeInner.style.transform = `rotateX(${8 - py * 20}deg) rotateY(${px * 26}deg)`;
    }));
    globeScene.addEventListener('pointerleave', () => {
      globeInner.style.transform = '';
      globeInner.style.animationPlayState = 'running';
    });
  }

  // ---- 3D mouse-tilt for the hero scene (parallax) ----
  const scene = document.getElementById('heroScene');
  const sceneInner = document.getElementById('sceneInner');
  if (scene && sceneInner) {
    scene.addEventListener('pointermove', rafThrottle((e) => {
      const rect = scene.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      sceneInner.style.animationPlayState = 'paused';
      sceneInner.style.transform = `translateY(-8px) rotateX(${6 - py * 14}deg) rotateY(${-10 + px * 20}deg)`;
    }));
    scene.addEventListener('pointerleave', () => {
      sceneInner.style.transform = '';
      sceneInner.style.animationPlayState = 'running';
    });
  }

  // ---- homepage hero: restrained 3D depth that follows the pointer ----
  const heroStage = document.getElementById('heroStage');
  const heroDepth = document.getElementById('heroDepth');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroStage && heroDepth && canHover && !reduceMotion) {
    heroStage.addEventListener('pointermove', rafThrottle((e) => {
      const rect = heroStage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroDepth.style.animationPlayState = 'paused';
      heroDepth.style.transform = `translateY(-4px) rotateX(${-y * 7}deg) rotateY(${x * 10}deg)`;
    }));
    heroStage.addEventListener('pointerleave', () => {
      heroDepth.style.transform = '';
      heroDepth.style.animationPlayState = 'running';
    });
  }

  // ---- 3D tilt for any .tilt-card following the cursor ----
  // Special scenes have their own tailored transforms and must not also receive
  // this generic tilt (the duplicate globe transform was a source of jank).
  document.querySelectorAll('.tilt-card:not(#globeScene):not(#heroScene)').forEach((card) => {
    card.addEventListener('pointermove', rafThrottle((e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
    }));
    card.addEventListener('pointerleave', () => {
      card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateY(0)';
    });
  });

  // ---- outline text mouse-follow color reveal (about page) ----
  const outlineHero = document.getElementById('outlineHero');
  const outlineText = document.getElementById('outlineText');
  if (outlineHero && outlineText) {
    outlineHero.addEventListener('pointermove', rafThrottle((e) => {
      const r = outlineText.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      outlineText.style.setProperty('--mx', x + 'px');
      outlineText.style.setProperty('--my', y + 'px');
    }));
    outlineHero.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      const r = outlineText.getBoundingClientRect();
      outlineText.style.setProperty('--mx', (t.clientX - r.left) + 'px');
      outlineText.style.setProperty('--my', (t.clientY - r.top) + 'px');
    }, { passive: true });
  }

  // ---- about page: animated skill chips / floating shapes trigger ----
  document.querySelectorAll('.chip-pop').forEach((chip, i) => {
    const ioChip = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 70);
          ioChip.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    ioChip.observe(chip);
  });

  // ---- about page: horizontal 3-stop journey map ----
  const journeyMap = document.querySelector('[data-journey-map]');
  if (journeyMap) {
    const tracker = journeyMap.querySelector('[data-journey-tracker]');
    const skipButton = journeyMap.querySelector('[data-journey-skip]');
    const stops = [...journeyMap.querySelectorAll('[data-journey-stop]')];
    const stories = [...journeyMap.querySelectorAll('[data-journey-story]')];
    const routePoints = [[60, 165], [260, 65], [540, 175], [900, 70]];
    const reduceJourneyMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let journeyStarted = false;
    let journeySkipped = false;
    let journeyObserver;

    const placeTracker = ([x, y], angle = 0) => tracker?.setAttribute('transform', `translate(${x} ${y}) rotate(${angle})`);
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // The final timeline cards use a real cursor-follow tilt. Keeping it scoped
    // to the settled line-up prevents pointer transforms from fighting the
    // route/stack animations that lead into it.
    if (canHover && !reduceJourneyMotion) {
      stories.forEach((story) => {
        story.addEventListener('pointermove', rafThrottle((event) => {
          if (!story.classList.contains('is-final-card')) return;
          const rect = story.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - .5;
          const y = (event.clientY - rect.top) / rect.height - .5;
          story.style.setProperty('--journey-tilt-x', `${-y * 9}deg`);
          story.style.setProperty('--journey-tilt-y', `${x * 11}deg`);
          story.classList.add('is-tilting');
        }));
        story.addEventListener('pointerleave', () => {
          story.classList.remove('is-tilting');
          story.style.removeProperty('--journey-tilt-x');
          story.style.removeProperty('--journey-tilt-y');
        });
      });
    }

    function moveTracker(from, to, duration = 1250) {
      return new Promise(resolve => {
        const startedAt = performance.now();
        const direction = Math.atan2(to[1] - from[1], to[0] - from[0]) * 180 / Math.PI + 90;
        function frame(now) {
          if (journeySkipped) {
            resolve();
            return;
          }
          const progress = Math.min((now - startedAt) / duration, 1);
          const eased = progress < .5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          placeTracker([
            from[0] + (to[0] - from[0]) * eased,
            from[1] + (to[1] - from[1]) * eased
          ], direction);
          if (progress < 1) requestAnimationFrame(frame);
          else resolve();
        }
        requestAnimationFrame(frame);
      });
    }

    function showFullJourney(instant = false) {
      placeTracker(routePoints[routePoints.length - 1], 74);
      journeyMap.classList.remove('all-stacked');
      journeyMap.classList.add('has-history', 'is-final-lineup');
      if (instant) journeyMap.classList.add('journey-skipped');
      stories.forEach((story) => {
        story.classList.remove('is-active', 'is-stacked', 'is-tilting', 'detail-faded');
        story.classList.add('is-final-card');
        story.style.removeProperty('--journey-tilt-x');
        story.style.removeProperty('--journey-tilt-y');
        story.setAttribute('aria-hidden', 'false');
      });
      stops.forEach((stop) => {
        stop.classList.remove('is-active');
        stop.classList.add('is-complete');
      });
      if (skipButton) skipButton.hidden = true;
    }

    skipButton?.addEventListener('click', () => {
      journeySkipped = true;
      journeyStarted = true;
      journeyObserver?.disconnect();
      showFullJourney(true);
    });

    function showJourneyStep(index) {
      stories.forEach((story, storyIndex) => {
        const active = storyIndex === index;
        story.classList.toggle('is-active', active);
        story.classList.toggle('is-stacked', storyIndex < index);
        if (active) story.classList.remove('detail-faded');
        story.setAttribute('aria-hidden', storyIndex <= index ? 'false' : 'true');
      });
      journeyMap.classList.toggle('has-history', index > 0);
      stops.forEach((stop, stopIndex) => {
        stop.classList.toggle('is-active', stopIndex === index);
        if (stopIndex < index) stop.classList.add('is-complete');
      });
    }

    async function runJourney() {
      let current = routePoints[0];
      for (let index = 0; index < stories.length; index += 1) {
        const destination = routePoints[index + 1];
        await moveTracker(current, destination);
        if (journeySkipped) return;
        showJourneyStep(index);
        await wait(2300);
        if (journeySkipped) return;
        stories[index].classList.add('detail-faded');

        if (index < stories.length - 1) {
          // Let the description fully disappear, hold the clean card for one
          // second, and only then move it into the right-side history stack.
          await wait(1700); // 700ms fade/collapse + 1000ms intentional pause
          if (journeySkipped) return;
          stories[index].classList.remove('is-active');
          stories[index].classList.add('is-stacked');
          stories[index].setAttribute('aria-hidden', 'false');
          stops[index].classList.remove('is-active');
          stops[index].classList.add('is-complete');
        }
        current = destination;
      }

      // The final stop joins the history stack, then all three settle into a
      // reverse-chronological proof row: FlyRank, Stanford, DHA Suffa.
      await wait(420);
      if (journeySkipped) return;
      const finalStory = stories[stories.length - 1];
      finalStory.classList.remove('is-active');
      finalStory.classList.add('is-stacked');
      finalStory.setAttribute('aria-hidden', 'false');
      stops[stops.length - 1]?.classList.add('is-complete');
      journeyMap.classList.add('all-stacked', 'has-history');

      await wait(520);
      if (journeySkipped) return;
      journeyMap.classList.add('is-final-lineup');
      for (const story of [...stories].reverse()) {
        story.classList.remove('is-stacked', 'detail-faded');
        story.classList.add('is-final-card');
        await wait(180);
        if (journeySkipped) return;
      }
      journeyMap.classList.remove('all-stacked');
      if (skipButton) skipButton.hidden = true;
    }

    if (reduceJourneyMotion) {
      journeyMap.classList.add('show-all');
      journeySkipped = true;
      showFullJourney(true);
    } else {
      journeyObserver = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting) || journeyStarted) return;
        journeyStarted = true;
        journeyObserver.disconnect();
        runJourney();
      }, { threshold: .28 });
      journeyObserver.observe(journeyMap);
    }
  }

  // ---- interview scheduler (contact page) ----
  const schedSlots = document.querySelectorAll('.sched-slot');
  let chosenSlot = '';
  schedSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      schedSlots.forEach(s => {
        s.classList.remove('selected');
        s.setAttribute('aria-pressed', 'false');
      });
      slot.classList.add('selected');
      slot.setAttribute('aria-pressed', 'true');
      chosenSlot = slot.dataset.slot;
      chosenHour = '';
      chosenMinute = '00';
      chosenAmPm = 'AM';
      document.querySelectorAll('.chip-mini.selected').forEach((chip) => {
        chip.classList.remove('selected');
        chip.setAttribute('aria-pressed', 'false');
      });
    });
  });

  // ---- custom time chips (hour / minute / am-pm) ----
  let chosenHour = '', chosenMinute = '00', chosenAmPm = 'AM';
  document.querySelectorAll('#hourChips .chip-mini').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('#hourChips .chip-mini').forEach(x => {
        x.classList.remove('selected');
        x.setAttribute('aria-pressed', 'false');
      });
      c.classList.add('selected');
      c.setAttribute('aria-pressed', 'true');
      chosenHour = c.dataset.hour;
      chosenSlot = '';
      schedSlots.forEach((slot) => {
        slot.classList.remove('selected');
        slot.setAttribute('aria-pressed', 'false');
      });
    });
  });
  document.querySelectorAll('#minuteChips .chip-mini').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('#minuteChips .chip-mini').forEach(x => {
        x.classList.remove('selected');
        x.setAttribute('aria-pressed', 'false');
      });
      c.classList.add('selected');
      c.setAttribute('aria-pressed', 'true');
      chosenMinute = c.dataset.min;
    });
  });
  document.querySelectorAll('#ampmChips .chip-mini').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('#ampmChips .chip-mini').forEach(x => {
        x.classList.remove('selected');
        x.setAttribute('aria-pressed', 'false');
      });
      c.classList.add('selected');
      c.setAttribute('aria-pressed', 'true');
      chosenAmPm = c.dataset.ampm;
    });
  });

  // ---- "send for approval" restrained envelope-to-inbox animation ----
  function playApprovalAnimation(btn) {
    const road = document.getElementById('approvalRoad');
    const runner = document.getElementById('approvalRunner');
    const inbox = document.getElementById('approvalInbox');
    const status = document.getElementById('approvalStatus');
    const btnText = btn.querySelector('.btn-text');
    const originalText = btnText ? btnText.textContent : 'Send for approval';
    if (!road || !runner || !inbox) return null;

    const timers = [];
    const startedAt = performance.now();
    const travelDuration = 2800;
    const later = (fn, delay) => timers.push(setTimeout(fn, delay));
    const clearTimers = () => timers.splice(0).forEach(clearTimeout);

    road.classList.remove('arrived');
    road.classList.add('show');
    road.setAttribute('aria-hidden', 'false');
    runner.classList.remove('ride');
    // Force a clean restart even when the form is submitted twice quickly.
    void runner.offsetWidth;
    runner.classList.add('ride');
    btn.classList.remove('delivered', 'send-error');
    btn.classList.add('sending');
    if (btnText) btnText.textContent = 'Sending approval…';
    if (status) status.textContent = 'Sending securely';

    return {
      complete() {
        // The success state begins only after the runner has reached the inbox,
        // so a fast network response can never cut the travel animation short.
        const delay = Math.max(travelDuration - (performance.now() - startedAt), 0);
        later(() => {
          road.classList.add('arrived');
          btn.classList.remove('sending');
          btn.classList.add('delivered');
          if (btnText) btnText.textContent = 'Approval sent';
          if (status) status.textContent = 'Approval delivered to Yumna’s inbox';
        }, delay);
        later(() => {
          road.classList.remove('show');
          road.setAttribute('aria-hidden', 'true');
        }, delay + 1600);
        later(() => {
          clearTimers();
          road.classList.remove('arrived');
          runner.classList.remove('ride');
          btn.classList.remove('delivered');
          if (btnText) btnText.textContent = originalText;
          btn.disabled = false;
        }, delay + 3000);
      },
      fail() {
        clearTimers();
        road.classList.remove('show', 'arrived');
        road.setAttribute('aria-hidden', 'true');
        runner.classList.remove('ride');
        btn.classList.remove('sending', 'delivered');
        btn.classList.add('send-error');
        if (btnText) btnText.textContent = 'Couldn’t send — try again';
        later(() => {
          btn.classList.remove('send-error');
          if (btnText) btnText.textContent = originalText;
          btn.disabled = false;
        }, 3500);
      }
    };
  }

  // ---- real backend call: Formspree (free tier) actually receives this data ----
  // 1. Go to formspree.io -> sign up free -> "New Form" -> copy the endpoint
  //    it gives you (looks like https://formspree.io/f/xxxxxxxx).
  // 2. Paste it below, replacing YOUR_FORM_ID.
  // 3. Formspree forwards every real submission straight to your inbox as an email —
  //    that's the "backend" doing actual work, not just opening a mail app.
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mrpzjowl';

  const schedForm = document.getElementById('schedForm');
  if (schedForm) {
    const schedDateInput = document.getElementById('schedDate');
    if (schedDateInput) {
      const localToday = new Date();
      localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
      schedDateInput.min = localToday.toISOString().slice(0, 10);
    }

    schedForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = document.getElementById('schedSubmit');
      // stop rapid double-clicks from firing two submissions/two animations at once
      if (btn.disabled) return;
      btn.disabled = true;

      const name = document.getElementById('schedName').value.trim();
      const email = document.getElementById('schedEmail').value.trim();
      const date = document.getElementById('schedDate').value;
      const time = chosenHour ? `${chosenHour}:${chosenMinute} ${chosenAmPm}` : '';
      const note = document.getElementById('schedNote').value.trim();

      const errNote = document.getElementById('schedError');
      if (errNote) errNote.style.display = 'none';

      if (!chosenHour && !chosenSlot) {
        if (errNote) {
          errNote.style.display = 'block';
          errNote.textContent = 'Please choose a preferred time or a quick time window.';
        }
        btn.disabled = false;
        return;
      }

      const payload = {
        name,
        email,
        date,
        time,
        preferred_window: chosenSlot || '',
        note,
        _subject: 'Interview call request — ' + (date || 'flexible date')
      };

      // envelope + road animation plays immediately for feedback,
      // the real network request runs underneath it
      const approvalAnimation = playApprovalAnimation(btn);

      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Form submission failed: ' + res.status);
        approvalAnimation?.complete();
        schedForm.reset();
        document.querySelectorAll('.chip-mini.selected, .sched-slot.selected')
          .forEach(el => {
            el.classList.remove('selected');
            el.setAttribute('aria-pressed', 'false');
          });
        chosenHour = '';
        chosenMinute = '00';
        chosenAmPm = 'AM';
        chosenSlot = '';

      } catch (err) {
        console.error(err);
        approvalAnimation?.fail();
        if (errNote) {
          errNote.style.display = 'block';
          errNote.textContent = "Couldn't reach the server — email me directly instead: yumna6431@gmail.com";
        }
      }
    });
  }
});

// ---- rotating notebook evidence coverflow (work page) ----
document.addEventListener('DOMContentLoaded', () => {
  const carousels = [...document.querySelectorAll('[data-notebook-carousel]')];
  if (!carousels.length) return;

  carousels.forEach((carousel) => {

  const slides = [...carousel.querySelectorAll('[data-notebook-slide]')];
  const dotsWrap = carousel.querySelector('.notebook-dots');
  const prev = carousel.querySelector('[data-notebook-prev]');
  const next = carousel.querySelector('[data-notebook-next]');
  let active = 0;

  const dots = slides.map((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'notebook-dot';
    dot.setAttribute('aria-label', `Show notebook screenshot ${index + 1}`);
    dot.addEventListener('click', () => { active = index; render(); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function signedDistance(index) {
    let distance = index - active;
    const half = slides.length / 2;
    if (distance > half) distance -= slides.length;
    if (distance < -half) distance += slides.length;
    return distance;
  }

  function render() {
    slides.forEach((slide, index) => {
      const distance = signedDistance(index);
      const depth = Math.abs(distance);
      const direction = Math.sign(distance);
      const shift = depth === 0 ? 0 : direction * (42 + (depth - 1) * 27);
      const rotate = direction * Math.min(13, 5 + depth * 2.5);
      const scale = Math.max(.68, 1 - depth * .105);

      slide.style.transform = `translate(-50%,-50%) translateX(${shift}%) rotate(${rotate}deg) scale(${scale})`;
      slide.style.zIndex = String(20 - depth);
      slide.style.opacity = depth > 3 ? '0' : String(Math.max(.28, 1 - depth * .2));
      slide.style.pointerEvents = depth > 3 ? 'none' : 'auto';
      slide.classList.toggle('is-active', distance === 0);
      slide.classList.toggle('is-nearby', depth <= 1);
      slide.setAttribute('aria-hidden', distance === 0 ? 'false' : 'true');
      dots[index].classList.toggle('is-active', index === active);
    });
  }

  function move(step) {
    active = (active + step + slides.length) % slides.length;
    render();
  }

  prev?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));
  slides.forEach((slide, index) => slide.addEventListener('click', () => {
    if (index !== active) { active = index; render(); }
  }));
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
  });

  render();
  });
});

// Pause expensive ambient loops while their section (or the whole tab) is not
// visible. They resume from the same frame when the visitor comes back.
document.addEventListener('DOMContentLoaded', () => {
  const regions = document.querySelectorAll(
    '.big-hero, .hero-scene, .globe-scene, .case-card, .capstone-card, .journey-map'
  );
  if ('IntersectionObserver' in window) {
    const motionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('motion-paused', !entry.isIntersecting);
      });
    }, { rootMargin: '140px 0px', threshold: 0 });
    regions.forEach((region) => motionObserver.observe(region));
  }
  const syncPageVisibility = () => {
    document.documentElement.classList.toggle('page-hidden', document.hidden);
  };
  document.addEventListener('visibilitychange', syncPageVisibility);
  syncPageVisibility();
});

// ---- fix: page appears blank after using the browser Back button ----
// Some browsers restore a page from cache (bfcache) instead of re-running this
// script. Since .reveal/.reveal-3d elements start hidden (opacity:0) until the
// IntersectionObserver above marks them .in, a bfcache-restored page can get
// stuck showing nothing until the user scrolls. This forces everything visible
// immediately whenever the page is restored from cache.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    document.querySelectorAll('.reveal, .reveal-3d').forEach(el => el.classList.add('in'));
  }
});
