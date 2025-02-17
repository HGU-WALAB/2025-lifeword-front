import React from "react";
import { loginWithGoogle } from "../../services/APIService";

const SignUpPageSocial = () => {
    return (
        <div>
            <h2>소셜 회원가입</h2>
            <button onClick={loginWithGoogle}>구글 회원가입</button>
        </div>
    );
};

export default SignUpPageSocial;
