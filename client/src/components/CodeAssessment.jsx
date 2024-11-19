/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { useComponent } from "../context/ComponentContext";
import { Button, notification } from "antd";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const languageOptions = {
  c: 50,
  cpp: 54,
  python: 71,
  java: 62,
};

const API_KEY = import.meta.env.VITE_API_KEY;

const CodeAssessment = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [code, setCode] = useState("// Write your code here");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [hiddenTestResults, setHiddenTestResults] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("cpp");
  const { fetchCodingQuestion, submit_coding } = useComponent();
  const [submit, setSubmit] = useState([]);
  const [ cookies ] = useCookies();
  const [time, setTime] = useState(90 * 60);
  const navigate = useNavigate();

  const goFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const exitFullScreen = () => {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Fetch questions
  const fetch = async () => {
    try {
      const fetchedQuestions = await fetchCodingQuestion();
      if (Array.isArray(fetchedQuestions)) {
        setQuestions(fetchedQuestions);
        setSelectedQuestion(fetchedQuestions[0]);
      } else {
        console.error("Fetched data is not an array", fetchedQuestions);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  useEffect(() => {
    fetch();
    goFullScreen();
  }, []);

  //timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          notification.warning({ message: "Time's up!" });
          handleEndTest();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [navigate]);

  //codee change
  const handleCodeChange = useCallback((value) => {
    setCode(value);
  }, []);

  //language chanage
  const handleLanguageChange = useCallback(
    (event) => {
      setSelectedLanguage(event.target.value);
      if (!code.trim() || code === "// Write your code here") {
        setCode("// Write your code here");
      }
    },
    [code]
  );

  //ruun test cases
  const fetchResult = async (token) => {
    const checkStatus = async () => {
      const response = await axios.get(
        `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        {
          headers: {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        }
      );
      const { stdout, stderr, compile_output, status } = response.data;
      if (
        status.description === "In Queue" ||
        status.description === "Processing"
      ) {
        return null;
      }
      return { output: stdout || stderr || compile_output || "No output" };
    };

    let result = null;
    while (result === null) {
      result = await checkStatus();
      if (result === null) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    return result;
  };

  const runTestCases = async (testCases, isHidden) => {
    const results = await Promise.all(
      testCases.map(async (testCase) => {
        try {
          const { data } = await axios.post(
            "https://judge0-ce.p.rapidapi.com/submissions",
            {
              source_code: code,
              language_id: languageOptions[selectedLanguage],
              stdin: testCase.input,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Key": API_KEY,
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
              },
            }
          );

          const result = await fetchResult(data.token);
          const passed =
            result.output.trim() === String(testCase.expected).trim();
          return {
            input: testCase.input,
            expected: testCase.expected,
            passed,
          };
        } catch {
          return {
            input: testCase.input,
            expected: testCase.expected,
            passed: false,
          };
        }
      })
    );

    if (isHidden) {
      setHiddenTestResults(results);
    } else {
      setTestResults(results);
    }
  };

  //run the code
  // Run visible test cases
const handleRunCode = async () => {
  if (!selectedQuestion) {
    setOutput("No question selected");
    return;
  }

  // Ensure test cases exist
  if (
    !Array.isArray(selectedQuestion.test_cases)
  ) {
    setOutput("Invalid or missing test cases");
    return;
  }

  setLoading(true);
  setOutput("");
  setTestResults([]);  // Reset test results before running

  try {
    // Run only visible test cases
    await runTestCases(selectedQuestion.test_cases, false); 
  } catch (error) {
    setOutput("Error running code: " + error.message);
  } finally {
    setLoading(false);
  }
};


  //reset the code
  const handleReset = () => {
    setCode("// Write your code here");
    setOutput("");
    setTestResults([]);
    setHiddenTestResults([]);
  };

  //submission of each code
  const handleSubmit = async () => {
    if (!selectedQuestion) return;
  
    setLoading(true);
    setOutput("");
    setTestResults([]);
    setHiddenTestResults([]);
  
    try {
      // Run both visible and hidden test cases
      await runTestCases(selectedQuestion.test_cases, false);  
      await runTestCases(selectedQuestion.hidden_test_cases, true); 
  
      // Prepare the result data
      const resultData = {
        questionId: selectedQuestion._id,
        title: selectedQuestion.title,
        description: selectedQuestion.description,
        totalTests: selectedQuestion.test_cases.length + selectedQuestion.hidden_test_cases.length,
        totalPassed: [
          ...testResults.filter((result) => result.passed),
          ...hiddenTestResults.filter((result) => result.passed),
        ].length,
        code: code,
      };
  
      // Prevent duplicate submissions for the same question
      setSubmit((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.questionId === selectedQuestion._id
        );
        if (existingIndex !== -1) {
          // Update existing submission
          const updated = [...prev];
          updated[existingIndex] = resultData;
          return updated;
        }
        // Add new submission
        return [...prev, resultData];
      });
  
      setOutput("Assessment submitted successfully!");
    } catch (error) {
      setOutput("Error submitting assessment: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const handleEndTest = async () => {
    try {
      console.log(cookies.userData.id);
      await submit_coding({
        user_id: cookies.userData.id,
        questions: submit, 
      });
      exitFullScreen();
      navigate("/feedback");
    } catch (e) {
      console.log(e);
    }
  };
  

  //format time
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="overflow-x-hidden">
      <div className="container mx-1 py-5 h-full">
        <div className="text-center text-xl font-bold m-0 fixed bg-white w-full z-10">
          Time Left: {formatTime(time)}
          <Button
            className=" m-2 float-right font-bold"
            onClick={handleEndTest}
          >
            End Test
          </Button>
        </div>

        <div className="flex flex-row lg:flex-row gap-8  w-full mt-20">
          {/* Questions Section */}
          <div className="lg:w-1/3 overflow-y-auto">
            <div className="w-full flex flex-row ">
              <div className="space-y-2 lg:w-1/12 w-1/12 ">
                {Array.isArray(questions) &&
                  questions.map((question) => (
                    <button
                      key={question._id}
                      className={`block w-full px-4 py-2 rounded-lg text-left ${
                        selectedQuestion?._id === question._id
                          ? "bg-submain text-black "
                          : "bg-coolGrey hover:bg-lightGray"
                      }`}
                      onClick={() => {
                        setSelectedQuestion(question), handleReset();
                      }}
                    >
                      {question.index}
                    </button>
                  ))}
              </div>

              {selectedQuestion && (
                <div className=" ml-5  p-2 h-52 mt-0">
                  <h2 className="text-lg font-bold mb-2">
                    {selectedQuestion.title}
                  </h2>
                  <p className="text-gray-700 mt-2">
                    {selectedQuestion.description}
                  </p>
                </div>
              )}
            </div>

            {/* test cases */}
            {selectedQuestion &&
              selectedQuestion.test_cases &&
              selectedQuestion.test_cases.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-lg">Test Cases:</h3>
                  {selectedQuestion.test_cases.map((testCase, index) => (
                    <div key={index} className="p-2 mb-2">
                      <p>
                        <strong>Input:</strong> {testCase.input}
                      </p>
                      {testCase.input2 && (<p>
                        <strong>Input2:</strong> {testCase.input2}
                      </p>)}
                      <p>
                        <strong>Expected Output:</strong> {testCase.output}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            {/* output */}
            {output && (<div className="mt-6 w-full ">
              <h3 className="font-bold text-lg">Output:</h3>
              <p className="bg-gray-100 p-4 rounded-lg mt-2 overflow-clip">
                {output}
              </p>
            </div>)}

            {testResults.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-lg">Test Results:</h3>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg ${
                      result.passed ? " text-green" : " text-red"
                    }`}
                  >
                    Input: {result.input} - Expected: {result.expected} -{" "}
                    {result.passed ? "Passed" : "Failed"}
                  </div>
                ))}
              </div>
            )}

            {/* hidden test cases */}
            {hiddenTestResults.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-lg">Hidden Test Results:</h3>
                {hiddenTestResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg ${
                      result.passed
                        ? " text-green" : " text-red"
                    }`}
                  >
                    {result.passed ? "Test Passed" : "Test Failed"}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Code Editor and Output Section */}
          <div className="lg:w-2/3 flex flex-col">
            {/* language selection */}
            <div className="flex flex-row">
              <div className="mb-4 w-2/4">
                <label htmlFor="language" className="block font-semibold mb-2">
                  Language:
                </label>
                <select
                  id="language"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                >
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex flex-col gap-8">
              <Editor
                height="60vh"
                language="cpp"
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
              />
              <div className="mt-4">
                <button
                  onClick={handleRunCode}
                  className="bg-submain text-black py-2 px-6 rounded-md mr-4"
                >
                  Run Code
                </button>

                <button
                    onClick={handleSubmit}
                    className="bg-main text-white py-2 px-6 rounded-md"
                  >
                    Submit
                  </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeAssessment;
