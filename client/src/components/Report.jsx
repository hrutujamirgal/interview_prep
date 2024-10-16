import { useState } from "react";
import { Rate, Input, Button, Table } from "antd";

const Report = () => {
  const [isFeedBack, setIsFeedBack] = useState(false);
  const { TextArea } = Input;

  const handlefeedback=()=>{
    setIsFeedBack(!isFeedBack);
  }

  const columns = [
    {
        title:"Subject",
        dataIndex:"subject",
        key:"subject",
    },
    {
        title:"Date",
        dataIndex:"date",
        key:"date",
    },
    {
        title:"Report",
        dataIndex:"report",
        key:"report",
    },
]

  return (
    <>
      <div>
        {!isFeedBack ? (
          <>
            <div className="bg-last w-screen h-screen flex justify-center items-center">
              <div className="bg-mid w-3/4 lg:w-1/3 h-2/3 shadow-2xl rounded-xl p-5 md:p-5 lg:p-10 items-center space-x-3 space-y-5">
                <p className="p-2 font-serif text-xl md:text-2xl lg:text-3xl text-black">
                  How was the Interview ?
                </p>
                <Rate allowHalf
                  defaultValue={0}
                  className="text-2xl  md:text-3xl lg:text-4xl text-main"
                />
                  <TextArea rows={4} className="w-3/4 lg:w-full"
                  maxLength={100} placeholder="FeedBack" />
                <Button onClick={handlefeedback} >Submit</Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-10">
              <div>
                  <p className="text-xl md:text-2xl lg:text-3xl font-serif">Interview Feedback Report</p>
              </div>
                <div className="p-10">
                    <Button className="p-5 text-xl bg-main text-white" >Download Report</Button>
                </div>

                <div>
                  <p  className="text-xl md:text-2xl lg:text-3xl font-serif mt-10">Past Report</p>
                    <Table columns={columns}
                    />
                </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Report;
