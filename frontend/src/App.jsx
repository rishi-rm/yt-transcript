import { useState, useRef } from "react";
import { decode } from "html-entities";
import { useEffect } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en")
  const [copied, setCopied] = useState(false)

  const [summary, setSummary] = useState("")
  const [loadingSummary, setLoadingSummary] = useState(false)

  const languages = [
    { name: "English", code: "en" },
    { name: "Hindi", code: "hi" },
    { name: "Spanish", code: "es" },
    { name: "French", code: "fr" },
    { name: "German", code: "de" },
    { name: "Chinese", code: "zh" },
    { name: "Japanese", code: "ja" },
    { name: "Korean", code: "ko" },
    { name: "Arabic", code: "ar" },
    { name: "Russian", code: "ru" },
    { name: "Portuguese", code: "pt" },
    { name: "Italian", code: "it" },
    { name: "Turkish", code: "tr" },
    { name: "Bengali", code: "bn" },
    { name: "Dutch", code: "nl" }
  ];
  const fetchTranscript = async () => {
    if (url.trim() === "") return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/transcript?url=${encodeURIComponent(url)}&lang=${lang}`
      );
      const data = await response.json();

      if (!data.FetchedData || data.FetchedData.length === 0) {
        setTranscript("⚠️ No transcript found for this video.");
        return;
      }
      setTranscript(decode(data.FetchedData));
    } catch (err) {
      console.error(err);
      setTranscript("‼️Error fetching transcript.");
    } finally {
      setLoading(false);
    }
  };

  const summarizeTranscript = async () => {
    if (!transcript || transcript.trim() === "") {
      setSummary("No transcript to summarize.")
      return
    }

    try {
      setLoadingSummary(true)
      const summarizer = await pipeline(
        "summarization",
        "Xenova/t5-small"
      )

      const result = await summarizer(transcript, {
        max_length: 200,
        min_length: 50
      })

      setSummary(result[0].summary_text)
    }
    catch (err) {
      setSummary("Error while summarizing")
      console.log(err)
    } finally {
      setLoadingSummary(false)
    }
  }

  const divRef = useRef();
  const handleCopy = () => {
    navigator.clipboard.writeText(divRef.current.innerText);
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 10000);
  }

  useEffect(() => {
    setCopied(false)
  }, [transcript])
  return (
    <div className="min-h-screen bg-[#f4f6fb] flex justify-center p-6 gap-8">
      <div className="w-full flex flex-col gap-6">
        <div className="bg-white shadow-2xl max-h-[28rem] rounded-2xl p-10 max-w-4xl  border border-gray-200 flex flex-col gap-6">

          <h1 className="text-4xl font-extrabold text-gray-900 text-center tracking-tight">
            🎧 YouTube Transcript Fetcher
          </h1>
          <p className="text-center text-gray-600 -mt-3">
            Paste any YouTube link and get the full transcript instantly.
          </p>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700">
              YouTube URL
            </label>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=XYZ"
              className="p-4 rounded-xl border border-gray-300 bg-white text-gray-900 
            placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div className="flex justify-start gap-4">
            <div className="flex flex-col w-[80%] gap-3">
              <label htmlFor="language" className="text-sm font-semibold text-gray-700">Language</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="border-2 border-gray-400 outline-none px-2 rounded-lg w-full h-full py-4"
              >
                {
                  languages.map((lang, key) => (
                    <option value={lang.code} key={key}>{lang.name}</option>
                  ))
                }
              </select>
            </div>
            <button
              onClick={fetchTranscript}
              className="p-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 
          transition rounded-xl text-white font-bold shadow-md w-[80%] h-[65%] self-end"
            >
              {loading ? "Fetching Transcript..." : "Get Transcript"}
            </button>
          </div>
          {/* <button className="text-xl px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 active:from-yellow-700 active:to-amber-700 shadow-md hover:shadow-lg transition-all duration-200"
          onClick={summarizeTranscript}
          >
            Summarize
          </button>

        </div>
        <div className="min-h-[10rem] bg-white shadow-2xl rounded-2xl p-8 max-w-7xl text-xl w-full border border-gray-200 flex flex-col gap-6">
          <div className="text-sm font-semibold text-gray-700">
            Summary
          </div> */}
          {/* <div className="min-h-64 p-4 bg-white text-gray-900 border border-gray-300 
            rounded-xl resize-none shadow-sm focus:outline-none focus:ring-2 
            focus:ring-blue-500 tracking-wide leading-loose">
              {summary}
          </div> */}
        </div>
      </div>
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-7xl text-xl w-full border border-gray-200 flex flex-col gap-6">
        <div className="flex justify-between w-[99%]">
          <div className="text-sm font-semibold text-gray-700 self-center">
            Transcript output
          </div>
          <button className=" border-2 border-gray-700 text-sm text-gray-700 p-2 rounded-lg self-start"
            onClick={handleCopy}
          >{
              copied ? "Copied" : "Copy"
            }</button>
        </div>
        <div
          className="min-h-64 p-4 bg-white text-gray-900 border border-gray-300 
            rounded-xl resize-none shadow-sm focus:outline-none focus:ring-2 
            focus:ring-blue-500 tracking-wide leading-loose"
          placeholder="Transcript will appear here..."
          ref={divRef}
        >
          {transcript}
        </div>
      </div>
    </div>
  );
}

export default App;
