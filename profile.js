
const profileForm =
    document.getElementById("profileForm");

const profileImage =
    document.getElementById("profileImage");

const profileInitial =
    document.getElementById("profileInitial");

const profileMessage =
    document.getElementById("profileMessage");

let currentUser = null;
let currentAvatarUrl = null;


// LOAD PROFILE

async function loadProfile() {

    const { data, error } =
        await supabaseClient.auth.getUser();

    if (error || !data.user) {

        profileMessage.textContent = "Please log in.";

        profileForm.hidden = true;

        return;

    }

    currentUser = data.user;

    document.getElementById("profileEmail").textContent =
        currentUser.email;

    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("user_id", currentUser.id)
            .maybeSingle();

    if (profileError) {

        profileMessage.textContent = profileError.message;

        return;

    }

    const displayName =
        profile?.display_name ||
        currentUser.user_metadata?.username ||
        currentUser.email.split("@")[0];

    document.getElementById("displayName").value =
        displayName;

    currentAvatarUrl = profile?.avatar_url || null;

    if (currentAvatarUrl) {

        profileImage.src = currentAvatarUrl;

        profileImage.hidden = false;

        profileInitial.hidden = true;

    } else {

        profileInitial.textContent =
            displayName.charAt(0).toUpperCase();

        profileInitial.hidden = false;

        profileImage.hidden = true;

    }

}


// SAVE PROFILE

profileForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    if (!currentUser) return;

    const displayName =
        document.getElementById("displayName")
        .value.trim();

    const imageFile =
        document.getElementById("profilePicture")
        .files[0];

    if (!displayName) {

        profileMessage.textContent =
            "Please enter a display name.";

        return;

    }

    if (displayName.length > 60) {

        profileMessage.textContent =
            "Display name is too long.";

        return;

    }

    profileMessage.textContent = "Saving profile...";

    let avatarUrl = currentAvatarUrl;


    // UPLOAD NEW PROFILE PICTURE

    if (imageFile) {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(imageFile.type)) {

            profileMessage.textContent =
                "Please choose a JPG, PNG or WebP image.";

            return;

        }

        if (imageFile.size > 3 * 1024 * 1024) {

            profileMessage.textContent =
                "Image must be smaller than 3 MB.";

            return;

        }

        const extension =
            imageFile.type === "image/jpeg" ? "jpg" :
            imageFile.type === "image/png" ? "png" : "webp";

        const filePath =
            currentUser.id + "/" +
            crypto.randomUUID() + "." + extension;

        const { error: uploadError } =
            await supabaseClient.storage
                .from("profile-images")
                .upload(filePath, imageFile, {
                    contentType: imageFile.type,
                    upsert: false
                });

        if (uploadError) {

            profileMessage.textContent =
                uploadError.message;

            return;

        }

        const { data: imageData } =
            supabaseClient.storage
                .from("profile-images")
                .getPublicUrl(filePath);

        avatarUrl = imageData.publicUrl;

    }


    // SAVE PROFILE INFORMATION

    const { error } = await supabaseClient
        .from("profiles")
        .upsert({

            user_id: currentUser.id,

            display_name: displayName,

            avatar_url: avatarUrl

        }, {
            onConflict: "user_id"
        });

    if (error) {

        profileMessage.textContent = error.message;

        return;

    }

    currentAvatarUrl = avatarUrl;

    // UPDATE THE DISPLAY

    if (avatarUrl) {

        profileImage.src = avatarUrl;

        profileImage.hidden = false;

        profileInitial.hidden = true;

    } else {

        profileInitial.textContent =
            displayName.charAt(0).toUpperCase();

        profileInitial.hidden = false;

    }

    profileMessage.textContent =
        "Your profile has been saved successfully!";

});


// START

loadProfile();
