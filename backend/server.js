import { decode } from 'html-entities'
import { fetchTranscript } from 'youtube-transcript-plus';
import express from "express"
import cors from "cors"
const app = express()
app.use(cors({ origin: "*" }))
app.use(express.json())
import translate from "google-translate-api-x";

function splitText(text, size = 3000) {
    const chunks = []

    let i = 0;
    while (i < text.length) {
        chunks.push(text.slice(i, i + size))
        i += size
    }
    return chunks
}

async function t(text, lang) {
    console.log("text")
    console.log(text)
    let chunks = splitText(text)
    let final = ""
    for (const chunk of chunks) {
        const t = await translate(chunk, {
            to: lang,
            rejectOnPartialFail: false,
            forceBatch: false,
            forceTo:true
        })
        final += t.text + " "
    }
    return final
}


app.get("/", function (req, res) {
    res.send("<h2>give video url as query parameter</h2><br><h2>/transcript?url=https://yotube.com/....&lang=en</h2>")
})
app.get("/transcript", async function (req, res) {
    const url = req.query.url
    const lang = req.query.lang
    if (!url) {
        return res.status(400).json({ error: "No url provided" })
    }

    try {
        const transcriptData = await fetchTranscript(url)

        const cleaned = transcriptData.map(item => ({
            ...item,
            text: decode(item.text)
        }));

        const combined = cleaned.map((item) => item.text).join(" ");
        let final = combined;
        if(transcriptData[0].lang!=lang){
            final = await t(combined, lang)   
        }
        return res.json({ FetchedData: final })
    }
    catch (err) {
        res.status(500).json({
            error: "Could not fetch transcript.",
            details: err.message
        })
    }
})

app.listen(process.env.PORT || 3000, () => {
  console.log("server live");
});
