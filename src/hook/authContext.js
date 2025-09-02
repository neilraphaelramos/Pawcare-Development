import { createContext, useState, useEffect } from "react";
import { googleLogout } from "@react-oauth/google";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [agoraData, setAgoraData] = useState(() => {
    const storedAgoraData = localStorage.getItem("agoraData");
    return storedAgoraData ? JSON.parse(storedAgoraData) : null;
  });

  const [allUser, setAllUser] = useState(() => {
    const storedAllData = localStorage.getItem("userList");
    return storedAllData ? JSON.parse(storedAllData) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (agoraData) {
      localStorage.setItem("agoraData", JSON.stringify(agoraData));
    } else {
      localStorage.removeItem("agoraData");
    }
  }, [agoraData]);

  useEffect(() => {
    if (user?.role === "Admin") {
      if (allUser) {
        localStorage.setItem("userList", JSON.stringify(allUser));
      } else {
        localStorage.removeItem("userList");
      }
    } else {
      localStorage.removeItem("userList");
    }
  }, [allUser, user]);

  const logout = () => {
    googleLogout();
    setUser(null);
    setAllUser(null);
    console.log("User logged out");
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, setAllUser, allUser, agoraData, setAgoraData }}>
      {children}
    </UserContext.Provider>
  );
};
