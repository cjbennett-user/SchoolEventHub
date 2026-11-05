function setupTimePicker(name, required) {
    const picker = document.getElementById(name + "Picker");
    const legend = picker.querySelector("legend");
    const label = legend.textContent.trim().toLowerCase();
    const controls = document.createElement("div");
    controls.className = "time-picker-controls";

    const hour = document.createElement("select");
    hour.id = name + "Hour";
    hour.setAttribute("aria-label", label + " hour");
    hour.required = required;

    if (!required) {
        hour.add(new Option("—", ""));
    } else {
        hour.add(new Option("Hour", "", true, true));
    }

    for (let value = 1; value <= 12; value += 1) {
        hour.add(new Option(String(value), String(value)));
    }

    const minute = document.createElement("select");
    minute.id = name + "Minute";
    minute.setAttribute("aria-label", label + " minutes");
    minute.required = required;

    if (required) {
        minute.add(new Option("Minute", "", true, true));
    }

    for (let value = 0; value < 60; value += 1) {
        const minuteValue = String(value).padStart(2, "0");
        minute.add(new Option(minuteValue, minuteValue));
    }

    const period = document.createElement("select");
    period.id = name + "Period";
    period.setAttribute("aria-label", label + " AM or PM");
    period.required = required;

    if (required) {
        period.add(new Option("AM/PM", "", true, true));
    }

    period.add(new Option("AM", "AM"));
    period.add(new Option("PM", "PM"));

    addTimeControl(controls, "Hour", hour);
    addTimeControl(controls, "Minute", minute);
    addTimeControl(controls, "AM/PM", period);
    picker.appendChild(controls);

}

function addTimeControl(container, labelText, select) {
    const label = document.createElement("label");
    label.className = "time-picker-field";
    label.textContent = labelText;
    label.appendChild(select);
    container.appendChild(label);
}

function getTimePickerValue(name) {
    const hour = document.getElementById(name + "Hour").value;
    const minute = document.getElementById(name + "Minute").value;
    const period = document.getElementById(name + "Period").value;

    if (!hour) {
        return null;
    }

    if (!minute || !period) {
        return null;
    }

    let hours = Number(hour) % 12;

    if (period === "PM") {
        hours += 12;
    }

    return String(hours).padStart(2, "0") + ":" + minute;
}

function setTimePickerValue(name, time) {
    const hourSelect = document.getElementById(name + "Hour");
    const minuteSelect = document.getElementById(name + "Minute");
    const periodSelect = document.getElementById(name + "Period");

    if (!time) {
        hourSelect.value = "";
        hourSelect.dispatchEvent(new Event("change"));
        return;
    }

    const match = time.match(/^(\d{1,2}):(\d{2})/);

    if (!match) {
        return;
    }

    let hours = Number(match[1]);
    let minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) {
        return;
    }

    const isPm = hours >= 12;
    hourSelect.value = String(hours % 12 || 12);
    minuteSelect.value = String(minutes).padStart(2, "0");
    periodSelect.value = isPm ? "PM" : "AM";

    if (hourSelect.value) {
        minuteSelect.disabled = false;
        periodSelect.disabled = false;
    }
}
