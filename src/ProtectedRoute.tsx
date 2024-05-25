import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
import {Button} from "flowbite-react";
import {Outlet} from "react-router-dom";
import {customTheme} from "./Utils/theme.ts";
import Menu from "./components/utils/Menu.tsx";
import {useEffect, useState} from "react";

const ProtectedRoute = () => {
    const [user, setUser] = useState<{ given_name: string, family_name: string, email: string, picture: string } | null>(null);

    useEffect(() => {
        if (localStorage.getItem('user')) {
            const user = JSON.parse(localStorage.getItem('user'))
            setUser(user);
        }
    }, []);

    const {login, register} = useKindeAuth();

    if (!user) {
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

    if (user) {
        return <Outlet/>
    }
};

export default ProtectedRoute;
