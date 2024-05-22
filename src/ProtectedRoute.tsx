import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
import {Outlet} from "react-router-dom";

export default function ProtectedRoute() {
    const {isLoading, isAuthenticated, login} = useKindeAuth();

    if (isLoading) {
        return <h1>Loading...</h1>
    }

    if (!isLoading && !isAuthenticated) {
        return (
            <div>
                <h1>Not authenicated</h1>
                <button onClick={login}>Login</button>
            </div>
        )
    }

    if (!isLoading && isAuthenticated) {
        return <Outlet/>
    }
}
