import { Link, useNavigate } from "react-router-dom";
import "../assets/Styles/Pages/login.css";
import { useEffect, useState } from "react";
import axiosInstance from "../context/axiosInstance.js";
import loginBg from "../assets/images/Login-1.jpg";
const Login = () => {
  useEffect(() => {
    document.title = "Billing | login";
  }, []);

  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/login", { userName, password });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/");
      }
      console.log("token ", localStorage.getItem("token"));

    } catch (error) {
      console.log("Error : ", error);
    }
  };

  return (
    <div className="container-fluid vh-100 d-md-flex flex-row vw-100 g-0">
      <div className="left-bar h-100 w-50 d-none d-md-block">
        <img src={loginBg} alt="loging.jp" className="h-100 w-100"/>
      </div>
      <div className="right-bar h-100 w-50 d-flex justify-content-center align-items-center">
        <div className="container h-75 border rounded w-75 ">
          <form onSubmit={handleSubmit} className="w-100 h-100 d-flex align-items-center flex-column p-5 justify-content-around">
            <h3>SignIn</h3>
            <div className="input-groups w-75">
              <input
                type="text"
                name="userName"
                id="userName"
                className="form-control"
                placeholder="Email or UserName"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                }}
              />
              <input
                type="password"
                name="password"
                id="password"
                required
                className="form-control mt-5"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="text-align-start w-75 mt-3">
                <p className="second-font">Forgot password ?</p>
              </div>
            </div>
            <div className="button-group w-50 d-flex align-items-center flex-column">
              <button className="btn btn-secondary w-100 mb-3" type="submit">
                SignIn
              </button>
              <p className="second-font">
                or with <span className="bold fw-bold">google account</span>
              </p>
              <p className="second-font">
                don't have account ?
                <Link to="/signup" className="second-font fw-bold ">
                  signup
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
