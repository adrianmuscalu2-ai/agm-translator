
function openProfile() {
    document.getElementById("profileName").value = localStorage.getItem("profileName") || "";
    document.getElementById("profileCompany").value = localStorage.getItem("profileCompany") || "";
    document.getElementById("profileEmail").value = localStorage.getItem("profileEmail") || "";
    document.getElementById("profilePhone").value = localStorage.getItem("profilePhone") || "";
    document.getElementById("profileAddress").value = localStorage.getItem("profileAddress") || "";
    document.getElementById("profileWebsite").value = localStorage.getItem("profileWebsite") || "";
    document.getElementById("profileSignature").value = localStorage.getItem("profileSignature") || "";

    document.getElementById("profileModal").style.display = "block";
}


function saveProfile() {
    const name = document.getElementById("profileName").value;
    const company = document.getElementById("profileCompany").value;
    const email = document.getElementById("profileEmail").value;
    const phone = document.getElementById("profilePhone").value;
    const address = document.getElementById("profileAddress").value;
    const website = document.getElementById("profileWebsite").value;
    const signature = document.getElementById("profileSignature").value;
    localStorage.setItem("profileName", name);
    localStorage.setItem("profileCompany", company);
    localStorage.setItem("profileEmail", email);
    localStorage.setItem("profilePhone", phone);
    localStorage.setItem("profileAddress", address);
    localStorage.setItem("profileWebsite", website);
    localStorage.setItem("profileSignature", signature);
    alert("Profil salvat!");
    closeProfile();
}

function closeProfile() {
    document.getElementById("profileModal").style.display = "none";
}



    function startDictation() {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Browserul nu suportă recunoașterea vocală.");
        return;
    }

    const recognition = new SpeechRecognition();
    const direction = document.querySelector('input[name="lang"]:checked').value;

    if (direction === "de") {
        recognition.lang = "ro-RO";
    } else {
        recognition.lang = "de-DE";
    }

    alert("Dictare activă în: " + recognition.lang);

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function(event) {
        document.querySelector("textarea[name='message']").value =
            event.results[0][0].transcript;
    };

    recognition.onerror = function(event) {
        alert("Eroare microfon: " + event.error);
    };

    recognition.start();
}

function clearMessage() {
    document.querySelector("textarea[name='message']").value = "";
}
async function speakText() {
  const textarea = document.querySelector('textarea[name="message"]');
  const text = textarea.value;

  if (!text.trim()) {
    alert("Nu există niciun text de redat.");
    return;
  }

  const direction = document.querySelector('input[name="lang"]:checked').value;
  const lang = direction === "de" ? "ro" : "de";
const loading = document.getElementById("loading");
loading.innerText = "🔊 Se generează vocea...";
loading.style.display = "block";
  const response = await fetch("/speak", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
      lang: lang,
    }),
  });

  if (!response.ok) {
    alert("Eroare la generarea vocii.");
    return;
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  await audio.play();
  loading.style.display = "none";
}



async function speakResult() {
  const result = document.getElementById("result");

  if (!result || !result.value.trim()) {
    alert("Nu există nicio traducere.");
    return;
  }

  const direction = document.querySelector('input[name="lang"]:checked').value;
  const lang = direction === "de" ? "de" : "ro";
const loading = document.getElementById("loading");
loading.innerText = "🔊 Se generează vocea...";
loading.style.display = "block";
  const response = await fetch("/speak", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: result.value,
      lang: lang,
    }),
  });

  if (!response.ok) {
    alert("Eroare la generarea vocii.");
    return;
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  await audio.play();
  loading.style.display = "none";
}



