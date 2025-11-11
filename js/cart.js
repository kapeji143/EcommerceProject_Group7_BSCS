// =============================
// CART PAGE SCRIPT
// =============================

document.addEventListener("DOMContentLoaded", async () => {
    // Load header and footer
    loadComponent("../components/header.html", "#header-placeholder");
    loadComponent("../components/footer.html", "#footer-placeholder");

    // Initialize cart
    renderCart();
    initCheckout();
    loadUserDataToCheckout();
});

// =============================
// RENDER CART
// =============================
function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartItems = document.getElementById("cartItems");
    const emptyCart = document.getElementById("emptyCart");
    const orderSummary = document.getElementById("orderSummary");

    // ✅ Always make sure both sections exist
    if (!cartItems || !emptyCart || !orderSummary) return;

    // --- If cart is empty ---
    if (cart.length === 0) {
        // Clear cart items
        cartItems.innerHTML = "";

        // Show empty cart message/icon
        emptyCart.classList.remove("d-none");

        // ✅ Keep order summary visible even if empty
        orderSummary.classList.remove("d-none");

        // Update order summary to show $0.00
        const subtotalEl = document.getElementById("subtotal");
        const shippingEl = document.getElementById("shipping");
        const taxEl = document.getElementById("tax");
        const totalEl = document.getElementById("total");

        if (subtotalEl) subtotalEl.textContent = "$0.00";
        if (shippingEl) shippingEl.textContent = "$0.00";
        if (taxEl) taxEl.textContent = "$0.00";
        if (totalEl) totalEl.textContent = "$0.00";

        // Hide free shipping alert if present
        const freeShippingAlert = document.getElementById("freeShippingAlert");
        if (freeShippingAlert) freeShippingAlert.classList.add("d-none");

        return;
    }

    // --- If cart has items ---
    emptyCart.classList.add("d-none");
    orderSummary.classList.remove("d-none");

    // Populate cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="card mb-3 shadow-sm" data-item-id="${item.id}">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${item.image}" alt="${item.name}" class="img-fluid rounded" 
                             style="max-height: 100px; object-fit: cover;">
                    </div>
                    <div class="col-md-4">
                        <h5 class="mb-1">${item.name}</h5>
                        <p class="text-muted mb-0">$${parseFloat(item.price).toFixed(2)}</p>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group" style="max-width: 130px;">
                            <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <input type="text" class="form-control form-control-sm text-center" 
                                   value="${item.quantity}" readonly>
                            <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <strong style="color: var(--primary-orange);">
                            $${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                        </strong>
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart('${item.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join("");

    updateOrderSummary(cart);
}


// =============================
// UPDATE CART QUANTITY
// =============================
function updateQuantity(id, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = cart.find(i => i.id === id);

    if (item) {
        item.quantity = Math.max(1, parseInt(item.quantity) + change);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
        document.dispatchEvent(new Event("cartUpdated"));
    }
}

// =============================
// REMOVE FROM CART
// =============================
function removeFromCart(id) {
    if (!confirm("Remove this item from cart?")) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    document.dispatchEvent(new Event("cartUpdated"));
}

// =============================
// UPDATE ORDER SUMMARY
// =============================
function updateOrderSummary(cart) {
    const subtotal = cart.reduce((sum, item) =>
        sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);

    const shipping = subtotal >= 100 ? 0 : 10;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("shipping").textContent = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
    document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
    document.getElementById("total").textContent = `$${total.toFixed(2)}`;

    // Free shipping alert
    const freeShippingAlert = document.getElementById("freeShippingAlert");
    if (subtotal < 100) {
        const remaining = 100 - subtotal;
        document.getElementById("freeShippingAmount").textContent = `$${remaining.toFixed(2)}`;
        freeShippingAlert.classList.remove("d-none");
    } else {
        freeShippingAlert.classList.add("d-none");
    }
}

// =============================
// LOAD USER DATA TO CHECKOUT
// =============================
function loadUserDataToCheckout() {
    // Check if user is logged in
    if (localStorage.getItem("isLoggedIn") !== "true") return;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const profileData = JSON.parse(localStorage.getItem("profileData")) || {};
    const addresses = JSON.parse(localStorage.getItem("addresses")) || [];
    const defaultAddress = addresses.find(addr => addr.isDefault);

    // Pre-fill checkout form
    if (currentUser && currentUser.email) {
        document.getElementById("customerEmail").value = currentUser.email;
    }

    if (profileData.firstName && profileData.lastName) {
        document.getElementById("customerName").value =
            `${profileData.firstName} ${profileData.lastName}`;
    } else if (currentUser && currentUser.name) {
        document.getElementById("customerName").value = currentUser.name;
    }

    if (defaultAddress) {
        const fullAddress = `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.postalCode}`;
        document.getElementById("customerAddress").value = fullAddress;
    }
}

// =============================
// INITIALIZE CHECKOUT
// =============================
function initCheckout() {
    const checkoutBtn = document.getElementById("checkoutBtn");
    const checkoutModal = new bootstrap.Modal(document.getElementById("checkoutModal"));
    const confirmOrderBtn = document.getElementById("confirmOrderBtn");
    const placePinBtn = document.getElementById("placePinBtn");

    checkoutBtn.addEventListener("click", () => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Check if user is logged in
        if (localStorage.getItem("isLoggedIn") !== "true") {
            if (confirm("You need to login to checkout. Would you like to login now?")) {
                // Save pending action
                localStorage.setItem("pendingCheckout", "true");
                window.location.href = "../html/login.html";
            }
            return;
        }

        loadUserDataToCheckout();
        checkoutModal.show();
    });

    // Place Pin Button
    placePinBtn.addEventListener("click", () => {
        const address = document.getElementById("customerAddress").value;
        if (address) {
            const mapFrame = document.getElementById("mapFrame");
            const encodedAddress = encodeURIComponent(address);
            mapFrame.src = `https://maps.google.com/maps?q=${encodedAddress}&t=m&z=16&output=embed&iwloc=near`;
        }
    });

    // Confirm Order
    confirmOrderBtn.addEventListener("click", () => {
        const name = document.getElementById("customerName").value.trim();
        const email = document.getElementById("customerEmail").value.trim();
        const address = document.getElementById("customerAddress").value.trim();

        // Validation
        if (!name) {
            showError("nameError");
            return;
        }
        if (!email || !isValidEmail(email)) {
            showError("emailError");
            return;
        }
        if (!address) {
            showError("addressError");
            return;
        }

        // Process order
        processOrder(name, email, address);
        checkoutModal.hide();
    });
}

