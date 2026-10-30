
const pastEventsList =
    document.getElementById("pastEventsList");

const eventsStatus =
    document.getElementById("eventsStatus");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

let allPastEvents = [];


// LOAD PAST EVENTS

async function loadPastEvents() {

    eventsStatus.textContent = "Loading past events...";

    const { data, error } = await supabaseClient
        .from("events")
        .select("*")
        .lt("event_date", getLocalDate())
        .order("event_date", { ascending: false });

    if (error) {

        console.error("Past events error:", error);

        eventsStatus.textContent =
            "Unable to load past events. Please try again.";

        return;

    }

    allPastEvents = data || [];

    displayPastEvents(filterPastEvents());

}


// FILTER PAST EVENTS

function filterPastEvents() {

    const searchTerm =
        searchInput.value.trim().toLowerCase();

    const selectedCategory =
        categoryFilter.value;

    return allPastEvents.filter(function(event) {

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
            (event.category || "Other") === selectedCategory;

        return matchesSearch && matchesCategory;

    });

}


// DISPLAY PAST EVENTS

function displayPastEvents(events) {

    pastEventsList.replaceChildren();

    if (events.length === 0) {

        eventsStatus.textContent =
            allPastEvents.length === 0
                ? "There are no past events yet."
                : "No past events match your search.";

        return;

    }

    eventsStatus.textContent =
        `Showing ${events.length} past event(s).`;

    events.forEach(function(event) {

        const card = document.createElement("article");

        card.className = "event-card";


        // EVENT IMAGE

        if (event.image_url) {

            const image = document.createElement("img");

            image.src = event.image_url;

            image.alt = event.event_name;

            image.className = "event-image";

            image.loading = "lazy";

            card.appendChild(image);

        }


        // CATEGORY

        const category = document.createElement("p");

        category.className = "event-category";

        category.textContent =
            getCategoryIcon(event.category) + " " +
            (event.category || "Other");

        card.appendChild(category);


        // TITLE

        const title = document.createElement("h3");

        title.textContent = event.event_name;

        card.appendChild(title);


        // DESCRIPTION

        const description = document.createElement("p");

        description.textContent =
            event.description || "No description available.";

        card.appendChild(description);


        // LOCATION

        const location = document.createElement("p");

        location.textContent = "📍 " + event.location;

        card.appendChild(location);


        // DATE

        const date = document.createElement("p");

        date.textContent = "📅 " + event.event_date;

        card.appendChild(date);


        // TIME

        const time = document.createElement("p");

        time.textContent = "🕒 " +
            (event.start_time || "Time not specified");

        card.appendChild(time);


        // PAST EVENT LABEL

        const pastLabel = document.createElement("span");

        pastLabel.className = "past-event-label";

        pastLabel.textContent = "Event completed";

        card.appendChild(pastLabel);


        // VIEW DETAILS BUTTON

        const detailsButton =
            document.createElement("button");

        detailsButton.textContent = "View Event Details";

        detailsButton.addEventListener("click", function() {

            window.location.href =
                "event-details.html?id=" +
                encodeURIComponent(event.id);

        });

        card.appendChild(detailsButton);

        pastEventsList.appendChild(card);

    });

}


// SEARCH

searchInput.addEventListener("input", function() {

    displayPastEvents(filterPastEvents());

});


// CATEGORY FILTER

categoryFilter.addEventListener("change", function() {

    displayPastEvents(filterPastEvents());

});


// START

loadPastEvents();
