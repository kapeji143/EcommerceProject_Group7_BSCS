document.addEventListener("DOMContentLoaded", async () => {
    const specialBundleGrid = document.getElementById("specialBundleGrid");
    const onSaleGrid = document.getElementById("onSaleGrid");

    // Load header/footer
    await loadComponent("../components/header.html", "#header-placeholder");
    await loadComponent("../components/footer.html", "#footer-placeholder");

    try {
        // Fetch products
        const res = await fetch("../json/products.json");
        const products = await res.json();

        // Filter products for Special Bundle (in_trend_spotlight_for_november_fall)
        const trendingProducts = products.filter(p => p.in_trend_spotlight_for_november_fall === true);

        // Filter products On Sale
        const saleProducts = products.filter(p => p.is_on_sale === true);

        // Render sections
        renderProductGrid(trendingProducts, specialBundleGrid, "No special bundle items available at this time.");
        renderProductGrid(saleProducts, onSaleGrid, "No sale items available at this time.");

    } catch (err) {
        console.error("Failed to load products:", err);
        showError(specialBundleGrid);
        showError(onSaleGrid);
    }

    // Product grid render function
    function renderProductGrid(products, container, emptyMessage) {
        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
                    <p class="text-muted mt-3">${emptyMessage}</p>
                </div>`;
            return;
        }

        container.innerHTML = products.map(p => createProductCard(p)).join("");
        attachCardListeners(container);
    }

    // Create product card
    function createProductCard(p) {
        const badges = [];

        if (p.is_on_sale) {
            badges.push(`<span class="badge bg-danger">Sale</span>`);
        }
        if (p.is_new_arrival) {
            badges.push(`<span class="badge bg-success">New</span>`);
        }
        if (p.in_trend_spotlight_for_november_fall) {
            badges.push(`<span class="badge bg-warning text-dark">Trending</span>`);
        }

        const badgeHtml = badges.length > 0
            ? `<div class="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">${badges.join("")}</div>`
            : "";

        const priceDisplay = p.price !== null
            ? `<p class="fw-bold mb-0" style="color: var(--primary-orange-dark);">$${p.price.toFixed(2)}</p>`
            : `<p class="fw-bold mb-0 text-muted">Price upon request</p>`;

        return `
        <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm position-relative h-100 product-card" 
                 data-id="${p.id}" 
                 style="cursor:pointer;">
                ${badgeHtml}
                <img src="${p.thumbnail}" class="card-img-top" alt="${p.name}" 
                     style="height:250px; object-fit:cover;" loading="lazy">
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

    // Attach click listeners to product cards
    function attachCardListeners(container) {
        const cards = container.querySelectorAll(".product-card");
        cards.forEach(card => {
            card.addEventListener("click", () => {
                const id = card.dataset.id;
                window.location.href = `../html/product.html?id=${id}&fromDeals=true`;
            });
        });
    }

    // Show error message
    function showError(container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle" style="font-size: 3rem; color: #dc3545;"></i>
                <p class="text-danger mt-3">Failed to load products. Please try again later.</p>
            </div>`;
    }

    // Load reusable component (header/footer)
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
