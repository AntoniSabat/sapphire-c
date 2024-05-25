import "./ProfilePage.scss"
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
import {Avatar, Button} from "flowbite-react";
import {customTheme} from "../../Utils/theme.ts";
import Menu from "../../components/utils/Menu.tsx";
import {useEffect, useState} from "react";

const checkUserPicture = (pictureUrl: string): Promise<string> => {
    return new Promise((resolve, _) => {
        const img = new Image();
        img.onload = () => resolve(pictureUrl);
        img.onerror = () => resolve('');
        img.src = pictureUrl;
    });
}

const ProfilePage = () => {
    const [user, setUser] = useState<{ given_name: string, family_name: string, email: string, picture: string } | null>(null);
    const {login, register, logout} = useKindeAuth();
    const [admin, setAdmin] = useState(false);
    const [userPicture, setUserPicture] = useState<string | undefined>('');

    useEffect(() => {
        setAdmin(localStorage.getItem('admin') === 'true');
        if (localStorage.getItem('user')) {
            const user = JSON.parse(localStorage.getItem('user'))
            setUser(user);
        }
    }, []);

    useEffect(() => {
        const fetchUserPicture = async () => {
            try {
                if (user?.picture) {
                    const pictureUrl = await checkUserPicture(user.picture);
                    setUserPicture(pictureUrl as string);
                }
            } catch (error) {
                console.error('Błąd podczas ładowania obrazka:', error);
            }
        };

        fetchUserPicture();
    }, [user?.picture]);

    const handleLogout = async() => {
        await logout();
        setUser(null);
        setAdmin(false);
        localStorage.removeItem('admin');
        localStorage.removeItem('user');
    }

    return (
        <div className={'w-full m-auto box'}>
            <Menu/>
                <div>
                    <div className={'shadow container w-[80%] m-auto bg-transparent h-[40vh] mt-[20vh] relative rounded-md lg:w-1/2 md:w-[60%]'}>
                        {user
                            ? <>
                                <Avatar img={`${userPicture}`} rounded size={"xl"} className={'avatar'}/>

                                <div className={'flex flex-col gap-1.5 mt-[-50px]'}>
                                    <p className={'userName text-center text-3xl'}>{user?.given_name} {user?.family_name}{admin && ' - admin'}</p>
                                    <p className={'userEmail text-center text-md'}>{user?.email}</p>
                                    <Button color={'red'} className={'self-center absolute bottom-5 w-52'} onClick={handleLogout}>logout</Button>
                                </div>
                            </>
                            : <div className={'buttons flex gap-2 justify-center items-center h-full'}>
                                <Button theme={customTheme.button} color={'primary'}
                                        onClick={() => login({org_code: 'org_10006d186d9'})}>zaloguj się</Button>
                                <Button theme={customTheme.button} color={'primary'}
                                        onClick={() => register({org_code: 'org_10006d186d9'})}>zarejestruj się</Button>
                            </div>
                        }
                    </div>
                </div>
        </div>
    )
};

export default ProfilePage;
