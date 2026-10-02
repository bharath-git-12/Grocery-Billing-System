
// =====================================
// GROCERY BILLING SYSTEM - ADMIN PANEL
// =====================================

let allOrders = [];

// Available order statuses
const ORDER_STATUSES = [
    "Placed",
    "Confirmed",
    "Preparing",
    "Out for Delivery",
    "Delivered",
    "Cancelled"
];

// Safely display text in HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char];
    });
}

// Display messages
function showMessage(message, type = "success") {
    const box = document.getElementById("messageBox");

    box.textContent = message;
    box.className = "message " + type;
    box.style.display = "block";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Check Admin login and role
async function checkAdminAccess() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        alert("Please login first.");
        window.location.href = "index.html";
        return false;
    }

    const user = data.user;

    const { data: roleData, error: roleError } =
        await supabaseClient
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();

    if (roleError) {
        console.error("Role check error:", roleError);
        alert("Unable to verify Admin access. Please contact support.");
        window.location.href = "index.html";
        return false;
    }

    if (!roleData || roleData.role !== "admin") {
        alert("Access denied. Admin only.");
        window.location.href = "products.html";
        return false;
    }

    return true;
}

// Load all orders and their products
async function loadOrders() {
    const loading = document.getElementById("loadingMessage");
    const table = document.getElementById("ordersTable");
    const empty = document.getElementById("emptyMessage");

    loading.style.display = "block";
    loading.textContent = "Loading orders...";
    table.style.display = "none";
    empty.style.display = "none";

    const { data: orders, error: orderError } =
        await supabaseClient
            .from("orders")
            .select(`
                id,
                customer_name,
                customer_mobile,
                department,
                delivery_location,
                total_amount,
                status,
                created_at
            `)
            .order("created_at", { ascending: false });

    if (orderError) {
        console.error("Orders error:", orderError);
        loading.textContent = "Unable to load orders: " + orderError.message;
        return;
    }

    allOrders = orders || [];

    // Load order items for all returned orders
    if (allOrders.length > 0) {
        const orderIds = allOrders.map(order => order.id);

        const { data: items, error: itemsError } =
            await supabaseClient
                .from("order_items")
                .select("id, order_id, product_name, quantity, price")
                .in("order_id", orderIds);

        if (itemsError) {
            console.error("Order items error:", itemsError);
            loading.textContent =
                "Orders loaded, but product details could not be loaded: " +
                itemsError.message;
            return;
        }

        allOrders.forEach(order => {
            order.items = (items || []).filter(
                item => String(item.order_id) === String(order.id)
            );
        });
    }

    loading.style.display = "none";

    updateDashboardStats();
    applyFilters();
}

// Update dashboard statistics
function updateDashboardStats() {
    const total = allOrders.length;

    const placed = allOrders.filter(
        order => order.status === "Placed"
    ).length;

    const delivered = allOrders.filter(
        order => order.status === "Delivered"
    ).length;

    const sales = allOrders
        .filter(order => order.status !== "Cancelled")
        .reduce(
            (sum, order) => sum + Number(order.total_amount || 0),
            0
        );

    document.getElementById("totalOrders").textContent = total;
    document.getElementById("placedOrders").textContent = placed;
    document.getElementById("deliveredOrders").textContent = delivered;

    document.getElementById("totalSales").textContent =
        "₹" + sales.toFixed(2);
}

// Display product details
function getProductsHTML(items) {
    if (!items || items.length === 0) {
        return "No product details";
    }

    return items.map(item => `
        <div style="margin-bottom:7px;">
            <strong>${escapeHTML(item.product_name)}</strong><br>
            Qty: ${escapeHTML(item.quantity)}
            × ₹${Number(item.price || 0).toFixed(2)}
        </div>
    `).join("");
}

// Prepare WhatsApp message
function getWhatsAppURL(order) {
    let phone = String(order.customer_mobile || "")
        .replace(/\D/g, "");

    if (phone.length === 10) {
        phone = "91" + phone;
    }

    if (!/^\d{12}$/.test(phone)) {
        return "";
    }

    const message =
        "Hello " + (order.customer_name || "Customer") + ",\n\n" +
        "Your Grocery Order #" + order.id + " status has been updated.\n" +
        "New Status: " + order.status + "\n" +
        "Total Amount: ₹" + Number(order.total_amount || 0).toFixed(2) +
        "\n\nThank you for shopping with us!";

    return "https://wa.me/" + phone +
        "?text=" + encodeURIComponent(message);
}

