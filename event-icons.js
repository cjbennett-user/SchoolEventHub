
function getCategoryIcon(category) {

    const icons = {
        Music: "🎵",
        Science: "🔬",
        Sports: "🏆",
        Arts: "🎨",
        Academic: "🎓",
        Social: "👥",
        Technology: "💻",
        Health: "🩺",
        Fundraising: "💰",
        Other: "📅"
    };

    return icons[category] || "📅";

}
