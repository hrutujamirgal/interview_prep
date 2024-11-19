/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Instruction from "./components/Instruction";
import Subjects from "./components/Subjects";
import Interview from "./components/Interview";
import Report from "./components/Report";
import CodeAssessment from "./components/CodeAssessment";
import Index from "./components/Index";
import MCQ from "./components/MCQ";
import Test from "./components/Test";
import FeedBack from "./components/FeedBack";
import CodeInstruction from "./components/CodeIntruction";
 

import { UserProvider } from "./context/UserContext";
import { InterviewProvider } from "./context/InterviewContext";
import { ComponentProvider } from "./context/ComponentContext";

import { useCookies } from "react-cookie";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

function App() {
  const [cookies] = useCookies(["isLogin"]);

  return (
    <Router> 
      <UserProvider>
        <InterviewProvider>
          <ComponentProvider>
          <LocationWrapper />
          <Routes>
            <Route path="/" element={cookies.isLogin ? <Index /> : <Home />} />
            <Route path="/instruction" element={<Instruction />} />
            <Route path="/coding" element={<CodeAssessment />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/report" element={<Report />} />
            <Route path="/mcq" element={<MCQ />} />
            <Route path="/test" element={<Test />} />
            <Route path="/feedback" element={<FeedBack />} />
            <Route path="/codeInstruction" element={<CodeInstruction />} />
          </Routes>
          </ComponentProvider>
        </InterviewProvider>
      </UserProvider>
    </Router>
  );
}

function LocationWrapper() {
  const location = useLocation();

  return (
    <>
      { (location.pathname !== "/interview" && location.pathname !== "/test" && location.pathname !== "/coding") && <Navbar />}
    </>
  );
}

export default App;
