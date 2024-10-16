/* eslint-disable no-unused-vars */
import { Carousel } from "antd";
import {feature} from "../assets/feature";

const Features = () => {
  return (
    <>
      <div className="p-10 ">
        <p className="font-serif text-center text-3xl md:text-4xl lg:text-5xl m-5">
          Features
        </p>
        <Carousel autoplay >
          {feature.map((obj, indx) => (
            <div key={indx}>
              <div className="h-72 flex flex-row">
                <img src={obj.img} className="w-1/2" />
                <div className="p-10 bg-submain w-full">
                  <p className="font-serif text-2xl md:text-3xl lg:text-4xl ">
                    {obj.title}
                  </p>
                  <p className="mt-10 ">{obj.description}</p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </>
  );
};

export default Features;
