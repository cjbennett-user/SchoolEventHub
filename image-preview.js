
const eventImage = document.getElementById("eventImage");

const imagePreview = document.getElementById("imagePreview");

if (eventImage && imagePreview) {

    eventImage.addEventListener("change", function() {

        const file = eventImage.files[0];

        imagePreview.hidden = true;

        imagePreview.removeAttribute("src");

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {

            alert("Please choose a JPG, PNG or WebP image.");

            eventImage.value = "";

            return;
        }

        if (file.size > 5 * 1024 * 1024) {

            alert("Your image must be smaller than 5 MB.");

            eventImage.value = "";

            return;
        }

        imagePreview.src = URL.createObjectURL(file);

        imagePreview.hidden = false;

    });

}
