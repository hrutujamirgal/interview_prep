
import Trailer from "../components/Trailer";
import Footer from "../components/Footer";
import Instruction from "../components/Instruction";
import Subjects from "../components/Subjects";
import Interview from "../components/Interview"
import Report from "../components/Report"
import Features from "../components/Features";


const Home = () => {
  return (
   <>
      <div className="overflow-x-hidden">
        <Trailer />
        <Features />
        <Instruction />
        <Subjects />
        <Interview />
        <Report />
        <Footer />
        </div>

   </>
  );
};

export default Home;
