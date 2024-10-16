/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { createContext, useState, useContext} from "react";
import { useCookies } from "react-cookie";
import { notification } from "antd";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // const [user, setUser] = useState();
  const [cookies, setCookies, removeCookies] = useCookies(
    "userData",
    "isLogin", 
    "selectSubject",
  );
  // const userRoute = immport.meta.env.VITE_ROUTE;
  // const route = `${userRoute}`

  const login = async (username, password) => {
    try {
      // const reponse =
      const data = [username, password];
      if (data) {
        //rersponse.ok
        setCookies("userData", username);
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



  const logout = ()=>{
    removeCookies(['userData', 'isLogin', 'selectSubject']);
    notification.success({
        message: "Logout Successful",
      });
  }



  const register = (username, password, email,  college)=>{
    try{
        // const response 
        const data = ["user", "user@gmail.com", "user", "vit"];
        if(data)     //response.ok
        {
            setCookies('userData', [username, password, email,  college]);
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
