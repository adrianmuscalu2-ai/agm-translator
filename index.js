const express = require("express");
require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 4569;

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <h1>TEST HERMES 999</h1>
    <p>AI Translator for Drivers</p>
    <p><i>Scrie ce vrei să spui la interviu. Hermes traduce politicos și natural.</i></p>
<h2>Direcția traducerii</h2>

    <form method="POST" action="/ask">
      <textarea name="message" rows="6" cols="60"></textarea>
      <br><br>
      <label>
  <input type="radio" name="lang" value="de" checked>
  Română → Germană
</label>

<br>

<label>
  <input type="radio" name="lang" value="ro">
  Germană → Română
</label>
<b>Mod:</b><br>

<label>
<input type="radio" name="mode" value="translate" checked>
Traducere
</label>

<br>

<label>
<input type="radio" name="mode" value="interview">
Interviu
</label>

<br>

<label>
<input type="radio" name="mode" value="email">
Email profesional
</label>

<br><br>

<br><br>
      <button type="submit">🚛 Tradu mesajul</button>
    </form>
  `);
});

app.get("/test", (req, res) => {
  res.send("Hermes test OK");
})
app.post("/ask", async (req, res) => {
  try {
    const message = req.body.message;
    const lang = req.body.lang;
    const mode = req.body.mode;
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
    input:
  mode === "interview"
    ? "Formulează un răspuns natural și profesionist pentru un interviu de angajare în Germania. Răspunde în germană.\n\n" + message
    : mode === "email"
    ? "Transformă textul într-un e-mail profesional în germană. Răspunde doar cu e-mailul final.\n\n" + message
    : lang === "ro"
    ? "Tradu textul în română, clar și natural. Răspunde doar cu traducerea.\n\n" + message
    : "Tradu textul în germană, natural și politicos. Răspunde doar cu traducerea.\n\n" + message
    });
    const translatedText = response.output_text;

    res.send(`
      <h1>🚚 Hermes Translator</h1>

      <h2>Rezultat</h2>

      <div id="rezultat" style="
        padding:15px;
        border:1px solid #999;
        border-radius:8px;
        background:#f5f5f5;
        font-size:20px;
        min-height:180px;
        line-height:1.6;
        white-space:pre-wrap;
      ">
        ${translatedText}
      </div>

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
      
        📋 Copiază traducerea
      </button>

      <br><br>

      <a href="/" style="
font-size:18px;
text-decoration:none;
font-weight:bold;
">
⬅️ Traducere nouă
</a>

      <script>
        function copyResult() {
          const text = document.getElementById("rezultat").innerText;
          navigator.clipboard.writeText(text);
          alert("Traducerea a fost copiată!");
        }
      </script>
    `);

  } catch (err) {
    console.error(err);
    res.send("Eroare la conectarea cu OpenAI.");
  }
});
app.listen(port, () => {
  console.log("Hermes ruleaza pe portul " + port);
});