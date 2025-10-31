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
