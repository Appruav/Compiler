"use client"
import { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";

export default function Home() {
  const [code, setCode] = useState("// Type your code here");
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [showInput, setShowInput] = useState(false);

  const checkForInputOperations = (code:any) => {
    const inputPatterns = {
      cpp: /\b(cin|scanf|getline)\b/,
      java: /\b(Scanner|BufferedReader|System\.console\(\)\.readLine)\b/
    };
    return inputPatterns[language].test(code);
  };

  const handleCodeChange = (value) => {
    setCode(value);
    // Removed setShowInput from here
  };
  const handleCompile = async () => {
   try{
     // Check if input is needed
     const needsInput = checkForInputOperations(code);
      
     // If code needs input and input box isn't shown yet
     if (needsInput && !showInput) {
       setShowInput(true);
       return; // Stop here until input box is shown
     }

     // If code needs input and there's no input, don't proceed
     if (needsInput && !input.trim()) {
       setOutput("Please provide input first");
       return;
     }
      console.log("Sending request with:", {
        language,
        code,
        input: needsInput ? input : ""
      });

      const response = await axios.post("http://localhost:9000/api/compile", {
        language,
        code,
        input: needsInput ? input : ""
      });

      console.log("Response received:", response.data);
      
      if (response.data.output !== undefined) {
        setOutput(response.data.output);
        setShowInput(false);
      } else {
        setOutput("No output received from server");
      }
    } catch (error) {
      console.error("Error:", error);
      setOutput("Error: " + (error.response?.data?.message || error.message));
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      <h1 className="text-3xl font-semibold text-white mb-6">Online Code Compiler</h1>
      
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <label htmlFor="language" className="text-gray-300 font-medium">
          Choose Language:
        </label>
        <select
          id="language"
          onChange={(e) => setLanguage(e.target.value)}
          value={language}
          className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none"
        >
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>

      <div className="w-full max-w-4xl mb-6">
        <div className="rounded-lg overflow-hidden shadow-lg">
          <MonacoEditor
            height="400px"
            language={language === "cpp" ? "cpp" : "java"}
            theme="vs-dark"
            value={code}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>

        {/* Input section that appears when input operations are detected */}
        {showInput && (
          <div className="mt-4 bg-gray-800 rounded-lg p-4">
            <label className="block text-gray-300 font-medium mb-2">
              Program Input:
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter input values here${language === 'cpp' ? ' (for cin)' : ' (for Scanner)'}`}
              className="w-full h-32 px-3 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none resize-none"
            />
            <p className="text-gray-400 text-sm mt-2">
              {language === 'cpp' 
                ? 'For multiple inputs, separate values with spaces or newlines'
                : 'For multiple inputs, separate values with spaces or newlines'}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleCompile}
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md transition duration-200"
      >
        Run Code
      </button>

      <div className="w-full max-w-4xl bg-gray-800 text-gray-200 p-4 mt-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-2">Output:</h2>
        <pre className="whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
}