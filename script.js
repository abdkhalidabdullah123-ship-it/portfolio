
/* =========================================================
   KHALID ABDULLAH — PORTFOLIO INTERACTIONS

   01. DOM Elements & Configuration
   02. Spider-Man Face Reveal
       - Desktop Mouse / Pen Interaction
       - Mobile Touch Interaction
   03. Scroll-Based Hero Animation
   04. Section Entrance Animations
   05. Smooth Scroll Navigation

   All interactions initialize after the DOM loads.
========================================================= */


document.addEventListener('DOMContentLoaded', () => {

    /* =====================================================
       01. DOM ELEMENTS & CONFIGURATION
    ===================================================== */

    // Main hero section
    const hero = document.querySelector('.hero');

    // Spider-Man artwork and face reveal window
    const artwork = document.getElementById('artwork');
    const faceWindow = document.getElementById('faceWindow');

    // Technology Stack section and navigation link
    const aboutSection = document.getElementById('about');
    const scrollLink = document.querySelector('.scroll-link');

    // Detect whether the user prefers reduced animations
    const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    );


    /* =====================================================
       02. SPIDER-MAN FACE REVEAL

       Desktop:
       - Move cursor over the mask to reveal the face.
       - Spotlight follows mouse or pen movement.
       - Reveal disappears when cursor leaves.

       Mobile:
       - First tap reveals the face.
       - Second tap hides the face.
       - Drag moves the spotlight.
       - Releasing after dragging hides the reveal.
    ===================================================== */

    if (artwork && faceWindow) {

        /* ---------------------------------------------
           02.1 — INTERACTION STATE
        --------------------------------------------- */

        // Current spotlight position
        let currentX = 0;
        let currentY = 0;

        // Target spotlight position
        let targetX = 0;
        let targetY = 0;

        // Reveal and animation states
        let active = false;
        let animationFrame = null;

        // Mobile touch starting coordinates
        let touchStartX = 0;
        let touchStartY = 0;

        // Mobile interaction flags
        let touchedMask = false;
        let wasActiveAtTouchStart = false;
        let touchMoved = false;


        /* ---------------------------------------------
           02.2 — GET MASK COORDINATES

           Converts screen coordinates into coordinates
           relative to the face reveal window.
        --------------------------------------------- */

        function getRevealPoint(clientX, clientY) {

            const rect = faceWindow.getBoundingClientRect();

            const x = clientX - rect.left;
            const y = clientY - rect.top;

            // Check whether the pointer is inside the window
            const inside =
                x >= 0 &&
                x <= rect.width &&
                y >= 0 &&
                y <= rect.height;

            return {
                x,
                y,
                width: rect.width,
                inside
            };

        }


        /* ---------------------------------------------
           02.3 — ANIMATE SPOTLIGHT

           Smoothly interpolates the current spotlight
           position toward the target position.

           Reduced-motion users get immediate movement.
        --------------------------------------------- */

        function drawReveal() {

            animationFrame = null;

            if (!active) return;

            // Interpolation speed
            const speed = reducedMotion.matches ? 1 : 0.2;

            currentX += (targetX - currentX) * speed;
            currentY += (targetY - currentY) * speed;

            // Update CSS custom properties
            faceWindow.style.setProperty(
                '--spot-x',
                `${currentX}px`
            );

            faceWindow.style.setProperty(
                '--spot-y',
                `${currentY}px`
            );

            // Continue until spotlight reaches its target
            const distanceX = Math.abs(currentX - targetX);
            const distanceY = Math.abs(currentY - targetY);

            if (distanceX > 0.2 || distanceY > 0.2) {

                animationFrame = requestAnimationFrame(
                    drawReveal
                );

            }

        }


        /* ---------------------------------------------
           02.4 — ACTIVATE FACE REVEAL

           Displays the face when the interaction is
           inside the mask reveal area.
        --------------------------------------------- */

        function revealAt(clientX, clientY) {

            const point = getRevealPoint(clientX, clientY);

            // Hide if pointer is outside the reveal area
            if (!point.inside) {

                hideReveal();
                return false;

            }

            // Update target position
            targetX = point.x;
            targetY = point.y;

            // Immediately position on first interaction
            if (!active) {

                currentX = targetX;
                currentY = targetY;

            }

            // Activate reveal
            active = true;

            faceWindow.classList.add('active');

            // Set spotlight radius based on mask width
            const radius = Math.max(
                24,
                point.width * 0.3
            );

            faceWindow.style.setProperty(
                '--radius',
                `${radius}px`
            );

            // Start spotlight animation
            if (animationFrame === null) {

                animationFrame = requestAnimationFrame(
                    drawReveal
                );

            }

            return true;

        }


        /* ---------------------------------------------
           02.5 — HIDE FACE REVEAL

           Removes the reveal and cancels any active
           spotlight animation.
        --------------------------------------------- */

        function hideReveal() {

            active = false;

            faceWindow.classList.remove('active');

            if (animationFrame !== null) {

                cancelAnimationFrame(animationFrame);
                animationFrame = null;

            }

        }


        /* =============================================
           02.6 — DESKTOP MOUSE / PEN INTERACTION
        ============================================= */

        // Follow pointer movement across the mask
        artwork.addEventListener('pointermove', (event) => {

            // Touch interactions are handled separately
            if (event.pointerType === 'touch') return;

            revealAt(event.clientX, event.clientY);

        });


        // Hide reveal when pointer leaves artwork
        artwork.addEventListener('pointerleave', (event) => {

            if (event.pointerType !== 'touch') {

                hideReveal();

            }

        });


        /* =============================================
           02.7 — MOBILE TOUCH INTERACTION
        ============================================= */

        /* ---------------------------------------------
           TOUCH START

           Detects the initial tap location and whether
           the reveal was already active.
        --------------------------------------------- */

        artwork.addEventListener('touchstart', (event) => {

            const touch = event.touches[0];

            if (!touch) return;

            const point = getRevealPoint(
                touch.clientX,
                touch.clientY
            );

            // Store previous reveal state
            wasActiveAtTouchStart = active;

            // Check whether the mask was touched
            touchedMask = point.inside;

            // Reset drag detection
            touchMoved = false;

            touchStartX = touch.clientX;
            touchStartY = touch.clientY;

            // Reveal only when touching the mask
            if (touchedMask) {

                revealAt(
                    touch.clientX,
                    touch.clientY
                );

            } else {

                hideReveal();

            }

        }, { passive: true });


        /* ---------------------------------------------
           TOUCH MOVE

           Moves the reveal with the user's finger.

           Movement greater than 8 pixels is treated
           as a drag rather than a simple tap.
        --------------------------------------------- */

        artwork.addEventListener('touchmove', (event) => {

            if (!touchedMask) return;

            const touch = event.touches[0];

            if (!touch) return;

            // Calculate movement distance
            const movement = Math.hypot(
                touch.clientX - touchStartX,
                touch.clientY - touchStartY
            );

            if (movement > 8) {

                touchMoved = true;

            }

            // Update spotlight position
            revealAt(
                touch.clientX,
                touch.clientY
            );

        }, { passive: true });


        /* ---------------------------------------------
           TOUCH END

           First tap: Keep reveal visible.
           Second tap: Hide reveal.
           Drag release: Hide reveal.
        --------------------------------------------- */

        artwork.addEventListener('touchend', () => {

            if (!touchedMask) return;

            if (touchMoved || wasActiveAtTouchStart) {

                hideReveal();

            }

            touchedMask = false;

        });


        /* ---------------------------------------------
           TOUCH CANCEL

           Reset the reveal when a touch interaction
           is interrupted by the browser.
        --------------------------------------------- */

        artwork.addEventListener('touchcancel', () => {

            touchedMask = false;

            hideReveal();

        });


        /* ---------------------------------------------
           OUTSIDE TOUCH

           Tapping outside Spider-Man closes the
           persistent face reveal.
        --------------------------------------------- */

        document.addEventListener('touchstart', (event) => {

            if (!artwork.contains(event.target)) {

                hideReveal();

            }

        }, { passive: true });


        // Hide when the browser window loses focus
        window.addEventListener('blur', hideReveal);

    }



    /* =====================================================
       03. SCROLL-BASED HERO ANIMATION

       Effects:
       - Hero foreground moves upward.
       - Foreground gradually fades out.
       - White background remains unchanged.
       - Animation follows natural page scrolling.

       CSS properties updated:
       --scroll-opacity
       --scroll-shift
    ===================================================== */

    let scrollFrame = null;


    /* ---------------------------------------------
       03.1 — CALCULATE SCROLL PROGRESS
    --------------------------------------------- */

    function updateHeroScroll() {

        scrollFrame = null;

        if (!hero) return;

        // Distance over which the hero fades
        const fadeDistance = Math.max(
            hero.offsetHeight * 0.8,
            1
        );

        // Progress from 0 to 1
        const progress = Math.min(
            Math.max(
                (window.scrollY - hero.offsetTop) / fadeDistance,
                0
            ),
            1
        );

        // Smoothstep easing
        const smoothProgress =
            progress * progress * (3 - 2 * progress);

        // Calculate opacity
        const opacity = reducedMotion.matches
            ? 1
            : 1 - smoothProgress;

        // Calculate vertical movement
        const shift = reducedMotion.matches
            ? 0
            : -120 * smoothProgress;

        // Update CSS variables
        hero.style.setProperty(
            '--scroll-opacity',
            String(opacity)
        );

        hero.style.setProperty(
            '--scroll-shift',
            `${shift}px`
        );

        // Disable interactions when hero is nearly invisible
        hero.style.pointerEvents =
            !reducedMotion.matches && progress > 0.95
                ? 'none'
                : 'auto';

    }


    /* ---------------------------------------------
       03.2 — REQUEST ANIMATION FRAME

       Prevents unnecessary repeated calculations
       during rapid scrolling.
    --------------------------------------------- */

    function requestHeroUpdate() {

        if (scrollFrame === null) {

            scrollFrame = requestAnimationFrame(
                updateHeroScroll
            );

        }

    }


    /* ---------------------------------------------
       03.3 — SCROLL EVENT LISTENERS
    --------------------------------------------- */

    window.addEventListener(
        'scroll',
        requestHeroUpdate,
        { passive: true }
    );

    window.addEventListener(
        'resize',
        requestHeroUpdate
    );

    // Recalculate when motion preferences change
    reducedMotion.addEventListener(
        'change',
        requestHeroUpdate
    );

    // Initialize hero position
    requestHeroUpdate();



    /* =====================================================
       04. SECTION ENTRANCE ANIMATIONS

       Used for:
       - Technology Stack columns
       - Education Roadmap milestones

       IntersectionObserver detects when items enter
       the viewport and activates their CSS animations.

       Content stays visible if JavaScript is disabled.
    ===================================================== */


    /* ---------------------------------------------
       04.1 — REUSABLE SCROLL REVEAL FUNCTION
    --------------------------------------------- */

    function revealOnScroll(
        sectionSelector,
        itemSelector,
        readyClass
    ) {

        // Find section and animated items
        const section = document.querySelector(
            sectionSelector
        );

        const items = section?.querySelectorAll(
            itemSelector
        );

        // Stop if required elements are missing
        if (!section || !items?.length) return;

        // Skip animations for reduced motion or unsupported browsers
        if (
            reducedMotion.matches ||
            !('IntersectionObserver' in window)
        ) {
            return;
        }

        // Enable animation-ready styles
        section.classList.add(readyClass);


        /* -----------------------------------------
           CREATE INTERSECTION OBSERVER
        ----------------------------------------- */

        const observer = new IntersectionObserver(
            (entries, observerInstance) => {

                for (const entry of entries) {

                    if (!entry.isIntersecting) continue;

                    // Reveal item
                    entry.target.classList.add('visible');

                    // Animate each item only once
                    observerInstance.unobserve(
                        entry.target
                    );

                }

            },
            {
                threshold: 0.05,
                rootMargin: '0px 0px 60px 0px'
            }
        );


        // Observe every item inside the section
        items.forEach((item) => {

            observer.observe(item);

        });


        /* -----------------------------------------
           REDUCED MOTION HANDLING

           Remove hidden/animation-ready styles if
           the user enables reduced motion.
        ----------------------------------------- */

        reducedMotion.addEventListener('change', () => {

            if (reducedMotion.matches) {

                section.classList.remove(readyClass);

                observer.disconnect();

            }

        });

    }


    /* ---------------------------------------------
       04.2 — TECHNOLOGY STACK REVEAL

       Animates the three skill columns.
    --------------------------------------------- */

    revealOnScroll(
        '.about-section',
        '.tech-column',
        'tech-ready'
    );


    /* ---------------------------------------------
       04.3 — EDUCATION ROADMAP REVEAL

       Animates all four educational milestones.
    --------------------------------------------- */

    revealOnScroll(
        '.education-section',
        '.roadmap-item',
        'education-ready'
    );



    /* =====================================================
       05. SMOOTH SCROLL NAVIGATION

       Clicking "SCROLL TO EXPLORE" navigates to
       the Technology Stack section.

       Respects reduced-motion preferences.
    ===================================================== */

    if (scrollLink && aboutSection) {

        scrollLink.addEventListener('click', (event) => {

            // Prevent default anchor jump
            event.preventDefault();

            // Scroll smoothly to the Technology Stack
            aboutSection.scrollIntoView({

                behavior: reducedMotion.matches
                    ? 'auto'
                    : 'smooth',

                block: 'start'

            });

        });

    }

/* =====================================================
   06. CINEMATIC LETTER REVEAL

   Animates the Technology Stack and Education
   headings letter by letter when scrolling.
===================================================== */

function initializeLetterReveal(selector) {

    const heading = document.querySelector(selector);

    if (!heading) return;

    // Preserve the original HTML structure and colors
    function splitText(element, counter) {

        const nodes = Array.from(element.childNodes);

        nodes.forEach((node) => {

            // Process text nodes
            if (node.nodeType === Node.TEXT_NODE) {

                const fragment = document.createDocumentFragment();

                Array.from(node.textContent).forEach((character) => {

                    if (character === ' ' || character === '\n') {

                        fragment.appendChild(
                            document.createTextNode(character)
                        );

                        return;
                    }

                    const letter = document.createElement('span');

                    letter.className = 'animated-letter';

                    letter.textContent = character;

                    // Stagger each letter animation
                    letter.style.setProperty(
                        '--letter-delay',
                        `${counter.value * 45}ms`
                    );

                    fragment.appendChild(letter);

                    counter.value++;

                });

                node.replaceWith(fragment);

            }

            // Preserve nested elements such as red text spans
            else if (node.nodeType === Node.ELEMENT_NODE) {

                splitText(node, counter);

            }

        });

    }

    // Split heading into animated characters
    splitText(heading, { value: 0 });

    // Reveal heading when it enters the viewport
    if ('IntersectionObserver' in window) {

        const observer = new IntersectionObserver((entries) => {

            entries.forEach((entry) => {

                
if (entry.isIntersecting) {

    // Heading screen par aaye toh animation start
    heading.classList.add('letters-visible');

} else {

    // Heading screen se bahar jaaye toh reset
    heading.classList.remove('letters-visible');

}


            });

        }, {
            threshold: 0.3
        });

        observer.observe(heading);

    } else {

        heading.classList.add('letters-visible');

    }

}


// Initialize both headings
initializeLetterReveal('.tech-heading h2');
initializeLetterReveal('.education-heading h2');


/* ==========================================
   07. EXPERIENCE HEADING ANIMATION
========================================== */

initializeLetterReveal('.experience-heading h2');


/* ==========================================
   08. EXPERIENCE SCROLL REVEAL
   Replays whenever the row re-enters view
========================================== */

function initializeExperienceReveal() {

    const section = document.querySelector('.experience-section');
    const experienceItem = section?.querySelector('.experience-item');

    if (!section || !experienceItem) return;

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
        return;
    }

    section.classList.add('experience-ready');

    const observer = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                // Play entrance animation
                entry.target.classList.add('visible');

            } else {

                // Reset when leaving the viewport
                entry.target.classList.remove('visible');

            }

        });

    }, {
        threshold: 0.15
    });

    observer.observe(experienceItem);

    reducedMotion.addEventListener('change', () => {

        if (reducedMotion.matches) {
            section.classList.remove('experience-ready');
            observer.disconnect();
        }

    });

}

