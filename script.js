(() => {
  'use strict';

  // As fotos ficam aqui para que a mesma galeria funcione nas páginas inicial e de produto.
  const gallerySlides = {
    hoodie: [
      { src: 'assets/moletom-frente.jpg', alt: 'Moletom Zetsuy2k preto visto de frente, com estampa verde', product: true },
      { src: 'assets/moletom-costas.jpg', alt: 'Moletom Zetsuy2k preto visto de costas, com estampa verde de asas', product: true },
      { src: 'assets/look-costas-01.jpg', alt: 'Modelo usando o moletom Zetsuy2k de costas' },
      { src: 'assets/look-costas-02.jpg', alt: 'Detalhe da estampa traseira do moletom em um look urbano' },
      { src: 'assets/look-frente.jpg', alt: 'Modelo usando o moletom Zetsuy2k de frente' },
      { src: 'assets/look-sentado.jpg', alt: 'Look Zetsuy2k fotografado sentado' },
      { src: 'assets/look-costas-03.jpg', alt: 'Close da estampa verde nas costas do moletom' },
      { src: 'assets/look-costas-04.jpg', alt: 'Moletom Zetsuy2k fotografado de costas em ambiente escuro' }
    ],
    tee: [
      { src: 'assets/camiseta-resident-frente.jpg', alt: 'Camiseta preta Zetsuy2k com estampa de Resident Evil, vista de frente', product: true },
      { src: 'assets/camiseta-resident-costas.jpg', alt: 'Camiseta preta Zetsuy2k vista de costas com estampa gráfica', product: true },
      { src: 'assets/camiseta-look-01.jpg', alt: 'Modelo vestindo a camiseta Zetsuy2k com estampa nas costas' },
      { src: 'assets/camiseta-look-02.jpg', alt: 'Modelo vestindo a camiseta Resident Evil com jaqueta aberta' },
      { src: 'assets/camiseta-look-03.jpg', alt: 'Detalhe frontal da camiseta Resident Evil no look' },
      { src: 'assets/camiseta-look-04.jpg', alt: 'Look editorial com camiseta Resident Evil e calça streetwear' }
    ]
  };

  const selectors = {
    menuToggle: '.menu-toggle',
    menu: '#site-menu',
    galleries: '.product-gallery',
    lightbox: '#image-lightbox'
  };

  function initializeMenu() {
    const toggle = document.querySelector(selectors.menuToggle);
    const menu = document.querySelector(selectors.menu);
    if (!toggle || !menu) return;

    function setOpen(isOpen) {
      menu.hidden = !isOpen;
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    }

    toggle.addEventListener('click', () => setOpen(menu.hidden));
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.site-header')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  function initializeLightbox() {
    const element = document.querySelector(selectors.lightbox);
    if (!element) return null;

    const photo = element.querySelector('.lightbox-photo');
    const closeButton = element.querySelector('.lightbox-close');
    const previousButton = element.querySelector('.lightbox-prev');
    const nextButton = element.querySelector('.lightbox-next');
    if (!photo || !closeButton || !previousButton || !nextButton) return null;

    let activeGallery = null;
    let previousFocus = null;

    function updatePhoto(sourcePhoto) {
      if (!element.classList.contains('is-open')) return;
      photo.src = sourcePhoto.src;
      photo.alt = sourcePhoto.alt;
    }

    function open(sourcePhoto, galleryController) {
      activeGallery = galleryController;
      previousFocus = document.activeElement;
      photo.src = sourcePhoto.src;
      photo.alt = sourcePhoto.alt;
      element.classList.add('is-open');
      element.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      closeButton.focus();
    }

    function close() {
      element.classList.remove('is-open');
      element.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      previousFocus?.focus();
      activeGallery = null;
    }

    closeButton.addEventListener('click', close);
    previousButton.addEventListener('click', () => activeGallery?.previous());
    nextButton.addEventListener('click', () => activeGallery?.next());
    element.addEventListener('click', (event) => {
      if (event.target === element) close();
    });

    document.addEventListener('keydown', (event) => {
      if (!element.classList.contains('is-open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') activeGallery?.previous();
      if (event.key === 'ArrowRight') activeGallery?.next();
    });

    return { open, updatePhoto };
  }

  function initializeGallery(gallery, lightbox) {
    const slides = gallerySlides[gallery.dataset.gallery];
    const photo = gallery.querySelector('.gallery-photo');
    const backdrop = gallery.querySelector('.gallery-backdrop');
    const previousButton = gallery.querySelector('.gallery-prev');
    const nextButton = gallery.querySelector('.gallery-next');

    if (!slides?.length || !photo || !backdrop || !previousButton || !nextButton) return;

    const thumbnails = gallery
      .closest('.product-detail-media')
      ?.querySelectorAll('[data-slide-index]') ?? [];

    let activeIndex = 0;
    let lastPointerIndex = -1;
    let touchStartX = null;
    let imageRequest = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      const slide = slides[activeIndex];
      const requestId = ++imageRequest;

      photo.classList.toggle('product-cutout', Boolean(slide.product));
      gallery.classList.toggle('product-slide-active', Boolean(slide.product));
      photo.classList.add('is-changing');

      thumbnails.forEach((thumbnail, thumbnailIndex) => {
        const isActive = thumbnailIndex === activeIndex;
        thumbnail.classList.toggle('is-active', isActive);
        if (isActive) thumbnail.setAttribute('aria-current', 'true');
        else thumbnail.removeAttribute('aria-current');
      });

      const finishLoading = () => {
        if (requestId !== imageRequest) return;
        photo.classList.remove('is-changing');
        gallery.classList.add('is-ready');
      };

      photo.onload = finishLoading;
      photo.onerror = finishLoading;
      backdrop.src = slide.src;
      photo.src = slide.src;
      photo.alt = slide.alt;
      if (photo.complete) finishLoading();
      lightbox?.updatePhoto(photo);
    }

    const controller = {
      previous: () => showSlide(activeIndex - 1),
      next: () => showSlide(activeIndex + 1)
    };

    photo.addEventListener('click', () => lightbox?.open(photo, controller));
    photo.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      lightbox?.open(photo, controller);
    });

    gallery.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse' || event.target.closest('button')) return;
      const bounds = gallery.getBoundingClientRect();
      if (!bounds.width) return;

      const position = (event.clientX - bounds.left) / bounds.width;
      const index = Math.min(slides.length - 1, Math.floor(position * slides.length));
      if (index === lastPointerIndex) return;

      lastPointerIndex = index;
      showSlide(index);
    });

    gallery.addEventListener('pointerleave', (event) => {
      lastPointerIndex = -1;
      if (event.pointerType === 'mouse' && !document.body.classList.contains('lightbox-open')) {
        showSlide(0);
      }
    });

    previousButton.addEventListener('click', controller.previous);
    nextButton.addEventListener('click', controller.next);
    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener('click', () => {
        showSlide(Number(thumbnail.dataset.slideIndex));
      });
    });

    gallery.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        controller.previous();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        controller.next();
      }
    });

    gallery.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    gallery.addEventListener('touchend', (event) => {
      if (touchStartX === null) return;
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) > 35) showSlide(activeIndex + (distance < 0 ? 1 : -1));
      touchStartX = null;
    }, { passive: true });

    showSlide(0);
  }

  initializeMenu();
  const lightbox = initializeLightbox();
  document.querySelectorAll(selectors.galleries).forEach((gallery) => {
    initializeGallery(gallery, lightbox);
  });
})();
