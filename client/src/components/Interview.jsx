import React, { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import {
  Button,
  CircularProgress,
  Typography,
  Grid,
  TextField,
  Card,
  CardContent,
} from "@mui/material";
import axios from "axios";

const Interview = () => {
  const [topic, setTopic] = useState(null);
  const [subjectName, setSubjectName] = useState("");
  const [question, setQuestion] = useState("");
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies(["topic"]);
  const [stream, setStream] = useState(null);
  const mediaRecorder = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [followUpAnswerText, setFollowUpAnswerText] = useState("");
  const [followUpIndex, setFollowUpIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  useEffect(() => {
    if (cookies.topic && cookies.topic.length === 2) {
      setSubjectName(cookies.topic[0]);
      setTopic(cookies.topic[1]);
    }
  }, [cookies]);

  const speakQuestion = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const fetchNewQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/interview/question",
        { topic: topic }
      );
      setQuestion(response.data.question);
      setFollowUpQuestion("");
      setFollowUpAnswerText("");
      setIsLoading(false);
      setErrorMessage("");
      speakQuestion(response.data.question);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("Error fetching question.");
    }
  };

  const handleAnswerSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/interview/follow-up",
        {
          currentAnswer: followUpAnswerText,
          followUpIndex: followUpIndex,
          topic: topic,
        }
      );
      setFollowUpQuestion(response.data.question);
      setFollowUpIndex(response.data.followUpIndex);
      setIsLoading(false);
      speakQuestion(response.data.question);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("Error fetching follow-up question.");
    }
  };

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

        try {
          await axios.post("http://127.0.0.1:5000/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        } catch (error) {
          console.error("Error uploading video:", error);
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

  return (
    <div style={{ backgroundColor: "#eef5fc", minHeight: "100vh", padding: "40px" }}>
      <Typography variant="h3" align="center" gutterBottom style={{ color: "#003366", marginBottom: "30px" }}>
        Interview for {subjectName}
      </Typography>

      <Typography variant="h5" align="center" gutterBottom style={{ marginBottom: "20px" }}>
        {question || "Get ready for your interview!"}
      </Typography>

      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        style={{
          marginBottom: "40px",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <Grid item xs={12} sm={isRecording ? 6 : 12}>
          <div style={{ display: "flex", justifyContent: isRecording ? "flex-start" : "center" }}>
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

      <Button
        variant="contained"
        onClick={fetchNewQuestion}
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
        {isLoading ? <CircularProgress size={24} style={{ color: "#ffffff" }} /> : question ? "Next Question" : "Start Preparation"}
      </Button>

      <Button
        variant="contained"
        onClick={isRecording ? stopRecording : startRecording}
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
        {isRecording ? "Stop Answering" : "Start Answering"}
      </Button>

      {followUpQuestion && (
        <Card variant="outlined" sx={{ mt: 4, padding: "20px", borderRadius: "10px" }}>
          <CardContent>
            <Typography variant="h6" style={{ color: "#003366" }}>
              Follow-Up Question:
            </Typography>
            <Typography variant="body1" paragraph>
              {followUpQuestion}
            </Typography>
            <TextField
              fullWidth
              label="Your Follow-Up Answer"
              multiline
              rows={4}
              value={followUpAnswerText}
              onChange={(e) => setFollowUpAnswerText(e.target.value)}
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAnswerSubmit}
              fullWidth
              disabled={isLoading || !followUpAnswerText}
              style={{ marginTop: "10px", borderRadius: "30px" }}
            >
              {isLoading ? <CircularProgress size={24} /> : "Submit Follow-Up Answer"}
            </Button>
          </CardContent>
        </Card>
      )}

      {errorMessage && (
        <Typography variant="body2" color="error" align="center">
          {errorMessage}
        </Typography>
      )}
    </div>
  );
};

export default Interview;