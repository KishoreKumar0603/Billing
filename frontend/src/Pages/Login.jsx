import { Link } from "react-router-dom";
import "../assets/Styles/Pages/login.css";
import { useEffect, useState } from "react";

const Login = () => {
  useEffect(() => {
    document.title = "Billing | login";
  }, []);

  const [userName, setUserName] = useState();
  const [password, setPassword] = useState();

  function setUser(e) {
    setUserName(e);
  }
  function setPass(e) {
    setPassword(e);
  }

  const printUser = () => {
    console.log("UseName : ", userName);
    console.log("Password : ", password);
  };

  return (
    <div className="container-fluid vh-100 d-md-flex flex-row vw-100 g-0">
      <div className="left-bar h-100 w-50 d-none d-md-block"></div>
      <div className="right-bar h-100 w-50 d-flex justify-content-center align-items-center">
        <div className="container h-75 border rounded w-75 d-flex align-items-center flex-column p-5 justify-content-around">
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
                setUser(e.target.value);
              }}
            />
            <input
              type="text"
              name="password"
              id="password"
              required
              className="form-control mt-5"
              placeholder="Password"
            />
            <div className="text-align-start w-75 mt-3">
              <p className="second-font">Forgot password ?</p>
            </div>
          </div>
          <div className="button-group w-50 d-flex align-items-center flex-column">
            <button className="btn btn-secondary w-100 mb-3"
              onClick={printUser()}
            >SignIn</button>
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
        </div>
      </div>
    </div>
  );
};

export default Login;
