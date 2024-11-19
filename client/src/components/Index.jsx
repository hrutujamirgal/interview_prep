
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie'

import index from "../assets/index"
import Footer from "./Footer";

const Index = ()=>{
    const navigate = useNavigate();
    const [cookies, setCookies ] = useCookies()

    const handleInterview = ()=>{
        navigate("/subjects")
    }

    const handleHR=()=>{
        setCookies('topic', 'HR')
        navigate("/instruction")
    }

    const handleMCQ = ()=>{
       navigate('/mcq')
    }

    const handleCoding=()=>{
        navigate("/coding")
    }

    return(<>
    <div className="overflow-x-hidden">
    <div className=" h-15 p-5  m-10">
        <p className="font-serif text-xl md:text-2xl lg:text-3xl font-bold capitalize">Hello, { cookies.userData['username']}</p>
    </div>
        <div className="m-20 bg-paleBlue p-5 rounded-md flex flex-row">
            <div className="w-96">
                <img src={index[0].img} alt="" />
            </div>
            <div className="p-10 align-middle ml-9 font-serif">
            <p className="text-2xl md:text-3xl lg:text-4xl">
                Start practicing {index[0].name}
            </p>
            <Button className="mt-10 text-lg md:text-xl lg:text-2xl p-5 font-serif" onClick={handleInterview}>{index[0].button}</Button>
            </div>
        </div>


        <div className="m-20 bg-paleBlue p-5 rounded-md flex flex-row">
            
            <div className="p-10 align-middle ml-9 font-serif">
            <p className="text-2xl md:text-3xl lg:text-4xl">
                Start practicing {index[1].name}
            </p>
            <Button className="mt-10 text-lg md:text-xl lg:text-2xl p-5 font-serif" onClick={handleHR}>{index[1].button}</Button>
            </div>

            <div className="w-96">
                <img src={index[1].img} alt="" />
            </div>
        </div>


        <div className="m-20 bg-paleBlue p-5 rounded-md flex flex-row">
            <div className="w-96">
                <img src={index[2].img} alt="" />
            </div>
            <div className="p-10 align-middle ml-9 font-serif">
            <p className="text-2xl md:text-3xl lg:text-4xl">
                Start practicing {index[2].name}
            </p>
            <Button className="mt-10 text-lg md:text-xl lg:text-2xl p-5 font-serif" onClick={handleMCQ}>{index[2].button}</Button>
            </div>
        </div>


        <div className="m-20 bg-paleBlue p-5 rounded-md flex flex-row">
            
            <div className="p-10 align-middle ml-9 font-serif">
            <p className="text-2xl md:text-3xl lg:text-4xl">
                Start practicing {index[3].name}
            </p>
            <Button className="mt-10 text-lg md:text-xl lg:text-2xl p-5 font-serif" onClick={handleCoding}>{index[3].button}</Button>
            </div>

            <div className="w-96">
                <img src={index[3].img} alt="" />
            </div>
        </div>

        <Footer/>

        </div>
    </>)
}

export default Index