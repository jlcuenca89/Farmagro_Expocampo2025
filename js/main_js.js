document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.main-container');
    const panels = document.querySelectorAll('.panel');
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('mainVideo');
    const closeButton = document.querySelector('.close-button');
    const centerPanel = document.querySelector('.panel-center');

    if (!container) return; // Nothing to do on pages without the main container

    // Función para alternar el estado (para paneles laterales)
    const toggleAssembly = (e) => {
        // Si el modal está abierto, no hacemos nada
        if (modal && modal.classList.contains('show')) return;
        
        const isAssembled = container.classList.contains('assembled');
        if (isAssembled) {
            container.classList.remove('assembled');
        } else {
            container.classList.add('assembled');
        }
    };

    // Función para abrir modal (panel central)
    const openModal = (e) => {
        e.stopPropagation(); // Evita que el click burbujee

        if (!modal) return; // nothing to open if modal doesn't exist on this page

        // Solo abrir si ya está ensamblado, o abrir siempre? 
        // Asumimos que actúa como botón principal
        modal.style.display = "flex";
        // Force reflow for transition
        void modal.offsetWidth; 
        modal.classList.add('show');

        // Autoplay video (if present)
        if (video) {
            try{ video.currentTime = 0; }catch(e){}
            try{ video.play().catch(err => console.log("Autoplay prevented:", err)); }catch(e){}
        }
    };

    const closeModal = () => {
        if (modal) modal.classList.remove('show');
        setTimeout(() => {
            if (modal) modal.style.display = "none";
            if (video) try{ video.pause(); }catch(e){}
        }, 300); // Wait for transition
    };

    // Asignar listeners específicos
    panels.forEach(panel => {
        const link = panel.dataset.link;
        if (link) {
            // Si el panel tiene data-link, navegar allí al hacer click
            panel.addEventListener('click', (e) => {
                // Evitamos toggles si el modal está abierto
                if (modal && modal.classList.contains('show')) return;
                window.location.href = link;
            });
        } else if (panel.classList.contains('panel-center')) {
            panel.addEventListener('click', openModal);
        } else {
            panel.addEventListener('click', toggleAssembly);
        }

        // Make panels keyboard-accessible: Enter or Space activates the panel
        panel.addEventListener('keydown', (e) => {
            const key = e.key || e.code;
            if (key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 'Space') {
                e.preventDefault();
                panel.click();
            }
        });
    });

    // Modal controls
    if (closeButton) closeButton.addEventListener('click', closeModal);
    
    // Cerrar si click fuera del video
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

    // --- Fullscreen handling for the video and exit button ---
    const exitBtn = document.getElementById('exitFullBtn');

    function requestFullscreen(el) {
        if (!el) return Promise.resolve();
        if (el.requestFullscreen) return el.requestFullscreen();
        if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
        if (el.mozRequestFullScreen) return el.mozRequestFullScreen();
        if (el.msRequestFullscreen) return el.msRequestFullscreen();
        return Promise.resolve();
    }

    function exitFullscreen() {
        if (document.exitFullscreen) return document.exitFullscreen();
        if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
        if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
        if (document.msExitFullscreen) return document.msExitFullscreen();
        return Promise.resolve();
    }

    if (video) {
        video.addEventListener('play', function() {
            // Pedir fullscreen del contenedor que incluye tanto el video como el botón
            const el = video.closest('.modal-content') || video.closest('.video-wrapper') || video;
            requestFullscreen(el).catch(() => {});
        });
    }

    function onFullChange() {
        const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        if (exitBtn) {
            exitBtn.style.display = isFull ? 'block' : 'none';
        }
    }

    document.addEventListener('fullscreenchange', onFullChange);
    document.addEventListener('webkitfullscreenchange', onFullChange);
    document.addEventListener('mozfullscreenchange', onFullChange);
    document.addEventListener('MSFullscreenChange', onFullChange);

    if (exitBtn) {
        exitBtn.addEventListener('click', function() {
            // Salir de fullscreen y además cerrar el modal de video
            // Se intenta salir de pantalla completa y, aunque falle,
            // siempre cerramos el modal para cumplir el comportamiento esperado.
            const p = exitFullscreen();
            if (p && typeof p.finally === 'function') {
                p.catch(() => {}).finally(() => closeModal());
            } else {
                // Si la API no devuelve una Promise, llamamos igualmente
                try { exitFullscreen(); } catch (e) {}
                closeModal();
            }
        });
    }

    window.addEventListener('resize', onFullChange);

    // Animación automática al inicio
    setTimeout(() => {
        // Forzamos la unión inicial para que se vea el efecto
        container.classList.add('assembled');
    }, 1000); 
});