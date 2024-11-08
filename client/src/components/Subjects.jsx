import { useEffect, useState } from "react";
import { useInterview } from "../context/InterviewContext";
import { Button } from "antd";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const Subjects = () => {
  const { fetchSubjects } = useInterview();
  const [subject, setSubject] = useState([]);
  const [, setCookies] = useCookies();
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchSubjects();
        setSubject(res);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    };

    fetchData();
  }, []);

  const handlesubject =(sub)=>{
      setCookies('topic', sub)
      navigate("/instruction")
  }

  return (
    <>
      <div className="p-5 mt-10">
        <p className="text-center font-serif text-xl md:text-2xl lg:text-3xl ">
          Select the Subject for the Interview
        </p>

        
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5 mt-10 p-5">
            {subject.map((sub, ind) => (
            <div className="bg-mid w-40 h-40 rounded-md p-5" key={ind}>
              <p className="text-black text-md md:text-lg lg:text-xl font-serif text-center py-2">
                {sub}
              </p>
              <Button
                style={{ alignSelf: "center",  marginTop: 20 }}
                onClick={()=>handlesubject(sub)}
              >
                Start Interview
              </Button>
            </div>
        ))}
          </div>
        
      </div>
    </>
  );
};

export default Subjects;
