document.addEventListener("DOMContentLoaded", async () => {
    const productGrid = document.getElementById("productGrid");
    const featuredContainer = document.getElementById("featuredContainer");

    // Make these accessible to all functions below
    let products = [];
    let nonFeatured = [];

    // Load header/footer
    loadComponent("../components/header.html", "#header-placeholder");
    loadComponent("../components/footer.html", "#footer-placeholder");

    // Fetch products
    const res = await fetch("../json/products.json");
    products = await res.json();

    // Featured + non-featured split
    const featured = products.filter(p => p.featured);
    nonFeatured = products.filter(p => !p.featured);

    // Render sections
    featuredContainer.innerHTML = featured.map(p => createFeaturedCard(p)).join("");
    renderProducts(nonFeatured);

    // === Price slider setup ===
    const priceSlider = document.getElementById("priceRange");
    const minLabel = document.getElementById("minPriceLabel");
    const maxLabel = document.getElementById("maxPriceLabel");

    const validPrices = products
        .filter(p => p && typeof p.price === "number")
        .map(p => p.price);

    const maxProductPrice = validPrices.length > 0 ? Math.ceil(Math.max(...validPrices)) : 1000;

    priceSlider.min = 0;
    priceSlider.max = maxProductPrice;
    priceSlider.value = maxProductPrice;

    minLabel.textContent = `$0`;
    maxLabel.textContent = `$${maxProductPrice}`;

    priceSlider.addEventListener("input", () => {
        maxLabel.textContent = `$${priceSlider.value}`;
    });

    // === Apply filters ===
    const applyButton = document.getElementById("applyFilters");
    applyButton?.addEventListener("click", () => {
        const category = document.getElementById("filterCategory")?.value || "";
        const brand = document.getElementById("filterBrand")?.value || "";
        const maxPrice = parseFloat(priceSlider.value);

        const filtered = nonFeatured.filter(p => {
            if (!p || typeof p.price !== "number") return false;
            return (!category || p.category === category) &&
                (!brand || p.brand === brand) &&
                p.price <= maxPrice;
        });

        renderProducts(filtered);
    });

    // === Reset filters ===
    const resetButton = document.getElementById("resetFilters");
    resetButton?.addEventListener("click", () => {
        const categoryEl = document.getElementById("filterCategory");
        const brandEl = document.getElementById("filterBrand");

        if (categoryEl) categoryEl.value = "";
        if (brandEl) brandEl.value = "";

        const resetMax = priceSlider.max || 1000;
        priceSlider.value = resetMax;
        maxLabel.textContent = `$${resetMax}`;
        minLabel.textContent = `$0`;

        renderProducts(nonFeatured);
    });

    // === Render products ===
    function renderProducts(list) {
        if (!list || list.length === 0) {
            productGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
                    <p class="text-muted mt-3">No products found matching your filters.</p>
                </div>`;
            return;
        }
        productGrid.innerHTML = list.map(p => createProductCard(p)).join("");
        attachCardListeners(productGrid);
    }

    // === Create Featured Card ===
    function createFeaturedCard(p) {
        const badge = p.is_on_sale
            ? `<span class="badge bg-danger position-absolute top-0 start-0 m-2">Sale</span>`
            : p.is_new_arrival
                ? `<span class="badge bg-success position-absolute top-0 start-0 m-2">New</span>`
                : `<span class="badge bg-warning text-dark position-absolute top-0 start-0 m-2">Featured</span>`;

        const priceDisplay = p.price !== null
            ? `<p class="fw-bold mb-0" style="color: var(--primary-orange-dark);">$${p.price.toFixed(2)}</p>`
            : `<p class="fw-bold mb-0 text-muted">Price upon request</p>`;

        return `
        <div class="card border-0 shadow-sm position-relative product-card" data-id="${p.id}">
            ${badge}
            <img src="${p.thumbnail}" class="card-img-top" alt="${p.name}" style="height:250px; object-fit:cover;">
            <div class="card-body">
                <h5 class="card-title">${p.name}</h5>
                <p class="text-muted mb-2 small">${p.brand}</p>
                ${priceDisplay}
                ${p.rating ? `
                    <div class="d-flex align-items-center mt-2">
                        <span class="text-warning me-1">★</span>
                        <small class="text-muted">${p.rating} (${p.reviews_count})</small>
                    </div>
                ` : ""}
            </div>
        </div>`;
    }

    // === Create Product Card ===
    function createProductCard(p) {
        const badge = p.is_on_sale
            ? `<span class="badge bg-danger position-absolute top-0 start-0 m-2">Sale</span>`
            : p.is_new_arrival
                ? `<span class="badge bg-success position-absolute top-0 start-0 m-2">New</span>`
                : "";

        const priceDisplay = p.price !== null
            ? `<p class="fw-bold mb-0" style="color: var(--primary-orange-dark);">$${p.price.toFixed(2)}</p>`
            : `<p class="fw-bold mb-0 text-muted">Price upon request</p>`;

        return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card border-0 shadow-sm position-relative h-100 product-card" data-id="${p.id}" style="cursor:pointer;">
                ${badge}
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

    // === Attach click handlers ===
    function attachCardListeners(container) {
        const cards = container.querySelectorAll(".product-card");
        cards.forEach(card => {
            card.addEventListener("click", () => {
                const id = card.dataset.id;
                window.location.href = `../html/product.html?id=${id}`;
            });
        });
    }

    attachCardListeners(featuredContainer);

    // === Load reusable component ===
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
