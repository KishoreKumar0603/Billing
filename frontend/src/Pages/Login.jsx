import { useEffect, useState } from "react";
import '../assets/Styles/Pages/login.css'
const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="container">
      <div className="input-div">
        <label htmlFor="userName">Username</label>
        <input type="text" name="userName" value={userName} onChange={(e)=>{
            setUserName(e.target.value);
        }} />
      </div>
      <div className="input-div">
        <label htmlFor="password">Password</label>
        <input type="password" name="password" onChange={(e)=>{
          setPassword(e.target.value);
        }} />
      </div>
      
    </div>
  );
};

export default Login;
