
const myEventsList = document.getElementById("myEventsList");

async function loadMyEvents() {

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        myEventsList.textContent = "Please log in.";
        return;
    }

    const { data, error } = await supabaseClient
        .from("event_registrations")
        .select(`
            id,
            registered_at,
            events (
                id,
                event_name,
                location,
                event_date,
                start_time
            )
        `)
        .eq("user_id", userData.user.id);

    if (error) {
        myEventsList.textContent = error.message;
        alert(error.message);
        return;
    }
    alert("You have successfully registered!");
    if (typeof updateNotificationCount === "function") {
        await updateNotificationCount();
    }


    myEventsList.replaceChildren();

    if (data.length === 0) {
        myEventsList.textContent =
            "You haven't registered for any events yet.";
        return;
    }

    data.forEach(function(registration) {

        const event = registration.events;

        if (!event) return;

        const card = document.createElement("div");
        card.className = "event-card";
if (event.image_url) {

    const image = document.createElement("img");

    image.src = event.image_url;

    image.alt = event.event_name;

    image.className = "event-image";

    image.loading = "lazy";

    card.appendChild(image);

}

const category = document.createElement("p");

category.className = "event-category";

category.textContent =
    getCategoryIcon(event.category) + " " +
    (event.category || "Other");

card.appendChild(category);
        const title = document.createElement("h3");
        title.textContent = event.event_name;

        const location = document.createElement("p");
        location.textContent = "Location: " + event.location;

        const date = document.createElement("p");
        date.textContent = "Date: " + event.event_date;

        const time = document.createElement("p");
        time.textContent = "Time: " + event.start_time;

        const viewButton = document.createElement("button");
        viewButton.textContent = "View Event";

        viewButton.addEventListener("click", function() {
            window.location.href =
                "event-details.html?id=" + event.id;
        });

        card.append(title, location, date, time, viewButton);

        myEventsList.appendChild(card);

    });

}

loadMyEvents();
