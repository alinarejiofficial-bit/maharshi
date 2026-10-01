// Count-up animation for years badge
document.addEventListener('DOMContentLoaded', function () {
  const badgeNum = document.querySelector('.badge-num');
  if (!badgeNum) return;

  const target = parseInt(badgeNum.dataset.target, 10);
  let started = false;

  function runCountUp() {
    if (started) return;
    started = true;

    let current = 1;
    badgeNum.textContent = '1+';
    const stepMs = Math.max(40, Math.floor(2000 / target));

    const timer = setInterval(() => {
      current++;
      badgeNum.textContent = current + '+';
      if (current >= target) clearInterval(timer);
    }, stepMs);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        runCountUp();
        observer.disconnect();
      }
    },
    { threshold: 0.5 }
  );

  observer.observe(badgeNum.closest('.about-badge'));
});

// Accordion toggle (used by inline onclick handlers)
function toggleAccordion(item) {
  const accordion = item.closest('.about-accordion');
  accordion.querySelectorAll('.accordion-item.open').forEach((openItem) => {
    if (openItem !== item) openItem.classList.remove('open');
  });
  item.classList.toggle('open');
}

// Scroll to top button
document.addEventListener('DOMContentLoaded', function () {
  const scrollTopBtn = document.querySelector('.scroll-top');
  if (!scrollTopBtn) return;

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// Ventures section auto-scroll: both rows right-to-left
document.addEventListener('DOMContentLoaded', function () {
  const venturesGrid = document.querySelector('.ventures-grid');
  if (!venturesGrid) return;

  const items = Array.from(venturesGrid.querySelectorAll('.venture-item'));
  if (items.length < 4) return;

  const explicitBreakIndex = items.findIndex((item) => item.classList.contains('venture-row-break'));
  const splitIndex = explicitBreakIndex > 0 ? explicitBreakIndex : Math.ceil(items.length / 2);
  const isMobile = window.innerWidth <= 768;
  const rowGroups = isMobile
    ? [items]
    : [items.slice(0, splitIndex), items.slice(splitIndex)].filter((group) => group.length > 0);
  if (!isMobile && rowGroups.length < 2) return;

  venturesGrid.classList.add('ventures-grid-scroll');
  venturesGrid.innerHTML = '';

  const rowStates = rowGroups.map((group) => {
    const row = document.createElement('div');
    row.className = 'ventures-row';

    const track = document.createElement('div');
    track.className = 'ventures-track';

    // Add original set, then duplicate set for seamless repeating visuals
    group.forEach((item) => {
      track.appendChild(item);
    });
    group.forEach((item) => {
      track.appendChild(item.cloneNode(true));
    });

    row.appendChild(track);
    venturesGrid.appendChild(row);

    return { row, track, animating: false, baseCount: group.length, offset: 0 };
  });

  function getStepWidth(state) {
    const first = state.track.querySelector('.venture-item');
    if (!first) return 0;
    const gap = parseFloat(getComputedStyle(state.track).gap) || 14;
    return first.getBoundingClientRect().width + gap;
  }

  function setOffset(state, offset, transition) {
    state.offset = offset;
    state.track.style.transition = transition || 'none';
    state.track.style.transform = `translate3d(-${offset}px, 0, 0)`;
  }

  function scrollOneItem(state, direction = 1, duration = 1.5) {
    if (state.animating) {
      return false;
    }

    const stepWidth = getStepWidth(state);
    if (!stepWidth) {
      return false;
    }

    const loopWidth = stepWidth * state.baseCount;
    if (direction < 0 && state.offset < stepWidth) {
      setOffset(state, state.offset + loopWidth);
      void state.track.offsetWidth;
    }

    state.animating = true;
    setOffset(state, state.offset + stepWidth * direction, `transform ${duration}s ease`);

    state.track.addEventListener('transitionend', function handler() {
      if (state.offset >= loopWidth) {
        setOffset(state, state.offset - loopWidth);
      }

      requestAnimationFrame(function () {
        state.animating = false;
      });
    }, { once: true });

    return true;
  }

  let venturesTimer = null;
  // Alternate continuously: row 1 -> row 2 -> row 1 ...
  let activeRowIndex = 0;

  function runStep() {
    const moved = scrollOneItem(rowStates[activeRowIndex]);
    if (moved) {
      activeRowIndex = (activeRowIndex + 1) % rowStates.length;
    }
  }

  function startVenturesAutoScroll(stepNow = true) {
    stopVenturesAutoScroll();
    if (stepNow) runStep();
    venturesTimer = setInterval(runStep, isMobile ? 3000 : 1700);
  }

  function stopVenturesAutoScroll() {
    if (venturesTimer) {
      clearInterval(venturesTimer);
      venturesTimer = null;
    }
  }

  venturesGrid.addEventListener('mouseenter', stopVenturesAutoScroll);
  venturesGrid.addEventListener('mouseleave', () => startVenturesAutoScroll());

  const swipeState = rowStates[0];
  let touchStartX = 0;
  let touchStartY = 0;
  let dragX = 0;
  let isDragging = false;
  let didSwipe = false;

  venturesGrid.addEventListener('touchstart', function (event) {
    stopVenturesAutoScroll();
    if (!isMobile || swipeState.animating) return;

    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    dragX = 0;
    isDragging = false;
    didSwipe = false;

    const stepWidth = getStepWidth(swipeState);
    if (swipeState.offset < stepWidth) {
      setOffset(swipeState, swipeState.offset + stepWidth * swipeState.baseCount);
    }
  }, { passive: true });

  venturesGrid.addEventListener('touchmove', function (event) {
    if (!isMobile || swipeState.animating) return;

    const touch = event.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (!isDragging) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      isDragging = true;
    }

    dragX = dx;
    swipeState.track.style.transition = 'none';
    swipeState.track.style.transform = `translate3d(${-swipeState.offset + dragX}px, 0, 0)`;
  }, { passive: true });

  venturesGrid.addEventListener('touchend', function () {
    if (isMobile && isDragging) {
      didSwipe = true;
      const threshold = Math.min(60, getStepWidth(swipeState) * 0.2);
      if (Math.abs(dragX) > threshold) {
        scrollOneItem(swipeState, dragX < 0 ? 1 : -1, 0.45);
      } else {
        setOffset(swipeState, swipeState.offset, 'transform 0.3s ease');
      }
      isDragging = false;
    }
    startVenturesAutoScroll(false);
  }, { passive: true });

  venturesGrid.addEventListener('click', function (event) {
    if (didSwipe) {
      event.stopPropagation();
      event.preventDefault();
      didSwipe = false;
    }
  }, true);

  startVenturesAutoScroll();
});

// Ventures image lightbox
document.addEventListener('DOMContentLoaded', function () {
  const venturesSection = document.querySelector('.ventures-section');
  const lightbox = document.getElementById('venturesLightbox');
  const lightboxImage = document.getElementById('venturesLightboxImage');
  const lightboxCount = document.getElementById('venturesLightboxCount');
  const closeBtn = document.getElementById('venturesLightboxClose');
  const prevBtn = document.getElementById('venturesLightboxPrev');
  const nextBtn = document.getElementById('venturesLightboxNext');

  if (!venturesSection || !lightbox || !lightboxImage || !lightboxCount || !closeBtn || !prevBtn || !nextBtn) {
    return;
  }

  let galleryImages = [];
  let currentIndex = 0;

  function collectGalleryImages() {
    const seen = new Set();
    galleryImages = [];

    venturesSection.querySelectorAll('.ventures-grid .venture-item img').forEach((img) => {
      const src = img.getAttribute('src');
      if (!src || seen.has(src)) return;
      seen.add(src);
      galleryImages.push({
        src: src,
        alt: img.getAttribute('alt') || 'Venture image',
      });
    });
  }

  function renderImage() {
    if (!galleryImages.length) return;
    const image = galleryImages[currentIndex];
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCount.textContent = String(currentIndex + 1);
  }

  function openLightbox(index) {
    if (!galleryImages.length) return;
    currentIndex = (index + galleryImages.length) % galleryImages.length;
    renderImage();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function goNext() {
    if (!galleryImages.length) return;
    currentIndex = (currentIndex + 1) % galleryImages.length;
    renderImage();
  }

  function goPrev() {
    if (!galleryImages.length) return;
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    renderImage();
  }

  venturesSection.addEventListener('click', function (event) {
    const clickedImage = event.target.closest('.venture-item img');
    if (!clickedImage) return;

    collectGalleryImages();
    if (!galleryImages.length) return;

    const clickedSrc = clickedImage.getAttribute('src');
    const foundIndex = galleryImages.findIndex((image) => image.src === clickedSrc);
    openLightbox(foundIndex >= 0 ? foundIndex : 0);
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);

  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (!lightbox.classList.contains('is-open')) return;

    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowRight') goNext();
    if (event.key === 'ArrowLeft') goPrev();
  });
});

// Scroll-based section reveal animations (toggle on enter/leave)
document.addEventListener('DOMContentLoaded', function () {
  function setupScrollReveal(selector, visibleClass, threshold) {
    const section = document.querySelector(selector);
    if (!section) return;

    if (window.matchMedia('(max-width: 768px)').matches) {
      section.classList.add(visibleClass);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          section.classList.toggle(visibleClass, entry.isIntersecting);
        });
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observer.observe(section);
  }

  setupScrollReveal('.about-section', 'about-visible', 0.2);
  setupScrollReveal('.values-section', 'values-visible', 0.14);
  setupScrollReveal('.companies-section', 'companies-visible', 0.16);
  setupScrollReveal('.projects-section', 'projects-visible', 0.16);
  setupScrollReveal('.ventures-section', 'ventures-visible', 0.12);
});

