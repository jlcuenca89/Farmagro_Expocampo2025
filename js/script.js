document.addEventListener('DOMContentLoaded', () => {
    // Page Transition Logic
    // Use filenames (no leading paths) to reliably compare when files are opened locally
    const pageOrder = ['index.html', 'technology.html', 'sustainability.html', 'about-us.html'];

    const getFileName = (path) => {
        if (!path) return '';
        const parts = path.split('/');
        return parts[parts.length - 1] || 'index.html';
    };

    const currentPageFile = getFileName(window.location.pathname.endsWith('/') ? '/index.html' : window.location.pathname);

    const currentIndex = parseInt(document.body.dataset.pageIndex, 10);
    const previousIndex = sessionStorage.getItem('previousPageIndex');

    if (previousIndex !== null) {
        const prevIdx = parseInt(previousIndex, 10);
        if (currentIndex > prevIdx) {
            document.body.classList.add('page-transition-in-right');
        } else if (currentIndex < prevIdx) {
            document.body.classList.add('page-transition-in-left');
        }
    } else {
        // Fallback for first load
        document.body.style.opacity = '1';
    }

    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetUrl = new URL(link.href, window.location.href);
            const targetFile = getFileName(targetUrl.pathname.endsWith('/') ? '/index.html' : targetUrl.pathname);

            // If clicking the same page, do nothing special
            if (targetFile === currentPageFile) return;

            // If the target page is not in our pageOrder (external or asset), allow normal navigation
            const targetIndex = pageOrder.indexOf(targetFile);
            if (targetIndex === -1) return; // leave default navigation

            e.preventDefault();

            // store current index so the next page can decide inbound animation
            sessionStorage.setItem('previousPageIndex', currentIndex.toString());

            if (targetIndex > currentIndex) {
                document.body.classList.add('page-transition-out-left');
            } else if (targetIndex < currentIndex) {
                document.body.classList.add('page-transition-out-right');
            }

            setTimeout(() => {
                window.location.href = link.href;
            }, 400); // Match animation duration
        });
    });

    // Gallery functionality for index.html
    const galleryContainer = document.querySelector('.gallery-container');
    if (galleryContainer) {
        const slides = galleryContainer.querySelector('.gallery-slides');
        const slideItems = galleryContainer.querySelectorAll('.gallery-slide-item');
        const dotsContainer = galleryContainer.querySelector('.gallery-dots');
        let currentIndex = 0;
        let slideInterval;
        const totalSlides = slideItems ? slideItems.length : 0;

        if (totalSlides > 0 && slides && dotsContainer) {
            // Create dots
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                dot.addEventListener('click', () => {
                    goToSlide(i);
                    resetInterval();
                });
                dotsContainer.appendChild(dot);
            }
            const dots = dotsContainer.querySelectorAll('.dot');

            function updateDots() {
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentIndex);
                });
            }

            function updateSlides() {
                const containerWidth = galleryContainer.offsetWidth;
                const slideWidth = slideItems[0].offsetWidth;
                const slideMargin = parseInt(window.getComputedStyle(slideItems[0]).marginRight) * 2;
                const totalSlideWidth = slideWidth + slideMargin;
                
                // Center the active slide
                const offset = (containerWidth / 2) - (totalSlideWidth / 2) - (currentIndex * totalSlideWidth);
                slides.style.transform = `translateX(${offset}px)`;

                slideItems.forEach((slide, index) => {
                    slide.classList.toggle('active', index === currentIndex);
                });
            }

            function goToSlide(index) {
                currentIndex = index;
                updateSlides();
                updateDots();
            }

            function nextSlide() {
                currentIndex = (currentIndex + 1) % totalSlides;
                goToSlide(currentIndex);
            }

            function startInterval() {
                slideInterval = setInterval(nextSlide, 3000); // Change image every 3 seconds
            }

            function resetInterval() {
                clearInterval(slideInterval);
                startInterval();
            }

            // Initialize
            // Use a small timeout to ensure dimensions are calculated correctly after CSS is applied
            setTimeout(() => {
                goToSlide(0);
                startInterval();
                window.addEventListener('resize', () => goToSlide(currentIndex));
            }, 100);
        }
    }

    const video = document.getElementById('hero-video');

    if (video) {
        // This logic is now in video.js
    }

    // Interactive section functionality
    const interactiveContainer = document.querySelector('.interactive-container');
    if (interactiveContainer) {
        const buttons = interactiveContainer.querySelectorAll('.interactive-button');
        const textContents = interactiveContainer.querySelectorAll('.interactive-text');
        const image = interactiveContainer.querySelector('#interactive-image');

        const imageMap = {
            'drought': 'img/drought-resistant-rice.png',
            'yield': 'img/high-yield-rice.png',
            'pest': 'img/hero-technology.png'
        };

        const techImageMap = {
            'drought': 'img/tech-drought.png',
            'yield': 'img/tech-yield.png',
            'pest': 'img/tech-pest.png'
        };

        const aboutImageMap = {
            'drought': 'img/about-us-drought.png',
            'yield': 'img/about-us-yield.png',
            'pest': 'img/about-us-pest.png'
        };

        let currentImageMap = imageMap;
        if(document.title.includes('Technology')) currentImageMap = techImageMap;
        if(document.title.includes('About Us')) currentImageMap = aboutImageMap;
        // Sustainability page can be added if it has this section
        if(document.title.includes('Sustainability')) {
             const sustainabilityImageMap = {
                'drought': 'img/sustainability-drought.png',
                'yield': 'img/sustainability-yield.png',
                'pest': 'img/sustainability-pest.png'
            };
            currentImageMap = sustainabilityImageMap;
        }


        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const content = button.dataset.content;

                // Update buttons
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update text
                textContents.forEach(text => {
                    text.classList.toggle('active', text.dataset.content === content);
                });

                // Update image with a subtle transition
                if (image.src.includes(currentImageMap[content])) return;

                image.style.opacity = '0.7';
                setTimeout(() => {
                    image.src = currentImageMap[content];
                    image.alt = `${content.replace('-', ' ')} rice`;
                    image.onload = () => {
                        image.style.opacity = '1';
                    };
                }, 200);
            });
        });
    }

    // Partner benefits interactive section
    const benefitsContainer = document.querySelector('.benefits-interactive-container');
    if (benefitsContainer) {
        const buttons = benefitsContainer.querySelectorAll('.benefit-option');
        const textContents = benefitsContainer.querySelectorAll('.benefit-text');
        const image = benefitsContainer.querySelector('#benefit-image');

        const imageMap = {
            'profitability': 'img/ecoo_texto1.png',
            'support': 'img/ecoo_texto2.png',
            'market': 'img/ecoo_texto3.png',
            'sustainability': 'img/ecoo_texto4.png'
        };
        
        const sustainabilityImageMap = {
            'profitability': 'img/sustainability-benefit-1.png',
            'support': 'img/sustainability-benefit-2.png',
            'market': 'img/sustainability-benefit-3.png',
            'sustainability': 'img/sustainability-benefit-4.png',
            'innovation': 'img/sustainability-benefit-5.png'
        };
        
        const techImageMap = {
            'profitability': 'img/tech-benefit-1.png',
            'support': 'img/tech-benefit-2.png',
            'market': 'img/tech-benefit-3.png',
            'sustainability': 'img/tech-benefit-4.png',
            'innovation': 'img/tech-benefit-5.png'
        };
        
        const aboutUsImageMap = {
            'profitability': 'img/about-us-benefit-1.png',
            'support': 'img/about-us-benefit-2.png',
            'market': 'img/about-us-benefit-3.png',
            'sustainability': 'img/about-us-benefit-4.png',
            'innovation': 'img/about-us-benefit-5.png'
        };

        let currentImageMap = imageMap;
        if(document.title.includes('Sustainability')) currentImageMap = sustainabilityImageMap;
        if(document.title.includes('Technology')) currentImageMap = techImageMap;
        if(document.title.includes('About Us')) currentImageMap = aboutUsImageMap;


        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const benefit = button.dataset.benefit;

                // Update active state on buttons
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update active state on text
                textContents.forEach(text => {
                    text.classList.toggle('active', text.dataset.benefit === benefit);
                });

                // Update image with a fade transition
                if (image.src.includes(currentImageMap[benefit])) return;

                image.style.opacity = '0.7';
                setTimeout(() => {
                    image.src = currentImageMap[benefit];
                    image.alt = button.textContent;
                    image.onload = () => {
                        image.style.opacity = '1';
                    };
                }, 200); // Corresponds to transition duration
            });
        });
    }

    // Product Gallery section
    const productGallerySection = document.querySelector('.product-gallery-section');
    if (productGallerySection) {
        let products = [
            {
                id: 'yield',
                title: 'Oryza-YieldMax',
                description: 'Engineered for maximum grain output, increasing profitability and land efficiency. The top choice for commercial farming.',
                image: 'img/high-yield-rice.png'
            },
            {
                id: 'drought',
                title: 'Oryza-AquaSip',
                description: 'Thrives in arid conditions with minimal water. Your best defense against unpredictable weather and drought.',
                image: 'img/drought-resistant-rice.png'
            },
            {
                id: 'pest',
                title: 'Oryza-ShieldGuard',
                description: 'Features natural, built-in resistance to common pests, reducing the need for chemical sprays and promoting ecological balance.',
                image: 'img/pest-shield-rice.png'
            },
            {
                id: 'nutrient',
                title: 'Oryza-NutriBoost',
                description: 'Enhanced with vital micronutrients to combat malnutrition and provide a healthier staple for communities worldwide.',
                image: 'img/nutrient-rich-rice.png'
            },
            {
                id: 'fast',
                title: 'Oryza-QuickGro',
                description: 'A fast-maturing variety that allows for multiple harvests per year, ideal for regions with shorter growing seasons.',
                image: 'img/fast-growing-rice.png'
            }
        ];

        if (document.title.includes('Sustainability')) {
            products = [
                 { id: 'yield', title: 'Oryza-EcoYield', description: 'Our highest-yield variety designed with sustainable practices in mind, maximizing output while minimizing environmental footprint.', image: 'img/sustainability-product-1.png' },
                 { id: 'drought', title: 'Oryza-Conserve', description: 'The ultimate water-saving seed, engineered for resilience in the driest conditions to protect farmers and conserve water.', image: 'img/sustainability-product-2.png' },
                 { id: 'pest', title: 'Oryza-BioGuard', description: 'Promotes a healthy farm ecosystem with natural resistance, reducing the need for chemical intervention and supporting biodiversity.', image: 'img/sustainability-product-3.png' },
                 { id: 'nutrient', title: 'Oryza-WholeLife', description: 'A nutrient-dense hybrid that provides essential vitamins and minerals, grown sustainably for the health of people and planet.', image: 'img/sustainability-product-4.png' },
                 { id: 'fast', title: 'Oryza-Regen', description: 'A rapid-growth hybrid that supports soil health and allows for efficient crop rotation, regenerating the land with each cycle.', image: 'img/sustainability-product-5.png' }
            ];
        }

        if (document.title.includes('Technology')) {
            products = [
                 { id: 'yield', title: 'Oryza-Quantum', description: 'Utilizing predictive analytics and genetic mapping, this hybrid is engineered for unparalleled grain production efficiency.', image: 'img/tech-product-1.png' },
                 { id: 'drought', title: 'Oryza-HydraCore', description: 'Features bio-engineered root structures that optimize water absorption at a cellular level, thriving where others cannot.', image: 'img/tech-product-2.png' },
                 { id: 'pest', title: 'Oryza-Sentinel', description: 'A smart seed with programmable genetic defenses that activate in response to specific pest threats, minimizing crop loss.', image: 'img/tech-product-3.png' },
                 { id: 'nutrient', title: 'Oryza-BioForge', description: 'Bio-fortified using advanced gene-editing to produce essential nutrients, directly addressing dietary deficiencies.', image: 'img/tech-product-4.png' },
                 { id: 'fast', title: 'Oryza-Velocity', description: 'Its growth cycle is accelerated through optimized metabolic pathways, making it the most time-efficient hybrid available.', image: 'img/tech-product-5.png' }
            ];
        }

        if (document.title.includes('About Us')) {
            products = [
                 { id: 'yield', title: 'Oryza-Legacy', description: 'This popular hybrid has helped thousands of farming families build prosperity and create a lasting legacy for the next generation.', image: 'img/about-us-product-1.png' },
                 { id: 'drought', title: 'Oryza-Hope', description: 'Delivering food security to vulnerable communities, this resilient seed brings hope and stability in the face of climate change.', image: 'img/about-us-product-2.png' },
                 { id: 'pest', title: 'Oryza-Purity', description: 'Our commitment to safe, healthy food is embodied in this hybrid, which produces pure, chemical-free rice for families.', image: 'img/about-us-product-3.png' },
                 { id: 'nutrient', title: 'Oryza-Nourish', description: 'Developed in partnership with global health organizations to provide vital nutrition to mothers and children worldwide.', image: 'img/about-us-product-4.png' },
                 { id: 'fast', title: 'Oryza-Community', description: 'This fast-growing variety empowers communities by enabling multiple harvests, fostering local economies and food independence.', image: 'img/about-us-product-5.png' }
            ];
        }


        let currentProductIndex = 0;

        const imageEl = document.getElementById('product-gallery-image');
        const titleEl = document.getElementById('product-gallery-title');
        const descriptionEl = document.getElementById('product-gallery-description');
        const prevButton = document.getElementById('prev-product');
        const nextButton = document.getElementById('next-product');
        const dotsContainer = productGallerySection.querySelector('.product-gallery-dots');

        // Defensive checks: if essential elements are missing, skip initialization
        if (!imageEl || !titleEl || !descriptionEl || !prevButton || !nextButton || !dotsContainer) return;

        function updateGallery(index, direction = 'next') {
            const product = products[index];

            // Transition out
            imageEl.style.opacity = '0.7';
            imageEl.style.transform = direction === 'next' ? 'translateX(-10px)' : 'translateX(10px)';

            setTimeout(() => {
                imageEl.src = product.image;
                imageEl.alt = product.title;
                titleEl.textContent = product.title;
                descriptionEl.textContent = product.description;

                imageEl.onload = () => {
                    // Transition in
                    imageEl.style.opacity = '1';
                    imageEl.style.transform = 'translateX(0)';
                };
            }, 200);
            
            // Update dots
            const dots = dotsContainer.querySelectorAll('.product-gallery-dot');
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('active', dotIndex === index);
            });
        }
        
        // Create dots
        products.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('product-gallery-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                const direction = index > currentProductIndex ? 'next' : 'prev';
                currentProductIndex = index;
                updateGallery(currentProductIndex, direction);
            });
            dotsContainer.appendChild(dot);
        });

        prevButton.addEventListener('click', () => {
            currentProductIndex = (currentProductIndex - 1 + products.length) % products.length;
            updateGallery(currentProductIndex, 'prev');
        });

        nextButton.addEventListener('click', () => {
            currentProductIndex = (currentProductIndex + 1) % products.length;
            updateGallery(currentProductIndex, 'next');
        });
    }

    // Testimonials slider
    const testimonialsSection = document.querySelector('.testimonials-section');
    if (testimonialsSection) {
        const slidesContainer = testimonialsSection.querySelector('.testimonial-slides-container');
        const cards = testimonialsSection.querySelectorAll('.testimonial-card');
        const prevButton = document.getElementById('prev-testimonial');
        const nextButton = document.getElementById('next-testimonial');
        const totalCards = cards ? cards.length : 0;
        let currentIndex = 0;

        function showTestimonial(index) {
            if (!slidesContainer) return;
            const offset = -index * 100;
            slidesContainer.style.transform = `translateX(${offset}%)`;
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + totalCards) % totalCards;
                showTestimonial(currentIndex);
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % totalCards;
                showTestimonial(currentIndex);
            });
        }

        // Initialize
        showTestimonial(0);
    }
    
    // Animate on scroll
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.remove('is-visible');
                }
            });
        }, {
            threshold: 0.1
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }
});