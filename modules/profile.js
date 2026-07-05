// ==============================
// A.G.M. Assistant
// Modul: Profil utilizator
// ==============================

const PROFILE_KEY = "agm_profile";

function saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function loadProfile() {
    const data = localStorage.getItem(PROFILE_KEY);

    if (!data) {
        return null;
    }

    return JSON.parse(data);
}

function clearProfile() {
    localStorage.removeItem(PROFILE_KEY);
}