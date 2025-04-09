import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import HarmCategoryPie from "./HarmCategoryPie";
import KeywordWordCloud from "./KeywordWordCloud";

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileType, setFileType] = useState("text");
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [showConfig, setShowConfig] = useState(false);

  const textFileRef = useRef(null);
  const videoFileRef = useRef(null);
  const audioFileRef = useRef(null);

  
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  const saveApiKey = () => {
    localStorage.setItem("openai_api_key", apiKey);
    setShowConfig(false);
  };

  const handleFileUpload = async (fileInputRef, type) => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files.length) {
      alert("请先选择文件");
      return;
    }
    if (!apiKey) {
      alert("请先设置API密钥");
      setShowConfig(true);
      return;
    }

  //文本分析
    const file = fileInput.files[0];
    setLoading(true);
    setError(null);

    try {
      //音频分析
      if (type === "audio") {
        const formData = new FormData();
        formData.append("file", file);
      
        try {
          const response = await axios.post("http://127.0.0.1:8000/analyze", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          
      
          const text = response.data?.predictions?.[0]?.content?.parts?.[0]?.text || "未返回内容";

          setResults([...results, {
            source: "audio",
            text_snippet: "[音频摘要]",
            raw_text: text
          }]);
          
      
          fileInputRef.current.value = "";
          return;
        } catch (err) {
          setError("音频分析失败：" + (err.response?.data?.detail || err.message));
          setLoading(false);
          return;
        }
      }
      
      const fileContent = await readFileContent(file);

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `Please analyze the following ${type} content in detail.

You should:
1. Identify the main topic and subtopics.
2. Summarize the content in 3-5 bullet points.
3. Evaluate the tone (e.g., positive, negative, neutral).
4. categorize all harmful content it may contain (eg.Hate Speech, Misinformation, Discrimination,Fearmongering, Others (if applicable))，For each type of harmful content, estimate its proportion in the article as a percentage (e.g., based on sentence or paragraph frequency).
  If a category is not found, set its percentage to 0.
5. Provide suggestions for improving the clarity or neutrality of the content (if needed).
6. Please assess the level of harmful content in the following news article on a scale from 1 (safe) to 10 (extremely harmful). Provide your rating and a brief explanation for your decision.
7. Please extract the 20 most frequently mentioned meaningful words from the following news article.
  Do not include meaningless stopwords, focus on content-related keywords (nouns, verbs, or named entities). 


Content:
${fileContent}`

            },
            {
              role: "user",
              content: `Analyze the following ${type} content:\n${fileContent}`
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;



      setResults([...results, {
        source: type,
        text_snippet: fileContent.substring(0, 50) + "...",
        raw_text: aiResponse
      }]);
      


      fileInputRef.current.value = "";
    } catch (error) {
      console.error("分析失败:", error);
      setError(`分析失败: ${error.response?.data?.error?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith("text/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
      } else {
        resolve(`[${file.name}] - 文件内容无法直接读取`);
      }
    });
  };

  const fileTypeButtonStyle = (active) => ({
    padding: "0.5rem 1rem",
    margin: "0 0.5rem 1rem 0",
    fontSize: "16px",
    backgroundColor: active ? "#4f46e5" : "#e5e7eb",
    color: active ? "white" : "black",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  });

  const uploadButtonStyle = {
    marginTop: "0.5rem",
    padding: "0.5rem 1rem",
    fontSize: "16px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  };

  const fileInputContainerStyle = {
    marginTop: "1rem",
    padding: "1.5rem",
    border: "2px dashed #d1d5db",
    borderRadius: "8px",
    textAlign: "center"
  };

  const configPanelStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    padding: "2rem",
    backgroundColor: "white",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    zIndex: 1000,
    width: "80%",
    maxWidth: "500px"
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>🧠 Media Analysis Tool</h1>
      <div style={{ marginBottom: "1rem", textAlign: "right" }}>
        <button
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: apiKey ? "#10b981" : "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
          onClick={() => setShowConfig(true)}
        >
          {apiKey ? "✓ API已配置" : "⚙️ 配置API"}
        </button>
      </div>

      {showConfig && (
        <div style={configPanelStyle}>
          <h2>API配置</h2>
          <p>请输入您的OpenAI API密钥：</p>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "1rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px"
            }}
          />
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
            您的API密钥将保存在本地浏览器中，不会发送到我们的服务器。
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#e5e7eb",
                color: "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
              onClick={() => setShowConfig(false)}
            >
              取消
            </button>
            <button
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
              onClick={saveApiKey}
            >
              保存
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <button style={fileTypeButtonStyle(fileType === "text")} onClick={() => setFileType("text")}>📝 文本文件</button>
        <button style={fileTypeButtonStyle(fileType === "video")} onClick={() => setFileType("video")}>🎬 视频文件</button>
        <button style={fileTypeButtonStyle(fileType === "audio")} onClick={() => setFileType("audio")}>🎵 音频文件</button>
      </div>

      <div style={fileInputContainerStyle}>
        {fileType === "text" && (
          <div>
            <h3>上传文本文件</h3>
            <p>支持的格式: .txt, .doc, .docx, .pdf</p>
            <input type="file" ref={textFileRef} accept=".txt,.doc,.docx,.pdf" style={{ display: "block", margin: "1rem auto" }} />
            <button style={uploadButtonStyle} onClick={() => handleFileUpload(textFileRef, "text")} disabled={loading}>
              {loading ? "分析中..." : "分析文本"}
            </button>
          </div>
        )}

        {fileType === "video" && (
          <div>
            <h3>上传视频文件</h3>
            <p>支持的格式: .mp4, .avi, .mov, .wmv</p>
            <input type="file" ref={videoFileRef} accept=".mp4,.avi,.mov,.wmv" style={{ display: "block", margin: "1rem auto" }} />
            <button style={uploadButtonStyle} onClick={() => handleFileUpload(videoFileRef, "video")} disabled={loading}>
              {loading ? "分析中..." : "分析视频"}
            </button>
          </div>
        )}

        {fileType === "audio" && (
          <div>
            <h3>Upload Audio File</h3>
            <p>Supported format: .mp3, .wav, .ogg, .m4a</p>
            <input type="file" ref={audioFileRef} accept=".mp3,.wav,.ogg,.m4a" style={{ display: "block", margin: "1rem auto" }} />
            <button style={uploadButtonStyle} onClick={() => handleFileUpload(audioFileRef, "audio")} disabled={loading}>
              {loading ? "Analyzing..." : "Go"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "4px" }}>
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: "2rem", whiteSpace: "pre-wrap", background: "#f3f4f6", padding: "1rem", borderRadius: "8px" }}>
          <h3>📝 AI 分析结果：</h3>
          <p>{results[results.length - 1].raw_text}</p>
        </div>
      )}
    </div>
  );
}

export default App;
