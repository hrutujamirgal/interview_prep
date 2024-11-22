/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Button, Table, Select, notification } from "antd";
import { useCookies } from "react-cookie";
import { useComponent } from "../context/ComponentContext";
import {useInterview} from "../context/InterviewContext"

const { Option } = Select;

const Report = () => {
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [recentlyCompleted, setRecentlyCompleted] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [cookies, , removeCookie] = useCookies(["component"]);
  const {
    download_mcq_report,
    fetchReport,
    download_coding_report,
    download
  } = useComponent();
  const {download_report} = useInterview()
  const [column, setColumn] = useState([]);

  useEffect(() => {
    const initializeData = async () => {
      if (cookies.component) {
        setRecentlyCompleted(true);
        setSelectedReportType(cookies.component);
        const fetchedReports = await fetchReport(cookies.component);
        setReports(fetchedReports);
      }
    };

    initializeData();
  }, [cookies.component, fetchReport]);

  const handleReportSelect = async (value) => {
    setSelectedReportType(value);
    setLoadingReports(true);
    try {
      const fetchedReports = await fetchReport(value);
      setReports(fetchedReports);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to fetch reports. Please try again.",
      });
    } finally {
      setLoadingReports(false);
    }
  };

  const handleDownloadReport = async () => {
    if (recentlyCompleted) {
      try {
        switch (cookies.component) {
          case "mcq":
            await download_mcq_report();
            setColumn(mcq_column);
            break;
          case "coding":
            await download_coding_report();
            setColumn(coding_column);
            break;
          case "interview":
            await download_report();
            setColumn(interview_column);
            break;
          default:
            throw new Error("Invalid report type.");
        }
        removeCookie("component");
        notification.success({
          message: "Success",
          description: "Report downloaded successfully!",
        });
      } catch (error) {
        notification.error({
          message: "Error",
          description: "Failed to download the report. Please try again.",
        });
      }
    } else {
      notification.warning({
        message: "Warning",
        description: "Complete a component to download the report.",
      });
    }
  };

  const mcq_column = [
    {
      title: "Subject",
      dataIndex: "selectedTopic",
      key: "selectedTopic",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
    },
    {
      title: "Report",
      dataIndex: "report",
      key: "report",
      render: (report, _id) => (<>
        <Button type="link" onClick={async() => await download('mcq', _id._id)}>
        {console.log(_id._id)}View
        </Button>
      </>),
    },
  ];

  const coding_column = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
    },
    {
      title: "Report",
      dataIndex: "report",
      key: "report",
      render: (report) => (
        <Button type="link" onClick={async() => await download('coding', report._id)}>
          View
        </Button>
      ),
    },
  ];

  const interview_column = [
    {
      title: "Subject",
      dataIndex: "selectedTopic",
      key: "selectedTopic",
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
      render: (report, _id) => (
        <Button type="link" onClick={async() => await download('interview', report._id)}>
          View
        </Button>
      ),
    },
  ];

  useEffect(() => {
    if (selectedReportType) {
      switch (selectedReportType) {
        case "mcq":
          setColumn(mcq_column);
          break;
        case "coding":
          setColumn(coding_column);
          break;
        case "interview":
          setColumn(interview_column);
          break;
        default:
          setColumn([]);
      }
    }
  }, [selectedReportType]);

  return (
    <div className="overflow-x-hidden">
      <div className="p-10">
        {recentlyCompleted && (
          <>
            <div>
              <p className="text-xl md:text-2xl lg:text-3xl font-serif">
                Feedback Report
              </p>
            </div>

            <div className="p-10">
              <Button
                className="p-5 text-xl bg-main text-white"
                onClick={handleDownloadReport}
              >
                Download Report
              </Button>
            </div>
          </>
        )}

        <div className="p-5 w-2/3 text-2xl">
        <p className="text-2xl font-serif">Select the Report Type</p>
          <Select
            placeholder="Select Report Type"
            style={{ width: 200 }}
            onChange={handleReportSelect}
          >
            <Option value="mcq">MCQ</Option>
            <Option value="coding">Coding</Option>
            <Option value="interview">Interview</Option>
          </Select>
        </div>

        <div>
          <p className="text-xl md:text-2xl lg:text-3xl font-serif mt-10 capitalize">
            {selectedReportType} Past Reports
          </p>
          <Table
            columns={column}
            dataSource={reports}
            loading={loadingReports}
            rowKey={(record) => record.id || record._id}
          />
        </div>
      </div>
    </div>
  );
};

export default Report;
