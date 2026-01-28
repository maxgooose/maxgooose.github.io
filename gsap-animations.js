/**
 * Syrian Mosaic Foundation - Premium GSAP Animations
 * Gentle, sophisticated reveal animations with Lenis smooth scrolling
 * Aesthetic: Navy, Gold, Cream - High-end lookbook feel
 */

// Initialize Lenis smooth scrolling
let lenis;

function initLenis() {
    lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Gentle expo ease
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.8, // Slower, more gentle scroll
        touchMultiplier: 1.5,
        infinite: false,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

// Wait for DOM and GSAP to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, falling back to basic animations');
        return;
    }

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Show all elements immediately without animation
        gsap.set('.hero-title, .hero-description, .hero-word, .benefits_card_wrap, .image-card, .tour-feature, .fade-in', {
            opacity: 1,
            y: 0,
            clipPath: 'none'
        });
        return;
    }

    // Initialize Lenis if available
    if (typeof Lenis !== 'undefined') {
        initLenis();
    }

    // Run all animation initializers
    initHeroReveal();
    initCardReveals();
    initSectionReveals();
    initImageReveals();
    initParallaxEffects();
});

/**
 * Hero Section - Gentle Staggered Reveal
 * Creates that "opening a book" premium feel
 */
function initHeroReveal() {
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const hero = document.querySelector('.hero');

    if (!heroTitle) return;

    // Split title into words for staggered animation
    const titleText = heroTitle.textContent;
    heroTitle.innerHTML = titleText.split(' ').map(word =>
        `<span class="hero-word" style="display: inline-block; overflow: hidden;">
            <span class="hero-word-inner" style="display: inline-block;">${word}</span>
        </span>`
    ).join(' ');

    const heroWords = heroTitle.querySelectorAll('.hero-word-inner');

    // Create the master timeline
    const heroTl = gsap.timeline({
        defaults: {
            ease: 'expo.out',
            duration: 1.5
        }
    });

    // Initial states
    gsap.set(heroWords, {
        y: 60,
        opacity: 0,
        rotateX: -15
    });

    if (heroDescription) {
        gsap.set(heroDescription, {
            y: 40,
            opacity: 0
        });
    }

    // Animate words with gentle stagger
    heroTl.to(heroWords, {
        y: 0,
        opacity: 1,
        rotateX: 0,
        stagger: 0.12,
        duration: 1.6,
        ease: 'expo.out'
    });

    // Animate description
    if (heroDescription) {
        heroTl.to(heroDescription, {
            y: 0,
            opacity: 1,
            duration: 1.4,
            ease: 'power4.out'
        }, '-=1.0'); // Overlap with title animation
    }

    // Optional: Add a subtle line reveal under the hero
    const divider = hero?.querySelector('.heritage-section-divider');
    if (divider) {
        gsap.set(divider, { scaleX: 0, transformOrigin: 'center' });
        heroTl.to(divider, {
            scaleX: 1,
            duration: 1.2,
            ease: 'power3.inOut'
        }, '-=0.8');
    }
}

/**
 * Tour Cards - Clip-path Reveal Animation
 * Unveils cards from center, creating that premium "unfolding" effect
 */
function initCardReveals() {
    const cards = document.querySelectorAll('.benefits_card_wrap');

    if (cards.length === 0) return;

    cards.forEach((card, index) => {
        // Set initial state - hidden with clip-path
        gsap.set(card, {
            clipPath: 'inset(50% 50% 50% 50%)',
            opacity: 0,
            scale: 0.95
        });

        // Create reveal animation on scroll
        gsap.to(card, {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            scale: 1,
            duration: 1.4,
            ease: 'expo.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'top 50%',
                toggleActions: 'play none none none'
            },
            delay: index * 0.15 // Stagger effect
        });

        // Add hover animation for cards
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                scale: 1.02,
                duration: 0.6,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                scale: 1,
                duration: 0.6,
                ease: 'power2.out'
            });
        });
    });
}

/**
 * Section Headers - Gentle fade and slide
 */
