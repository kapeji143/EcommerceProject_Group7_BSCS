// Load Header Component
async function loadHeader() {
    try {
        const response = await fetch('../components/header.html');
        const html = await response.text();
        document.getElementById('header-placeholder').innerHTML = html;

        // Initialize header functionality after loading
        initializeHeader();
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

// Load Footer Component
async function loadFooter() {
    try {
        const response = await fetch('../components/footer.html');
        const html = await response.text();
        document.getElementById('footer-placeholder').innerHTML = html;

        // Initialize footer functionality after loading
        initializeFooter();
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

// Initialize Header Functionality
function initializeHeader() {
    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('bi-list');
                icon.classList.toggle('bi-x');
            }
        });
    }

    // Sticky Header on Scroll
    const header = document.querySelector('.main-header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Close mobile menu when clicking on a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.classList.add('bi-list');
                icon.classList.remove('bi-x');
            }
        });
    });
}

// Initialize Footer Functionality
function initializeFooter() {
    // Newsletter Subscription
    const newsletterBtn = document.querySelector('.btn-newsletter');
    const newsletterInput = document.querySelector('.newsletter-input');

    if (newsletterBtn && newsletterInput) {
        newsletterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = newsletterInput.value.trim();

            if (email && validateEmail(email)) {
                alert('Thank you for subscribing to our newsletter!');
                newsletterInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });

        // Allow Enter key to submit
        newsletterInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                newsletterBtn.click();
            }
        });
    }
}

// Email Validation Helper
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Smooth Scroll for Anchor Links
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Animate elements on scroll (Intersection Observer)
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Add animation to feature cards
    const animatedElements = document.querySelectorAll('.feature-card, .room-card, .brand-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Shopping Cart Functionality (Example)
let cartCount = 3; // Initial cart count

function updateCartCount(count) {
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        cartBadge.textContent = count;
    }
}

// Search Functionality
function initializeSearch() {
    const searchIcon = document.querySelector('.header-icon.bi-search');

    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            const searchQuery = prompt('What are you looking for?');
            if (searchQuery) {
                console.log('Searching for:', searchQuery);
                // Implement search functionality here
                alert(`Searching for: ${searchQuery}`);
            }
        });
    }
}

// Back to Top Button
function createBackToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '<i class="bi bi-arrow-up"></i>';
    button.className = 'back-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: var(--primary-orange);
        color: white;
        border: none;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        z-index: 1000;
    `;

    document.body.appendChild(button);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.display = 'flex';
        } else {
            button.style.display = 'none';
        }
    });

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load components
    loadHeader();
    loadFooter();

    // Setup animations
    setTimeout(() => {
        setupScrollAnimations();
        initializeSearch();
        createBackToTopButton();
    }, 100);
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('Page is now visible');
    }
});

// Console welcome message
console.log('%cWelcome to Craft Carpets! 🛋️', 'color: #EA580C; font-size: 20px; font-weight: bold;');
console.log('%cDiscover premium quality handcrafted carpets and home furnishings.', 'color: #6B7280; font-size: 14px;');