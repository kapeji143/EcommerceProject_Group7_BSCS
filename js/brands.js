document.addEventListener("DOMContentLoaded", async () => {
    const brandSelection = document.getElementById("brandSelection");
    const productResults = document.getElementById("productResults");
    const brandProductsGrid = document.getElementById("brandProductsGrid");
    const brandTitle = document.getElementById("brandTitle");
    const backToBrandsBtn = document.getElementById("backToBrands");

    let allProducts = [];

    // Load header/footer
    await loadComponent("../components/header.html", "#header-placeholder");
    await loadComponent("../components/footer.html", "#footer-placeholder");

    try {
        // Fetch products
        const res = await fetch("../json/products.json");
        allProducts = await res.json();

        // Attach click listeners to brand cards
        attachBrandListeners();
    } catch (err) {
        console.error("Failed to load products:", err);
    }

    // Attach click listeners to brand cards
    function attachBrandListeners() {
        const cards = document.querySelectorAll(".brand-card");
        cards.forEach(card => {
            card.addEventListener("click", () => {
                const brandName = card.dataset.brand;
                showBrandProducts(brandName);
            });
        });
    }

    // Show products for selected brand
    function showBrandProducts(brandName) {
        const brandProducts = allProducts.filter(p => p.brand === brandName);

        if (brandProducts.length === 0) {
            brandProductsGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
                    <p class="text-muted mt-3">No products found for this brand.</p>
                </div>`;
        } else {
            brandProductsGrid.innerHTML = brandProducts.map(p => createProductCard(p)).join("");
            attachProductListeners();
        }

        brandTitle.textContent = brandName;
        brandSelection.classList.add("d-none");
        productResults.classList.remove("d-none");
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        if (p.featured) {
            badges.push(`<span class="badge bg-warning text-dark">Featured</span>`);
        }

        const badgeHtml = badges.length > 0
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

    // Attach click listeners to product cards
    function attachProductListeners() {
        const cards = document.querySelectorAll(".product-card");
        cards.forEach(card => {
            card.addEventListener("click", () => {
                const id = card.dataset.id;
                const currentBrand = brandTitle.textContent.trim();
                window.location.href = `../html/product.html?id=${id}&fromBrand=${encodeURIComponent(currentBrand)}`;
            });
        });
    }

    // Back to brands button
    backToBrandsBtn.addEventListener("click", () => {
        productResults.classList.add("d-none");
        brandSelection.classList.remove("d-none");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

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

    // --- Auto-load brand from URL query ---
    const urlParams = new URLSearchParams(window.location.search);
    const initialBrand = urlParams.get("brand");

    if (initialBrand) {
        // Wait until products are loaded
        const checkProductsLoaded = setInterval(() => {
            if (allProducts.length > 0) {
                clearInterval(checkProductsLoaded);
                showBrandProducts(initialBrand);
            }
        }, 100);
    }
});
