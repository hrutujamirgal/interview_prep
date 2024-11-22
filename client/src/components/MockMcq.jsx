/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Button, Radio, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { useComponent } from "../context/ComponentContext";
import { useCookies } from "react-cookie";

const MockMcq = () => {
  const [cookies, setCookies] = useCookies('mocktopic');
  const [time, setTime] = useState(30 * 60); 
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();
  const { fetchMockMcQ, submit_mock_mcq } = useComponent();

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
  

  const getQuestion = async () => {
    try {
      const mcq = await fetchMockMcQ();
      setQuestions(mcq);
    } catch (e) {
      console.log("Error occurred in fetching MCQ questions", e);
    }
  };

  useEffect(() => {
    getQuestion();
    goFullScreen();
  }, [cookies.mcq_topic]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          notification.warning({ message: "Time's up!" });
          navigate("/feedback");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [navigate]);

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[index] = value;
    setSelectedOptions(updatedOptions);
  };

  const handleSubmitQuiz = async () => {
    const newReport = questions.map((question, index) => ({
      question: question.question_text,
      options: question.options,
      answer: question.correct_answer,
      selected_option: selectedOptions[index],
    }));

    

    const score = await submit_mock_mcq({
      user_id: cookies.userData.id,
      questions: newReport,
    });

    exitFullScreen();

    if(score >= 70){
      setCookies('mocktopic', 'coding')
      navigate("/mockcoding");
    }else{
      navigate("/result");
    }
    
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
            {index + 1}. {question.question_text}
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
          className="w-40 mt-5"
        >
          Submit Quiz
        </Button>
      </div>
    </div>
  );
};

export default MockMcq;