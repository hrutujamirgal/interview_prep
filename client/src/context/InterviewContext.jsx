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
  const route = import.meta.env.VITE_ROUTE
  const [blob, setBlob] = useState(null)

  const selectSubject = (sub) => {
    setCookies('selectSubject', sub);
  };

  const fetchQuestions = async (sub) => {
    try {
      const response = await fetch(`${route}/api/interview/follow-up`,{
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({topic: sub}),
      });
      const data = await response.json(); 

      const cleanedString = data.replace(/```json|\n|```/g, '').trim();
      const dataF = JSON.parse(cleanedString);

      if (dataF) { 
        console.log(dataF)
        return dataF;
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
      const response = await fetch(`${route}/get_subjects`, { method: "GET" });
      const data = await response.json()
      if (data) { 
        setSubject(data.subjects);
        return data.subjects;
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

  const submitAnswer = async (followUpAnswerText, followUpIndex, topic) => {
    try {
      const response = await fetch(`${route}/api/interview/follow-up`,{
        method:"POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentAnswer: followUpAnswerText,
          followUpIndex: followUpIndex,
          topic: topic,
        }),
      })
      const data = await response.json();
      if(data){
        return data
      }
    } catch (e) {
      notification.error({
        message: "Error sending answer",
      });
    }
  };

  const uploadAnswer = async (formData) => {
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }
    try {
      console.log("Uploading video:", formData);
      const response = await fetch(`${route}/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      const data = await response.json();
      console.log(data)
      if (data) {
        return data.data;
      }
    } catch (e) {
      notification.error({
        message: "Error sending answer",
      });
      console.error(e);
    }
  };
  
  const get_report = async(component)=>{
    try {
      console.log(component)
      const response = await fetch(`${route}/get_report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(component),
      });
  
      if (!response.ok) {
        throw new Error('Failed to download report');
      }
  
      const blob = await response.blob();
      setBlob(blob)
  
      notification.success({
        message: "Quiz submitted",
      });
    } catch (e) {
      console.error("Error occurred while submitting MCQ:", e);
    }
  };
  
  
  
  const download_report = ()=>{
    const url = window.URL.createObjectURL(blob);
    console.log(url);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coding_report.pdf'; 
    document.body.appendChild(a);
    a.click();
    // Cleanup
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };


  return (
    <InterviewContext.Provider
      value={{ fetchSubjects, fetchQuestions, selectSubject, submitAnswer, question, subject, uploadAnswer, get_report, download_report }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => useContext(InterviewContext);
