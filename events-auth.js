
const logoutButton = document.getElementById("logoutButton");

// Check whether the user is logged in

async function checkLogin() {

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {
        console.error("Session error:", error.message);
        return false;
    }

    // No session means the user is not logged in

    if (!data.session) {
        window.location.replace("login.html");
        return false;
    }

    console.log("User is logged in!");

    return true;
}

// Only attach the logout event if the button exists

if (logoutButton) {

    logoutButton.addEventListener("click", async function() {

        const { error } =
            await supabaseClient.auth.signOut();

        if (error) {
            alert(error.message);
            return;
        }

        window.location.replace("login.html");

    });

}

// Check the login session

checkLogin();
