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
  const [hrBlob, setHrBlob] = useState(null);
  const [technicalBlob, setTechnicalBlob] = useState(null);
  const [cookies, setCookies, removeCookies] = useCookies(['selectSubject','userData', 'mcq_topic']);
  const route = import.meta.env.VITE_ROUTE

//   const selectSubject = (sub) => {
//     setCookies('selectSubject', sub);
//   };

const fetchMcQ = async (subject_name) => {
    try {
        const response = await fetch(`${route}/get_mcq`, { 
            method: "POST", 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ subject_name: subject_name })
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


const download_mcq_report = ()=>{
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mcq_report.pdf'; 
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

const fetchCodingQuestion = async()=>{
  try{
    const response = await fetch(`${route}/get_coding_question`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

    const data = await response.json()
    if(data){
      const questionsWithIndex = data.questions.map((question, index) => ({
        ...question,
        index: index + 1, 
      }));

      return questionsWithIndex;
    }else{
      console.log('error in fetching the coding questions')
    }
  }catch(e){
    console.log(e)
  }
};


const fetchReport= async(component)=>{
  try{
    console.log(component)
    const response = await fetch(`${route}/get_report/${component}/${cookies.userData.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    
    const data = await response.json()
    if(data){
      return data
    }else{
      console.error('error')
    }
  }catch(e){
    console.log(e)
  }
};


const submit_coding = async(component)=>{
  try {
    console.log(component)
    const response = await fetch(`${route}/get_coding_report`, {
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
    setCodingBlob(blob)

    notification.success({
      message: "Quiz submitted",
    });
  } catch (e) {
    console.error("Error occurred while submitting MCQ:", e);
  }
};



const download_coding_report = ()=>{
  const url = window.URL.createObjectURL(codingBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'coding_report.pdf'; 
  document.body.appendChild(a);
  a.click();
  // Cleanup
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};



const download_hr_report = ()=>{
  const url = window.URL.createObjectURL(hrBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hr_report.pdf'; 
  document.body.appendChild(a);
  a.click();
  // Cleanup
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};


const download_technical_report = ()=>{
  const url = window.URL.createObjectURL(technicalBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'technical_report.pdf'; 
  document.body.appendChild(a);
  a.click();
  // Cleanup
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};



const sendFeedback = async(rate, feedback, id)=>{
  try{
    const response = await fetch(`${route}/send_feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({rate: rate, feedback:feedback, userId: id}),
    });

    const data = await response.json()
    if(data){
      notification.success({
        message: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
      });
    }
  }catch(e){
    notification.error("error occured: ",e)
  }
}
  

  return (
    <ComponentContext.Provider
      value={{ fetchMcQ, submit_mcq, download_mcq_report, blob, fetchReport, fetchCodingQuestion, submit_coding, download_coding_report, codingBlob, sendFeedback }}
    >
      {children}
    </ComponentContext.Provider>
  );
};

export const useComponent = () => useContext(ComponentContext);
