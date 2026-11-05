
const upcomingEvents =
    document.getElementById("upcomingEvents");

function formatEventTime(time) {
    if (!time) return "Time not specified";

    const match = time.match(/^(\d{1,2}):(\d{2})/);

    if (!match) return time;

    const hours = Number(match[1]);
    const minutes = match[2];

    if (hours > 23) return time;

    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${minutes} ${period}`;
}

async function loadDashboard() {

    // GET CURRENT USER

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        return;
    }

    const user = userData.user;

    loadDashboardStatistics(user);

    const [profileResult, eventsResult] = await Promise.all([
        supabaseClient
            .from("profiles")
            .select("display_name")
            .eq("user_id", user.id)
            .maybeSingle(),
        supabaseClient
            .from("events")
            .select("id, event_name, description, category, image_url, location, event_date, start_time")
            .gte("event_date", getLocalDate())
            .order("event_date", { ascending: true })
            .limit(6)
    ]);

    if (profileResult.error) {
        console.error("Profile loading error:", profileResult.error.message);
    }

    const welcomeMessage =
        document.getElementById("welcomeMessage");

    welcomeMessage.textContent =
        "Welcome back, " +
        (profileResult.data?.display_name ||
         user.user_metadata?.username ||
         user.email.split("@")[0]) + "!";

    if (eventsResult.error) {

        upcomingEvents.textContent =
            "Unable to load upcoming events.";

        console.error(eventsResult.error.message);

        return;
    }

    const events = eventsResult.data;

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
    image.decoding = "async";

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
            "🕒 " + formatEventTime(event.start_time);

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

async function loadDashboardStatistics(user) {
    const results = await Promise.all([
        supabaseClient
            .from("events")
            .select("id", { count: "exact", head: true })
            .gte("event_date", getLocalDate()),
        supabaseClient
            .from("event_registrations")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
        supabaseClient
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_read", false)
    ]);

    const [eventResult, registrationResult, notificationResult] = results;

    if (eventResult.error) {
        console.error("Event count error:", eventResult.error.message);
    } else {
        document.getElementById("totalEvents").textContent =
            eventResult.count;
    }

    if (registrationResult.error) {
        console.error("Registration count error:", registrationResult.error.message);
    } else {
        document.getElementById("myRegistrations").textContent =
            registrationResult.count;
    }

    if (notificationResult.error) {
        console.error("Notification count error:", notificationResult.error.message);
    } else {
        document.getElementById("unreadNotifications").textContent =
            notificationResult.count;
    }
}

loadDashboard();
