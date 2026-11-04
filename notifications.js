
const notificationsList =
    document.getElementById("notificationsList");

async function loadNotifications() {

    const { data, error } = await supabaseClient
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        notificationsList.textContent = error.message;
        return;
    }
    if (typeof updateNotificationCount === "function") {

    await updateNotificationCount();

}

    notificationsList.replaceChildren();

    if (data.length === 0) {
        notificationsList.textContent =
            "You don't have any notifications yet.";
        return;
    }

    data.forEach(function(notification) {

        const card = document.createElement("div");
        card.className = "event-card";

        const message = document.createElement("p");
        message.textContent = notification.message;

        const date = document.createElement("small");

        date.textContent = new Date(
            notification.created_at
        ).toLocaleString();

        card.append(message, date);

        if (!notification.is_read) {

            const unread = document.createElement("strong");
            unread.textContent = "   New notification    ";

            const readButton = document.createElement("button");

            readButton.textContent = "Mark as Read";

            readButton.addEventListener("click", async function() {

                const { error } = await supabaseClient
                    .from("notifications")
                    .update({ is_read: true })
                    .eq("id", notification.id);

                if (error) {
                    alert(error.message);
                    return;
                }

                loadNotifications();

            });

            card.append(unread, readButton);

        } else {

            const read = document.createElement("small");
            read.textContent = "Read";

            card.append(read);

        }

        notificationsList.appendChild(card);

    });

}

loadNotifications();
