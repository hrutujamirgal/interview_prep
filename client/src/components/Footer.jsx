import { titles } from "../assets/feature";

const Footer = () => {

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
