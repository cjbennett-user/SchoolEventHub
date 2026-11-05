
const editEventForm = document.getElementById("editEventForm");
const message = document.getElementById("message");

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

let originalEvent = null;

setupTimePicker("startTime", true);
setupTimePicker("endTime", true);


// LOAD EXISTING EVENT

async function loadEvent() {

    if (!eventId) {
        message.textContent = "No event selected.";
        editEventForm.hidden = true;
        return;
    }

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        message.textContent = "Please log in.";
        editEventForm.hidden = true;
        return;
    }

    const { data, error } = await supabaseClient
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

    if (error) {
        message.textContent = error.message;
        editEventForm.hidden = true;
        return;
    }
    document.getElementById("category").value =
    data.category || "Other";

    document.getElementById("eventDate").min =
    getLocalDate();

    // Check event ownership

    if (data.created_by !== userData.user.id) {
        message.textContent = "You cannot edit this event.";
        editEventForm.hidden = true;
        return;
    }

    originalEvent = data;

    // Fill in the form

    document.getElementById("eventName").value =
        data.event_name;

    document.getElementById("description").value =
        data.description || "";

    document.getElementById("location").value =
        data.location;

    document.getElementById("eventDate").value =
        data.event_date;

    setTimePickerValue("startTime", data.start_time);
    setTimePickerValue("endTime", data.end_time);

}


// SAVE CHANGES

editEventForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    if (!originalEvent) return;

    const eventName =
        document.getElementById("eventName").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const location =
        document.getElementById("location").value.trim();

    const eventDate =
        document.getElementById("eventDate").value;

    const startTime =
        getTimePickerValue("startTime");

    const endTime =
        getTimePickerValue("endTime");

    if (!startTime || !endTime) {
        message.textContent =
            "Please choose both a start time and an end time.";
        return;
    }

    if (endTime <= startTime) {
        message.textContent =
            "End time must be later than start time.";
        return;
    }
    if (eventDate < getLocalDate()) {

    message.textContent =
        "Please choose today or a future date.";

    return;

}

    message.textContent = "Saving changes...";

    const { error } = await supabaseClient
        .from("events")
        .update({
            event_name: eventName,
            description: description,
            category: document.getElementById("category").value,
            location: location,
            event_date: eventDate,
            start_time: startTime,
            end_time: endTime
        })
        .eq("id", eventId);

    if (error) {
        message.textContent = error.message;
        return;
    }

    message.textContent = "Event updated successfully!";

    setTimeout(function() {

        window.location.href =
            "event-details.html?id=" + eventId;

    }, 1000);

});


// START

loadEvent();