async function correctText() {
    const textarea = document.querySelector("textarea[name='message']");
    const text = textarea.value;
    if (!text.trim()) {
    alert("Scrie mai întâi un mesaj.");
    return;
}
   document.getElementById("loading").style.display = "block";
    const formData = new FormData();
    formData.append("message", text);
const mode = document.querySelector('input[name="mode"]:checked').value;
const lang = document.querySelector('input[name="lang"]:checked').value;
formData.append("lang", lang);
formData.append("mode", mode);
    const response = await fetch("/correct", {
        method: "POST",
        body: new URLSearchParams(formData)
    });
try {
    const correctedText = await response.text();
    document.getElementById("result").value = correctedText;
} finally {
    document.getElementById("loading").style.display = "none";
}
}
async function improveText() {
    
    const textarea = document.querySelector("textarea[name='message']");
    const text = textarea.value;
    if (!text.trim()) {
  alert("Scrie mai întâi un mesaj.");
  return;
}
    document.getElementById("loading").style.display = "block";

    const formData = new FormData();
    formData.append("message", text);
const mode = document.querySelector('input[name="mode"]:checked').value;
const lang = document.querySelector('input[name="lang"]:checked').value;
formData.append("mode", mode);
formData.append("lang", lang);
    const response = await fetch("/improve", {
        method: "POST",
        body: new URLSearchParams(formData)
    });

    try {
        const improvedText = await response.text();
        document.getElementById("result").value = improvedText;
        saveHistory();
    } finally {
        document.getElementById("loading").style.display = "none";
    }
}


document.getElementById("translateForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    document.getElementById("loading").style.display = "block";

    const response = await fetch("/ask", {
        method: "POST",
        body: new URLSearchParams(formData)
    });

    const translatedText = await response.text();

    document.getElementById("result").value = translatedText;
    
    document.getElementById("loading").style.display = "none";
})
;function saveHistory() {
    const original = document.querySelector('textarea[name="message"]').value;
    const translated = document.getElementById("result").value;

    if (!original || !translated) return;

    localStorage.getItem("agmHistory")

    history.unshift({
        date: new Date().toLocaleString(),
        original,
        translated
    });

    if (history.length > 20) {
        history = history.slice(0, 20);
    }

    localStorage.setItem("agmHistory", JSON.stringify(history));

    showHistory();
}





function showHistory() {
    const historyList = document.getElementById("historyList");
    const history = JSON.parse(localStorage.getItem("agmHistory") || "[]");

    if (!history.length) {
        historyList.innerHTML = "Nu există mesaje salvate.";
        return;
    }

    historyList.innerHTML = history.map((item, index) => `
    <div style="border-bottom:1px solid #ddd; padding:10px 0;">
        <strong>${item.date}</strong><br>
        <b>Original:</b><br>${item.original}<br>
        <b>Traducere:</b><br>${item.translated}
        <br><br>
        <button type="button" onclick="deleteHistoryItem(${index})">
            🗑️ Șterge
        </button>
    </div>
`).join("");
}
function saveHistory() {
    const original = document.querySelector('textarea[name="message"]').value.trim();
    const translated = document.getElementById("result").value.trim();

    if (!original || !translated) return;

    let history;

try {
    history = JSON.parse(localStorage.getItem("agmHistory") || "[]");
} catch (e) {
    history = [];
}

if (!Array.isArray(history)) {
    history = [];
}

    

    history.unshift({
        date: new Date().toLocaleString(),
        original: original,
        translated: translated
    });

    history = history.slice(0, 20);

    localStorage.setItem("agmHistory", JSON.stringify(history));
    showHistory();
}

function showHistory() {
    const historyList = document.getElementById("historyList");
    if (!historyList) return;

    let history = JSON.parse(localStorage.getItem("agmHistory") || "[]");

    if (!Array.isArray(history)) {
        history = [];
    }

    if (!history.length) {
        historyList.innerHTML = "Nu există mesaje salvate.";
        return;
    }

    historyList.innerHTML = history.map((item, index) => `
    <div style="border-bottom:1px solid #ddd; padding:10px 0;">
        <strong>${item.date}</strong><br>
        <b>Original:</b><br>${item.original}<br>
        <b>Traducere:</b><br>${item.translated}
        <br><br>
        <button type="button" onclick="deleteHistoryItem(${index})">
            🗑️ Șterge
        </button>
    </div>
`).join("");
}function deleteHistoryItem(index) {
    let history = JSON.parse(localStorage.getItem("agmHistory") || "[]");

    if (!Array.isArray(history)) {
        history = [];
    }

    history.splice(index, 1);

    localStorage.setItem("agmHistory", JSON.stringify(history));
    showHistory();
}
