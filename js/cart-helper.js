// ===== Cart Helper Functions =====

// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    // Trigger custom event to update cart count in header
    document.dispatchEvent(new Event("cartUpdated"));
}

// Add item to cart
function addToCart(product) {
    const cart = getCart();

    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        // Increase quantity
        existingItem.quantity = (parseInt(existingItem.quantity) || 1) + 1;
    } else {
        // Add new item with quantity 1
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart(cart);
    console.log("✅ Added to cart:", product.name);
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    console.log("🗑️ Removed from cart:", productId);
}

// Update item quantity
function updateCartQuantity(productId, newQuantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);

    if (item) {
        const quantity = parseInt(newQuantity);
        if (quantity > 0) {
            item.quantity = quantity;
            saveCart(cart);
            console.log("🔄 Updated quantity:", productId, "->", quantity);
        } else {
            // Remove item if quantity is 0 or less
            removeFromCart(productId);
        }
    }
}

// Clear entire cart
function clearCart() {
    localStorage.setItem("cart", "[]");
    document.dispatchEvent(new Event("cartUpdated"));
    console.log("🗑️ Cart cleared");
}

// Get total cart count
function getCartCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
}

// Get cart total price
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return sum + (price * quantity);
    }, 0);
}
