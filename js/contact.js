document.addEventListener("DOMContentLoaded", () => {
    // Reusable function to load components
    function loadComponent(url, placeholderSelector, callback) {
        fetch(url)
            .then(res => res.text())
            .then(data => {
                document.querySelector(placeholderSelector).innerHTML = data;
                if (typeof callback === "function") callback(); // ✅ Run callback after load
            })
            .catch(err => console.error("Failed to load component:", err));
    }

    // Usage
    document.addEventListener("DOMContentLoaded", () => {
        loadComponent("../components/header.html", "#header-placeholder", initSearch);
        loadComponent("../components/footer.html", "#footer-placeholder");
    });


    // Contact form submission handler
    const form = document.getElementById("contactForm");
    form.addEventListener("submit", e => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!name || !email || !message) {
            alert("Please fill out all fields before submitting.");
            return;
        }

        // Simulate form submission
        alert(`Thank you, ${name}! Your message has been sent successfully.`);

        // Reset form
        form.reset();
    });
});
