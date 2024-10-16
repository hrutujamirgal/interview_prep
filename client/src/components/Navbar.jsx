/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Menu, Button, Drawer, Dropdown } from "antd";
import { useCookies } from "react-cookie";
import { MenuOutlined } from "@ant-design/icons";
import Login from "./Login";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const beforeLogin = ["Login", "SignUp"];
  const afterLogin = ["Interview", "MCQ", "Profile"];
  const [bar, setBar] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  const [cookies] = useCookies(["isLogin"]);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Menu Items for Dropdowns
  const itemsI = [
    {
      label: (
        <a target="_blank" rel="noopener noreferrer" href="/Subjective">
          Subjective Interview
        </a>
      ),
      key: "0",
    },
    {
      label: (
        <a target="_blank" rel="noopener noreferrer" href="/hrInterview">
          HR Interview
        </a>
      ),
      key: "1",
    },
  ];

  const itemsM = [
    {
      label: (
        <a target="_blank" rel="noopener noreferrer" href="/SubjectA">
          Subject A
        </a>
      ),
      key: "0",
    },
    {
      label: (
        <a target="_blank" rel="noopener noreferrer" href="/SubjectB">
          Subject B
        </a>
      ),
      key: "1",
    },
  ];

  const itemsP = [
    {
      label: (
        <a target="_blank" rel="noopener noreferrer" href="/Report">
          Report
        </a>
      ),
      key: "0",
    },
    {
      label: (
        <a target="_blank" rel="noopener noreferrer" href="/Logout">
          Logout
        </a>
      ),
      key: "1",
    },
  ];

  const map = {
    Interview: itemsI,
    MCQ: itemsM,
    Profile: itemsP,
  };

  useEffect(() => {
    if (cookies.isLogin) {
      setBar(afterLogin);
    } else {
      setBar(beforeLogin);
    }
  }, [cookies.isLogin]);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <nav
        className={`w-screen flex justify-between items-center px-5 py-3 shadow-lg z-10 
         ${scrolled ? "bg-main fixed text-white" : "bg-opacity-15"}`}
      >
        <p className="font-serif font-bold text-2xl">Interview Prep</p>

        <Button
          className="md:hidden bg-main hover:bg-main transition-all duration-300 text-xl"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#800080";
            e.currentTarget.style.color = "#800080";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#D3D3D3";
            e.currentTarget.style.color = "initial";
          }}
          type="primary"
          onClick={showDrawer}
        >
          <MenuOutlined />
        </Button>

        {!cookies.isLogin ? (
          <ul className="list-none hidden md:flex px-5 text-xl">
            {bar.map((items) => (
              <li className="px-2" key={items}>
                <Login name={items}>{items}</Login>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="list-none hidden md:flex px-5">
            {bar.map((items) => (
              <li className="px-2" key={items}>
                {map[items] ? (
                  <Dropdown overlay={<Menu items={map[items]} />}>
                    <Button
                      type="link"
                      className={`text-xl font-serif ${
                        isHovered ? "text-white underline" : "text-white"
                      } ${scrolled ? " text-white" : "text-black"}`}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      {items}
                    </Button>
                  </Dropdown>
                ) : (
                  <Button type="link" className={`text-xl font-serif ${isHovered ? "text-white underline" : "text-white"}`}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}>{items}</Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </nav>

      <Drawer
        title="Menu"
        placement="right"
        onClose={onClose}
        visible={visible}
      >
        <Menu>
          {bar.map((items) => (
            <Menu.Item key={items}>{items}</Menu.Item>
          ))}
        </Menu>
      </Drawer>
    </>
  );
};

export default Navbar;
