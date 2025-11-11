document.addEventListener("DOMContentLoaded", async () => {
    // Load header and footer
    await loadComponent("../components/header.html", "#header-placeholder");
    await loadComponent("../components/footer.html", "#footer-placeholder");

    // Get product ID from URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    const fromDeals = params.get("fromDeals");
    const fromBrand = params.get("fromBrand");
    const productContainer = document.getElementById("product-details");

    if (!productId) {
        productContainer.innerHTML = `
            <div class="text-center mt-5">
                <h3>Product not found</h3>
                <a href="../html/shop.html" class="btn btn-dark mt-3">Go Back to Shop</a>
            </div>`;
        return;
    }

    try {
        const res = await fetch("../json/products.json");
        const products = await res.json();
        const product = products.find(p => p.id === productId);

        if (!product) {
            productContainer.innerHTML = `
                <div class="text-center mt-5">
                    <h3>Oops! Product not found</h3>
                    <a href="../html/shop.html" class="btn btn-dark mt-3">Back to Shop</a>
                </div>`;
            return;
        }

        renderProduct(product);

        // Check for pending action after login
        checkPendingAction(product);
    } catch (error) {
        console.error("Error loading product data:", error);
        productContainer.innerHTML = `
            <div class="text-center mt-5">
                <h3>Failed to load product details</h3>
                <a href="../html/shop.html" class="btn btn-dark mt-3">Try Again</a>
            </div>`;
    }

    // RENDER PRODUCT DETAILS
    function renderProduct(p) {
        const thumbnails = p.images.map((img, i) => `
            <img src="${img}" 
                 alt="Thumbnail ${i + 1}" 
                 class="thumb-img rounded ${i === 0 ? 'active' : ''}" 
                 style="width: 80px; height: 80px; object-fit: cover;">`
        ).join("");

        const materials = p.materials.map(m => `<li>${m}</li>`).join("");
        const tags = p.tags.map(t => `<span class="badge bg-light text-dark border me-1">${t}</span>`).join("");

        productContainer.innerHTML = `
            <div class="mb-4">
                ${fromBrand
                ? `<a href="../html/brands.html?brand=${encodeURIComponent(fromBrand)}" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-2"></i>Back to ${fromBrand}
       </a>`
                : fromDeals
                    ? `<a href="../html/deals.html" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-2"></i>Back to Deals
       </a>`
                    : `<a href="../html/shop.html" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-2"></i>Back to Shop
       </a>`}

            </div>

            <div class="row g-5">
                <!-- Left: Product Images -->
                <div class="col-lg-6">
                    <div class="border rounded mb-3 overflow-hidden">
                        <img id="mainImage" src="${p.images[0]}" alt="${p.name}" class="img-fluid product-img w-100">
                    </div>
                    <div class="d-flex gap-2" id="thumbnailContainer">${thumbnails}</div>
                </div>

                <!-- Right: Product Info -->
                <div class="col-lg-6">
                    <h2 class="fw-bold mb-3">${p.name}</h2>
                    <p class="text-muted mb-1">Brand: ${p.brand}</p>
                    <h3 class="text-warning fw-bold mb-3">$${p.price.toFixed(2)}</h3>
                    <p>${p.description}</p>

                    <ul class="list-unstyled mb-3">
                        <li><strong>SKU:</strong> ${p.sku}</li>
                        <li><strong>Dimensions:</strong> ${p.dimensions.width} × ${p.dimensions.depth} × ${p.dimensions.height}</li>
                        <li><strong>Weight:</strong> ${p.weight}</li>
                        <li><strong>Finish:</strong> ${p.finish}</li>
                        <li><strong>Style:</strong> ${p.style}</li>
                        <li><strong>Assembly Required:</strong> ${p.assembly_required ? "Yes" : "No"}</li>
                    </ul>

                    <h6>Materials:</h6>
                    <ul>${materials}</ul>

                    <h6>Tags:</h6>
                    <p>${tags}</p>

                    <div class="mt-4 d-flex gap-3">
                        <button class="btn btn-orange flex-fill" id="addToCartBtn">
                            <i class="bi bi-cart-plus me-2"></i>Add to Cart
                        </button>
                        <button class="btn btn-outline-dark" id="favoriteBtn">
                            <i class="bi bi-heart fs-5"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Thumbnail click to change main image
        const mainImage = document.getElementById("mainImage");
        const thumbImgs = document.querySelectorAll(".thumb-img");

        thumbImgs.forEach(thumb => {
            thumb.addEventListener("click", () => {
                thumbImgs.forEach(t => t.classList.remove("active"));
                thumb.classList.add("active");
                mainImage.src = thumb.src;
            });
        });

        // --- Button actions ---
        const addToCartBtn = document.getElementById("addToCartBtn");
        const favoriteBtn = document.getElementById("favoriteBtn");
        const heartIcon = favoriteBtn.querySelector("i");

        addToCartBtn.addEventListener("click", () => {
            if (!isUserLoggedIn()) {
                savePendingAction('cart', p.id);
                window.location.href = "../html/login.html";
                return;
            }

            addToCart(p);
            addToCartBtn.innerHTML = `<i class="bi bi-cart-check me-2"></i>Item added to cart`;
            addToCartBtn.disabled = true;
        });

        favoriteBtn.addEventListener("click", () => {
            if (!isUserLoggedIn()) {
                savePendingAction('favorite', p.id);
                window.location.href = "../html/login.html";
                return;
            }

            const isFav = toggleFavorite(p);
            heartIcon.classList.toggle("text-danger", isFav);
            heartIcon.classList.toggle("bi-heart", !isFav);
            heartIcon.classList.toggle("bi-heart-fill", isFav);
        });
    }

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

// =============================
// AUTH CHECK FUNCTION
// =============================
function isUserLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
}

// =============================
// SAVE PENDING ACTION
// =============================
function savePendingAction(action, productId) {
    const pendingAction = {
        action: action,
        productId: productId,
        returnUrl: window.location.href
    };
    localStorage.setItem("pendingAction", JSON.stringify(pendingAction));
    console.log("📝 Saved pending action:", pendingAction);
}

// =============================
// CHECK AND EXECUTE PENDING ACTION
// =============================
async function checkPendingAction(product) {
    const pendingActionStr = localStorage.getItem("pendingAction");

    if (!pendingActionStr) return;

    const pendingAction = JSON.parse(pendingActionStr);

    if (isUserLoggedIn() && pendingAction.productId === product.id) {
        console.log("✅ Executing pending action:", pendingAction);

        if (pendingAction.action === 'cart') {
            addToCart(product);
            const addToCartBtn = document.getElementById("addToCartBtn");
            if (addToCartBtn) {
                addToCartBtn.innerHTML = `<i class="bi bi-cart-check me-2"></i>Item added to cart`;
                addToCartBtn.disabled = true;
            }
        } else if (pendingAction.action === 'favorite') {
            toggleFavorite(product);
            const favoriteBtn = document.getElementById("favoriteBtn");
            if (favoriteBtn) {
                const heartIcon = favoriteBtn.querySelector("i");
                heartIcon.classList.add("text-danger", "bi-heart-fill");
                heartIcon.classList.remove("bi-heart");
            }
        }

        localStorage.removeItem("pendingAction");
    }
}

// =============================
// ADD TO CART FUNCTION
// =============================
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity = parseInt(existing.quantity) + 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: product.images[0],
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    document.dispatchEvent(new Event("cartUpdated"));
    updateCartDisplay(cart);
}

// =============================
// UPDATE CART DISPLAY / BADGE
// =============================
function updateCartDisplay(cart) {
    const cartBadge = document.getElementById("cartCount");
    if (cartBadge) {
        const totalItems = cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);
        cartBadge.textContent = totalItems;
        cartBadge.classList.toggle("d-none", totalItems === 0);
    }

    const cartContainer = document.getElementById("cartItems");
    if (cartContainer && typeof renderCart === "function") {
        renderCart();
    }
}

// =============================
// ADD TO FAVORITES FUNCTION
// =============================
function toggleFavorite(product) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const existingIndex = favorites.findIndex(f => f.id === product.id);

    if (existingIndex !== -1) {
        favorites.splice(existingIndex, 1);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        return false;
    } else {
        favorites.push({
            id: product.id,
            name: product.name,
            image: product.images[0],
            price: product.price
        });
        localStorage.setItem("favorites", JSON.stringify(favorites));
        return true;
    }
}
