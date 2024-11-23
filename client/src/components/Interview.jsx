/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { Button, CircularProgress, Typography, Grid } from "@mui/material";
import axios from "axios";
import { useInterview } from "../context/InterviewContext";
import { useNavigate } from "react-router-dom";

const Interview = () => {
  const [topic, setTopic] = useState(null);
  const [subjectName, setSubjectName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies, setCookies] = useCookies(["topic"]);
  const [stream, setStream] = useState(null);
  const mediaRecorder = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [report, setReport] = useState({ responses: [] });
  const [qIndex, setQIndex] = useState(0);
  const navigate = useNavigate();

  const { fetchQuestions, get_report } = useInterview();

  // Fetching and handling the questions
  const fetchNewQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await fetchQuestions(topic);
      if (cookies.topic[0] === "HR") {
        setQuestions(response);
        console.log("response", response[0]);
        setQuestion(response[0]);
        setErrorMessage("");
        speakQuestion(response[0].question);
      } else {
        setQuestions(response.questions);
        setQuestion(response.questions[0]);
        setErrorMessage("");
        speakQuestion(response.questions[0].question);
      }
    } catch (error) {
      setErrorMessage("Error fetching question.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextQuestion = async () => {
    if (qIndex < questions.length - 1) {
      setQuestion(questions[qIndex + 1]);
      speakQuestion(questions[qIndex + 1].question);
      setQIndex(qIndex + 1);
    } else {
      handleSubmitReport();
    }
  };

  // Handling Speech Synthesis
  const speakQuestion = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Recording Functions
  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);

      const recorder = new MediaRecorder(mediaStream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/mp4" });
        const formData = new FormData();
        formData.append("file", blob, "recording.mp4");

        setIsLoading(true);
        try {
          const resp = await axios.post(
            "http://127.0.0.1:5000/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (resp.data) {
            setReport((prev) => ({
              ...prev,
              responses: [
                ...(prev.responses || []),
                {
                  question: question.question,
                  answer: question.answer,
                  userAnswer: resp.data.transcription,
                  fumble_status: resp.data.fumble.confidence,
                  fumble_score: resp.data.fumble.fumble,
                  confidence_status: resp.data.confidence.message,
                  confidence_score: resp.data.confidence.confidence,
                },
              ],
            }));
          }
        } catch (error) {
          console.error("Error uploading video:", error);
        } finally {
          setIsLoading(false);
        }
      };

      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsRecording(false);
  };

  // Handle report submission
  const handleSubmitReport = async () => {
    try {
      const newReport = {
        report: report.responses,
        user_id: cookies.userData.id,
        topic: cookies.topic[0],
      };

      setCookies("component", "interview");
      console.log("report", newReport);
      await get_report(newReport);
      exitFullScreen();
      navigate("/feedback");
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  // Fullscreen handling
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

  useEffect(() => {
    if (cookies.topic && cookies.topic.length === 2) {
      setSubjectName(cookies.topic[0]);
      setTopic(cookies.topic[0]);
    }
    goFullScreen();
  }, [cookies]);

  return (
    <div
      style={{
        backgroundColor: "#eef5fc",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        style={{ color: "#003366", marginBottom: "30px" }}
      >
        Interview for {subjectName}
      </Typography>

      <Typography
        variant="h5"
        align="center"
        gutterBottom
        style={{ marginBottom: "20px" }}
      >
        {question ? question.question : "Get ready for your interview!"}
      </Typography>

      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        style={{ marginBottom: "40px" }}
      >
        <Grid item xs={12} sm={isRecording ? 6 : 12}>
          <div
            style={{
              display: "flex",
              justifyContent: isRecording ? "flex-start" : "center",
            }}
          >
            <img
              src="/person.jpg"
              alt="Avatar"
              style={{
                width: "100%",
                maxWidth: "400px",
                height: "auto",
                objectFit: "cover",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
              }}
            />
          </div>
        </Grid>

        {isRecording && (
          <Grid item xs={12} sm={6}>
            {stream && (
              <video
                ref={(video) => {
                  if (video) {
                    video.srcObject = stream;
                  }
                }}
                autoPlay
                muted
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  height: "auto",
                  objectFit: "cover",
                  borderRadius: "10px",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                }}
              />
            )}
          </Grid>
        )}
      </Grid>

      {!isRecording && (
        <Button
          variant="contained"
          onClick={question ? fetchNextQuestion : fetchNewQuestion}
          disabled={isLoading}
          style={{
            width: "300px",
            height: "50px",
            backgroundColor: "#003366",
            color: "#ffffff",
            margin: "10px auto",
            display: "block",
            borderRadius: "30px",
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} style={{ color: "#ffffff" }} />
          ) : question ? (
            "Next Question"
          ) : (
            "Start Preparation"
          )}
        </Button>
      )}

      {question && (
        <Button
          variant="contained"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          style={{
            width: "300px",
            height: "50px",
            backgroundColor: isRecording ? "#FF0000" : "#006400",
            color: "#ffffff",
            margin: "10px auto",
            display: "block",
            borderRadius: "30px",
          }}
        >
          {isRecording ? (
            "Stop Answering"
          ) : isLoading ? (
            <CircularProgress size={24} style={{ color: "#ffffff" }} />
          ) : (
            "Start Answering"
          )}
        </Button>
      )}

      {errorMessage && (
        <Typography variant="h6" color="error" align="center">
          {errorMessage}
        </Typography>
      )}
    </div>
  );
};

export default Interview;