function initSectionReveals() {
    // Target all section headings
    const sectionHeadings = document.querySelectorAll('.section h2, .section h3');
    const sectionParagraphs = document.querySelectorAll('.prose > p, .lead');
    const dividers = document.querySelectorAll('.heritage-section-divider');

    // Headings
    sectionHeadings.forEach(heading => {
        gsap.set(heading, {
            y: 30,
            opacity: 0
        });

        gsap.to(heading, {
            y: 0,
            opacity: 1,
            duration: 1.5,
            ease: 'expo.out',
            scrollTrigger: {
                trigger: heading,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Paragraphs
    sectionParagraphs.forEach(para => {
        gsap.set(para, {
            y: 25,
            opacity: 0
        });

        gsap.to(para, {
            y: 0,
            opacity: 1,
            duration: 1.3,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: para,
                start: 'top 88%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Section dividers - scale from center
    dividers.forEach(divider => {
        gsap.set(divider, {
            scaleX: 0,
            transformOrigin: 'center'
        });

        gsap.to(divider, {
            scaleX: 1,
            duration: 1.2,
            ease: 'power3.inOut',
            scrollTrigger: {
                trigger: divider,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Tour features list - staggered reveal
    const tourFeatures = document.querySelectorAll('.tour-feature');
    tourFeatures.forEach((feature, index) => {
        gsap.set(feature, {
            x: -20,
            opacity: 0
        });

        gsap.to(feature, {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: {
                trigger: feature,
                start: 'top 90%',
                toggleActions: 'play none none none'
            },
            delay: index * 0.1
        });
    });

    // Grid items (What's Included section)
    const gridItems = document.querySelectorAll('.grid > div');
    gridItems.forEach((item, index) => {
        gsap.set(item, {
            y: 30,
            opacity: 0
        });

        gsap.to(item, {
            y: 0,
            opacity: 1,
            duration: 1.3,
            ease: 'power4.out',
            scrollTrigger: {
                trigger: item,
                start: 'top 88%',
                toggleActions: 'play none none none'
            },
            delay: index * 0.12
        });
    });
}

/**
 * Image Cards - Reveal with clip-path from bottom
 */
function initImageReveals() {
    const imageCards = document.querySelectorAll('.image-card');

    imageCards.forEach((card, index) => {
        const img = card.querySelector('img');
        const content = card.querySelector('.image-card-content');

        // Set initial states
        gsap.set(card, {
            y: 40,
            opacity: 0
        });

        if (img) {
            gsap.set(img, {
                scale: 1.15,
                clipPath: 'inset(100% 0% 0% 0%)'
            });
        }

        if (content) {
            gsap.set(content, {
                y: 20,
                opacity: 0
            });
        }

        // Create timeline for each card
        const cardTl = gsap.timeline({
            scrollTrigger: {
                trigger: card,
                start: 'top 82%',
                toggleActions: 'play none none none'
            }
        });

        // Card container fade in
        cardTl.to(card, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power4.out',
            delay: index * 0.15
        });

        // Image reveal - unveil from bottom with subtle zoom
        if (img) {
            cardTl.to(img, {
                scale: 1,
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 1.4,
                ease: 'expo.out'
            }, '-=0.9');
        }

        // Content fade in
        if (content) {
            cardTl.to(content, {
                y: 0,
                opacity: 1,
                duration: 1.0,
                ease: 'power3.out'
            }, '-=0.6');
        }
    });
}

/**
 * Subtle Parallax Effects
 * Adds depth without being distracting
 */
function initParallaxEffects() {
    // Only add parallax on larger screens
    if (window.innerWidth < 768) return;

    // Hero subtle parallax
    const hero = document.querySelector('.hero');
    if (hero) {
        gsap.to(hero, {
            backgroundPosition: '50% 30%',
            ease: 'none',
            scrollTrigger: {
                trigger: hero,
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5
            }
        });
    }

    // Image cards slight parallax on scroll
    const imageCards = document.querySelectorAll('.image-card img');
    imageCards.forEach(img => {
        gsap.to(img, {
            y: -20,
            ease: 'none',
            scrollTrigger: {
                trigger: img,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 2
            }
        });
    });
}

/**
 * Button Hover Animations
 * Premium micro-interactions
 */
function initButtonAnimations() {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                scale: 1.02,
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                scale: 1,
                duration: 0.4,
                ease: 'power2.out'
            });
        });
    });
}

// Initialize button animations after DOM load
document.addEventListener('DOMContentLoaded', initButtonAnimations);

/**
 * Page Transition - Optional
 * Smooth fade when navigating between pages
 */
function initPageTransitions() {
    // Fade in on page load
    gsap.from('body', {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
    });

    // Fade out on link click (internal links only)
    document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"], a:not([href^="http"]):not([href^="#"]):not([href^="mailto"]):not([href^="tel"])').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !link.getAttribute('target')) {
                e.preventDefault();
                gsap.to('body', {
                    opacity: 0,
                    duration: 0.4,
                    ease: 'power2.in',
                    onComplete: () => {
                        window.location.href = href;
                    }
                });
            }
        });
    });
}
