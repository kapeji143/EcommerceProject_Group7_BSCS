const basePath = window.location.pathname.includes("/html/") ? "../" : "";

// ===== Load Header =====
fetch(basePath + "components/header.html")
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
    })
    .then(html => {
        const headerEl = document.getElementById("header-placeholder");
        if (!headerEl) throw new Error("header-placeholder not found");
        headerEl.innerHTML = html;

        console.log("✅ Header loaded, attaching events...");

        // Wait a moment to ensure DOM inside header is parsed
        setTimeout(() => {
            const searchIcon = document.getElementById("searchIcon");
            const searchInput = document.getElementById("searchInput");
            const cartIcon = document.getElementById("cartIcon");
            const profileIcon = document.getElementById("profileIcon");

            console.log("🧩 Checking header icons:", {
                searchIconFound: !!searchIcon,
                cartIconFound: !!cartIcon,
                profileIconFound: !!profileIcon,
            });

            // Search Icon
            if (searchIcon && searchInput) {
                const basePath = window.location.pathname.includes("/html/") ? "../" : "";

                // Toggle input visibility
                searchIcon.addEventListener("click", (e) => {
                    e.preventDefault(); // ✅ Prevent form submission or default behavior
                    e.stopPropagation(); // ✅ Prevent bubbling if inside clickable elements

                    const isActive = searchInput.classList.contains("active");

                    if (!isActive) {
                        // Expand input
                        searchInput.classList.add("active");
                        searchInput.focus();
                    } else if (searchInput.value.trim() === "") {
                        // Collapse if empty
                        searchInput.classList.remove("active");
                        searchInput.blur();
                    } else {
                        // Perform search if has text
                        const query = searchInput.value.trim();
                        if (query) {
                            window.location.href = basePath + "html/search.html?query=" + encodeURIComponent(query);
                        }
                    }
                });

                // Collapse when clicking outside
                document.addEventListener("click", (e) => {
                    if (!searchIcon.contains(e.target) && !searchInput.contains(e.target)) {
                        if (searchInput.classList.contains("active") && searchInput.value.trim() === "") {
                            searchInput.classList.remove("active");
                        }
                    }
                });

                // Trigger search on Enter key
                searchInput.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault(); // ✅ Prevent accidental form submission
                        const query = searchInput.value.trim();
                        if (query) {
                            window.location.href = basePath + "html/search.html?query=" + encodeURIComponent(query);
                        }
                    }
                });
            }


            // Cart Icon
            if (cartIcon) {
                cartIcon.addEventListener("click", () => {
                    console.log("🛒 Cart icon clicked!");
                    window.location.href = basePath + "html/cart.html";
                });
            }

            // Profile Icon
            if (profileIcon) {
                profileIcon.addEventListener("click", () => {
                    console.log("👤 Profile icon clicked!");
                    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                    const targetPage = isLoggedIn
                        ? basePath + "html/profile.html"
                        : basePath + "html/login.html";
                    console.log("➡️ Redirecting to:", targetPage);
                    window.location.href = targetPage;
                });
            }

            // Update cart count if available
            updateCartCount();
        }, 50);
    })
    .catch(err => console.error("Error loading header:", err));

// ===== Load Footer (isolated) =====
fetch(basePath + "components/footer.html")
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
    })
    .then(html => {
        const footerEl = document.getElementById("footer-placeholder");
        if (footerEl) footerEl.innerHTML = html;
        console.log("✅ Footer loaded successfully");
    })
    .catch(err => console.warn("⚠️ Error loading footer (ignored):", err));

// ===== Update Cart Count =====
function updateCartCount() {
    const cartCountEl = document.getElementById("cartCount");
    if (!cartCountEl) return;

    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Calculate total items (sum of all quantities)
    const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

    console.log("🛒 Cart count:", totalItems, "items in cart:", cart);

    if (totalItems > 0) {
        cartCountEl.textContent = totalItems;
        cartCountEl.classList.remove("d-none");
    } else {
        cartCountEl.classList.add("d-none");
    }
}

// Call updateCartCount whenever cart changes
window.addEventListener("storage", updateCartCount);
document.addEventListener("cartUpdated", updateCartCount);

// Also update on page load
window.addEventListener("DOMContentLoaded", () => {
    // Wait for header to load first
    setTimeout(updateCartCount, 100);
});