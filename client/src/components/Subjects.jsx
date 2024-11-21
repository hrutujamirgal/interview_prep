/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useInterview } from "../context/InterviewContext";

const Subjects = () => {
  const { fetchSubjects } = useInterview();
  const [subject, setSubject] = useState([]);
  const [, setCookies] = useCookies();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subjectsResponse = await fetchSubjects();
        if (subjectsResponse && typeof subjectsResponse === 'object') {
          const subjectsArray = Object.entries(subjectsResponse).map(([key, value]) => ({
            _id: value._id, 
            subject: value.subject 
          }));
          setSubject(subjectsArray);
        } else {
          console.error('Subjects data is not in the expected format:', subjectsResponse);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    };

    fetchData();
  }, []);

  const handlesubject = (sub, id) => {
    setCookies('topic', [sub, id]);  // Save the selected subject to cookies
    navigate("/instruction");          // Navigate to the Interview page
  };

  return (
    <div className="overflow-x-hidden">
      <div className="p-5 mt-10">
        <p className="text-center font-serif text-xl md:text-2xl lg:text-3xl">
          Select the Subject for the Interview
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-10 p-5 items-center">
          {subject.map((sub) => (
            <div className="bg-submain w-64 h-40 rounded-md p-5" key={sub._id}>
              <p className="text-black text-md md:text-lg lg:text-xl font-serif text-center py-2">
                {sub.subject}
              </p>
              <Button
                className="ml-10"
                style={{ marginTop: 20 }}
                onClick={() => handlesubject(sub.subject, sub._id)}
              >
                Start Interview
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subjects;
