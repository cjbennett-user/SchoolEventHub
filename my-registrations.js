const myEventsList = document.getElementById("myEventsList");

async function loadMyEvents() {

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        myEventsList.textContent = "Please log in.";
        return;
    }

    const { data: events, error } = await supabaseClient
        .from("events")
        .select("id, event_name, description, category, image_url, location, event_date, start_time")
        .eq("created_by", userData.user.id)
        .order("event_date", { ascending: true });

    if (error) {
        myEventsList.textContent = error.message;
        console.error("Created events loading error:", error);
        return;
    }

    myEventsList.replaceChildren();

    if (events.length === 0) {
        myEventsList.textContent =
            "You haven't created any events yet.";
        return;
    }

    events.forEach(function(event) {

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

        const viewButton = document.createElement("button");
        viewButton.textContent = "View Event";
        viewButton.addEventListener("click", function() {
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
            viewButton
        );

        if (event.event_date >= getLocalDate()) {
            const editButton = document.createElement("button");
            editButton.textContent = "Edit Event";
            editButton.addEventListener("click", function() {
                window.location.href =
                    "edit-event.html?id=" +
                    encodeURIComponent(event.id);
            });
            card.appendChild(editButton);
        }

        myEventsList.appendChild(card);

    });

}

loadMyEvents();
