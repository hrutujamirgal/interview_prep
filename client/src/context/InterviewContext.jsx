/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useContext, createContext, useState } from "react";
import { notification } from "antd";
import { useCookies } from "react-cookie";

const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [subject, setSubject] = useState([]);
  const [question, setQuestion] = useState([]);
  const [cookies, setCookies, removeCookies] = useCookies(['selectSubject']);

  const selectSubject = (sub) => {
    setCookies('selectSubject', sub);
  };

  const fetchQuestions = async (sub) => {
    try {
      // const response = await fetch(`${route}/questions`, { method: "GET" });
      const data = ['Sample Question']; // Placeholder
      if (data) { // replace with response.ok after integrating API
        setQuestion(data);
        return data;
      } else {
        notification.error({
          message: "Fetching Questions Failed!",
        });
      }
    } catch (e) {
      console.error("Error during fetching questions:", e);
      notification.error({
        message: "Error during fetching questions",
      });
    }
  };

  const fetchSubjects = async () => {
    try {
      // const response = await fetch(`${route}/subjects`, { method: "GET" });
      const data = ['Subject A','Subject A','Subject A','Subject A','Subject A','Subject A','Subject A','Subject A','Subject A','Subject A','Subject A','Subject A','Subject A','Subject A','Subject A']; // Placeholder
      if (data) { 
        setSubject(data);
        return data;
      } else {
        notification.error({
          message: "Fetching subject Failed!",
        });
      }
    } catch (e) {
      console.error("Error during fetching subject:", e);
      notification.error({
        message: "Error during fetching subject",
      });
    }
  };

  const sendAnswer = async (question, video) => {
    try {
      // Placeholder logic for sending video answers.
      console.log("Answer sent for question:", question, "with video:", video);
    } catch (e) {
      notification.error({
        message: "Error sending answer",
      });
    }
  };

  return (
    <InterviewContext.Provider
      value={{ fetchSubjects, fetchQuestions, selectSubject, sendAnswer, question, subject }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => useContext(InterviewContext);
