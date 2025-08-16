import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
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
    if (allUser) {
      localStorage.setItem("userList", JSON.stringify(allUser));
    } else {
      localStorage.removeItem("userList");
    }
  }, [allUser]);

  const logout = () => {
    setUser(null);
    setAllUser(null);
    console.log("User logged out");
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, setAllUser, allUser }}>
      {children}
    </UserContext.Provider>
  );
};
