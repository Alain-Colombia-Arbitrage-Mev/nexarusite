/**
 * NGS Landing — Main Controller
 * Manages: Loader → Section sequencing → Video playback → Scroll navigation → Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  const sections = Array.from(document.querySelectorAll('.section'));
  const nav = document.getElementById('main-nav');
  const loader = document.getElementById('loader');
  const loaderVideo = document.getElementById('loader-video');

  let currentIndex = 0;
  let isTransitioning = false;
  let isLoaded = false;

  // ========================================
  // 1. Loader
  // ========================================
  function initLoader() {
    if (!loaderVideo) {
      finishLoader();
      return;
    }

    loaderVideo.play().catch(() => {
      // Autoplay blocked — skip loader
      finishLoader();
    });

    loaderVideo.addEventListener('ended', finishLoader, { once: true });

    // Safety timeout: if video takes too long
    setTimeout(() => {
      if (!isLoaded) finishLoader();
    }, 15000);
  }

  function finishLoader() {
    if (isLoaded) return;
    isLoaded = true;

    loader?.classList.add('is-hidden');
    setTimeout(() => {
      loader?.remove();
    }, 800);

    // Show first section
    activateSection(0);
    nav?.classList.add('is-visible');

    // Preload next video
    preloadAdjacentVideos(0);
  }

  // ========================================
  // 2. Section Management
  // ========================================
  function activateSection(index) {
    if (index < 0 || index >= sections.length) return;

    const prevSection = sections[currentIndex];
    const nextSection = sections[index];

    // Deactivate previous
    if (prevSection && prevSection !== nextSection) {
      prevSection.classList.remove('is-active');
      const prevVideo = prevSection.querySelector('video');
      if (prevVideo) {
        prevVideo.pause();
      }
      // Reset animations
      resetAnimations(prevSection);
    }

    // Activate next
    currentIndex = index;
    nextSection.classList.add('is-active');

    // Play video
    const video = nextSection.querySelector('video');
    if (video) {
      const videoSrc = nextSection.dataset.video;
      if (videoSrc && video.src !== location.origin + videoSrc && !video.src.endsWith(videoSrc)) {
        video.src = videoSrc;
        video.load();
      }
      video.currentTime = 0;
      video.loop = false;
      video.play().catch(() => {});

      if (nextSection.dataset.transition === 'true') {
        // Transition videos: auto-advance to next section when done
        video.addEventListener('ended', () => {
          goToSection(currentIndex + 1);
        }, { once: true });
      }
      // Content sections: video plays once and freezes on last frame
      // User reads content at their pace, scrolls when ready
    }

    // Run entry animations
    requestAnimationFrame(() => {
      runAnimations(nextSection);
    });

    // Update nav
    updateNav(nextSection.dataset.section);

    // Preload adjacent
    preloadAdjacentVideos(index);
  }

  function goToSection(index) {
    if (isTransitioning || index === currentIndex || index < 0 || index >= sections.length) return;
    isTransitioning = true;

    const currentSection = sections[currentIndex];
    const nextSection = sections[index];

    // Fade out current
    currentSection.style.transition = 'opacity 0.6s ease';
    currentSection.style.opacity = '0';

    setTimeout(() => {
      currentSection.classList.remove('is-active');
      currentSection.style.transition = '';
      currentSection.style.opacity = '';

      const prevVideo = currentSection.querySelector('video');
      if (prevVideo) prevVideo.pause();

      // Fade in next
      nextSection.style.opacity = '0';
      activateSection(index);
      nextSection.style.transition = 'opacity 0.6s ease';

      requestAnimationFrame(() => {
        nextSection.style.opacity = '1';
      });

      setTimeout(() => {
        nextSection.style.transition = '';
        isTransitioning = false;
      }, 600);
    }, 500);
  }

  // ========================================
  // 2b. Animated Section Navigation (hero icons)
  // ========================================
  const transitionEffects = [
    // Each hero icon triggers a different transition style
    { out: 'translateX(-100%)', in: 'translateX(100%)' },       // strategic: slide left
    { out: 'scale(1.3)', in: 'scale(0.7)' },                   // advantages: zoom
    { out: 'translateY(-100%)', in: 'translateY(100%)' },       // provides: slide up
    { out: 'translateX(100%)', in: 'translateX(-100%)' },       // services: slide right
    { out: 'scale(0.5) rotate(10deg)', in: 'scale(1.5)' },     // clients: shrink-spin
    { out: 'translateY(100%)', in: 'translateY(-100%)' },       // cta: slide down
  ];

  function goToSectionAnimated(index, effectIndex) {
    if (isTransitioning || index === currentIndex || index < 0 || index >= sections.length) return;
    isTransitioning = true;

    const currentSection = sections[currentIndex];
    const nextSection = sections[index];
    const effect = transitionEffects[effectIndex] || transitionEffects[0];

    // Animate out current section
    currentSection.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    currentSection.style.opacity = '0';
    currentSection.style.transform = effect.out;

    setTimeout(() => {
      currentSection.classList.remove('is-active');
      currentSection.style.transition = '';
      currentSection.style.opacity = '';
      currentSection.style.transform = '';

      const prevVideo = currentSection.querySelector('video');
      if (prevVideo) prevVideo.pause();

      // Prepare next section entry
      nextSection.style.opacity = '0';
      nextSection.style.transform = effect.in;
      activateSection(index);
      nextSection.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

      requestAnimationFrame(() => {
        nextSection.style.opacity = '1';
        nextSection.style.transform = 'translate(0,0) scale(1) rotate(0deg)';
      });

      setTimeout(() => {
        nextSection.style.transition = '';
        nextSection.style.transform = '';
        isTransitioning = false;
      }, 650);
    }, 450);
  }

  // ========================================
  // 3. Video Preloading
  // ========================================
  function preloadAdjacentVideos(index) {
    const toPreload = [index - 1, index + 1, index + 2].filter(
      i => i >= 0 && i < sections.length
    );

    toPreload.forEach(i => {
      const section = sections[i];
      const video = section.querySelector('video');
      const videoSrc = section.dataset.video;
      if (video && videoSrc && !video.src.endsWith(videoSrc)) {
        video.preload = 'auto';
        video.src = videoSrc;
        video.load();
      }
    });
  }

  // ========================================
  // 4. Entry Animations
  // ========================================
  function runAnimations(section) {
    const animElements = section.querySelectorAll(
      '.anim-fade-up, .anim-fade-left, .anim-fade-right, .anim-scale-in'
    );

    animElements.forEach((el, i) => {
      const delay = parseFloat(el.style.getPropertyValue('--delay') || '0') + i * 0.06;
      el.style.transition = `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`;
      el.style.opacity = '1';
      el.style.transform = 'translate(0, 0) scale(1)';
    });
  }

  function resetAnimations(section) {
    const animElements = section.querySelectorAll(
      '.anim-fade-up, .anim-fade-left, .anim-fade-right, .anim-scale-in'
    );

    animElements.forEach(el => {
      el.style.transition = 'none';
      if (el.classList.contains('anim-fade-up')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
      } else if (el.classList.contains('anim-fade-left')) {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-60px)';
      } else if (el.classList.contains('anim-fade-right')) {
        el.style.opacity = '0';
        el.style.transform = 'translateX(60px)';
      } else if (el.classList.contains('anim-scale-in')) {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.9)';
      }
    });
  }

  // ========================================
  // 5. Scroll / Keyboard Navigation
  // ========================================
  let scrollAccumulator = 0;
  const SCROLL_THRESHOLD = 80;

  function handleWheel(e) {
    e.preventDefault();
    if (isTransitioning) return;

    scrollAccumulator += e.deltaY;

    if (Math.abs(scrollAccumulator) >= SCROLL_THRESHOLD) {
      if (scrollAccumulator > 0) {
        goToSection(currentIndex + 1);
      } else {
        goToSection(currentIndex - 1);
      }
      scrollAccumulator = 0;
    }

    // Reset accumulator after idle
    clearTimeout(handleWheel._timeout);
    handleWheel._timeout = setTimeout(() => {
      scrollAccumulator = 0;
    }, 200);
  }

  window.addEventListener('wheel', handleWheel, { passive: false });

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if (isTransitioning) return;
    if (e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      goToSection(currentIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      goToSection(currentIndex - 1);
    }
  });

  // Touch support
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (isTransitioning) return;
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      goToSection(currentIndex + (diff > 0 ? 1 : -1));
    }
  }, { passive: true });

  // ========================================
  // 6. Nav Click Navigation
  // ========================================
  function updateNav(sectionId) {
    document.querySelectorAll('.nav__link').forEach(link => {
      link.classList.toggle('is-active', link.dataset.target === sectionId);
    });
  }

  // Nav links — standard fade transition
  document.querySelectorAll('.nav__link, .section-icon').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const targetIndex = sections.findIndex(s => s.dataset.section === targetId);
      if (targetIndex !== -1) {
        goToSection(targetIndex);
      }
    });
  });

  // Hero icons — each has a unique animated transition
  document.querySelectorAll('.hero__icon').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const targetIndex = sections.findIndex(s => s.dataset.section === targetId);
      if (targetIndex !== -1) {
        goToSectionAnimated(targetIndex, i);
      }
    });
  });

  // ========================================
  // 7. Mouse Parallax (subtle depth effect)
  // ========================================
  let mouseX = 0.5;
  let mouseY = 0.5;
  let rafId = null;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;

    if (!rafId) {
      rafId = requestAnimationFrame(updateParallax);
    }
  });

  function updateParallax() {
    rafId = null;
    const activeSection = sections[currentIndex];
    if (!activeSection) return;

    // Layer 0: Video background — moves opposite to mouse (depth)
    const video = activeSection.querySelector('video');
    if (video) {
      const moveX = (mouseX - 0.5) * -12;
      const moveY = (mouseY - 0.5) * -8;
      video.style.transform = `scale(1.08) translate(${moveX}px, ${moveY}px)`;
    }

    // Layer 1: Left text block — subtle follow
    const heroLeft = activeSection.querySelector('.hero__left');
    if (heroLeft) {
      const moveX = (mouseX - 0.5) * 6;
      const moveY = (mouseY - 0.5) * 4;
      heroLeft.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    // Layer 2: Right icons — slight opposite movement
    const heroRight = activeSection.querySelector('.hero__right');
    if (heroRight) {
      const moveX = (mouseX - 0.5) * -4;
      const moveY = (mouseY - 0.5) * -3;
      heroRight.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    // Layer 3: CTA button — subtle float (centered via flexbox, no translateX)
    const heroCta = activeSection.querySelector('.hero__cta');
    if (heroCta) {
      const moveX = (mouseX - 0.5) * 3;
      const moveY = (mouseY - 0.5) * 2;
      heroCta.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    // Generic section content (other sections)
    const content = activeSection.querySelector('.section__content');
    if (content) {
      const moveX = (mouseX - 0.5) * 3;
      const moveY = (mouseY - 0.5) * 2;
      content.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
  }

  // ========================================
  // Init
  // ========================================
  initLoader();
});
