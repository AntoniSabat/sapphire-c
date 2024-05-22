import "./ProfilePage.scss"
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
import {Avatar, Button, Spinner} from "flowbite-react";
import {customTheme} from "../../Utils/theme.ts";
import Menu from "../../components/utils/Menu.tsx";
import {useEffect, useState} from "react";

const ProfilePage = () => {
    const {login, register, logout, isAuthenticated,  user, isLoading, getPermission} = useKindeAuth();
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            const admin = getPermission('admin').isGranted;
            if (admin) {
                setAdmin(true);
            }
        }
    }, [isAuthenticated]);

    const checkUserPicture = () => {
        return user?.picture ? user.picture : '';
    }

    return (
        <div className={'w-full m-auto box'}>
            <Menu/>
            { isLoading
                ? <div className={'w-full h-[100vh]'}>
                    <Spinner className={'absolute top-1/2 left-1/2'} size={"xl"}/>
                </div>
                : <div>
                    <div className={'shadow container w-[80%] m-auto bg-transparent h-[40vh] mt-[20vh] relative rounded-md lg:w-1/2 md:w-[60%]'}>
                        {isAuthenticated
                            ? <>
                                <Avatar img={`${checkUserPicture()}`} rounded size={"xl"} className={'avatar'}/>

                                <div className={'flex flex-col gap-1.5 mt-[-50px]'}>
                                    <p className={'userName text-center text-3xl'}>{user?.given_name} {user?.family_name}{admin && ' - admin'}</p>
                                    <p className={'userEmail text-center text-md'}>{user?.email}</p>
                                    <Button color={'red'} className={'self-center absolute bottom-5 w-52'} onClick={logout}>logout</Button>
                                </div>
                            </>
                            : <div className={'buttons flex gap-2 justify-center items-center h-full'}>
                                <Button theme={customTheme.button} color={'primary'}
                                        onClick={() => register({org_code: 'org_10006d186d9'})}>register</Button>
                                <Button theme={customTheme.button} color={'primary'}
                                        onClick={() => login({org_code: 'org_10006d186d9'})}>login</Button>
                            </div>
                        }
                    </div>
                </div>
            }
        </div>
    )
};

export default ProfilePage;
