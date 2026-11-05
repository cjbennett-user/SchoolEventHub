
const eventsList = document.getElementById("eventsList");

const searchInput = document.getElementById("searchInput");

let allEvents = [];
let currentUser = null;
//allEvents = data || [];


// LOAD EVENTS FROM SUPABASE

async function loadEvents() {


    eventsList.textContent = "Loading events...";

    const [eventsResult, userResult] = await Promise.all([
        supabaseClient
            .from("events")
            .select("id, event_name, description, category, image_url, location, event_date, start_time, created_by")
            .gte("event_date", getLocalDate())
            .order("event_date", { ascending: true }),
        supabaseClient.auth.getUser()
    ]);

    if (eventsResult.error) {

        eventsList.textContent = eventsResult.error.message;

        return;
    }

    allEvents = eventsResult.data;

    currentUser = userResult.data.user;

    displayEvents(allEvents, userResult.data.user);
}


// DISPLAY EVENTS

function displayEvents(events, currentUser) {


    eventsList.replaceChildren();

    if (events.length === 0) {

        eventsList.textContent = "No events found.";

        return;
    }

    events.forEach(function(event) {

        const card = document.createElement("div");

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

        const title = document.createElement("h3");
        title.textContent = event.event_name;

        const description = document.createElement("p");
        description.textContent = event.description || "";

        const category = document.createElement("p");
        

category.className = "event-category";

category.textContent =
    getCategoryIcon(event.category) + " " +
    (event.category || "Other");

        const location = document.createElement("p");
        location.textContent = "Location: " + event.location;

        const date = document.createElement("p");
        date.textContent = "Date: " + event.event_date;

        const time = document.createElement("p");
        time.textContent = "Start time: " + event.start_time;

        const detailsButton = document.createElement("button");

detailsButton.textContent = "View Event";

detailsButton.addEventListener("click", function() {

    window.location.href =
        "event-details.html?id=" + event.id;

});
        card.append(
    title,
    description,
    category,
    location,
    date,
    time,
    detailsButton
);
        

        // Only show management buttons to the creator

        if (currentUser &&
            currentUser.id === event.created_by) {

            const editButton = document.createElement("button");

            editButton.textContent = "Edit Event";

            editButton.addEventListener("click", function() {

    window.location.href =
        "edit-event.html?id=" + event.id;

});
            
const deleteButton = document.createElement("button");

deleteButton.textContent = "Delete Event";

deleteButton.className = "delete-button";

deleteButton.addEventListener("click", function() {

    // First click: request confirmation

    if (deleteButton.dataset.confirming !== "true") {

        deleteButton.dataset.confirming = "true";

        deleteButton.textContent = "Confirm Delete?";

        deleteButton.classList.add("delete-confirm");

        cancelDeleteButton.hidden = false;

        return;

    }

    // Second click: perform deletion

    deleteEvent(event.id);

});

const cancelDeleteButton =
    document.createElement("button");

cancelDeleteButton.textContent = "Cancel";

cancelDeleteButton.className = "cancel-delete-button";

cancelDeleteButton.hidden = true;

cancelDeleteButton.addEventListener("click", function() {

    deleteButton.dataset.confirming = "false";

    deleteButton.textContent = "Delete Event";

    deleteButton.classList.remove("delete-confirm");

    cancelDeleteButton.hidden = true;

});

card.append(deleteButton, cancelDeleteButton);

            card.append(editButton, deleteButton);
        }

        eventsList.appendChild(card);

    });

}


// SEARCH EVENTS

document.getElementById("searchInput")
    .addEventListener("input", function() {

        const filteredEvents = filterEvents(allEvents);

        displayEvents(filteredEvents, currentUser);

    });
function filterEvents(events) {

    const searchTerm =
        document.getElementById("searchInput")
        .value.trim().toLowerCase();

    const selectedCategory =
        document.getElementById("categoryFilter").value;

    return events.filter(function(event) {

        const searchableText = [
            event.event_name,
            event.description,
            event.location,
            event.category
        ].join(" ").toLowerCase();

        const matchesSearch =
            searchableText.includes(searchTerm);

        const matchesCategory =
            !selectedCategory ||
            event.category === selectedCategory;

        return matchesSearch && matchesCategory;

    });

}
document.getElementById("categoryFilter")
    .addEventListener("change", function() {

        displayEvents(filterEvents(allEvents), currentUser);

    });




// DELETE EVENTS

async function deleteEvent(eventId) {

    const confirmed = confirm(
        "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    const { error } = await supabaseClient
        .from("events")
        .delete()
        .eq("id", eventId);

    if (error) {

        alert(error.message);

        return;
    }

    alert("Event deleted successfully!");

    loadEvents();

}


// START THE PAGE

loadEvents();