initializeExperienceReveal();


/* =====================================================
   CHAPTER 04 — INTERACTIVE FOLDER ANIMATIONS
===================================================== */

// Existing cinematic heading animation
initializeLetterReveal('.portfolio-heading h2');


/* ---------------------------------------------
   REPEATABLE FOLDER SCROLL REVEAL
--------------------------------------------- */

function initializeFolderReveal() {

    const section = document.querySelector(
        '.portfolio-section'
    );

    if (!section) return;

    const items = section.querySelectorAll(
        '.folder-card, .folder-section-heading'
    );

    if (!items.length) return;

    if (
        reducedMotion.matches ||
        !('IntersectionObserver' in window)
    ) {
        return;
    }

    section.classList.add('folder-reveal-ready');

    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    // Play animation upon entering
                    entry.target.classList.add('visible');

                } else {

                    // Reset upon leaving
                    entry.target.classList.remove('visible');

                }

            });

        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -20px 0px'
        }
    );

    items.forEach((item) => {
        observer.observe(item);
    });

    reducedMotion.addEventListener('change', () => {

        if (reducedMotion.matches) {
            section.classList.remove('folder-reveal-ready');
            observer.disconnect();
        }

    });

}

initializeFolderReveal();





/* =====================================================
   09. HANGING SPIDER-MAN — EXPERIENCE
   Repeat the descent when Chapter 03 re-enters view.
===================================================== */

