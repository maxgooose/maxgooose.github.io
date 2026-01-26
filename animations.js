/**
 * Syrian Mosaic Foundation - Minimal Animations
 * Simple, subtle fade-in effects only
 */

document.addEventListener('DOMContentLoaded', function() {
    // Simple fade-in on scroll
    initScrollAnimations();

    // Mobile menu toggle
    initMobileMenu();

    // Timeline animations
    initTimeline();

    // Fullscreen hero header scroll behavior
    initFullscreenHeroScroll();

    // Contact overlay
    initContactOverlay();

    // Lenis smooth scroll
    initLenisScroll();

    // Swiper sliders (imaaicha)
    initSwiperSliders();

    // Dropdown toggles (defined section)
    initDropdownToggles();

    // Parallax phrase lines (defined section)
    initParallaxPhrases();
});

/**
 * Simple scroll-based fade-in animations
 */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in');
    
    if (elements.length === 0) return;
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        elements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        observer.observe(el);
    });
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const links = document.querySelector('.header-links');
    
    if (!toggle || !links) return;
    
    toggle.addEventListener('click', () => {
        links.classList.toggle('active');
        toggle.setAttribute('aria-expanded', 
            toggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
        );
    });
    
    // Close menu when clicking a link
    const menuLinks = links.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/**
 * Timeline scroll animations and interactivity
 * Supports vertical timeline with images, horizontal timeline, and basic vertical timeline
 */
function initTimeline() {
    // Try to initialize vertical timeline with images first
    const verticalTimelineWithImages = document.querySelector('.timeline-v');
    if (verticalTimelineWithImages) {
        initVerticalTimelineWithImages();
        return;
    }
    
    // Try to initialize horizontal timeline
    const horizontalTimeline = document.querySelector('.timeline-horizontal');
    if (horizontalTimeline) {
        initHorizontalTimeline();
        return;
    }
    
    // Fall back to basic vertical timeline if neither found
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length === 0) return;
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timelineItems.forEach(item => {
            item.style.opacity = '1';
            item.style.transform = 'none';
        });
        return;
    }
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });
    
    timelineItems.forEach(item => {
        observer.observe(item);
        
        // Add keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'article');
        
        // Add aria-label for screen readers
        const year = item.getAttribute('data-year');
        const title = item.querySelector('.timeline-title');
        if (year && title) {
            item.setAttribute('aria-label', `${year}: ${title.textContent}`);
        } else if (title) {
            item.setAttribute('aria-label', `Upcoming: ${title.textContent}`);
        }
    });
}

/**
 * Vertical Timeline with Image Switching (Mobile-First)
 */
function initVerticalTimelineWithImages() {
    const timelineItems = document.querySelectorAll('.timeline-v-item');
    const images = document.querySelectorAll('.timeline-img');
    
    if (timelineItems.length === 0 || images.length === 0) return;
    
    // Function to switch active timeline item and image
    function switchToItem(imgId) {
        // Remove active class from all items
        timelineItems.forEach(item => item.classList.remove('active'));
        images.forEach(img => img.classList.remove('active'));
        
        // Find and activate the matching items
        const activeItem = document.querySelector(`.timeline-v-item[data-img-id="${imgId}"]`);
        const activeImage = document.querySelector(`.timeline-img[data-timeline-img="${imgId}"]`);
        
        if (activeItem) activeItem.classList.add('active');
        if (activeImage) activeImage.classList.add('active');
    }
    
    // Add interaction handlers to timeline items
    timelineItems.forEach(item => {
        const imgId = item.getAttribute('data-img-id');
        
        // Click event
        item.addEventListener('click', () => {
            switchToItem(imgId);
        });
        
        // Hover event - changes image on hover
        item.addEventListener('mouseenter', () => {
            switchToItem(imgId);
        });
        
        // Keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                switchToItem(imgId);
            }
        });
    });
    
    // Optional: Auto-switch based on scroll position (as items come into view)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                const imgId = entry.target.getAttribute('data-img-id');
                if (imgId) {
                    switchToItem(imgId);
                }
            }
        });
    }, {
        threshold: [0.5],
        rootMargin: '-20% 0px -30% 0px'
    });
    
    timelineItems.forEach(item => {
        observer.observe(item);
    });
    
    // Preload all images for smooth transitions
    images.forEach(imgWrapper => {
        const img = imgWrapper.querySelector('img');
        if (img && img.src) {
            const preloadImg = new Image();
            preloadImg.src = img.src;
        }
    });
}

/**
 * Horizontal Timeline with Image Switching
 */
function initHorizontalTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-h-item');
    const heroImages = document.querySelectorAll('.timeline-hero-image');
    const timelineScroll = document.querySelector('.timeline-horizontal');
    const prevBtn = document.querySelector('.timeline-nav-prev');
    const nextBtn = document.querySelector('.timeline-nav-next');
    
    if (timelineItems.length === 0 || heroImages.length === 0) return;
    
    // Function to switch active timeline item and image
    function switchToItem(imgId) {
        // Remove active class from all items
        timelineItems.forEach(item => item.classList.remove('active'));
        heroImages.forEach(img => img.classList.remove('active'));
        
        // Find and activate the matching items
        const activeItem = document.querySelector(`[data-img-id="${imgId}"]`);
        const activeImage = document.querySelector(`[data-timeline-img="${imgId}"]`);
        
        if (activeItem) activeItem.classList.add('active');
        if (activeImage) activeImage.classList.add('active');
    }
    
    // Add click handlers to timeline items
    timelineItems.forEach(item => {
        const imgId = item.getAttribute('data-img-id');
        
        // Click event
        item.addEventListener('click', () => {
            switchToItem(imgId);
        });
        
        // Hover event (optional - shows image on hover)
        item.addEventListener('mouseenter', () => {
            switchToItem(imgId);
        });
        
        // Keyboard accessibility
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                switchToItem(imgId);
            }
        });
    });
    
    // Navigation button handlers
    if (prevBtn && timelineScroll) {
        prevBtn.addEventListener('click', () => {
            timelineScroll.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        });
    }
    
    if (nextBtn && timelineScroll) {
        nextBtn.addEventListener('click', () => {
            timelineScroll.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        });
    }
    
    // Auto-switch based on scroll position (optional)
    let scrollTimeout;
    if (timelineScroll) {
        timelineScroll.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // Find the most visible item
                const scrollLeft = timelineScroll.scrollLeft;
                const containerWidth = timelineScroll.offsetWidth;
                const centerPosition = scrollLeft + (containerWidth / 2);
                
                let closestItem = null;
                let closestDistance = Infinity;
                
                timelineItems.forEach(item => {
                    const itemLeft = item.offsetLeft;
                    const itemCenter = itemLeft + (item.offsetWidth / 2);
                    const distance = Math.abs(centerPosition - itemCenter);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestItem = item;
                    }
                });
                
                if (closestItem) {
                    const imgId = closestItem.getAttribute('data-img-id');
                    switchToItem(imgId);
                }
            }, 150);
        });
    }
    
    // Preload all images for smooth transitions
    heroImages.forEach(heroImg => {
        const img = heroImg.querySelector('img');
        if (img && img.src) {
            const preloadImg = new Image();
            preloadImg.src = img.src;
        }
    });
}

/**
 * Fullscreen Hero - Header scroll behavior & Depth Masking Parallax
 * Creates 3D depth effect where text slides behind the castle foreground
 * Nav becomes sticky when scrolled past hero
 */
function initFullscreenHeroScroll() {
    const body = document.body;

    // Only run if page has fullscreen hero
    if (!body.classList.contains('has-fullscreen-hero')) return;

    const heroSection = document.querySelector('.hero-fullscreen');
    const heroNav = document.querySelector('.hero-fullscreen-nav');
    const heroContent = document.querySelector('.hero-depth-content');
    const heroForeground = document.querySelector('.hero-depth-foreground');
    const titleSyria = document.querySelector('.title-syria');
    const titleYourWay = document.querySelector('.title-yourway');
    const isDepthHero = heroSection && heroSection.classList.contains('hero-depth');

    if (!heroSection) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scroll handler with depth parallax
    function handleScroll() {
        const heroHeight = heroSection.offsetHeight;
        const scrollY = window.scrollY || window.pageYOffset;

        // Header solid background toggle
        if (scrollY > heroHeight * 0.3) {
            body.classList.add('scrolled');
        } else {
            body.classList.remove('scrolled');
        }

        // Depth masking parallax effect
        if (!prefersReducedMotion && scrollY < heroHeight) {

            if (isDepthHero && heroContent) {
                // Container moves down
                const containerSpeed = 1.2;
                const containerOffset = scrollY * containerSpeed;
                heroContent.style.transform = `translateY(${containerOffset}px)`;

                // SYRIA text - moves FAST downward (falls behind castle quickly)
                if (titleSyria) {
                    const syriaSpeed = 2.0; // Fast fall
                    const syriaOffset = -20 + (scrollY * syriaSpeed); // Start -20px up, move down fast
                    const syriaOpacity = 1 - (scrollY / (heroHeight * 0.3));
                    titleSyria.style.transform = `translateY(${syriaOffset}px)`;
                    titleSyria.style.opacity = Math.max(0, syriaOpacity);
                }

                // YOUR WAY text - preserves existing behavior, just offset start position
                if (titleYourWay) {
                    const yourwaySpeed = 1.5;
                    const yourwayOffset = 10 + (scrollY * yourwaySpeed); // Start +10px down
                    const yourwayOpacity = 1 - (scrollY / (heroHeight * 0.35));
                    titleYourWay.style.transform = `translateY(${yourwayOffset}px)`;
                    titleYourWay.style.opacity = Math.max(0, yourwayOpacity);
                }

                // Foreground stays almost stationary
                if (heroForeground) {
                    const fgSpeed = 0.05;
                    heroForeground.style.transform = `translateY(${scrollY * fgSpeed}px)`;
                }
            }

        }
    }

    // Initial check
    handleScroll();

    // Listen for scroll with requestAnimationFrame for smooth performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/**
 * Contact Overlay - Toggle contact popup
 */
function initContactOverlay() {
    const overlay = document.getElementById('contact-overlay');
    const backdrop = document.getElementById('contact-backdrop');
    const closeBtn = document.getElementById('close-overlay');
    const contactTrigger = document.getElementById('nav-contact-trigger');

    if (!overlay) return;

    function openOverlay(e) {
        if (e) e.preventDefault();
        overlay.classList.add('is-open');
        if (backdrop) backdrop.classList.add('is-visible');
        document.body.style.overflow = 'hidden';
    }

    function closeOverlay() {
        overlay.classList.remove('is-open');
        if (backdrop) backdrop.classList.remove('is-visible');
        document.body.style.overflow = '';
    }

    // Open on Contact nav click
    if (contactTrigger) {
        contactTrigger.addEventListener('click', openOverlay);
    }

    // Close on X button click
    if (closeBtn) {
        closeBtn.addEventListener('click', closeOverlay);
    }

    // Close on backdrop click
    if (backdrop) {
        backdrop.addEventListener('click', closeOverlay);
    }

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
            closeOverlay();
        }
    });
}

