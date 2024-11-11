/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Button, Radio, notification } from "antd";
import { useNavigate } from "react-router-dom";

const Test = () => {
  const [time, setTime] = useState(30 * 60); // 30 minutes in seconds
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [report, setReport] = useState([]);
  const [questions] = useState([
    {
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      answer: "Paris",
    },
    {
      question: "Which language is used for web development?",
      options: ["Python", "C++", "JavaScript", "Java"],
      answer: "JavaScript",
    },
    // Add more questions here
  ]);
  const navigate = useNavigate();

  const goFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
  };

  useEffect(() => {
    goFullScreen();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          notification.warning({ message: "Time's up!" });
          navigate("/report");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[index] = value;
    setSelectedOptions(updatedOptions);
  };

  const handleSubmitQuiz = () => {
    const newReport = questions.map((question, index) => ({
      question: question.question,
      options: question.options,
      answer: question.answer,
      selected_option: selectedOptions[index],
    }));
    
    setReport(newReport);

    const correctAnswers = newReport.reduce((score, entry) => 
      score + (entry.selected_option === entry.answer ? 1 : 0), 0
    );

    notification.info({
      message: `Quiz Completed!`,
      description: `You scored ${correctAnswers} out of ${questions.length}.`,
    });
    navigate("/report");
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="p-5">
      <div className="text-center text-xl font-bold mb-5">
        Time Left: {formatTime(time)}
      </div>

      {questions.map((question, index) => (
        <div key={index} className="mb-5 m-10">
          <p className="text-2xl font-semibold mb-3">
            {index + 1}. {question.question}
          </p>
          <Radio.Group
            onChange={(e) => handleOptionChange(index, e.target.value)}
            value={selectedOptions[index]}
            className="w-full"
          >
            {question.options.map((option, idx) => (
              <Radio key={idx} value={option} className="block mb-2">
                {option}
              </Radio>
            ))}
          </Radio.Group>
        </div>
      ))}

      <div className="text-center">
        <Button
          type="primary"
          onClick={handleSubmitQuiz}
          disabled={selectedOptions.length !== questions.length}
          className="w-40 mt-5 items-end"
        >
          Submit Quiz
        </Button>
      </div>
    </div>
  );
};

export default Test;
