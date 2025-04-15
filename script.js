// Cart management
let cart = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
    
    // Initialize any product card functionality
    setupProductCards();
});

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('fashionHubCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('Error loading cart:', e);
            cart = [];
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('fashionHubCart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count in UI
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = count;
        if (count > 0) {
            element.classList.remove('d-none');
        } else {
            element.classList.add('d-none');
        }
    });
}

// Add product to cart
function addToCart(productId, name, price, image) {
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    saveCart();
    
    // Show toast notification
    showToast(`${name} added to cart!`);
}

// Remove product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Update product quantity in cart
function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart();
        }
    }
    
    updateCartUI();
}

// Setup product cards event listeners
function setupProductCards() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = parseInt(this.getAttribute('data-product-id'));
            const productName = this.getAttribute('data-product-name');
            const productPrice = parseFloat(this.getAttribute('data-product-price'));
            const productImage = this.getAttribute('data-product-image');
            
            addToCart(productId, productName, productPrice, productImage);
        });
    });
}

// Update cart UI when on cart page
function updateCartUI() {
    const cartContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartActions = document.getElementById('cart-actions');
    
    if (!cartContainer) return; // Not on cart page
    
    // Clear cart container
    cartContainer.innerHTML = '';
    
    if (cart.length === 0) {
        if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
        if (cartActions) cartActions.classList.add('d-none');
        if (cartTotal) cartTotal.textContent = '0.00';
        return;
    }
    
    // Show cart items
    if (emptyCartMessage) emptyCartMessage.classList.add('d-none');
    if (cartActions) cartActions.classList.remove('d-none');
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) cartTotal.textContent = total.toFixed(2);
    
    // Render cart items
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'card mb-3';
        itemElement.innerHTML = `
            <div class="row g-0">
                <div class="col-md-2 col-3">
                    <div class="img-container bg-light d-flex align-items-center justify-content-center p-2" style="height: 100%;">
                        <svg class="bd-placeholder-img" width="100%" height="60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${item.name}" preserveAspectRatio="xMidYMid slice" focusable="false">
                            <title>${item.name}</title>
                            <rect width="100%" height="100%" fill="#868e96"></rect>
                            <text x="50%" y="50%" fill="#dee2e6" dy=".3em">${item.name[0]}</text>
                        </svg>
                    </div>
                </div>
                <div class="col-md-10 col-9">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <h5 class="card-title">${item.name}</h5>
                            <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                        <p class="card-text">$${item.price.toFixed(2)}</p>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-secondary" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-secondary" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            <div class="ms-auto">
                                <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        cartContainer.appendChild(itemElement);
    });
}

// Share cart via WhatsApp
function shareCartViaWhatsApp() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    let message = 'My Order from The Fashion Hub:\n\n';
    
    cart.forEach(item => {
        message += `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\nTotal: $${total.toFixed(2)}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// Clear cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        updateCartUI();
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed bottom-0 end-0 m-3';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    
    bsToast.show();
    
    // Remove toast from DOM after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toast);
    });
}
