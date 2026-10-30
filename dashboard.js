
const upcomingEvents =
    document.getElementById("upcomingEvents");

async function loadDashboard() {

    // GET CURRENT USER

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        return;
    }

    const user = userData.user;

    // PERSONAL WELCOME MESSAGE

    const welcomeMessage =
        document.getElementById("welcomeMessage");

    welcomeMessage.textContent =
        "Welcome back, " +
        (user.user_metadata?.username ||
         user.email.split("@")[0]) + "!";


    // COUNT ALL EVENTS

    const { count: eventCount, error: eventError } =
        await supabaseClient
            .from("events")
            .select("*", { count: "exact", head: true });

    if (eventError) {
        console.error(eventError.message);
    } else {
        document.getElementById("totalEvents").textContent =
            eventCount;
    }


    // COUNT USER REGISTRATIONS

    const { count: registrationCount, error: registrationError } =
        await supabaseClient
            .from("event_registrations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

    if (registrationError) {
        console.error(registrationError.message);
    } else {
        document.getElementById("myRegistrations").textContent =
            registrationCount;
    }


    // COUNT UNREAD NOTIFICATIONS

    const { count: unreadCount, error: notificationError } =
        await supabaseClient
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

    if (notificationError) {
        console.error(notificationError.message);
    } else {
        document.getElementById("unreadNotifications").textContent =
            unreadCount;
    }


    // LOAD UPCOMING EVENTS

    const today = new Date().toLocaleDateString("en-CA");

    const { data: events, error: eventsError } =
        await supabaseClient
            .from("events")
            .select("*")
            .gte("event_date", getLocalDate())
            .order("event_date", { ascending: true })
            .limit(6);

    if (eventsError) {

        upcomingEvents.textContent =
            "Unable to load upcoming events.";

        console.error(eventsError.message);

        return;
    }

    upcomingEvents.replaceChildren();

    if (events.length === 0) {

        upcomingEvents.textContent =
            "There are currently no upcoming events.";

        return;
    }


    // DISPLAY EVENT CARDS

    events.forEach(function(event) {

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

        const title = document.createElement("h3");
        title.textContent = event.event_name;

        const description = document.createElement("p");
        description.textContent =
            event.description || "Join us for this school event!";
        
        const category = document.createElement("p");

        category.className = "event-category";

category.textContent =
    getCategoryIcon(event.category) + " " +
    (event.category || "Other");    
        const location = document.createElement("p");
        location.textContent =
            "📍 " + event.location;

        const date = document.createElement("p");
        date.textContent =
            "📅 " + event.event_date;

        const time = document.createElement("p");
        time.textContent =
            "🕒 " + event.start_time;

        const button = document.createElement("button");

        button.textContent = "View Event";

        button.addEventListener("click", function() {

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
            button
        );

        upcomingEvents.appendChild(card);

    });

}

loadDashboard();
