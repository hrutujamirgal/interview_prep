/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Rate, Input, Button, Table, Select, message } from "antd";
import { useCookies } from "react-cookie";
import { useComponent } from "../context/ComponentContext";

const { TextArea } = Input;
const { Option } = Select;

const Report = () => {
  const [isFeedBack, setIsFeedBack] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [recentlyCompleted, setRecentlyCompleted] = useState(false);
  const [reports, setReports] = useState([]);
  const [cookies] = useCookies("component");
  const { download_mcq_report } = useComponent();

  useEffect(() => {
    setRecentlyCompleted(true);
    setSelectedReportType(cookies.component);
  }, [cookies.component]);

  const handleFeedback = () => {
    setIsFeedBack(!isFeedBack);
    //send the fedbacck data and commponent ot the api and to database
  };

  const handleReportSelect = (value) => {
    setSelectedReportType(value);
  };

  const handleDownloadReport = async () => {
    if (recentlyCompleted) {
      if (cookies.component === "mcq") {
        await download_mcq_report();
      } else if (cookies.component === "coding") {
        await download_mcq_report();
      } else if (cookies.component === "hr") {
        await download_mcq_report();
      } else if (cookies.component === "interview") {
        await download_mcq_report();
      }
    } else {
      message.warning("Complete a component to download the report.");
    }
  };

  const columns = [
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Report",
      dataIndex: "report",
      key: "report",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
  ];

  return (
    <div>
      {!isFeedBack ? (
        <div className="bg-last w-screen h-fit flex justify-center items-center">
          <div className="bg-mid w-3/4 md:w-2/3 lg:w-1/3 h-fit mt-5 shadow-2xl rounded-xl p-5 md:p-5 lg:p-10 items-center space-x-3 space-y-5">
            <p className="p-2 font-serif text-xl md:text-2xl lg:text-3xl text-black">
              How was the Interview?
            </p>
            <Rate
              allowHalf
              defaultValue={0}
              className="text-2xl md:text-3xl lg:text-4xl text-main"
            />
            <TextArea
              rows={4}
              className="w-3/4 md:w-2/3 lg:w-full"
              maxLength={100}
              placeholder="Feedback"
            />
            <Button onClick={handleFeedback}>Submit</Button>
          </div>
        </div>
      ) : (
        <div className="p-10">
          <div>
            <p className="text-xl md:text-2xl lg:text-3xl font-serif">
              Feedback Report
            </p>
          </div>

          <div className="p-10">
            {recentlyCompleted && (
              <Button
                className="p-5 text-xl bg-main text-white"
                onClick={handleDownloadReport}
              >
                Download Report
              </Button>
            )}
          </div>

          <div className="p-10">
            <Select
              placeholder="Select Report Type"
              style={{ width: 200 }}
              onChange={handleReportSelect}
            >
              <Option value="mcq">MCQ</Option>
              <Option value="coding">Coding</Option>
              <Option value="technical">Technical Interview</Option>
              <Option value="hr">HR Interview</Option>
            </Select>
          </div>

          <div>
            <p className="text-xl md:text-2xl lg:text-3xl font-serif mt-10">
              Past Reports
            </p>
            <Table columns={columns} dataSource={reports} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
