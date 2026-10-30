
const notificationCount =
    document.getElementById("notificationCount");

async function updateNotificationCount() {

    if (!notificationCount) return;

    // Hide the counter until we know the result
    notificationCount.hidden = true;

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) return;

    const { count, error } = await supabaseClient
        .from("notifications")
        .select("id", {
            count: "exact",
            head: true
        })
        .eq("user_id", userData.user.id)
        .eq("is_read", false);

    if (error) {
        console.error(error.message);
        return;
    }

    if (count > 0) {

        notificationCount.textContent = count;

        notificationCount.hidden = false;

    } else {

        notificationCount.textContent = "";

        notificationCount.hidden = true;

    }

}

updateNotificationCount();
