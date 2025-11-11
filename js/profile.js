// =============================
// PROFILE PAGE SCRIPT
// =============================

document.addEventListener("DOMContentLoaded", async () => {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        window.location.href = "../html/login.html";
        return;
    }

    // Load header and footer
    await loadComponent("../components/header.html", "#header-placeholder");
    await loadComponent("../components/footer.html", "#footer-placeholder");

    // Initialize profile
    loadUserProfile();
    initSidebarNavigation();
    initAccountForm();
    initPasswordForm();
    initAddressForm();
    loadOrderHistory();
    loadSavedAddresses();
    loadFavorites();
    initLogout();
});

// =============================
// CHECK IF USER IS LOGGED IN
// =============================
function isUserLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
}

// =============================
// LOAD USER PROFILE
// =============================
function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) return;

    // Update profile header
    const email = currentUser.email;
    const name = currentUser.name || email.split("@")[0];
    const initial = name.charAt(0).toUpperCase();

    document.getElementById("profileAvatar").textContent = initial;
    document.getElementById("profileName").textContent = name;
    document.getElementById("profileEmail").textContent = email;

    // Load profile data from localStorage
    const profileData = JSON.parse(localStorage.getItem("profileData")) || {};

    document.getElementById("firstName").value = profileData.firstName || "";
    document.getElementById("lastName").value = profileData.lastName || "";
    document.getElementById("accountEmail").value = email;
    document.getElementById("phone").value = profileData.phone || "";
    document.getElementById("birthdate").value = profileData.birthdate || "";
}

// =============================
// SIDEBAR NAVIGATION
// =============================
function initSidebarNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".content-section");

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            const targetSection = link.getAttribute("data-section");

            // Update active states
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            // Show target section
            sections.forEach(section => {
                section.classList.remove("active");
            });
            document.getElementById(targetSection).classList.add("active");

            // Reload data based on section
            if (targetSection === "orders") {
                loadOrderHistory();
            } else if (targetSection === "addresses") {
                loadSavedAddresses();
            } else if (targetSection === "favorites") {
                loadFavorites();
            }
        });
    });
}

// =============================
// ACCOUNT FORM
// =============================
function initAccountForm() {
    const form = document.getElementById("accountForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const profileData = {
            firstName: document.getElementById("firstName").value,
            lastName: document.getElementById("lastName").value,
            phone: document.getElementById("phone").value,
            birthdate: document.getElementById("birthdate").value
        };

        localStorage.setItem("profileData", JSON.stringify(profileData));

        // Update user name
        const fullName = `${profileData.firstName} ${profileData.lastName}`.trim() ||
            document.getElementById("accountEmail").value.split("@")[0];

        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        currentUser.name = fullName;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        // Update display
        document.getElementById("profileName").textContent = fullName;

        showToast("Account details updated successfully!", "success");
    });
}

// =============================
// PASSWORD FORM
// =============================
function initPasswordForm() {
    const form = document.getElementById("passwordForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmNewPassword").value;

        // Validation
        if (newPassword.length < 6) {
            showToast("New password must be at least 6 characters", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        // Get current user
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.email === currentUser.email);

        if (!user || user.password !== currentPassword) {
            showToast("Current password is incorrect", "error");
            return;
        }

        // Update password
        user.password = newPassword;
        localStorage.setItem("users", JSON.stringify(users));

        // Clear form
        form.reset();
        showToast("Password updated successfully!", "success");
    });
}