// =============================
// PROCESS ORDER
// =============================
function processOrder(name, email, address) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const subtotal = cart.reduce((sum, item) =>
        sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
    const shipping = subtotal >= 100 ? 0 : 10;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    // Create order object
    const order = {
        id: generateOrderId(),
        date: new Date().toISOString(),
        customer: { name, email, address },
        items: cart,
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total,
        status: "Processing"
    };

    // Save order to localStorage
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.unshift(order); // Add to beginning
    localStorage.setItem("orders", JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem("cart");
    document.dispatchEvent(new Event("cartUpdated"));

    // Show success message
    showOrderSuccessToast(order.id);

    // Redirect to order confirmation or profile page after delay
    setTimeout(() => {
        window.location.href = "../html/profile.html?section=orders";
    }, 2000);
}

// =============================
// HELPER FUNCTIONS
// =============================
function generateOrderId() {
    return "ORD" + Date.now().toString().slice(-8);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(errorId) {
    const errorElement = document.getElementById(errorId);
    errorElement.classList.remove("d-none");
    setTimeout(() => {
        errorElement.classList.add("d-none");
    }, 3000);
}

function showOrderSuccessToast(orderId) {
    const toastEl = document.getElementById("orderToast");
    const toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = `Order #${orderId} placed successfully!`;

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
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

// Check for pending checkout after login
window.addEventListener("load", () => {
    if (localStorage.getItem("pendingCheckout") === "true") {
        localStorage.removeItem("pendingCheckout");
        const checkoutBtn = document.getElementById("checkoutBtn");
        if (checkoutBtn) {
            setTimeout(() => checkoutBtn.click(), 500);
        }
    }
});