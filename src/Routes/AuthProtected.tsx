import React, { useEffect } from "react";
import { Navigate, Route } from "react-router-dom";
import { setAuthorization } from "../helpers/api_helper";
import { useDispatch } from "react-redux";

import { useProfile } from "Common/Hooks/UserHooks";

import { logoutUser } from "slices/thunk";
import axios from 'axios';
import { setCredentials } from "features/account/authSlice";

import Cookies from 'js-cookie';


const AuthProtected = (props: any) => {
  let token = localStorage.getItem("auth");

  const tokenc = Cookies.get('astk');

  console.log(tokenc);

  const dispatch = useDispatch<any>();
   /*
    Navigate is un-auth access protected routes via url
    */

    if (!tokenc) {
      return (
        <Navigate to={{ pathname: "/login" }} />
      );
    }
  
    console.log(token);
    axios.post(`http://localhost:8800/companies/getCompanyByToken`, { token: tokenc })
    .then((res: any)=> {
      // console.log(res);
      dispatch(setCredentials(res));
    })
  
  
    return <>{props.children}</>;
  };

const AccessRoute = ({ component: Component, ...rest }: any) => {
  return (
    <Route
      {...rest}
      render={(props: any) => {
        return (<> <Component {...props} /> </>);
      }}
    />
  );
};

export { AuthProtected, AccessRoute };