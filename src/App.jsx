import { useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [resultUrl, setResultUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  const onFileChange = (event) => {
    setResultUrl("");
    setError("");
    setFile(event.target.files?.[0] || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please choose an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResultUrl("");

    try {
      const data = new FormData();
      data.append("file", file);

      const response = await fetch(`${API_BASE}/remove-bg`, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Background removal failed.");
      }

      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="card">
        <h1>AI Image Background Remover</h1>
        <p>Upload an image and get a transparent PNG result.</p>

        <form onSubmit={handleSubmit} className="form">
          <input type="file" accept="image/*" onChange={onFileChange} />
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Remove Background"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <div className="results">
          {previewUrl && (
            <div>
              <h2>Original</h2>
              <img src={previewUrl} alt="Original upload" />
            </div>
          )}
          {resultUrl && (
            <div>
              <h2>Result</h2>
              <img src={resultUrl} alt="Background removed" />
              <a href={resultUrl} download="removed-bg.png" className="download-link">
                Download PNG
              </a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
