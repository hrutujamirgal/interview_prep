import bg1  from "../assets/bg-image.jpg"
import { Button } from "antd";
// import AnimatedList from "./AnimatedList";


const Trailer = () => {
  const textT =
    "Unlock your potential and conquer the interview stage with our tailored practice sessions! Get ready to impress with real-world questions and expert guidance your dream job awaits!";


  return (
    <div
      className="w-screen h-screen  bg-cover  flex justify-center items-center overflow-x-hidden"
      style={{ backgroundImage: `url(${bg1})`, backgroundRepeat: "no-repeat", overflowX:"hidden"}}
    >

        <div className=" mt-5 p-4 sm:w-1/4 md:w-3/4 lg:w-2/3 h-50 text-black">
          <p className=" font-bold font-serif text-center text-3xl md:text-4xl lg:text-5xl ">
            JOB PREPARING !!!
          </p>
          <p className="text-lg md:text-xl lg:text-2xl font-serif ">{textT}</p>

          <Button
          className="text-md md:text-lg lg:text-xl p-5 text-centre font-serif"
            style={{
              borderColor: "#388087",
              color: "initial",
              marginTop:10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#388087";
              e.currentTarget.style.color = "#388087";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#D3D3D3";
              e.currentTarget.style.color = "initial";
            }}
          >
            Get Started
          </Button>
        </div>

        

    </div>
  );
};

export default Trailer;
