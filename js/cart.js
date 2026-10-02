
// ================= CART =================

let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ================= DISPLAY CART =================

function displayCart() {

    const container =
        document.getElementById("cartContainer");

    if (!container) return;

    container.innerHTML = "";

    // Fix old cart data
    cart = cart.map(item => ({

        ...item,

        price: Number(item.price) || 0,

        quantity: Number(item.quantity) || 1

    }));


    if (cart.length === 0) {

        container.innerHTML = `

            <div class="empty-cart">

                <h2>🛒 Your cart is empty</h2>

                <a href="products.html">
                    Continue Shopping
                </a>

            </div>

        `;

        updateBill();

        return;
    }


    // ================= DISPLAY PRODUCTS =================

    cart.forEach((item, index) => {

        const itemTotal =
            item.price * item.quantity;


        container.innerHTML += `

            <div class="cart-item">

                <div class="cart-product">

                    <span class="cart-icon">
                        ${item.icon || "🛒"}
                    </span>

                    <div>

                        <h3>
                            ${item.name}
                        </h3>

                        <p>
                            ₹${item.price.toFixed(2)}
                            /
                            ${item.unit || "item"}
                        </p>

                    </div>

                </div>


                <div class="quantity">

                    <button
                        onclick="decreaseQuantity(${index})">

                        −

                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="increaseQuantity(${index})">

                        +

                    </button>

                </div>


                <div class="item-price">

                    ₹${itemTotal.toFixed(2)}

                </div>


                <button
                    class="remove-btn"
                    onclick="removeItem(${index})">

                    ❌ Remove

                </button>

            </div>

        `;

    });


    updateBill();

}


// ================= INCREASE =================

function increaseQuantity(index) {

    cart[index].quantity++;

    saveCart();

}


// ================= DECREASE =================

function decreaseQuantity(index) {

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    }

    else {

        cart.splice(index, 1);

    }

    saveCart();

}


// ================= REMOVE =================

function removeItem(index) {

    cart.splice(index, 1);

    saveCart();

}


// ================= SAVE =================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    displayCart();

}


// ================= BILL =================

function updateBill() {

    let subtotal = 0;


    cart.forEach(item => {

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 0;

        subtotal +=
            price * quantity;

    });


    const gst =
        subtotal * 0.05;


    const grandTotal =
        subtotal + gst;


    const subtotalElement =
        document.getElementById("subtotal");

    const gstElement =
        document.getElementById("gst");

    const grandTotalElement =
        document.getElementById("grandTotal");


    if (subtotalElement) {

        subtotalElement.textContent =
            "₹" + subtotal.toFixed(2);

    }


    if (gstElement) {

        gstElement.textContent =
            "₹" + gst.toFixed(2);

    }


    if (grandTotalElement) {

        grandTotalElement.textContent =
            "₹" + grandTotal.toFixed(2);

    }

}


// ================= PLACE ORDER =================

