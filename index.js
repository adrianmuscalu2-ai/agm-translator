const express = require("express");
require("dotenv").config();

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
})
app.post("/ask", async (req, res) => {
  try {
    const message = req.body.message;
    const lang = req.body.lang;
    console.log("LANG =", lang);

    const mode = req.body.mode;
    console.log("LANG =", lang);
console.log("MODE =", mode);
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
    input:
mode === "interview"
? "Formulează un răspuns natural și profesionist pentru un interviu de angajare în Germania. Răspunde în germană. Răspunde doar cu textul final.\n\n" + message
: mode === "email"
? "Transformă textul într-un e-mail profesional în germană. Răspunde doar cu e-mailul final.\n\n" + message

: mode === "transport"
? (
    lang === "ro"
      ? "Acționezi ca un expert în transport rutier internațional. Reformulează și traduce mesajul în română, profesional și clar.\n\n"
      : "Act as an expert in international road transport. Rewrite and translate the message into German, professionally and naturally.\n\n"
  ) + message
    
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