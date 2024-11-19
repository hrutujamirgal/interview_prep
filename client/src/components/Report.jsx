/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Button, Table, Select, notification } from "antd";
import { useCookies } from "react-cookie";
import { useComponent } from "../context/ComponentContext";

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
    download_hr_report,
    download_technical_report,
  } = useComponent();
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
          case "hr":
            await download_hr_report();
            setColumn(hr_column);
            break;
          case "technical":
            await download_technical_report();
            setColumn(technical_column);
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
      render: (report) => (
        <Button type="link" onClick={() => window.open(report, "_blank")}>
          View
        </Button>
      ),
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
        <Button type="link" onClick={() => window.open(report, "_blank")}>
          View
        </Button>
      ),
    },
  ];

  const technical_column = [
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
      render: (report) => (
        <Button type="link" onClick={() => window.open(report, "_blank")}>
          View
        </Button>
      ),
    },
  ];

  const hr_column = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Report",
      dataIndex: "report",
      key: "report",
      render: (report) => (
        <Button type="link" onClick={() => window.open(report, "_blank")}>
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
        case "hr":
          setColumn(hr_column);
          break;
        case "technical":
          setColumn(technical_column);
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

        <div className="p-5">
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
