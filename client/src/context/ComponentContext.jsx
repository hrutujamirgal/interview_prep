/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useContext, createContext, useState } from "react";
import { notification } from "antd";
import { useCookies } from "react-cookie";

const ComponentContext = createContext();

export const ComponentProvider = ({ children }) => {
  const [blob, setBlob] = useState(null);
  const [codingBlob, setCodingBlob] = useState(null);
  const [cookies, setCookies, removeCookies] = useCookies([
    "selectSubject",
    "userData",
    "mcq_topic",
  ]);

  const [mockmcq, setMockmcq] = useState()
  const [mockcoding, setMockcoding] = useState()
  const [mockInterview, setMockInterview] = useState()
  const route = import.meta.env.VITE_ROUTE;

  const fetchMcQ = async (subject_name) => {
    try {
      const response = await fetch(`${route}/get_mcq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject_name: subject_name }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch MCQs");
      }

      const data = await response.json();
      return data.mcq_questions;
    } catch (error) {
      console.error("Error fetching MCQ:", error);
      throw error;
    }
  };


  const fetchMockMcQ = async () => {
    try {
      const response = await fetch(`${route}/get_mcqs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch MCQs");
      }

      const data = await response.json();
      return data.mcq_questions;
    } catch (error) {
      console.error("Error fetching MCQ:", error);
      throw error;
    }
  };

  const submit_mcq = async (info) => {
    try {
      const response = await fetch(`${route}/get_mcq_report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(info),
      });

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();
      setBlob(blob);

      notification.success({
        message: "Quiz submitted",
      });
    } catch (e) {
      console.error("Error occurred while submitting MCQ:", e);
    }
  };


  const submit_mock_mcq = async (info) => {
    try {
      const response = await fetch(`${route}/get_mcq_score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(info),
      });
  
      if (!response.ok) {
        throw new Error("Failed to download report");
      }
  
      const data = await response.json(); // Add parentheses to call json() correctly
      console.log(data);
      setMockmcq(data.path);  // Assuming this function stores the report path
      return data.score;
    } catch (e) {
      console.error("Error occurred while submitting MCQ:", e);
    }
  };
  

  const download_mcq_report = () => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcq_report.pdf";
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const download_mock_component_report= async(topic)=>{
    const mocki = topic === 'mcq' ? mockmcq : mockcoding
    console.log(mocki)
    try {
      const response = await fetch(`${route}/get_mock_report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mocki),
      });

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mock_mcq_report.pdf";
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    } catch (e) {
      console.error("Error occurred while submitting MCQ:", e);
    }
  }

  const fetchCodingQuestion = async () => {
    try {
      const response = await fetch(`${route}/get_coding_question`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data) {
        const questionsWithIndex = data.questions.map((question, index) => ({
          ...question,
          index: index + 1,
        }));

        return questionsWithIndex;
      } else {
        console.log("error in fetching the coding questions");
      }
    } catch (e) {
      console.log(e);
    }
  };


  const fetchReport = async (component) => {
    try {
      console.log(component);
      const response = await fetch(
        `${route}/get_report/${component}/${cookies.userData.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log(data);
      if (data) {
        return data;
      } else {
        console.error("error");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const submit_coding = async (component) => {
    try {
      console.log(component);
      const response = await fetch(`${route}/get_coding_report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(component),
      });

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await response.blob();
      setCodingBlob(blob);

      notification.success({
        message: "Code Assessment submitted",
      });
    } catch (e) {
      console.error("Error occurred while submitting MCQ:", e);
    }
  };

  const submit_mock_coding = async (component) => {
    try {
      console.log(component);
      const response = await fetch(`${route}/get_coding_score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(component),
      });

      if (!response.ok) {
        throw new Error("Failed to download report");
      }

      const data = await response.json;
      setMockcoding(data);

      notification.success({
        message: "Quiz submitted",
      });
    } catch (e) {
      console.error("Error occurred while submitting MCQ:", e);
    }
  };

  const download = async (name, id) => {
    try {
      console.log(name, id);
  
      const response = await fetch(`${route}/get_one_report/${name}/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to download report");
      }
  
      const blob = await response.blob();
  
      const url = window.URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      
      a.download = `${name}_report_${id}.pdf`;
  
      document.body.appendChild(a);
      a.click();
  
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.log(e);
    }
  };
  

  const download_coding_report = () => {
    const url = window.URL.createObjectURL(codingBlob);
    console.log(url);
    const a = document.createElement("a");
    a.href = url;
    a.download = "coding_report.pdf";
    document.body.appendChild(a);
    a.click();
    // Cleanup
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const sendFeedback = async (rate, feedback, id) => {
    try {
      const response = await fetch(`${route}/send_feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rate: rate, feedback: feedback, userId: id }),
      });

      const data = await response.json();
      if (data) {
        notification.success({
          message: "Feedback Submitted",
          description: "Thank you for your feedback!",
        });
      }
    } catch (e) {
      notification.error("error occured: ", e);
    }
  };

  const get_mock_report = async(component)=>{
    try {
      const newC = ({
        'component': component,
        'mcq': mockmcq,
        'code': mockcoding
      })
      const response = await fetch(`${route}/get_report_score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newC),
      });
  
      if (!response.ok) {
        throw new Error('Failed to download report');
      }
  
      const data = await response.blob();
      setMockInterview(data)
  
      notification.success({
        message: "Quiz submitted",
      });
    } catch (e) {
      console.error("Error occurred while submitting MCQ:", e);
    }
  };


  
  
  const download_mock_report = ()=>{
    const url = window.URL.createObjectURL(mockInterview);
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

  const fetchMockQuestions = async (sub) => {
    try {
      const response = await fetch(`${route}/questions`,{
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

  return (
    <ComponentContext.Provider
      value={{
        fetchMcQ,get_mock_report, download_mock_report,fetchMockMcQ , download_mock_component_report,
        submit_mcq, fetchMockQuestions,
        download_mcq_report,
        blob, submit_mock_mcq,
        fetchReport,
        fetchCodingQuestion,
        submit_coding,
        download_coding_report,
        codingBlob,
        sendFeedback,
        download, submit_mock_coding
      }}
    >
      {children}
    </ComponentContext.Provider>
  );
};

export const useComponent = () => useContext(ComponentContext);
