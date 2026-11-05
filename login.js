
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("message");

    message.textContent = "Logging in...";

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {

        message.textContent = error.message;

        return;
    }

    // Confirm that a session was actually created

    if (!data.session) {

        message.textContent =
            "Login did not create a session. Check your email confirmation settings.";

        return;
    }

    message.textContent = "Login successful!";

    // Give the browser a moment to save the session

    setTimeout(function() {

        window.location.href = "index.html";

    }, 1000);

});
