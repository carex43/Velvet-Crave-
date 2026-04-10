document.addEventListener('DOMContentLoaded', () => {
    const layers = document.querySelectorAll('.parallax-layer');
    const contentWrapper = document.querySelector('.content-wrapper');
    const reveals = document.querySelectorAll('.reveal-on-scroll');
    
    // Configuration for lazy physics
    let scrollY = window.scrollY;
    let targetScrollY = window.scrollY;
    const lerpFactor = 0.06; // Determines how "lazy" the physics feel. Lower = smoother/lazier
    
    // Animation loop
    function update() {
        // Calculate smooth scroll position using LERP
        scrollY = lerp(scrollY, targetScrollY, lerpFactor);
        
        // Ensure scrollY doesn't become extremely small decimal, avoiding layout jitter
        if (Math.abs(targetScrollY - scrollY) < 0.1) scrollY = targetScrollY;
        
        // Time variable for continuous passive drifting
        const time = performance.now() * 0.0005;

        // Update parallax layers
        layers.forEach(layer => {
            const speed = parseFloat(layer.getAttribute('data-speed')) || 0;
            const yPos = -(scrollY * speed);
            
            // Add slight drift even when scroll stops, based on sine wave
            // Foreground items (higher speed) drift more
            const driftY = Math.sin(time + speed * 10) * 15 * speed;
            const driftX = Math.cos(time + speed * 5) * 8 * speed;
            const rotation = Math.sin(time * 0.5 + speed) * 3 * speed;
            
            layer.style.transform = `translate3d(${driftX}px, ${yPos + driftY}px, 0) rotate(${rotation}deg)`;
        });
        
        // Scroll content wrapper at normal speed (speed = 1)
        const wrapperY = -(scrollY * 1);
        contentWrapper.style.transform = `translate3d(0, ${wrapperY}px, 0)`;
        
        // Hide scroll indicator if scrolled down a bit
        const indicator = document.querySelector('.scroll-indicator');
        if (indicator) {
            indicator.style.opacity = Math.max(0, 0.8 - (scrollY * 0.003));
        }
        
        // Check intersections manually since content wrapper is position: fixed/absolute
        checkReveals(wrapperY);
        
        requestAnimationFrame(update);
    }
    
    // Linear Interpolation helper
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    // Listen for real scroll events on the body and update target
    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY;
    }, { passive: true });
    
    // Force a resize calculation layout on window resize
    function handleResize() {
        const proxy = document.getElementById('scroll-proxy');
        if (proxy && contentWrapper) {
            // Give user enough scroll room to reach the bottom of content wrapper
            proxy.style.height = contentWrapper.offsetHeight + 'px';
        }
        checkReveals(-(scrollY * 1), true);
    }
    
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('load', handleResize, { passive: true });
    
    // Initial height set
    handleResize();
    
    // Setup reveal logic
    function checkReveals(currentY, force = false) {
        const viewportHeight = window.innerHeight;
        
        reveals.forEach(element => {
            if (element.classList.contains('is-visible') && !force) return;
            
            // Element's original offset Top relative to the wrapper
            const elementTop = element.offsetTop;
            // Screen Y is the top position minus how much the wrapper has moved up (since currentY is negative)
            // Wait, currentY is negative. So screenY = elementTop + currentY.
            const screenY = elementTop + currentY; 
            
            // If element comes into the bottom 85% of the viewport
            if (screenY < viewportHeight * 0.85 && screenY > -element.offsetHeight) {
                element.classList.add('is-visible');
            }
        });
    }
    
    // Initialize
    update();
    
    // Trigger reveals for anything already in viewport (e.g., if reloaded partway down)
    setTimeout(() => {
        targetScrollY = window.scrollY;
        checkReveals(-(targetScrollY * 1), true);
    }, 100);
});