// =============================
// LOAD ORDER HISTORY
// =============================
function loadOrderHistory() {
    const ordersList = document.getElementById("ordersList");
    const noOrders = document.getElementById("noOrders");
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    if (orders.length === 0) {
        ordersList.innerHTML = "";
        noOrders.classList.remove("d-none");
        return;
    }

    noOrders.classList.add("d-none");

    ordersList.innerHTML = orders.map(order => {
        const statusClass = getStatusClass(order.status);
        const date = new Date(order.date).toLocaleDateString();

        return `
            <div class="order-card">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 class="mb-1">Order #${order.id}</h5>
                        <p class="text-muted mb-0">${date}</p>
                    </div>
                    <span class="order-status ${statusClass}">${order.status}</span>
                </div>
                
                <div class="mb-3">
                    <strong>Items:</strong> ${order.items.length} item(s)
                    <br>
                    <strong>Total:</strong> $${order.total.toFixed(2)}
                </div>

                <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary btn-sm" onclick="viewOrderDetails('${order.id}')">
                        View Details
                    </button>
                    ${order.status === 'Delivered' ? `
                        <button class="btn btn-outline-secondary btn-sm" onclick="reorder('${order.id}')">
                            Order Again
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join("");
}

function getStatusClass(status) {
    switch (status) {
        case 'Delivered': return 'status-completed';
        case 'Processing': return 'status-processing';
        case 'Shipped': return 'status-shipped';
        default: return 'status-processing';
    }
}

// =============================
// ADDRESS MANAGEMENT
// =============================
function initAddressForm() {
    const saveBtn = document.getElementById("saveAddressBtn");
    const modal = new bootstrap.Modal(document.getElementById("addAddressModal"));

    saveBtn.addEventListener("click", () => {
        const addressData = {
            id: Date.now().toString(),
            label: document.getElementById("addressLabel").value,
            fullName: document.getElementById("fullName").value,
            phone: document.getElementById("phoneNumber").value,
            street: document.getElementById("streetAddress").value,
            city: document.getElementById("city").value,
            postalCode: document.getElementById("postalCode").value,
            isDefault: document.getElementById("setAsDefault").checked
        };

        // Validate
        if (!addressData.label || !addressData.fullName || !addressData.street) {
            showToast("Please fill in all required fields", "error");
            return;
        }

        // Get existing addresses
        let addresses = JSON.parse(localStorage.getItem("addresses")) || [];

        // If setting as default, remove default from others
        if (addressData.isDefault) {
            addresses.forEach(addr => addr.isDefault = false);
        }

        // Add new address
        addresses.push(addressData);
        localStorage.setItem("addresses", JSON.stringify(addresses));

        // Reset form and close modal
        document.getElementById("addAddressForm").reset();
        modal.hide();

        // Reload addresses
        loadSavedAddresses();
        showToast("Address saved successfully!", "success");
    });
}

function loadSavedAddresses() {
    const addressesList = document.getElementById("addressesList");
    const noAddresses = document.getElementById("noAddresses");
    const addresses = JSON.parse(localStorage.getItem("addresses")) || [];

    if (addresses.length === 0) {
        addressesList.innerHTML = "";
        noAddresses.classList.remove("d-none");
        return;
    }

    noAddresses.classList.add("d-none");

    addressesList.innerHTML = addresses.map(addr => `
        <div class="address-card ${addr.isDefault ? 'default' : ''}">
            ${addr.isDefault ? '<span class="default-badge">Default</span>' : ''}
            
            <h5 class="mb-2">${addr.label}</h5>
            <p class="mb-1"><strong>${addr.fullName}</strong></p>
            <p class="mb-1">${addr.phone}</p>
            <p class="mb-1">${addr.street}</p>
            <p class="mb-3">${addr.city}, ${addr.postalCode}</p>

            <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm" onclick="editAddress('${addr.id}')">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                ${!addr.isDefault ? `
                    <button class="btn btn-outline-secondary btn-sm" onclick="setDefaultAddress('${addr.id}')">
                        Set as Default
                    </button>
                ` : ''}
                <button class="btn btn-outline-danger btn-sm" onclick="deleteAddress('${addr.id}')">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join("");
}

function setDefaultAddress(id) {
    let addresses = JSON.parse(localStorage.getItem("addresses")) || [];
    addresses.forEach(addr => {
        addr.isDefault = addr.id === id;
    });
    localStorage.setItem("addresses", JSON.stringify(addresses));
    loadSavedAddresses();
    showToast("Default address updated", "success");
}

function deleteAddress(id) {
    if (!confirm("Are you sure you want to delete this address?")) return;

    let addresses = JSON.parse(localStorage.getItem("addresses")) || [];
    addresses = addresses.filter(addr => addr.id !== id);
    localStorage.setItem("addresses", JSON.stringify(addresses));
    loadSavedAddresses();
    showToast("Address deleted", "success");
}

function editAddress(id) {
    // This would open the modal with pre-filled data
    showToast("Edit functionality coming soon!", "info");
}

// =============================
// LOAD FAVORITES
// =============================
function loadFavorites() {
    const favoritesList = document.getElementById("favoritesList");
    const noFavorites = document.getElementById("noFavorites");
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {
        favoritesList.innerHTML = "";
        noFavorites.classList.remove("d-none");
        return;
    }

    noFavorites.classList.add("d-none");

    favoritesList.innerHTML = favorites.map(fav => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
                <img src="${fav.image}" class="card-img-top" alt="${fav.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h6 class="card-title">${fav.name}</h6>
                    <p class="text-primary fw-bold mb-3">$${parseFloat(fav.price).toFixed(2)}</p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-primary-custom btn-sm flex-fill" onclick="addToCartFromFavorites('${fav.id}')">
                            <i class="bi bi-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="removeFromFavorites('${fav.id}')">
                            <i class="bi bi-heart-fill"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join("");
}

function removeFromFavorites(id) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
    showToast("Removed from favorites", "success");
}

async function addToCartFromFavorites(id) {
    // Load product data
    const res = await fetch("../json/products.json");
    const products = await res.json();
    const product = products.find(p => p.id === id);

    if (product) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existing = cart.find(item => item.id === id);

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
        showToast("Added to cart!", "success");
    }
}

// =============================
// LOGOUT
// =============================
function initLogout() {
    document.getElementById("logoutBtn").addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("currentUser");
            window.location.href = "../index.html";
        }
    });
}

// =============================
// HELPER FUNCTIONS
// =============================
async function loadComponent(url, selector) {
    try {
        const res = await fetch(url);
        const html = await res.text();
        document.querySelector(selector).innerHTML = html;
    } catch (err) {
        console.error(`Failed to load ${url}:`, err);
    }
}

function showToast(message, type = "success") {
    // Create a simple toast notification
    const toast = document.createElement("div");
    toast.className = `alert alert-${type === "success" ? "success" : "danger"} position-fixed`;
    toast.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 250px;";
    toast.innerHTML = `
        <i class="bi bi-${type === "success" ? "check-circle" : "x-circle"} me-2"></i>
        ${message}
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Order actions (can be expanded)
function viewOrderDetails(orderId) {
    showToast("Order details view coming soon!", "info");
}

function reorder(orderId) {
    showToast("Reorder functionality coming soon!", "info");
}