function initializeSpidermanDescent() {
    const section = document.querySelector('.experience-section');
    const hangingImage = section?.querySelector('.hanging-spiderman');

    if (!section || !hangingImage) return;

    // Check the browser console if the image is missing.
    hangingImage.addEventListener('error', () => {
        console.error('Hanging Spider-Man image not found:', hangingImage.src);
    });

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
        return; // CSS displays the image without motion.
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            section.classList.toggle('spiderman-visible', entry.isIntersecting);
        });
    }, {
        threshold: 0.12
    });

    observer.observe(section);

    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) {
            section.classList.remove('spiderman-visible');
        }
    });
}

initializeSpidermanDescent();

/* ==========================================
   CHAPTER 05 — DM MESSAGE INTERACTION
========================================== */


/* ==========================================
   CHAPTER 05 — DIRECT DM SUBMISSION
========================================== */

const dmForm = document.getElementById('dmForm');

if (dmForm) {

    // Replace with your real Formspree endpoint
    const formEndpoint = 'https://formspree.io/f/xeagrjdr';

    const dmMessages = document.getElementById('dmMessages');
    const dmFeedback = document.getElementById('dmFeedback');
    const dmName = document.getElementById('dmName');
    const dmEmail = document.getElementById('dmEmail');
    const dmPhone = document.getElementById('dmPhone');
    const dmInput = document.getElementById('dmInput');
    const dmSend = dmForm.querySelector('.dm-send');

    dmForm.addEventListener('submit', async (event) => {

        event.preventDefault();

        if (!dmForm.reportValidity()) return;

        const name = dmName.value.trim();
        const email = dmEmail.value.trim();
        const phone = dmPhone.value.trim();
        const message = dmInput.value.trim();

        if (!name || !email || !message) {
            dmFeedback.textContent =
                'Please enter your name, email and message.';
            return;
        }

        if (formEndpoint.includes('YOUR_FORM_ID')) {
            dmFeedback.textContent =
                'Form endpoint has not been configured yet.';
            return;
        }

        const formData = new FormData();

        formData.append('name', name);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('message', message);
        formData.append('_subject', `Portfolio DM from ${name}`);

        dmSend.disabled = true;
        dmFeedback.textContent = 'Sending your message...';

        try {

            const response = await fetch(formEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Message submission failed');
            }

            // Show a sent bubble only after successful submission
            const bubble = document.createElement('div');
            bubble.className = 'dm-bubble dm-sent';
            bubble.textContent = message;

            dmMessages.appendChild(bubble);

            dmMessages.scrollTop =
                dmMessages.scrollHeight;

            dmFeedback.textContent =
                'Message sent successfully! Thanks for reaching out.';

            // Clear message, retain visitor details
            dmInput.value = '';

        } catch (error) {

            dmFeedback.textContent =
                'Could not send your message. Please try again.';

            console.error('DM submission error:', error);

        } finally {

            dmSend.disabled = false;

        }

    });

}

