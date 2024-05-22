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
    NavbarToggle, Spinner
} from "flowbite-react";
import {customTheme} from "../../Utils/theme.ts";

const links = [
    { href: PAGE_PATH, label: "Główna" },
    { href: `${PAGE_PATH}/comps`, label: "Terminy" },
    { href: `${PAGE_PATH}/comps/reports`, label: "Umówione" },
    { href: `${PAGE_PATH}/treatments`, label: "Usługi" },
    { href: `${PAGE_PATH}/employees`, label: "Pracownicy" },
    { href: `${PAGE_PATH}/gallery`, label: "Galeria" }
];

const Menu = ({upperHeader= true}) => {
    const {logout, isAuthenticated,  user, isLoading} = useKindeAuth();

    const checkUserPicture = () => {
        return user?.picture ? user.picture : '';
    }

    return (
        <div>
            <Flowbite>
                <div style={!upperHeader ? {display: 'none'} : {display: 'block'}} className="upperHeader"></div>
                <Navbar theme={customTheme.navbar} fluid rounded>
                    <NavbarBrand href={PAGE_PATH}>
                        <img src={logo} className="mr-3 h-12 sm:h-12" alt="Flowbite React Logo" />
                    </NavbarBrand>
                    {isLoading
                        ? <div className="flex md:order-2">
                            <Spinner/>
                        </div>
                        : isAuthenticated
                            ? <>
                                <div className="flex md:order-2">
                                    <Dropdown
                                        arrowIcon={false}
                                        inline
                                        label={
                                            <Avatar img={`${checkUserPicture()}`} rounded/>
                                        }
                                    >
                                        <Dropdown.Header>
                                            <span className="block text-sm">{user?.given_name} {user?.family_name}</span>
                                            <span className="block truncate text-sm font-medium">{user?.email}</span>
                                        </Dropdown.Header>
                                        <Dropdown.Item><a href={`${PAGE_PATH}/profile`}>Profil</a></Dropdown.Item>
                                        <Dropdown.Divider/>
                                        <Dropdown.Item onClick={logout}>Wyloguj się</Dropdown.Item>
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