// Values section carousel — infinite loop through all cards in order
document.addEventListener('DOMContentLoaded', function () {
  const track = document.getElementById('valuesTrack');
  const viewport = track && track.parentElement;
  const prevBtn = document.getElementById('valuesPrev');
  const nextBtn = document.getElementById('valuesNext');
  if (!track || !viewport || !prevBtn || !nextBtn) return;

  const gapDesktop = 24;
  const gapMobile = 20;
  let cardTemplates = [];
  let index = 0;
  let cardStep = 0;
  let isAnimating = false;

  function getVisibleCount() {
    return window.innerWidth <= 900 ? 1 : 3;
  }

  function getGap() {
    return window.innerWidth <= 900 ? gapMobile : gapDesktop;
  }

  function collectTemplates() {
    if (cardTemplates.length) return;

    const cards = [];
    track.querySelectorAll('.values-slide .value-card').forEach((card) => cards.push(card));
    if (!cards.length) {
      track.querySelectorAll('.value-card').forEach((card) => cards.push(card));
    }

    cardTemplates = cards.map((card) => card.cloneNode(true));
  }

  function buildTrack() {
    collectTemplates();
    const visible = getVisibleCount();
    const total = cardTemplates.length;
    if (!total) return;

    track.innerHTML = '';

    cardTemplates.slice(-visible).forEach((template) => {
      const clone = template.cloneNode(true);
      clone.dataset.clone = '1';
      clone.classList.remove('value-card-featured');
      track.appendChild(clone);
    });

    cardTemplates.forEach((template) => {
      track.appendChild(template.cloneNode(true));
    });

    cardTemplates.slice(0, visible).forEach((template) => {
      const clone = template.cloneNode(true);
      clone.dataset.clone = '1';
      clone.classList.remove('value-card-featured');
      track.appendChild(clone);
    });

    index = visible;
    measure();
    update(false);
  }

  function measure() {
    const visible = getVisibleCount();
    const gap = getGap();
    const viewportWidth = viewport.clientWidth;
    const cardWidth = (viewportWidth - (visible - 1) * gap) / visible;
    viewport.style.setProperty('--values-card-width', cardWidth + 'px');
    cardStep = cardWidth + gap;
  }

  function update(animate) {
    track.style.transition = animate ? 'transform 0.2s ease' : 'none';
    track.style.transform = 'translateX(-' + (index * cardStep) + 'px)';
  }

  function onTransitionEnd() {
    isAnimating = false;
    const visible = getVisibleCount();
    const total = cardTemplates.length;

    if (index >= visible + total) {
      index = visible;
      update(false);
    }
  }

  function setNavActive(direction) {
    prevBtn.classList.toggle('is-active', direction === 'prev');
    nextBtn.classList.toggle('is-active', direction === 'next');
  }

  function goNext() {
    if (isAnimating || !cardStep) return;

    setNavActive('next');
    isAnimating = true;
    index++;
    update(true);
    track.addEventListener('transitionend', function handler() {
      track.removeEventListener('transitionend', handler);
      onTransitionEnd();
    }, { once: true });
  }

  function goPrev() {
    if (isAnimating || !cardStep) return;

    setNavActive('prev');

    const visible = getVisibleCount();
    const total = cardTemplates.length;

    if (index === visible) {
      index = visible + total;
      update(false);
    }

    isAnimating = true;
    index--;
    update(true);
    track.addEventListener('transitionend', function handler() {
      track.removeEventListener('transitionend', handler);
      isAnimating = false;
    }, { once: true });
  }

  const autoScrollDelay = 4000;
  let autoScrollTimer = null;

  function startAutoScroll() {
    stopAutoScroll();
    autoScrollTimer = setInterval(goNext, autoScrollDelay);
  }

  function stopAutoScroll() {
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
  }

  function resetAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
  }

  prevBtn.addEventListener('click', function () {
    goPrev();
    resetAutoScroll();
  });

  nextBtn.addEventListener('click', function () {
    goNext();
    resetAutoScroll();
  });

  const cardsWrap = document.querySelector('.values-cards-wrap');
  if (cardsWrap) {
    cardsWrap.addEventListener('mouseenter', stopAutoScroll);
    cardsWrap.addEventListener('mouseleave', startAutoScroll);
  }

  buildTrack();
  setNavActive('next');

  requestAnimationFrame(function () {
    measure();
    update(false);
    startAutoScroll();
  });

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      stopAutoScroll();
      buildTrack();
      requestAnimationFrame(function () {
        measure();
        update(false);
        startAutoScroll();
      });
    }, 150);
  });
});

