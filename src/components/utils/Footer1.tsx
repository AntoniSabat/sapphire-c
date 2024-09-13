import { Footer, FooterCopyright, FooterLink, FooterLinkGroup } from "flowbite-react";
import {PAGE_PATH} from "../../Utils/env.ts";

const links = [
    { href: PAGE_PATH, label: "Główna" },
    { href: `${PAGE_PATH}/comps`, label: "Terminy" },
    { href: `${PAGE_PATH}/comps/reports`, label: "Umówione" },
    { href: `${PAGE_PATH}/employees`, label: "Usługi" },
    { href: `${PAGE_PATH}/treatments`, label: "Pracownicy" },
    { href: `${PAGE_PATH}/gallery`, label: "Galeria" }
];

const Footer1 = () => {
    return (
        <Footer container>
            <FooterCopyright href="#" by="Sapphire Studio™ - page created by Antoni Sabat" year={2024} />
            <FooterLinkGroup>
                {links.map(({href, label}) => (
                    <FooterLink key={label} href={href}>{label}</FooterLink>
                ))}
            </FooterLinkGroup>
        </Footer>
    );
};

export default Footer1;
