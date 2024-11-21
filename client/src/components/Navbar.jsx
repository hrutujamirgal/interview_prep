/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Menu, Button, Drawer, Dropdown, notification } from "antd";
import { useCookies } from "react-cookie";
import { MenuOutlined } from "@ant-design/icons";
import { useAuth } from "../context/UserContext";
import { Link } from 'react-router-dom';
import Login from "./Login";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const beforeLogin = ["Login", "SignUp"];
  const [cookies, setCookies] = useCookies(["isLogin", "userData", "component"]);
  const afterLogin = ["Home", "Interview", "Assessment", `${cookies.userData?.username || "User"}`];
  const [bar, setBar] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const { logout } = useAuth();

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
      setScrolled(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


   const handleHr = ()=>{
    setCookies('topic', ['HR', '00000'])
    navigate("/instruction")
   }


  const itemsI = [
    { label: <Link to="/subjects">Technical Interview</Link>, key: "0" },
    { label: <button onClick={handleHr}>HR Interview</button>, key: "1" },
  ];

  const itemsM = [
    { label: <Link to="/mcq-subjects">MCQ Practice</Link>, key: "0" },

    { label: <Link to="/codeInstruction">Coding Practice</Link>, key: "1" },
  ];

  const itemsP = [

    { label: <Link to="/report">Report</Link>, key: "0" },

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
      { label: <Link to="/">Home</Link>, key: "0" }, 
    ],
    Interview: itemsI,
    Assessment: itemsM,
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
                  <Button type="link" className={` capitalize ${scrolled ? "text-white" : "text-black"}`}>
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
