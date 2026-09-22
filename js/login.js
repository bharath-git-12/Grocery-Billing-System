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

    // Department users
    const users = {

        aids: {
            email: "aids@grocerybilling.com",
            department: "AIDS"
        },

        cse: {
            email: "cse@grocerybilling.com",
            department: "CSE"
        },

        ece: {
            email: "ece@grocerybilling.com",
            department: "ECE"
        },

        it: {
            email: "it@grocerybilling.com",
            department: "IT"
        }

    };


    // Clear old message
    document.getElementById("message").innerHTML = "";


    // Check username
    if (!users[username]) {

        document.getElementById("message").innerHTML =
            "❌ Invalid Username";

        return;
    }


    // Get user details
    const email = users[username].email;
    const department = users[username].department;


    // Check password empty
    if (!password) {

        document.getElementById("message").innerHTML =
            "❌ Please enter your password";

        return;
    }


    // Login using Supabase Authentication
    const { data, error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,
            password: password

        });


    // Check login error
    if (error) {

        console.error(
            "SUPABASE LOGIN ERROR:",
            error
        );

        document.getElementById("message").innerHTML =
            "❌ " + error.message;

        return;
    }


    // Login successful
    console.log(
        "Login successful:",
        data.user.email
    );


    // Save login information
    localStorage.setItem(
        "loggedIn",
        "true"
    );

    localStorage.setItem(
        "username",
        username
    );

    localStorage.setItem(
        "department",
        department
    );


    // Success message
    alert(
        "Login Successful!\n\n" +
        "Department: " +
        department
    );


    // Go to products page
    window.location.href = "products.html";
}