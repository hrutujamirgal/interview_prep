import { purple } from "@ant-design/colors";
import { Rate, Input, Button } from "antd";
import { titles } from "../assets/feature";

const Footer = () => {
  const { TextArea } = Input;

  const footerList = {
    Product: ["Interview Prep", "Using AI", "Personall feedback"],
    Features: titles,
  };

  return (
    <>
      <div className="bg-last min-h-fit p-10 flex flex-col md:flex-row lg:flex-row justify-evenly">
        <div>
          <div className="Accounts w-1/2 flex-1 text-black">
            <p className="text-md md:text-xl lg:text-2xl font-serif py-5">
              Interview Prep
            </p>
            <p className="text-sm md:text-lg lg:text-xl">
              Practice the Mock Interview to Ace the Real One.
            </p>
            <div className="feedback flex flex-col  py-5">
              <p className="text-sm md:text-lg lg:text-xl font-mono">Rate Us</p>
              <Rate
                allowHalf
                defaultValue={0}
                className="text-main"
                style={{
                  borderColor: "white",
                  filter: "brightness(120%)",
                  fontSize: "24px",
                  opacity: 0.9,
                }}
              />
              <span>
                <TextArea
                  rows={4}
                  maxLength={100}
                  placeholder="Share Expirience"
                  style={{ borderColor: purple }}
                />
              </span>
              <Button className="p-2 mt-5">Submit</Button>
            </div>
          </div>
        </div>

        <div className="info flex flex-row justify-between">
          {Object.entries(footerList).map(([category, items]) => (
            <div className="items flex flex-col px-10" key={category}>
              <p className="text-serif text-2xl font-serif font-bold">{category}</p>
              <ul className="list-none text-xl font-serif">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-last">
        <p className="text-center font-serif">Interview Prep @ 2024</p>
      </div>
    </>
  );
};

export default Footer;
