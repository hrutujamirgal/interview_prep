import { useEffect, useState } from "react";
import { CheckCircleFilled } from "@ant-design/icons";
import { motion } from "framer-motion";

const AnimatedList = () => {
  const list = [
    "MCQ Practice",
    "Subjective Interview",
    "HR Interview",
    "Coding Mock Test",
    "Full Mock Interview",
  ];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className=" top-20 md:top-20  right-5  flex justify-right  mt-16 lg:mt-8 md:mr-20">
      <p className=" font-serif text-center px-5 flex flex-row md:flex-col lg:flex-col items-center text-md md:text-lg lg:text-2xl">
        {list.map((item, index) => (
          <>
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}} 
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <CheckCircleFilled className="mr-2" />
              {item}
            </motion.div>
          </>
        ))}
      </p>
    </div>
  );
};

export default AnimatedList;