// Display orders in table
function displayOrders(orders) {
    const table = document.getElementById("ordersTable");
    const body = document.getElementById("ordersBody");
    const empty = document.getElementById("emptyMessage");

    body.innerHTML = "";

    if (orders.length === 0) {
        table.style.display = "none";
        empty.style.display = "block";
        return;
    }

    empty.style.display = "none";
    table.style.display = "table";

    orders.forEach(order => {
        const options = ORDER_STATUSES.map(status => `
            <option value="${escapeHTML(status)}"
                ${order.status === status ? "selected" : ""}>
                ${escapeHTML(status)}
            </option>
        `).join("");

        const whatsappURL = getWhatsAppURL(order);

        const whatsappHTML = whatsappURL
            ? `<a class="whatsapp-btn"
                  href="${whatsappURL}"
                  target="_blank"
                  rel="noopener noreferrer">
                  Send WhatsApp
               </a>`
            : `<span>Mobile number unavailable</span>`;

        const date = order.created_at
            ? new Date(order.created_at).toLocaleString("en-IN")
            : "Not available";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>#${escapeHTML(order.id)}</td>

            <td>
                <strong>${escapeHTML(order.customer_name)}</strong><br>
                Mobile: ${escapeHTML(order.customer_mobile || "Not available")}<br>
                Department: ${escapeHTML(order.department || "-")}
            </td>

            <td>${escapeHTML(order.delivery_location || "-")}</td>

            <td>${getProductsHTML(order.items)}</td>

            <td>
                <strong>₹${Number(order.total_amount || 0).toFixed(2)}</strong>
            </td>

            <td>${escapeHTML(date)}</td>

            <td>
                <select class="status-select"
                    data-order-id="${escapeHTML(order.id)}">
                    ${options}
                </select>
            </td>

            <td>${whatsappHTML}</td>
        `;

        body.appendChild(row);
    });
}

// Search and filter orders
function applyFilters() {
    const search = document.getElementById("searchInput")
        .value.trim().toLowerCase();

    const selectedStatus =
        document.getElementById("statusFilter").value;

    const filteredOrders = allOrders.filter(order => {
        const matchesSearch =
            String(order.id).toLowerCase().includes(search) ||
            String(order.customer_name || "").toLowerCase().includes(search) ||
            String(order.customer_mobile || "").includes(search);

        const matchesStatus =
            selectedStatus === "All" ||
            order.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    displayOrders(filteredOrders);
}

// Save updated status in Supabase
async function updateOrderStatus(orderId, newStatus, selectElement) {
    const order = allOrders.find(
        item => String(item.id) === String(orderId)
    );

    if (!order) {
        showMessage("Order not found.", "error");
        return;
    }

    const oldStatus = order.status;

    if (oldStatus === newStatus) {
        return;
    }

    if (!ORDER_STATUSES.includes(newStatus)) {
        showMessage("Invalid order status.", "error");
        selectElement.value = oldStatus;
        return;
    }

    selectElement.disabled = true;

    const { error } = await supabaseClient
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

    selectElement.disabled = false;

    if (error) {
        console.error("Status update error:", error);
        selectElement.value = oldStatus;
        showMessage("Status update failed: " + error.message, "error");
        return;
    }

    order.status = newStatus;

    updateDashboardStats();
    applyFilters();

    showMessage(
        "Order #" + orderId + " status updated to " + newStatus +
        ". Use Send WhatsApp to notify the customer."
    );
}

// Event listeners
document.getElementById("searchInput")
    .addEventListener("input", applyFilters);

document.getElementById("statusFilter")
    .addEventListener("change", applyFilters);

document.getElementById("refreshBtn")
    .addEventListener("click", loadOrders);

document.getElementById("ordersBody")
    .addEventListener("change", function (event) {
        if (event.target.classList.contains("status-select")) {
            const orderId = event.target.dataset.orderId;
            const newStatus = event.target.value;

            updateOrderStatus(orderId, newStatus, event.target);
        }
    });

// Admin logout
document.getElementById("logoutBtn")
    .addEventListener("click", async function () {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            showMessage("Logout failed: " + error.message, "error");
            return;
        }

        localStorage.removeItem("loggedIn");
        localStorage.removeItem("username");
        localStorage.removeItem("department");

        window.location.href = "index.html";
    });

// Start dashboard
document.addEventListener("DOMContentLoaded", async function () {
    const isAdmin = await checkAdminAccess();

    if (isAdmin) {
        await loadOrders();
    }
});
