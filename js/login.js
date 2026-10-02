
// ======================================
// GROCERY BILLING SYSTEM - LOGIN
// ======================================

async function login() {

    // Get username
    const username = document
        .getElementById("username")
        .value
        .trim()
        .toLowerCase();

    // Get password
    const password = document
        .getElementById("password")
        .value;

    // All users
    const users = {

        admin: {
            email: "admin@gmail.com",
            department: "ADMIN",
            role: "admin"
        },

        aids: {
            email: "aids@grocerybilling.com",
            department: "AIDS",
            role: "customer"
        },

        cse: {
            email: "cse@grocerybilling.com",
            department: "CSE",
            role: "customer"
        },

        ece: {
            email: "ece@grocerybilling.com",
            department: "ECE",
            role: "customer"
        },

        it: {
            email: "it@grocerybilling.com",
            department: "IT",
            role: "customer"
        }

    };

    // Clear old message
    const message = document.getElementById("message");
    message.innerHTML = "";

    // Check username
    if (!users[username]) {
        message.innerHTML = "❌ Invalid Username";
        return;
    }

    // Check password
    if (!password) {
        message.innerHTML = "❌ Please enter your password";
        return;
    }

    const userDetails = users[username];

    // Supabase login
    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: userDetails.email,
            password: password
        });

    // Check login error
    if (error) {
        console.error("LOGIN ERROR:", error);
        message.innerHTML = "❌ " + error.message;
        return;
    }

    // ==================================
    // ADMIN ROLE VERIFICATION
    // ==================================

    if (userDetails.role === "admin") {

        const { data: roleData, error: roleError } =
            await supabaseClient
                .from("user_roles")
                .select("role")
                .eq("user_id", data.user.id)
                .maybeSingle();

        if (roleError || !roleData || roleData.role !== "admin") {

            console.error("Admin verification failed:", roleError);

            await supabaseClient.auth.signOut();

            message.innerHTML =
                "❌ Admin access verification failed.";

            return;
        }

    }

    // ==================================
    // SAVE LOGIN INFORMATION
    // ==================================

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("username", username);
    localStorage.setItem("department", userDetails.department);

    console.log("Login successful:", data.user.email);

    // ==================================
    // REDIRECT BASED ON USER TYPE
    // ==================================

    if (userDetails.role === "admin") {

        alert("Admin Login Successful!");

        window.location.href = "admin.html";

    } else {

        alert(
            "Login Successful!\n\n" +
            "Department: " +
            userDetails.department
        );

        window.location.href = "products.html";

    }

}
