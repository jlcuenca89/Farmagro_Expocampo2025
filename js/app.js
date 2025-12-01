"use strict"

document.addEventListener('DOMContentLoaded', function(){
    const sections = Array.from(document.querySelectorAll('.video-section'));
    if(!sections.length) return;

    const ease = 0.08; // smoothing factor: lower = smoother/slower
    const states = [];

    sections.forEach(section => {
        const video = section.querySelector('.scroll-video');
        const progressBar = section.querySelector('.video-progress-bar');
        if(!video) return;

        const state = {
            section,
            video,
            progressBar,
            duration: 0,
            targetTime: 0,
            ease: parseFloat(section.dataset.ease) || 0.08
        };

        try{ video.pause(); }catch(e){}
        video.removeAttribute('autoplay');
        video.removeAttribute('loop');

        video.addEventListener('loadedmetadata', function(){ state.duration = video.duration; });

        states.push(state);
    });

    function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

    function getVisibleRatio(section){
        const rect = section.getBoundingClientRect();
        const windowH = window.innerHeight;
        const visibleTop = Math.max(rect.top, 0);
        const visibleBottom = Math.min(rect.bottom, windowH);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        // ratio relative to section height
        return rect.height > 0 ? (visibleHeight / rect.height) : 0;
    }

    function updateTargetsFromScroll(){
        // find the most visible section
        let best = null;
        let bestRatio = 0;
        states.forEach(s => {
            const ratio = getVisibleRatio(s.section);
            s._visibleRatio = ratio;
            if(ratio > bestRatio){ bestRatio = ratio; best = s; }
        });

        // if nothing is meaningfully visible, don't update targets
        if(!best || bestRatio < 0.03){
            return;
        }

        // compute target only for the most visible section to avoid conflicts
        const s = best;
        const rect = s.section.getBoundingClientRect();
        const windowH = window.innerHeight;
        const sectionTop = window.scrollY + rect.top;
        const sectionHeight = s.section.offsetHeight;
        const scrollY = window.scrollY || window.pageYOffset;
        const maxScroll = Math.max(sectionHeight - windowH, 1);
        const progress = clamp((scrollY - sectionTop) / maxScroll, 0, 1);
        if(s.duration > 0){ s.targetTime = progress * s.duration; }
        if(s.progressBar){ s.progressBar.style.width = (progress * 100) + '%'; }
    }

    window.addEventListener('scroll', function(){ requestAnimationFrame(updateTargetsFromScroll); }, {passive:true});
    window.addEventListener('resize', function(){ requestAnimationFrame(updateTargetsFromScroll); });
    requestAnimationFrame(updateTargetsFromScroll);

    function rafLoop(){
        states.forEach(s => {
            const { video, progressBar, duration } = s;
            if(!video || !isFinite(s.duration) || s.duration <= 0) return;
            const curr = isFinite(video.currentTime) ? video.currentTime : 0;
            const diff = s.targetTime - curr;
            const delta = diff * ease;
            if(Math.abs(diff) > 0.0005){
                try{ video.currentTime = curr + delta; }catch(e){}
            }
            if(progressBar && duration > 0){
                const pct = (video.currentTime / s.duration) * 100;
                progressBar.style.width = clamp(pct, 0, 100) + '%';
            }
        });
        requestAnimationFrame(rafLoop);
    }

    requestAnimationFrame(rafLoop);

    // --- Benefit image swapping ---
    const benefitImage = document.getElementById('benefit-image');
    const benefitButtons = Array.from(document.querySelectorAll('.benefit-option'));
    const benefitTextBlocks = Array.from(document.querySelectorAll('.benefit-text'));


    // Mapping from data-benefit keys to image paths. Edit this object to change mappings.
    const benefitImageMap = {
        profitability: 'img/ecoo_texto1.png',
        support: 'img/ecoo_texto2.png',
        market: 'img/ecoo_texto3.png',
        sustainability: 'img/ecoo_texto4.png',
        innovation: 'img/ecoo_texto4.png'
    };

    // Expose map so it's easy to adjust later from other scripts or the console
    window.benefitImageMap = benefitImageMap;

    function setBenefit(key){
        if(!benefitImage) return;
        const newSrc = benefitImageMap[key] || benefitImageMap.profitability;
        // If same src, still update active classes but avoid reloading
        if(benefitImage.getAttribute('src') === newSrc){
            benefitButtons.forEach(b => b.classList.toggle('active', b.dataset.benefit === key));
            benefitTextBlocks.forEach(t => t.classList.toggle('active', t.dataset.benefit === key));
            return;
        }

        // Fade out, preload new image, then swap and fade in
        try{
            benefitImage.style.opacity = 0;
        }catch(e){}

        const tmp = new Image();
        tmp.onload = function(){
            benefitImage.setAttribute('src', newSrc);
            // ensure the DOM paints the new src before fading in
            requestAnimationFrame(() => { requestAnimationFrame(() => { benefitImage.style.opacity = 1; }); });
        };
        tmp.src = newSrc;

        benefitButtons.forEach(b => b.classList.toggle('active', b.dataset.benefit === key));
        benefitTextBlocks.forEach(t => t.classList.toggle('active', t.dataset.benefit === key));
    }

    if(benefitButtons.length){
        benefitButtons.forEach(btn => {
            btn.addEventListener('click', function(){
                const key = this.dataset.benefit;
                setBenefit(key);
            });
        });
    }

});