
const notificationsList =
    document.getElementById("notificationsList");

const registeredEventsList =
    document.getElementById("registeredEventsList");

async function loadNotifications() {

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        registeredEventsList.textContent = "Please log in.";
        notificationsList.textContent = "Please log in.";
        return;
    }

    const [registrationsResult, notificationsResult] = await Promise.all([
        supabaseClient
            .from("event_registrations")
            .select(`
                events (
                    id,
                    event_name,
                    description,
                    category,
                    image_url,
                    location,
                    event_date,
                    start_time
                )
            `)
            .eq("user_id", userData.user.id),
        supabaseClient
            .from("notifications")
            .select("id, message, created_at, is_read")
            .eq("user_id", userData.user.id)
            .order("created_at", { ascending: false })
    ]);

    if (registrationsResult.error) {
        registeredEventsList.textContent =
            registrationsResult.error.message;
        console.error("RSVP event loading error:", registrationsResult.error);
        return;
    }

    registeredEventsList.replaceChildren();

    const registeredEvents = (registrationsResult.data || [])
        .map(function(registration) {
            return registration.events;
        })
        .filter(Boolean)
        .sort(function(first, second) {
            return first.event_date.localeCompare(second.event_date);
        });

    if (registeredEvents.length === 0) {
        registeredEventsList.textContent =
            "You haven't RSVP'd to any events yet.";
    }

    registeredEvents.forEach(function(event) {

        const card = document.createElement("article");
        card.className = "event-card";

        if (event.image_url) {
            const image = document.createElement("img");
            image.src = event.image_url;
            image.alt = event.event_name;
            image.className = "event-image";
            image.loading = "lazy";
            image.decoding = "async";
            card.appendChild(image);
        }

        const category = document.createElement("p");
        category.className = "event-category";
        category.textContent =
            getCategoryIcon(event.category) + " " +
            (event.category || "Other");

        const title = document.createElement("h3");
        title.textContent = event.event_name;

        const description = document.createElement("p");
        description.textContent =
            event.description || "No description available.";

        const location = document.createElement("p");
        location.textContent =
            "📍 " + (event.location || "Location not specified");

        const date = document.createElement("p");
        date.textContent = "📅 " + event.event_date;

        const time = document.createElement("p");
        time.textContent =
            "🕒 " + (event.start_time || "Time not specified");

        const rsvpButton = document.createElement("button");
        rsvpButton.textContent = "Open Event";
        rsvpButton.className = "rsvp-button";
        rsvpButton.addEventListener("click", function() {
            window.location.href =
                "event-details.html?id=" +
                encodeURIComponent(event.id);
        });

        card.append(
            category,
            title,
            description,
            location,
            date,
            time,
            rsvpButton
        );

        registeredEventsList.appendChild(card);

    });

    if (notificationsResult.error) {
        notificationsList.textContent = notificationsResult.error.message;
        return;
    }

    notificationsList.replaceChildren();

    if (notificationsResult.data.length === 0) {
        notificationsList.textContent =
            "You don't have any notifications yet.";
        return;
    }

    notificationsResult.data.forEach(function(notification) {

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
                    .eq("id", notification.id)
                    .eq("user_id", userData.user.id);

                if (error) {
                    alert(error.message);
                    return;
                }

                loadNotifications();

            });

            card.append(unread, readButton);

        } else {

            const read = document.createElement("small");
            read.textContent = "  Read";

            card.append(read);

        }

        notificationsList.appendChild(card);

    });

}

loadNotifications();