/**
 * Lenis Smooth Scroll initialization
 */
function initLenisScroll() {
    // Check if Lenis is available
    if (typeof Lenis === 'undefined') return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
        lerp: 0.1,
        wheelMultiplier: 0.7,
        gestureOrientation: 'vertical',
        normalizeWheel: false,
        smoothTouch: false
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Make lenis available globally for other scripts
    window.lenis = lenis;
}

/**
 * Swiper Slider initialization (imaaicha structure)
 */
function initSwiperSliders() {
    // Check if Swiper is available
    if (typeof Swiper === 'undefined') return;

    // Initialize main slider (Section 04 - OUR INITIATIVES)
    const mainSliderEl = document.querySelector('.swiper.is-slider-main');
    if (mainSliderEl) {
        const mainSlider = new Swiper('.swiper.is-slider-main', {
            slidesPerView: 1,
            spaceBetween: 16,
            loop: false,
            grabCursor: true,
            navigation: {
                nextEl: '.swiper-next',
                prevEl: '.swiper-prev',
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                },
            },
        });
    }
}

/**
 * Dropdown Toggles (Defined section - imaaicha structure)
 */
function initDropdownToggles() {
    const dropdowns = document.querySelectorAll('.travel-dropdown');

    if (dropdowns.length === 0) return;

    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.drop-toggle');
        const list = dropdown.querySelector('.drop-list');
        const arrow = dropdown.querySelector('.traval-arrow');

        if (!toggle || !list) return;

        toggle.addEventListener('click', () => {
            const isOpen = dropdown.classList.contains('is-open');

            // Close all other dropdowns
            dropdowns.forEach(d => {
                d.classList.remove('is-open');
                const a = d.querySelector('.traval-arrow');
                if (a) a.style.transform = 'rotate(0deg)';
            });

            // Toggle current dropdown
            if (!isOpen) {
                dropdown.classList.add('is-open');
                if (arrow) arrow.style.transform = 'rotate(45deg)';
            }
        });
    });
}

/**
 * Parallax Phrase Lines (imaaicha scroll animation)
 * Text SVGs slide horizontally in opposite directions as user scrolls
 */
function initParallaxPhrases() {
    const container = document.querySelector('[data-parallax-phrases]');
    if (!container) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const phraseLine1 = container.querySelector('.phrase-line._1');
    const phraseLine2 = container.querySelector('.phrase-line._2');
    const phraseLine3 = container.querySelector('.phrase-line._3');

    if (!phraseLine1 && !phraseLine2 && !phraseLine3) return;

    // Animation values from imaaicha (in %)
    // At scroll 0%: all at 0
    // At scroll 100%: _3 -> 36%, _2 -> -42%, _1 -> 36%
    const animations = {
        '_1': { start: 0, end: 36 },
        '_2': { start: 0, end: -42 },
        '_3': { start: 0, end: 36 }
    };

    function updateParallax() {
        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate scroll progress (0 to 1)
        // Starts when element enters viewport from bottom
        // Ends when element exits viewport from top
        const elementTop = rect.top;
        const elementHeight = rect.height;

        // Progress: 0 when element just enters viewport, 1 when element just exits
        const startTrigger = windowHeight; // when top of element is at bottom of viewport
        const endTrigger = -elementHeight; // when bottom of element is at top of viewport

        let progress = (startTrigger - elementTop) / (startTrigger - endTrigger);
        progress = Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1

        // Apply transforms
        if (phraseLine1) {
            const x = animations['_1'].start + (animations['_1'].end - animations['_1'].start) * progress;
            phraseLine1.style.transform = `translateX(${x}%)`;
        }
        if (phraseLine2) {
            const x = animations['_2'].start + (animations['_2'].end - animations['_2'].start) * progress;
            phraseLine2.style.transform = `translateX(${x}%)`;
        }
        if (phraseLine3) {
            const x = animations['_3'].start + (animations['_3'].end - animations['_3'].start) * progress;
            phraseLine3.style.transform = `translateX(${x}%)`;
        }
    }

    // Initial update
    updateParallax();

    // Update on scroll with requestAnimationFrame for smooth performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}
