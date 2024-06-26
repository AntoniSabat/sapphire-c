import "./Menu.scss";
import logo from "../../assets/images/logo.png";
import { PAGE_PATH } from "../../Utils/env.ts";
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
import {
    Avatar,
    Button,
    Dropdown,
    Flowbite,
    Navbar,
    NavbarBrand,
    NavbarCollapse,
    NavbarLink,
    NavbarToggle
} from "flowbite-react";
import {customTheme} from "../../Utils/theme.ts";
import {useEffect, useState} from "react";

const links = [
    { href: PAGE_PATH, label: "Główna" },
    { href: `${PAGE_PATH}/comps`, label: "Terminy" },
    { href: `${PAGE_PATH}/comps/reports`, label: "Umówione" },
    { href: `${PAGE_PATH}/treatments`, label: "Usługi" },
    { href: `${PAGE_PATH}/employees`, label: "Pracownicy" },
    { href: `${PAGE_PATH}/gallery`, label: "Galeria" }
];

const checkUserPicture = (pictureUrl: string): Promise<string> => {
    return new Promise((resolve, _) => {
        const img = new Image();
        img.onload = () => resolve(pictureUrl);
        img.onerror = () => resolve('');
        img.src = pictureUrl;
    });
}

const Menu = ({upperHeader= true}) => {
    const [savedUser, setSavedUser] = useState<{ given_name: string, family_name: string, email: string, picture: string | null } | null>(null);
    const {logout, isAuthenticated , getPermission, user} = useKindeAuth();
    const [userPicture, setUserPicture] = useState<string | undefined>('');

    useEffect(() => {
        if (isAuthenticated) {
            const admin = getPermission('admin').isGranted;
            admin ? localStorage.setItem('admin', 'true') : localStorage.removeItem('admin');
            localStorage.setItem('user', JSON.stringify(user));
            loadUser();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        const fetchUserPicture = async () => {
            try {
                if (savedUser?.picture) {
                    const pictureUrl = await checkUserPicture(savedUser.picture);
                    setUserPicture(pictureUrl as string);
                }
            } catch (error) {
                console.error('Błąd podczas ładowania obrazka:', error);
            }
        };

        fetchUserPicture();
    }, [savedUser]);

    const loadUser = () => {
        if (localStorage.getItem('user')) {
            const user = JSON.parse(localStorage.getItem('user'));
            setSavedUser(user);
        }
    }

    const handleLogout = async() => {
        setSavedUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        await logout()
    }

    return (
        <div>
            <Flowbite>
                <div style={!upperHeader ? {display: 'none'} : {display: 'block'}} className="upperHeader"></div>
                <Navbar theme={customTheme.navbar} fluid rounded>
                    <NavbarBrand href={PAGE_PATH}>
                        <img src={logo} className="mr-3 h-12 sm:h-12" alt="Flowbite React Logo" />
                    </NavbarBrand>
                    {savedUser
                        ? <>
                            <div className="flex md:order-2">
                                <Dropdown
                                    arrowIcon={false}
                                    inline
                                    label={
                                        <Avatar img={`${userPicture}`} rounded/>
                                    }
                                >
                                    <Dropdown.Header>
                                        <span className="block text-sm">{savedUser?.given_name} {savedUser?.family_name}</span>
                                        <span className="block truncate text-sm font-medium">{savedUser?.email}</span>
                                    </Dropdown.Header>
                                    <Dropdown.Item><a href={`${PAGE_PATH}/profile`}>Profil</a></Dropdown.Item>
                                    <Dropdown.Divider/>
                                    <Dropdown.Item onClick={handleLogout}>Wyloguj się</Dropdown.Item>
                                </Dropdown>
                                <Navbar.Toggle/>
                            </div>
                        </>
                        :
                            <div className="flex md:order-2">
                                <Button color={'primary'} theme={customTheme.button}>
                                    <a className='block w-full h-full' href={`${PAGE_PATH}/profile`}>Rozpocznij!</a>
                                </Button>
                                <NavbarToggle/>
                            </div>
                    }
                    <NavbarCollapse>
                        {links.map(({href, label}) => (
                            <NavbarLink
                                key={href}
                                href={href}
                                active={PAGE_PATH === href}
                            >
                                {label}
                            </NavbarLink>
                        ))}
                    </NavbarCollapse>
                </Navbar>
            </Flowbite>
        </div>
    );
};

export default Menu;
