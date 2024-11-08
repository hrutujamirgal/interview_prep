/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Menu, Button, Drawer, Dropdown, notification } from "antd";
import { useCookies } from "react-cookie";
import { MenuOutlined } from "@ant-design/icons";
import { useAuth } from "../context/UserContext";
import Login from "./Login";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const beforeLogin = ["Login", "SignUp"];
  const [cookies] = useCookies(["isLogin", "userData"]);
  const afterLogin = ["Interview", "MCQ", `${cookies.userData?.username || "User"}`];
  const [bar, setBar] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      notification.success({ message: "Logged out successfully" });
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

  // Dropdown Menu Items
  const itemsI = [
    { label: <a href="/Subjective">Subjective Interview</a>, key: "0" },
    { label: <a href="/hrInterview">HR Interview</a>, key: "1" },
  ];

  const itemsM = [
    { label: <a href="/SubjectA">Subject A</a>, key: "0" },
    { label: <a href="/SubjectB">Subject B</a>, key: "1" },
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

  const dropdownItems = {
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
        <p className="font-serif font-bold text-2xl">Interview Prep</p>

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
            <Menu.Item key={item}>{item}</Menu.Item>
          ))}
        </Menu>
      </Drawer>
    </>
  );
};

export default Navbar;
