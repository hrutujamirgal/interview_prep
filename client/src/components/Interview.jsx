/* eslint-disable no-unused-vars */
import { Button } from "antd";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
 
const Interview = () => {
  const videoRef = useRef(null);
  const [answer, setAnswer] = useState(false);
  const [question, setQuestion] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [askedQuestion , setAskedQuestion] = useState(0); 
  const navigate = useNavigate()

  useEffect(()=>{
    goFullScreen()
  },[])

  const handleAnswer = () => {
    setAnswer(!answer);
    if (!answer) {
      startWebcam();
      setAskedQuestion((prev)=>({
        ...prev + 1
      }))
    } else {
      stopWebcam();
    }

    if(askedQuestion === 5){
        navigate("/report")
    }
  };

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

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing the webcam: ", error);
    }
  };

  const stopWebcam = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className=" w-full h-screen flex flex-col items-center justify-center bg-late p-10">
      {!question ? (
        <>
          <div className="border border-main w-2/3 h-2/3 justify-center ">
            {/* Play the video to ask question */}
          </div>

          <div className="p-10">
            <Button
              onClick={handleAnswer}
              className="text-md md:text-lg lg:text-xl font-serif p-5 rounded-md"
            >
              {answer ? "Stop Answering" : "Answer the Question"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-row justify-between h-screen  w-full">
            <div className="mt-10">
              <video
                ref={videoRef}
                autoPlay
              ></video>
            </div>
            <div className=" w-full justify-center ">
              {/* Play the video to ask question */}
                    <p className="bg-main text-late p-5 font-serif text-xl ">Question</p>
                    <div>qustion with man</div>
            </div>
          </div>

          <div className="p-0">
            <Button
              onClick={handleAnswer}
              className="text-md md:text-lg lg:text-xl font-serif p-4 rounded-md"
            >
              {answer ? "Stop Answering" : "Answer the Question"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Interview;
