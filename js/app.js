document.addEventListener('DOMContentLoaded', () => {
    // Counter Animation
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const increment = target / 100;
        
        const updateCount = () => {
            count += increment;
            if (count < target) {
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target + "+";
            }
        };
        updateCount();
    });

    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
        });
    });
});
