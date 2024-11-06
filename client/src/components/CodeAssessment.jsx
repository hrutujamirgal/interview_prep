/* eslint-disable no-unused-vars */
import { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

// Judge0 API language options
const languageOptions = {
  c: 50,
  cpp: 54,
  python: 71,
  java: 62,
};

const hiddenTestCases = [
  { input: "[1, -2, 3, 4, -1, 2, -5, 3]", expected: 10 },
  { input: "[-1, -2, -3, -4]", expected: -1 },
];

function CodeAssessment() {
  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("cpp");

  // Visible test case
  const visibleTestCases = [
    { input: "[-2, 1, -3, 4, -1, 2, 1, -5, 4]", expected: 6 },
  ];

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
    setCode(""); // Reset code when changing language
  };

  const handleRunCode = async () => {
    setLoading(true);
    setOutput(""); // Clear previous output
    setTestResults([]);

    try {
      // Submit code to Judge0 API
      const { data } = await axios.post(
        "https://judge0-ce.p.rapidapi.com/submissions",
        {
          source_code: code,
          language_id: languageOptions[selectedLanguage],
          stdin: "", // Optionally add input for the code here
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key":
              "2417a3d064msh0bdc3b14f939f3dp1663e1jsn871feb6aebd1", // Replace with your actual API key
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      const token = data.token;

      // Retrieve the results
      const result = await fetchResult(token);
      setOutput(result.output);

      // Run visible test cases
      runTestCases(visibleTestCases);
      // Run hidden test cases
      runTestCases(hiddenTestCases, true);
    } catch (error) {
      setOutput("Error running code: " + error.message);
    }

    setLoading(false);
  };

  const fetchResult = async (token) => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(
          `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
          {
            headers: {
              "X-RapidAPI-Key":
                "2417a3d064msh0bdc3b14f939f3dp1663e1jsn871feb6aebd1", // Replace with your actual API key
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
          }
        );

        const { stdout, stderr, compile_output, status } = response.data;
        if (
          status.description === "In Queue" ||
          status.description === "Processing"
        ) {
          return null; // Continue polling if still in queue
        }
        return { output: stdout || stderr || compile_output || "No output" };
      } catch (error) {
        return { output: "Error fetching result" };
      }
    };

    let result = null;
    while (result === null) {
      result = await checkStatus();
      if (result === null) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay between requests
      }
    }
    return result;
  };

  const runTestCases = (testCases, isHidden = false) => {
    const results = testCases.map((testCase, index) => {
      const inputArray = JSON.parse(testCase.input);
      const expectedOutput = testCase.expected;

      // Simulating the logic for maximum subarray sum
      const maxSubArray = (nums) => {
        let max_sum = nums[0];
        let current_sum = nums[0];

        for (let i = 1; i < nums.length; ++i) {
          current_sum = Math.max(nums[i], current_sum + nums[i]);
          max_sum = Math.max(max_sum, current_sum);
        }

        return max_sum;
      };

      const output = maxSubArray(inputArray);
      return {
        input: testCase.input,
        expected: expectedOutput,
        passed: output === expectedOutput,
        index: index + 1,
      };
    });

    setTestResults((prevResults) => [...prevResults, ...results]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Maximum Subarray Sum</h2>
      <p>
        Given an integer array, find the contiguous subarray (containing at
        least one number) which has the largest sum and return its sum.
      </p>
      <h3>Visible Test Case</h3>
      <p>Input: [-2, 1, -3, 4, -1, 2, 1, -5, 4] - Output: 6</p>

      <h3>Hidden Test Cases</h3>
      {hiddenTestCases.map((testCase, index) => (
        <div key={index}>
          <p>
            Input: {testCase.input} - Expected Output: {testCase.expected}
          </p>
        </div>
      ))}

      {/* Language Selection */}
      <label htmlFor="language">Select Language:</label>
      <select
        id="language"
        value={selectedLanguage}
        onChange={handleLanguageChange}
      >
        <option value="cpp">C++</option>
        <option value="c">C</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
      </select>

      {/* Monaco Editor */}
      <Editor
        height="50vh"
        defaultLanguage="cpp"
        language={selectedLanguage}
        value={code}
        onChange={handleCodeChange}
        theme="vs-dark"
      />

      {/* Run Code Button */}
      <button
        onClick={handleRunCode}
        disabled={loading}
        style={{ marginTop: "10px" }}
      >
        {loading ? "Running..." : "Run Code"}
      </button>

      {/* Output Section */}
      <h3>Output:</h3>
      <pre>{output}</pre>

      {/* Test Results Section */}
      <h3>Test Results:</h3>
      {testResults.map((result) => (
        <p key={result.index}>
          Test Case {result.index}: {result.passed ? "Passed" : "Failed"}{" "}
          (Expected: {result.expected})
        </p>
      ))}
      <p>
        Hidden Test Cases Passed:{" "}
        {testResults.filter((result) => result.passed).length} /{" "}
        {hiddenTestCases.length}
      </p>
    </div>
  );
}

export default CodeAssessment;