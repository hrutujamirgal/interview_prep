/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Menu, Button, Drawer, Dropdown, notification } from "antd";
import { useCookies } from "react-cookie";
import { MenuOutlined } from "@ant-design/icons";
import { useAuth } from "../context/UserContext";
import { Link } from 'react-router-dom';
import Login from "./Login";
import { useInterview } from "../context/InterviewContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const beforeLogin = ["Login", "SignUp"];
  const [subject, setSubject] = useState([]);
  const [cookies, setCookies] = useCookies(["isLogin", "userData", "component"]);
  const afterLogin = ["Home", "Interview", "MCQ", `${cookies.userData?.username || "User"}`];
  const [bar, setBar] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const { logout } = useAuth();
  const { fetchSubjects } = useInterview();

  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      notification.error({
        message: "Logout Failed",
        description: "There was an error while trying to log out.",
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const subjectsResponse = await fetchSubjects();

        if (subjectsResponse && typeof subjectsResponse === 'object') {
          const subjectsArray = Object.entries(subjectsResponse).map(([key, value]) => ({
            _id: value._id, 
            subject: value.subject 
          }));

          setSubject(subjectsArray); 
        } else {
          console.error('Subjects data is not in the expected format:', subjectsResponse);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      }
    };

    fetchData();
  }, []); 

  const handlemcq = (item)=>{
     setCookies('component', 'mcq')
     setCookies('mcq_topic', item),
     navigate("/mcq")
  }

  // Dropdown Menu Items
  const itemsI = [
    { label: <Link to="/subjects">Technical Interview</Link>, key: "0" },
    { label: <Link to="/hrInterview">HR Interview</Link>, key: "1" },
  ];

  const itemsM = [
    ...subject.map((item, index) => ({
      label: <button onClick={()=> handlemcq(item)}>{item.subject}</button>,
      key: index.toString(),
    })),
  ];

  const itemsP = [
    { label: <a href="/Report">Report</a>, key: "0" },
    {
      label: (
        <Button type="text" onClick={handleLogout} danger>
          Logout
        </Button>
      ),
      key: "1",
    },
  ];

  // Directly add Home link to the dropdownItems
  const dropdownItems = {
    Home: [
      { label: <Link to="/">Home</Link>, key: "0" }, // Home link here
    ],
    Interview: itemsI,
    MCQ: itemsM,
    [cookies.userData?.username]: itemsP,
  };

  useEffect(() => {
    setBar(cookies.isLogin ? afterLogin : beforeLogin);
  }, [cookies.isLogin]);

  const showDrawer = () => setVisible(true);
  const onClose = () => setVisible(false);

  return (
    <>
      <nav
        className={`w-screen flex justify-between items-center px-5 py-3 shadow-lg z-30
          ${scrolled ? "bg-main fixed text-white " : "bg-opacity-15"}`}
      >
        <p className="font-serif font-bold text-2xl">
          <Link to="/">Interview Prep</Link> {/* Home link added here */}
        </p>

        <Button
          className="md:hidden bg-main hover:bg-main transition-all duration-300 text-xl"
          type="primary"
          onClick={showDrawer}
          icon={<MenuOutlined />}
        />

        <ul className="list-none hidden md:flex px-5 text-xl">
          {bar.map((item) => (
            <li className="px-2" key={item}>
              {dropdownItems[item] ? (
                <Dropdown overlay={<Menu items={dropdownItems[item]} />}>
                  <Button type="link" className={`${scrolled ? "text-white" : "text-black"}`}>
                    {item}
                  </Button>
                </Dropdown>
              ) : (
                <Login name={item}>{item}</Login>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <Drawer title="Menu" placement="right" onClose={onClose} visible={visible}>
        <Menu>
          {bar.map((item) => (
            <Menu.Item key={item}>
              {item === "Home" ? (
                <Link to="/">{item}</Link> 
              ) : (
                item
              )}
            </Menu.Item>
          ))}
        </Menu>
      </Drawer>
    </>
  );
};

export default Navbar;