/* ==========================================
   EDUCATION ROADMAP — SCROLL ANIMATION
========================================== */

function initializeRoadmapAnimation() {

    const roadmap = document.querySelector(
        '.education-roadmap'
    );

    if (!roadmap) return;

    const motionReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    if (motionReduced) return;

    roadmap.classList.add('animate-road');

    // Remove any previous education item reveal state
    // so this sequence controls the milestone timing.
    const educationSection = roadmap.closest(
        '.education-section'
    );

    if (educationSection) {
        educationSection.classList.remove(
            'education-ready'
        );
    }

    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    roadmap.classList.add(
                        'road-visible'
                    );

                } else {

                    // Replay when scrolling back
                    roadmap.classList.remove(
                        'road-visible'
                    );

                }

            });

        },
        {
            threshold: 0.08
        }
    );

    observer.observe(roadmap);
}

initializeRoadmapAnimation();

/* ==========================================
   GLOBAL LIGHT / NIGHT MODE
========================================== */

const themeToggle = document.getElementById('themeToggle');
const rootElement = document.documentElement;

if (themeToggle) {

    const savedTheme = localStorage.getItem(
        'portfolio-theme'
    );

    if (savedTheme === 'dark') {
        rootElement.classList.add('dark-mode');
    }

    function updateThemeButton() {

        const isDark = rootElement.classList.contains(
            'dark-mode'
        );

        themeToggle.setAttribute(
            'aria-pressed',
            String(isDark)
        );

        themeToggle.setAttribute(
            'aria-label',
            isDark
                ? 'Enable light mode'
                : 'Enable night mode'
        );
    }

    updateThemeButton();

    themeToggle.addEventListener('click', () => {

        rootElement.classList.toggle('dark-mode');

        const isDark = rootElement.classList.contains(
            'dark-mode'
        );

        try {
            localStorage.setItem(
                'portfolio-theme',
                isDark ? 'dark' : 'light'
            );
        } catch (error) {
            // Theme still works if storage is unavailable.
        }

        updateThemeButton();

    });

}



});
