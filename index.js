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

app.get("/test", (req, res) => {
    res.send("Hermes test OK");
});

app.post("/ask", async (req, res) => {
    try {
        const message = req.body.message;
        const lang = req.body.lang;
        const mode = req.body.mode;

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
                    ? context + "\nFormulează un răspuns natural și profesionist pentru un interviu de angajare în România. Răspunde doar cu textul final.\n\n"
                    : context + "\nFormulează un răspuns natural și profesionist pentru un interviu de angajare în Germania. Răspunde doar cu textul final.\n\n";
        } else if (mode === "email") {
            prompt =
                lang === "ro"
                    ? context + "\nTransformă textul într-un e-mail profesional în română. Răspunde doar cu e-mailul final.\n\n"
                    : context + "\nTransformă textul într-un e-mail profesional în germană. Răspunde doar cu e-mailul final.\n\n";
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
            input: prompt + message,
        });

        const translatedText = response.output_text;

        res.send(`
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <title>A.G.M. Translator - Rezultat</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <div class="container">
        <h1>🚛 A.G.M. TRANSLATOR</h1>

        <p style="font-size:18px; color:#555; margin-top:-10px; margin-bottom:25px;">
            Partenerul tău AI pentru transportul european
        </p>

        <h2 style="color:#1d4ed8;">✅ Traducerea este gata</h2>

        <div id="rezultat" style="
            padding:15px;
            border:1px solid #999;
            border-radius:8px;
            background:#f5f5f5;
            font-size:20px;
            min-height:180px;
            line-height:1.6;
            white-space:pre-wrap;
        ">${translatedText}</div>

        <br>

        <button onclick="copyResult()" style="
            padding:12px 24px;
            font-size:18px;
            background:#2e7d32;
            color:white;
            border:none;
            border-radius:8px;
            cursor:pointer;
        ">
            📋 Copiază în clipboard
        </button>

        <br><br>

        <a href="/" style="
            font-size:18px;
            text-decoration:none;
            font-weight:bold;
        ">
            ⬅️ Înapoi la traducător
        </a>
    </div>

    <script>
        function copyResult() {
            const text = document.getElementById("rezultat").innerText;
            navigator.clipboard.writeText(text);
            alert("Traducerea a fost copiată!");
        }
    </script>
</body>
</html>
        `);
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