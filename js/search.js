document.addEventListener("DOMContentLoaded", async () => {
    const searchResultsGrid = document.getElementById("searchResultsGrid");
    const searchQueryEl = document.getElementById("searchQuery");
    const backToHomeBtn = document.getElementById("backToHome");

    // Load header/footer components
    loadComponent("../components/header.html", "#header-placeholder");
    loadComponent("../components/footer.html", "#footer-placeholder");

    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query")?.trim() || "";

    if (query === "") {
        searchResultsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search" style="font-size: 3rem; color: #ccc;"></i>
                <p class="text-muted mt-3">Please enter a search term.</p>
            </div>`;
        return;
    }

    searchQueryEl.textContent = `"${query}"`;

    try {
        // Fetch all products
        const res = await fetch("../json/products.json");
        const allProducts = await res.json();

        // Filter by query (case-insensitive search in name, brand, or category)
        const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.brand.toLowerCase().includes(query.toLowerCase()) ||
            (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
        );

        // Show results
        if (filtered.length === 0) {
            searchResultsGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
                    <p class="text-muted mt-3">No products found for "${query}".</p>
                </div>`;
        } else {
            searchResultsGrid.innerHTML = filtered.map(p => createProductCard(p)).join("");
            attachProductListeners();
        }
    } catch (err) {
        console.error("Failed to load products:", err);
    }

    // Reusable: create product card (same as brands.js)
    function createProductCard(p) {
        const badges = [];

        if (p.is_on_sale) badges.push(`<span class="badge bg-danger">Sale</span>`);
        if (p.is_new_arrival) badges.push(`<span class="badge bg-success">New</span>`);
        if (p.featured) badges.push(`<span class="badge bg-warning text-dark">Featured</span>`);

        const badgeHtml = badges.length
            ? `<div class="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">${badges.join("")}</div>`
            : "";

        const priceDisplay = p.price !== null
            ? `<p class="fw-bold mb-0" style="color: var(--primary-orange-dark);">$${p.price.toFixed(2)}</p>`
            : `<p class="fw-bold mb-0 text-muted">Price upon request</p>`;

        return `
        <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm position-relative h-100 product-card" data-id="${p.id}" style="cursor:pointer;">
                ${badgeHtml}
                <img src="${p.thumbnail}" class="card-img-top" alt="${p.name}" style="height:250px; object-fit:cover;" loading="lazy">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${p.name}</h5>
                    <p class="text-muted mb-2 small">${p.brand}</p>
                    <div class="mt-auto">
                        ${priceDisplay}
                        ${p.rating ? `
                            <div class="d-flex align-items-center mt-2">
                                <span class="text-warning me-1">★</span>
                                <small class="text-muted">${p.rating} (${p.reviews_count})</small>
                            </div>
                        ` : ""}
                    </div>
                </div>
            </div>
        </div>`;
    }

    // Navigate to product page
    function attachProductListeners() {
        const cards = document.querySelectorAll(".product-card");
        cards.forEach(card => {
            card.addEventListener("click", () => {
                const id = card.dataset.id;
                window.location.href = `../html/product.html?id=${id}`;
            });
        });
    }

    // Back button
    backToHomeBtn.addEventListener("click", () => {
        window.location.href = "../index.html";
    });

    // Utility: load header/footer
    async function loadComponent(url, selector) {
        try {
            const res = await fetch(url);
            const html = await res.text();
            document.querySelector(selector).innerHTML = html;
        } catch (err) {
            console.error(`Failed to load ${url}:`, err);
        }
    }
});
