// Main JavaScript file for Columbus Heights Estate website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    const popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Add smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add responsive behavior for the map
    function handleResize() {
        const mapElement = document.getElementById('map');
        if (mapElement) {
            const windowHeight = window.innerHeight;
            const mapHeight = Math.max(400, windowHeight * 0.6);
            
            if (window.innerWidth < 768) {
                // Mobile: shorter map
                mapElement.style.height = '400px';
            } else {
                // Desktop: taller map
                mapElement.style.height = `${mapHeight}px`;
            }
            
            // If map is initialized, update its size
            if (typeof map !== 'undefined') {
                map.invalidateSize();
            }
        }
    }
    
    // Initial call and listen for window resize
    handleResize();
    window.addEventListener('resize', handleResize);
});