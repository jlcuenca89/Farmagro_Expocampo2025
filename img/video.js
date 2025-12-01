document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('hero-video');

    if (video) {
        // Ensure the video is loaded enough to have duration
        video.addEventListener('loadedmetadata', () => {
            // Set an arbitrary scroll distance to control the video playback.
            // For example, the video completes over 2000px of scrolling.
            const scrollPlayDuration = 2000;

            // Disable native scroll-to-play on some browsers
            video.pause();

            function updateVideoTime() {
                const scrollY = window.scrollY;

                // Calculate how far into the scroll-play duration we are.
                // This value goes from 0 to 1.
                const scrollFraction = Math.min(1, Math.max(0, scrollY / scrollPlayDuration));

                // Calculate the target time in the video.
                const targetTime = scrollFraction * video.duration;

                // Using requestAnimationFrame to smoothly update the video time.
                // This is more performant than setting currentTime on every scroll event.
                requestAnimationFrame(() => {
                    // Check if the video is ready
                    if (video.readyState > 0) {
                         // Check if the difference is significant to avoid unnecessary updates
                        if (Math.abs(video.currentTime - targetTime) > 0.05) {
                            video.currentTime = targetTime;
                        }
                    }
                });
            }

            window.addEventListener('scroll', updateVideoTime);

            // Set initial frame
            updateVideoTime();
        });

        // Handle cases where metadata doesn't load quickly
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA or more
            video.dispatchEvent(new Event('loadedmetadata'));
        }
    }
});