import React, { useContext, useState, useEffect } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from "axios"
import GoogleIcon from '../icons/GoogleIcon'

const LoginPopup = ({setShowLogin}) => {

    const {url, setToken, setUser} = useContext(StoreContext)

    const [currState,setCurrState] = useState("Login")
    const [data,setData] = useState({
        name:"",
        email:"",
        password:""
    })

    // Add event listener to listen for messages from the popup window
    useEffect(() => {
        const handleMessage = (event) => {
            // Only accept messages from the same origin for security
            if (event.origin !== window.location.origin) return;

            // Check if the message is from our authentication popup
            if (event.data && event.data.type === 'AUTH_SUCCESS') {
                // Handle successful authentication
                const { token, user } = event.data;

                // Save token and user info
                setToken(token);

                // Save user info if available
                if (user) {
                    setUser(user);
                }

                // Close the login popup
                setShowLogin(false);
            }
        };

        // Add event listener
        window.addEventListener('message', handleMessage);

        // Clean up
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [setToken, setUser, setShowLogin]);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data=>({...data,[name]:value}))
    }

    const handleGoogleSignIn = () => {
        // Open Google OAuth in a popup window
        const googleAuthUrl = `${url}/api/user/auth/google`;

        // Use popup window approach
        const width = 500;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        // Open the popup with specific features to ensure it's recognized as a popup
        const popup = window.open(
            googleAuthUrl,
            'googleAuth',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
        );

        // Focus on the popup to ensure it's in the foreground
        if (popup) {
            popup.focus();
        }

        // Uncomment this if you prefer redirect in the same window
        // window.location.href = googleAuthUrl;
    }

    const onLogin = async (event) => {
        event.preventDefault()
        let newUrl = url;
        if (currState==="Login"){
            newUrl += "/api/user/login"
        }
        else{
            newUrl += "/api/user/register"
        }

        const response = await axios.post(newUrl,data);

        if (response.data.success) {
            setToken(response.data.token);
            localStorage.setItem("token",response.data.token);
            setShowLogin(false)
        }
        else{
            alert(response.data.message)
        }

    }


  return (
    <div className='login-popup'>
        <form onSubmit={onLogin} className="login-popup-container">
            <div className="login-popup-title">
                <h2>{currState}</h2>
                <img onClick={()=>setShowLogin(false)} src={assets.cross_icon} alt="" />
            </div>
            <div className="login-popup-inputs">
                {currState==="Login"?<></>: <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required/>}
                <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required/>
                <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required/>
            </div>
            <button type='submit'>{currState==="Sign Up"?"Create account":"Login"}</button>

            <div className="login-popup-divider">
                <span>OR</span>
            </div>

            <button
                type="button"
                onClick={handleGoogleSignIn}
                className="google-signin-button"
            >
                <GoogleIcon size={20} />
                <span>Sign in with Google</span>
            </button>

            <div className="login-popup-condition">
                <input type="checkbox" required/>
                <p>By continuing, i agree to the terms of use & privacy policy.</p>
            </div>
            {currState==="Login"?
            <p>Create a new account? <span onClick={()=>setCurrState("Sign Up")}>Click here</span></p>
            :<p>Already have an account? <span onClick={()=>setCurrState("Login")}>Login here</span></p>
            }


        </form>
    </div>
  )
}

export default LoginPopup