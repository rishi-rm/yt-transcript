import { decode } from 'html-entities'
import { fetchTranscript } from 'youtube-transcript-plus';
import express from "express"
import cors from "cors"
const app = express()
app.use(cors())
app.get("/", function(req, res){
    res.send("<h2>give video url as query parameter</h2><br><h2>/transcript?url=...</h2>")
})
app.get("/transcript", async function (req, res) {
    const url = req.query.url

    if(!url){
        return res.status(400).json({error: "No url provided"})
    }   

    try {
        const transcriptData = await fetchTranscript(url)
        const cleaned = transcriptData.map(item => ({
            ...item,
            text: decode(item.text)
        }));

        const combined = cleaned.map((item) => item.text).join(" ");
        return res.json({ FetchedData: decode(combined) })
    }
    catch (err) {
        res.status(500).json({
            error: "Could not fetch transcript.",
            details: err.message
        })
    }
})

app.listen(3000, function () {
    console.log("http://localhost:3000")
})
