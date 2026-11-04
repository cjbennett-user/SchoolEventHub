

// PAGE ELEMENTS

const eventDetails = document.getElementById("eventDetails");

const registrationButton =
    document.getElementById("registrationButton");

const registrationMessage =
    document.getElementById("registrationMessage");

const editButton =
    document.getElementById("editButton");


// GET EVENT ID FROM URL

const params = new URLSearchParams(window.location.search);

const eventId = params.get("id");


// VARIABLES

let currentEvent = null;

let currentUser = null;

let isRegistered = false;

let isPastEvent = false;



// DISPLAY EVENT INFORMATION


function displayEventInformation(event) {

    eventDetails.replaceChildren();


    // EVENT IMAGE

    if (event.image_url) {

        const image = document.createElement("img");

        image.src = event.image_url;

        image.alt = event.event_name;

        image.className = "event-image";

        image.style.width = "100%";

        image.style.maxHeight = "350px";

        image.style.objectFit = "cover";

        image.style.borderRadius = "15px";

        eventDetails.appendChild(image);

    }


    // CATEGORY

    const category = document.createElement("p");

    category.className = "event-category";

    category.textContent =
        getCategoryIcon(event.category) + " " +
        (event.category || "Other");

    eventDetails.appendChild(category);


    // TITLE

    const title = document.createElement("h2");

    title.textContent = event.event_name;

    eventDetails.appendChild(title);


    // DESCRIPTION

    const description = document.createElement("p");

    description.textContent =
        event.description || "No description provided.";

    eventDetails.appendChild(description);


    // LOCATION

    const location = document.createElement("p");

    location.textContent =
        "📍 Location: " + (event.location || "Not specified");

    eventDetails.appendChild(location);


    // DATE

    const date = document.createElement("p");

    date.textContent = "📅 Date: " + event.event_date;

    eventDetails.appendChild(date);


    // START TIME

    const time = document.createElement("p");

    time.textContent =
        "🕒 Start time: " +
        (event.start_time || "Not specified");

    eventDetails.appendChild(time);


    // END TIME

    const endTime = document.createElement("p");

    endTime.textContent = event.end_time
        ? "End time: " + event.end_time
        : "End time: Not specified";

    eventDetails.appendChild(endTime);


    // PAST EVENT LABEL

    if (isPastEvent) {

        const pastLabel = document.createElement("p");

        pastLabel.className = "past-event-label";

        pastLabel.textContent = "Event completed";

        eventDetails.appendChild(pastLabel);

    }

}


// LOAD EVENT

async function loadEventDetails() {

    eventDetails.textContent = "Loading event...";


    // CHECK EVENT ID

    if (!eventId) {

        eventDetails.textContent =
            "No event was selected.";

        return;

    }


    // CHECK LOGIN

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {

        eventDetails.textContent =
            "Please log in to view this event.";

        return;

    }

    currentUser = userData.user;


    // GET EVENT FROM SUPABASE

    const { data, error } = await supabaseClient

        .from("events")

        .select("*")

        .eq("id", eventId)

        .single();


    if (error) {

        console.error("Event loading error:", error);

        eventDetails.textContent =
            "Could not load this event.";

        return;

    }


    currentEvent = data;


    // CHECK WHETHER EVENT IS IN THE PAST

    isPastEvent =
        data.event_date < getLocalDate();


    // DISPLAY EVENT

    displayEventInformation(data);


    // CHECK EVENT OWNER

    if (data.created_by === currentUser.id) {

        editButton.hidden = false;

    } else {

        editButton.hidden = true;

    }


    // PAST EVENTS CANNOT BE REGISTERED FOR

    if (isPastEvent) {

        registrationButton.disabled = true;

        registrationButton.textContent =
            "Registration Closed";

        registrationButton.hidden = false;

        registrationMessage.textContent =
            "This event has already taken place.";

        return;

    }


    // CHECK REGISTRATION STATUS

    await checkRegistration();

}



// CHECK REGISTRATION


async function checkRegistration() {

    const { data, error } = await supabaseClient

        .from("event_registrations")

        .select("id")

        .eq("event_id", eventId)

        .eq("user_id", currentUser.id)

        .maybeSingle();


    if (error) {

        registrationMessage.textContent = error.message;

        return;

    }


    isRegistered = !!data;

    registrationButton.hidden = false;

    registrationButton.disabled = false;

    registrationButton.textContent = isRegistered

        ? "Cancel Registration"

        : "Register for Event";

}


// REGISTER OR CANCEL REGISTRATION


registrationButton.addEventListener(
    "click",
    async function() {

        if (!currentUser || !currentEvent) {

            return;

        }


        // EXTRA PAST EVENT CHECK

        if (isPastEvent) {

            registrationMessage.textContent =
                "Registration for this event has closed.";

            return;

        }


        registrationButton.disabled = true;

        registrationMessage.textContent =
            "Please wait...";


        // CANCEL REGISTRATION

        if (isRegistered) {

            const { error } = await supabaseClient

                .from("event_registrations")

                .delete()

                .eq("event_id", eventId)

                .eq("user_id", currentUser.id);


            if (error) {

                registrationMessage.textContent =
                    error.message;

                registrationButton.disabled = false;

                return;

            }


            registrationMessage.textContent =
                "Your registration has been cancelled.";

        }


        // REGISTER FOR EVENT

        else {

            const { error } = await supabaseClient

                .from("event_registrations")

                .insert({

                    event_id: currentEvent.id,

                    user_id: currentUser.id

                });


            if (error) {

                registrationMessage.textContent =
                    error.message;

                registrationButton.disabled = false;

                return;

            }


            registrationMessage.textContent =
                "You have successfully registered for this event!";


            // REFRESH NOTIFICATION COUNTER

            if (
                typeof updateNotificationCount === "function"
            ) {

                await updateNotificationCount();

            }

        }


        // REFRESH REGISTRATION STATUS

        await checkRegistration();

    }
);

// EDIT EVENT


editButton.addEventListener("click", function() {

    if (!currentEvent || isPastEvent) {

        return;

    }

    window.location.href =
        "edit-event.html?id=" +
        encodeURIComponent(eventId);

});

// START PAGE


loadEventDetails().catch(function(error) {

    console.error("Unexpected event page error:", error);

    eventDetails.textContent =
        "Something went wrong while loading this event.";

});
