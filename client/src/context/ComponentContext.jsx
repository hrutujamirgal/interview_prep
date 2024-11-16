/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useContext, createContext, useState } from "react";
import { notification } from "antd";
import { useCookies } from "react-cookie";

const ComponentContext = createContext();

export const ComponentProvider = ({ children }) => {
  const [blob, setBlob] = useState(null);
//   const [question, setQuestion] = useState([]);
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
    console.log("n ddownload")
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
  

//   const fetchSubjects = async () => {
//     try {
//       const response = await fetch(`${route}/get_subjects`, { method: "GET" });
//       const data = await response.json()
//       if (data) { 
//         setSubject(data.subjects);
//         return data.subjects;
//       } else {
//         notification.error({
//           message: "Fetching subject Failed!",
//         });
//       }
//     } catch (e) {
//       console.error("Error during fetching subject:", e);
//       notification.error({
//         message: "Error during fetching subject",
//       });
//     }
//   };

//   const sendAnswer = async (question, video) => {
//     try {
//       // Placeholder logic for sending video answers.
//       console.log("Answer sent for question:", question, "with video:", video);
//     } catch (e) {
//       notification.error({
//         message: "Error sending answer",
//       });
//     }
//   };

  return (
    <ComponentContext.Provider
      value={{ fetchMcQ, submit_mcq, download_mcq_report, blob }}
    >
      {children}
    </ComponentContext.Provider>
  );
};

export const useComponent = () => useContext(ComponentContext);