// Mobile navigation menu
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.navbar').forEach(function (navbar) {
    if (navbar.querySelector('.nav-toggle')) return;

    var navLinks = navbar.querySelector('.nav-links');
    var navRight = navbar.querySelector('.nav-right');
    if (!navLinks) return;

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML =
      '<span class="nav-toggle-bar"></span>' +
      '<span class="nav-toggle-bar"></span>' +
      '<span class="nav-toggle-bar"></span>';

    navbar.insertBefore(toggle, navLinks);

    if (navRight && !navLinks.querySelector('.nav-mobile-extra')) {
      var ctaBtn = navRight.querySelector('.btn-primary');
      var phoneNumEl = navRight.querySelector('.contact-text .number');
      var phoneNum = phoneNumEl ? phoneNumEl.textContent.trim() : '';
      var extra = document.createElement('li');
      extra.className = 'nav-mobile-extra';

      if (phoneNum) {
        var phoneLink = document.createElement('a');
        phoneLink.className = 'nav-mobile-phone';
        phoneLink.href = 'tel:' + phoneNum.replace(/\s+/g, '');
        phoneLink.innerHTML =
          '<i class="fa-solid fa-phone" aria-hidden="true"></i><span>' +
          phoneNum +
          '</span>';
        extra.appendChild(phoneLink);
      }

      if (ctaBtn) {
        var ctaWrap = document.createElement('div');
        ctaWrap.className = 'nav-mobile-cta-wrap';
        ctaWrap.appendChild(ctaBtn.cloneNode(true));
        extra.appendChild(ctaWrap);
      }

      if (extra.childNodes.length) {
        navLinks.appendChild(extra);
      }
    }

    function closeMenu() {
      navbar.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }

    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      var isOpen = navbar.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('nav-open', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (event) {
      if (!navbar.contains(event.target)) closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024) closeMenu();
    });
  });
});
