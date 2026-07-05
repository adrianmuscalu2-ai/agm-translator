require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 4569;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// ... celelalte require-uri

const SAFETY_RULES = `
IMPORTANT:
- Nu inventa nume, prenume, companii sau date personale.
- Nu adăuga semnături.
- Nu folosi placeholdere precum:
  [Name]
  [Ihr Name]
  [Numele dumneavoastră]
  [Semnătura]
- Nu adăuga informații care nu există în mesaj.
- Răspunde numai cu textul final.
`;


app.get("/test", (req, res) => {
    res.send("Hermes test OK");
});

app.post("/ask", async (req, res) => {

    try {
const message = req.body.message;
if (!message || !message.trim()) {
    return res.send("Scrie mai întâi un mesaj.");
}
const lang = req.body.lang;
const mode = req.body.mode;

console.log("A INTRAT IN /ASK");
console.log(req.body);
console.log("LANG =", lang);
console.log("MODE =", mode);
console.log("MESAJ =", message);
const userSignature = req.body.profileSignature || "";
        console.log("LANG =", lang);
        console.log("MODE =", mode);

        let context = "";
let prompt = "";

if (mode === "interview") {
  context = "Context: interviu de angajare.";
}

if (mode === "email") {
  context = "Context: email profesional.";
}

if (mode === "transport") {
  context = "Context: transport rutier european.";
}
        if (mode === "interview") {
            prompt =
                lang === "ro"
    ? context + "\nFormulează un răspuns natural și profesionist în limba română. Nu adăuga nume, semnături sau placeholdere. Răspunde doar cu textul final.\n"
    : context + "\nTradu textul în limba germană. Răspunde EXCLUSIV în limba germană. Nu păstra niciun cuvânt în română. Nu adăuga nume, semnături sau placeholdere. Răspunde doar cu textul final.\n";
        } else if (mode === "email") {
            prompt =
                lang === "ro"
                    ? context + "\nTransformă textul într-un e-mail profesional în română. Răspunde doar cu e-mailul final.\n\nNu folosi [Numele utilizatorului]. Încheie doar cu Cu stimă."
                    : context + "\nTransformă textul într-un e-mail profesional în germană. Răspunde doar cu e-mailul final.\n\nNu folosi [Ihr Name] sau [Name des Nutzers]. Încheie doar cu Mit freundlichen Grüßen.";
        } else if (mode === "transport") {
            prompt =
                lang === "ro"
                    ? context + "\nAcționezi ca un expert în transport rutier internațional. Reformulează și traduce mesajul în română, clar, natural și profesionist. Răspunde doar cu textul final.\n\n"
                    : context + "\nAct as an expert in international road transport. Rewrite and translate the message into German, clearly, naturally and professionally. Reply only with the final text.\n\n";
        } else {
            prompt =
                lang === "ro"
                    ? "Tradu textul în română, clar și natural. Răspunde doar cu traducerea.\n\n"
                    : "Tradu textul în germană, natural și politicos. Răspunde doar cu traducerea.\n\n";
        }

     
const response = await client.responses.create({
  model: "gpt-4.1-mini",
  input:
    prompt +
    "\n\nMesaj:\n" +
    message
});


let translatedText = response.output_text;
translatedText = translatedText
    .replace(/\[Ihr Name\]/gi, "")
    .replace(/\[Name des Nutzers\]/gi, "")
    .replace(/\[Numele utilizatorului\]/gi, "")
    .replace(/\[Numele Dumneavoastră\]/gi, "")
    .replace(/\[Numele dumneavoastră\]/gi, "")
    .replace(/\[Name\]/gi, "")
    .replace(/\[Semnătura\]/gi, "")
    .trim();

res.send(translatedText);
    } catch (err) {
        console.error(err);
        res.send("Eroare la conectarea cu OpenAI.");
    }
});

app.post("/correct", async (req, res) => {
    try {
        const message = req.body.message || "";

        const response = await client.responses.create({
            model: "gpt-4.1-mini",
            input:
                "Corectează textul următor în limba română. " +
                "Corectează ortografia, diacriticele și punctuația. " +
                "Nu schimba sensul mesajului. Nu adăuga explicații. " +
                "Răspunde doar cu textul corectat.\n\n" +
                message,
        });
        
        res.send(response.output_text);
    } catch (err) {
        console.error(err);
        res.status(500).send("Eroare la corectare.");
    }
});
app.post("/improve", async (req, res) => {
  try {
    const message = req.body.message || "";
 const mode = req.body.mode || "interview"; 
  let context = "";

if (mode === "interview") {
  context = "Context: interviu de angajare. Textul trebuie să sune politicos, clar și potrivit pentru un angajator.";
}

if (mode === "email") {
  context = "Context: email profesional. Textul trebuie să fie structurat, respectuos și potrivit pentru comunicare scrisă.";
}

if (mode === "transport") {
  context = "Context: transport european. Textul trebuie să fie clar, practic și potrivit pentru șoferi, dispeceri, rampe, încărcare și descărcare.";
} 
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
      ${context}
Reformulează următorul mesaj într-un stil profesionist și natural.
Corectează ortografia, gramatica și punctuația.
Păstrează sensul mesajului.
Nu adăuga informații noi.
Răspunde doar cu textul îmbunătățit.

Mesaj:
${message}`,
    });

    res.send(response.output_text);
  } catch (err) {
    console.error(err);
    res.status(500).send("Eroare la îmbunătățire.");
  }
});
app.listen(port, () => {
    console.log("Hermes ruleaza pe portul " + port);
});