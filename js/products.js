// ================= PRODUCT LIST =================

const products = [
    {
        id: 1,
        name: "Apple",
        price: 180,
        unit: "kg",
        icon: "🍎"
    },
    {
        id: 2,
        name: "Banana",
        price: 60,
        unit: "dozen",
        icon: "🍌"
    },
    {
        id: 3,
        name: "Tomato",
        price: 40,
        unit: "kg",
        icon: "🍅"
    },
    {
        id: 4,
        name: "Onion",
        price: 35,
        unit: "kg",
        icon: "🧅"
    },
    {
        id: 5,
        name: "Potato",
        price: 30,
        unit: "kg",
        icon: "🥔"
    },
    {
        id: 7,
        name: "Ladies Finger",
        price: 45,
        unit: "kg",
        icon: "🥒"
    },
    {
        id: 8,
        name: "Brinjal",
        price: 55,
        unit: "kg",
        icon: "🍆"
    },
    {
        id: 9,
        name: "Spinach",
        price: 25,
        unit: "bunch",
        icon: "🥬"
    },
    {
        id: 10,
        name: "Coriander Leaves",
        price: 20,
        unit: "bunch",
        icon: "🌿"
    },
    {
        id: 11,
        name: "Mint Leaves",
        price: 20,
        unit: "bunch",
        icon: "🌿"
    },
    {
        id: 12,
        name: "Cabbage",
        price: 40,
        unit: "kg",
        icon: "🥬"
    },
    {
        id: 13,
        name: "Cauliflower",
        price: 50,
        unit: "piece",
        icon: "🥦"
    },
    {
        id: 14,
        name: "Beans",
        price: 70,
        unit: "kg",
        icon: "🫘"
    }
];

// ================= DISPLAY PRODUCTS =================

function displayProducts(productList = products) {

    const container = document.getElementById("productContainer");

    if (!container) return;

    container.innerHTML = "";

    if (productList.length === 0) {
        container.innerHTML = `
            <h3 style="text-align:center;">
                ❌ Product not found
            </h3>
        `;
        return;
    }

    productList.forEach(product => {

        container.innerHTML += `
            <div class="product-card">

                <div class="product-icon">
                    ${product.icon}
                </div>

                <h3>${product.name}</h3>

                <p class="price">
                    ₹${product.price.toFixed(2)}
                </p>

                <p class="unit">
                    / ${product.unit}
                </p>

                <button onclick="addToCart(${product.id})">
                    + Add to cart
                </button>

            </div>
        `;
    });
}


// ================= ADD TO CART =================

function addToCart(productId) {

    const product = products.find(p => p.id === productId);

    if (!product) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item.id === productId);

    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            unit: product.unit,
            icon: product.icon,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // ❌ NO ALERT
    // Directly update cart count
    updateCartCount();
}


// ================= SEARCH =================

function searchProducts() {

    const input = document.getElementById("searchInput");

    if (!input) return;

    const searchText = input.value.toLowerCase().trim();

    const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchText)
    );

    displayProducts(filtered);
}


// ================= CART COUNT =================

function updateCartCount() {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const count = cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );

    const cartCount = document.getElementById("cartCount");
    const cartCountBottom = document.getElementById("cartCountBottom");

    if (cartCount) {
        cartCount.textContent = count;
    }

    if (cartCountBottom) {
        cartCountBottom.textContent = count;
    }
}


// ================= PAGE LOAD =================

document.addEventListener("DOMContentLoaded", function () {

    displayProducts();

    updateCartCount();

});