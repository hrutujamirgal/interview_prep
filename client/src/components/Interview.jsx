import { Button } from "antd";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Avatar = () => {
  return (
    <img
      src="/person.jpg"
      alt="Avatar"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "1%",
      }}
    />
  );
};

const Interview = () => {
  const videoRef = useRef(null);
  const [answer, setAnswer] = useState(false);
  const [askedQuestion, setAskedQuestion] = useState(0);
  const [recordedAnswers, setRecordedAnswers] = useState([]);
  const navigate = useNavigate();

  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const questions = [
    "Tell me about yourself.",
    "Why do you want this job?",
  ];

  useEffect(() => {
    if (!answer) {
      speakQuestion(questions[askedQuestion]);
    }
  }, [askedQuestion, answer]);

  const speakQuestion = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.cancel(); // Stop any ongoing TTS
    window.speechSynthesis.speak(utterance);
  };

  const handleAnswer = () => {
    if (answer) {
      stopRecording();
      if (askedQuestion < questions.length - 1) {
        setAskedQuestion((prev) => prev + 1); // Move to the next question
      } else {
        stopWebcam(); // Stop webcam after the last question
        uploadAllAnswers();
        navigate("/report"); // Redirect to the report page
      }
    } else {
      startWebcam(); // Start webcam
      startRecording(); // Start recording
    }
    setAnswer(!answer); // Toggle answering state
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream; // Attach the stream to the video element
      }
    } catch (error) {
      console.error("Error accessing the webcam: ", error);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setMediaStream(null); // Reset mediaStream after stopping webcam
    }
  };

  const startRecording = () => {
    if (!mediaStream) return;

    const chunks = [];
    const recorder = new MediaRecorder(mediaStream, { mimeType: "video/webm" });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: "video/webm" });
        const recordedVideoURL = URL.createObjectURL(blob);

        setRecordedAnswers((prev) => [
          ...prev,
          { question: questions[askedQuestion], videoURL: recordedVideoURL },
        ]);

        // Upload the recording for the current question
        uploadRecording(blob);
      }
    };

    recorder.start(); // Start recording
    setMediaRecorder(recorder); // Save the recorder instance
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadRecording = (blob) => {
    const formData = new FormData();
    formData.append("file", blob, `recorded_video_${askedQuestion + 1}.mp4`);

    fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("File uploaded successfully", data);
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
      });
  };

  const uploadAllAnswers = () => {
    fetch("http://localhost:5000/save-answers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers: recordedAnswers }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("All answers saved successfully", data);
      })
      .catch((error) => {
        console.error("Error saving answers:", error);
      });
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-screen p-10">
      <div
        className="mt-10 font-serif text-lg"
        style={{ fontFamily: "Times New Roman", fontSize: "40px" }}
      >
        {askedQuestion + 1}. {questions[askedQuestion]}
      </div>
      <div
        className="flex items-center justify-center w-2/3 mt-20"
        style={{
          backgroundColor: "#f5f5f5",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          height: "650px",
          width: "650px",
        }}
      >
        <Avatar />
      </div>
      {answer && (
        <div className="w-2/3 mt-10" style={{ height: "650px", width: "650px" }}>
          <video ref={videoRef} autoPlay className="w-full h-full" />
        </div>
      )}
      <div className="mt-10">
        <Button
          onClick={handleAnswer}
          className="p-5 mt-auto font-serif rounded-md text-md md:text-lg lg:text-xl"
        >
          {answer ? "Stop Answering" : "Answer the Question"}
        </Button>
      </div>
    </div>
  );
};

export default Interview;
