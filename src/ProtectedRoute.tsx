import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
import {Button, Spinner} from "flowbite-react";
import {Outlet} from "react-router-dom";
import {customTheme} from "./Utils/theme.ts";
import Menu from "./components/utils/Menu.tsx";

const ProtectedRoute = () => {
    const {isLoading, isAuthenticated, login, register} = useKindeAuth();

    if (isLoading) {
        return (
            <div className={'w-full h-[100vh]'}>
                <Spinner className={'absolute top-1/2 left-1/2'} size={"xl"}/>
            </div>
        )
    }

    if (!isLoading && !isAuthenticated) {
        return (
            <div className={'w-full m-auto box'}>
                <Menu/>
                <div className={'shadow container w-[80%] m-auto bg-transparent h-[40vh] mt-[20vh] relative rounded-md lg:w-1/2 md:w-[60%]'}>
                    <p className={'text-center text-md relative top-16'}>Musisz się zalogować, żeby przejść dalej</p>
                    <div className={'buttons flex gap-2 justify-center items-center h-full'}>
                        <Button theme={customTheme.button} color={'primary'}
                                onClick={() => login({org_code: 'org_10006d186d9'})}>zaloguj się</Button>
                        <Button theme={customTheme.button} color={'primary'}
                                onClick={() => register({org_code: 'org_10006d186d9'})}>zarejestruj się</Button>
                    </div>
                </div>
            </div>
        )
    }

    if (!isLoading && isAuthenticated) {
        return <Outlet/>
    }
};

export default ProtectedRoute;
