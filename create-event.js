
const eventForm = document.getElementById("eventForm");
const eventDateInput =
    document.getElementById("eventDate");

setupTimePicker("startTime", true);
setupTimePicker("endTime", true);

// Get today's date using the user's local timezone

function getLocalDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Prevent selecting a past date

eventDateInput.min = getLocalDate();
eventForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const message = document.getElementById("message");

    message.textContent = "Saving event...";

    // Get the logged-in user

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        message.textContent = "Please log in first.";
        return;
    }

    // Collect event information

    const eventName =
        document.getElementById("eventName").value.trim();

    const description =
        document.getElementById("description").value.trim();

    const category =
    document.getElementById("category").value;

    
let imageUrl = null;

const imageFile =
    document.getElementById("eventImage").files[0];

if (imageFile) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(imageFile.type)) {
        message.textContent = "Invalid image type.";
        return;
    }

    if (imageFile.size > 5 * 1024 * 1024) {
        message.textContent = "Image must be under 5 MB.";
        return;
    }

    const extension =
        imageFile.type === "image/jpeg" ? "jpg" :
        imageFile.type === "image/png" ? "png" : "webp";

    const filePath =
        userData.user.id + "/" +
        crypto.randomUUID() + "." + extension;

    const { error: uploadError } = await supabaseClient
        .storage
        .from("event-images")
        .upload(filePath, imageFile, {
            contentType: imageFile.type,
            upsert: false
        });

    if (uploadError) {
        message.textContent = uploadError.message;
        return;
    }

    const { data: imageData } = supabaseClient
        .storage
        .from("event-images")
        .getPublicUrl(filePath);

    imageUrl = imageData.publicUrl;

}


    const location =
        document.getElementById("location").value.trim();

    const eventDate =
        document.getElementById("eventDate").value;

    const startTime =
        getTimePickerValue("startTime");

    const endTime =
        getTimePickerValue("endTime");

    // Validate the time

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
    // validate the date
    if (eventDate < getLocalDate()) {

    message.textContent =
        "You cannot create an event in the past.";

    return;

}

    // Save event to Supabase

    const { data, error } = await supabaseClient
        .from("events")
        .insert([
            {
                event_name: eventName,
                description: description,
                category: category,
                image_url: imageUrl,
                location: location,
                event_date: eventDate,
                start_time: startTime,
                end_time: endTime,
                created_by: userData.user.id
            }
        ])
        .select();

    if (error) {

        message.textContent = error.message;

        return;
    }

    message.textContent = "Event created successfully!";

const newEvent = data[0];

// Redirect to the newly created event

setTimeout(function() {

    window.location.href =
        "event-details.html?id=" + newEvent.id;

}, 1000);
});
