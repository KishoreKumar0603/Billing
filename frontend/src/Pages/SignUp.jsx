import  { use, useState } from 'react'
import "../assets/Styles/Pages/signUp.css";
import { Link } from 'react-router-dom';
const SignUp = () => {
  const [user , setUser] = useState({
    name:"",
    email:"",
    phone:"",
    password:"",
    confirmPassword:""
  });

  const [isVisible, setIsVisible] = useState({
    btn1:false,
    btn2:false
  });
  return (
    <div className="container-fluid d-flex justify-content-center align-items center vh-100 vw-100 g-0 ">
       <div className="left-bar h-100 w-50 d-none d-md-block"></div>
      <div className="right-bar h-100 w-50 d-flex justify-content-center align-items-center">
        <div className="container h-75 border rounded w-75">
          {/* <form > */}
            <h3>SignUp</h3>
            <div className="input-groups w-75">
              <input type="text"
              name='name'
              id='name'
              className='form-control'
              placeholder='Name'
              value={user.name}
              onChange={(e) =>{
                setUser({
                  ...user,
                  name : e.target.value}
                )
              }}
              required
              />
              <input type="email"
              name='email'
              id='email'
              className='form-control'
              value={user.email}
              onChange={(e)=>{
                setUser({
                  ...user,
                  email:e.target.value
                })
              }}
              placeholder='Email'
              required
               />
              
              <input type="text"
              name='phone'
              id='phone'
              className='form-control'
              placeholder='Phone'
              value={user.phone}
              onChange={(e)=>{
                setUser({
                  ...user,
                  phone : e.target.value
                })
              }} 
              required
              />
              <input type={isVisible.btn1 ? "text" :"password"} 
              name="password"
              id="password"
              placeholder='Password'
              className='form-control'
              value={user.password}
              onChange={(e)=>{
                setUser({
                  ...user,
                  password : e.target.value
                })
              }}
              required
              />
              <input type={isVisible.btn2 ? "text" : "password"} 
              name="confirmpass" id="confirmpass"
              placeholder='Confirm Password'
              className='form-control'
              value={user.confirmPassword}
              onChange={(e)=>{
                setUser({
                  ...user,
                  confirmPassword : e.target.value
                });
              }}
              />
              
            </div>
            <button onClick={()=>console.table(user)} className='btn btn-dark'>SignUp</button>
            <p className='text-muted'>or with <Link to="/" className='text-dark text-decoration-none'>Google</Link></p>
            <p className='text-muted'>Already have account ? <Link to="/login" className='text-dark text-decoration-none'>login</Link></p>

          {/* </form> */}
        </div>
      </div>
    </div>
  )
}

export default SignUp