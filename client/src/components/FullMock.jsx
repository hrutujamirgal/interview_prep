/* eslint-disable react/no-unescaped-entities */
import { useState } from "react";
import fullMockInterviewInstructions from "../assets/fullMockInterviewInstructions";
import { Checkbox, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const FullMock = () => {
  const { introduction, generalGuidelines, components, progressTracking, conclusion } = fullMockInterviewInstructions;
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const [, setCookie] = useCookies();

  const handleChecked = (e) => {
    setChecked(e.target.checked);
  };

  const handleSubmit = () => {
    setCookie("mocktopic", "mcq");
    navigate("/mockmcq");
  };

  return (
    <div className="h-screen overflow-x-hidden overflow-y-hidden">
      <div className="flex flex-row h-full overflow-y-scroll w-screen">
        <div className="bg-submain w-1/3">
          <p className="text-center mt-52 font-serif text-xl md:text-2xl lg:text-3xl font-bold p-5">
            Let's Prepare For Full Mock Interview
          </p>
        </div>
        <div className="info bg-last w-2/3 overflow-y-scroll">
          <div>
            <p className="text-center p-10 font-serif text-md md:text-lg lg:text-xl font-bold">
              {introduction}
            </p>
            
            {/* Display General Guidelines */}
            <div className="p-4">
              <h2 className="font-bold text-lg mb-2">General Guidelines</h2>
              <ul className="list-disc list-inside pl-5 space-y-1">
                {generalGuidelines.map((guideline, index) => (
                  <li key={index}>{guideline}</li>
                ))}
              </ul>
            </div>

            {/* Display Each Component (MCQ, Coding, Interview) */}
            {components?.length ? (
              <div className="overflow-y-scroll max-h-96">
                {components.map((component, index) => (
                  <div key={index} className="p-4">
                    <h2 className="font-bold text-lg mb-2">{component.title}</h2>
                    {component.precondition && (
                      <p className="italic text-sm text-gray-500">{component.precondition}</p>
                    )}
                    <ul className="list-disc list-inside pl-5 space-y-1">
                      {component.instructions.map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center p-10 font-serif text-md">
                No components available. Please contact support.
              </p>
            )}

            {/* Display Progress Tracking Section */}
            <div className="p-4">
              <h2 className="font-bold text-lg mb-2">{progressTracking.title}</h2>
              <ul className="list-disc list-inside pl-5 space-y-1">
                {progressTracking.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>

            {/* Conclusion */}
            <p className="text-center p-10 font-serif text-md">{conclusion}</p>

            {/* Consent Checkbox */}
            <div className="mt-4">
              <Checkbox onChange={handleChecked} aria-label="Consent checkbox">
                I agree to the guidelines and terms.
              </Checkbox>
              {checked && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="default"
                    htmlType="submit"
                    style={{ alignSelf: "end" }}
                    onClick={handleSubmit}
                    aria-label="Submit button"
                  >
                    Submit
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullMock;
