/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { createContext, useState, useContext} from "react";
import { useCookies } from "react-cookie";
import { notification } from "antd";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // const [user, setUser] = useState();
  const [cookies, setCookies, removeCookie] = useCookies(
    "userData",
    "isLogin", 
    "selectSubject",
  );
  const userRoute = import.meta.env.VITE_ROUTE;
  const route = `${userRoute}`

  const login = async (username, password) => {
    try {
      const response = await fetch(`${route}/login`, {
        method: 'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
      })
      const data = await response.json();
      console.log(data.user)
      if (data) {
        setCookies("userData", data.user);
        setCookies("isLogin", true);
        notification.success({
          message: "Login Successful",
        });
      } else {
        notification.error({
          message: "Login Failed!",
        });
      }
    } catch (e) {
      console.error("Error during login:", e);
      notification.error({
        message: "Error in login",
      });
    }
  };



  const logout = () => {
      try {
          Object.keys(cookies).forEach((cookieName) => {
            if (cookieName) {
              removeCookie(cookieName);
            }
          });
        notification.success({
          message: "Logout Successful",
        }); 
      } catch (error) {
        console.log(error)
        notification.error({
          message: 'error in logout',
        });
      }
  };


  const register = async(username, password, email,  collegeName)=>{
    try{
      const response = await fetch(`${route}/register`, {
        method: 'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({username, password, email,  collegeName})
      })

      const data = await response.json();
      console.log(data)
        if(data)    
        {
            setCookies('userData', data.user);
            setCookies("isLogin", true);
            notification.success({
                message: "Regitration Successfully",
              });
        } else {
              notification.error({
                message: "Registration failed!",
              });
        }
    }catch (e) {
        console.error("Error during registration:", e);
        notification.error({
          message: "Error in Registration.",
        });
      }
  };


  return <UserContext.Provider value={{login, logout, register}}>{children}</UserContext.Provider>;
};

export const useAuth = () => useContext(UserContext);