async function placeOrder() {

    // ================= CHECK CART =================

    if (cart.length === 0) {

        alert(
            "🛒 Your cart is empty!\n\n" +
            "Please select some products first."
        );

        return;

    }


    // ================= GET DELIVERY LOCATION =================

    const locationInput =
        document.getElementById("deliveryLocation");


    if (!locationInput) {

        alert("❌ Delivery location field not found.");

        return;

    }


    const deliveryLocation =
        locationInput.value.trim();


    if (!deliveryLocation) {

        alert("📍 Please enter your delivery location.");

        locationInput.focus();

        return;

    }


    // ================= GET CUSTOMER MOBILE =================

    const mobileInput =
        document.getElementById("customerMobile");


    if (!mobileInput) {

        alert("❌ Customer mobile number field not found.");

        return;

    }


    const customerMobile =
        mobileInput.value.trim();


    if (!/^[6-9]\d{9}$/.test(customerMobile)) {

        alert("📱 Please enter a valid 10-digit Indian mobile number.");

        mobileInput.focus();

        return;

    }


    // ================= GET LOGIN USER =================

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        alert("❌ Please login before placing an order.");

        window.location.href = "index.html";

        return;

    }


    // ================= CALCULATE BILL =================

    let subtotal = 0;


    cart.forEach(item => {

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 0;

        subtotal += price * quantity;

    });


    const gst =
        subtotal * 0.05;


    const grandTotal =
        subtotal + gst;


    // ================= USER DETAILS =================

    const username =
        localStorage.getItem("username") || "";

    const department =
        localStorage.getItem("department") || "";


    // ================= SAVE ORDER =================

    const {
        data: order,
        error: orderError
    } = await supabaseClient

        .from("orders")

        .insert({

            user_id: user.id,

            customer_name: username,

            customer_mobile: customerMobile,

            department: department,

            delivery_location: deliveryLocation,

            total_amount: grandTotal,

            status: "Placed"

        })

        .select()

        .single();


    // ================= ORDER ERROR =================

    if (orderError) {

        console.error("ORDER ERROR:", orderError);

        alert(
            "❌ Order could not be placed.\n\n" +
            orderError.message
        );

        return;

    }


    // ================= SAVE ORDER ITEMS =================

    const orderItems =
        cart.map(item => ({

            order_id: order.id,

            product_name: item.name,

            quantity: Number(item.quantity),

            price: Number(item.price)

        }));


    const {
        error: itemsError
    } = await supabaseClient

        .from("order_items")

        .insert(orderItems);


    // ================= ITEMS ERROR =================

    if (itemsError) {

        console.error("ORDER ITEMS ERROR:", itemsError);

        alert(
            "❌ Order created, but products could not be saved.\n\n" +
            itemsError.message
        );

        return;

    }


    // ================= WHATSAPP ADMIN MESSAGE =================

    const adminMessage =

        "🛒 NEW GROCERY ORDER\n\n" +

        "Order ID: " + order.id + "\n" +

        "Customer: " + username + "\n" +

        "Department: " + department + "\n" +

        "Customer Mobile: +91" + customerMobile + "\n\n" +

        "PRODUCT DETAILS:\n" +

        orderItems.map(item =>

            item.product_name +
            " x " + item.quantity +
            " = ₹" +
            (item.price * item.quantity).toFixed(2)

        ).join("\n") +

        "\n\nSubtotal: ₹" + subtotal.toFixed(2) +

        "\nGST (5%): ₹" + gst.toFixed(2) +

        "\nGrand Total: ₹" + grandTotal.toFixed(2) +

        "\n\n📍 Delivery Location:\n" + deliveryLocation +

        "\n\nStatus: Order Placed";


    // ================= WHATSAPP CUSTOMER MESSAGE =================

    const customerMessage =

        "Hi " + username + "! 😊\n\n" +

        "Your grocery order has been placed successfully! ✅\n\n" +

        "Order ID: " + order.id +

        "\nGrand Total: ₹" + grandTotal.toFixed(2) +

        "\n\nWe will update you when your order is on the way. 🚚" +

        "\n\nThank you for ordering with us!";


    // ================= STORE NOTIFICATION DETAILS =================

    sessionStorage.setItem(
        "adminMessage",
        adminMessage
    );


    sessionStorage.setItem(
        "customerMessage",
        customerMessage
    );


    sessionStorage.setItem(
        "customerMobile",
        "91" + customerMobile
    );


    sessionStorage.setItem(
        "orderId",
        String(order.id)
    );


    // ================= CLEAR CART =================

    localStorage.removeItem("cart");

    cart = [];


    // ================= OPEN WHATSAPP NOTIFICATION PAGE =================

    window.location.href = "whatsapp-notify.html";

}


// ================= PAGE LOAD =================

document.addEventListener(
    "DOMContentLoaded",
    displayCart
);
