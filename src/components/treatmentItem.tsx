import {PAGE_PATH} from "../Utils/env.ts";
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
import {useEffect, useState} from "react";
import {Card, Dropdown, DropdownItem} from "flowbite-react";
import {Currency} from "../models/Treatment.model.ts";

const TreatmentItem = ({treatment, remove}) => {
    const {isAuthenticated, getPermission} = useKindeAuth();
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            const admin = getPermission('admin').isGranted;
            if (admin) {
                setAdmin(true);
            }
        }
    }, [isAuthenticated]);

    return (
        // <div>
        //     <Link to={`${PAGE_PATH}/treatments/${treatment._id}`}>
        //         {treatment.name} {treatment.price} {treatment.currency}
        //     </Link>
        //     {admin &&
        //         <button onClick={() => remove(treatment._id)}><IoClose color={'crimson'}/></button>
        //     }
        // </div>
        <Card
            className="w-full"
            imgAlt=""
            imgSrc={treatment.image}
        >
            {/*<div className="flex justify-end px-4 pt-4">*/}
            {/*    {admin &&*/}
            {/*        <Dropdown inline label="">*/}
            {/*            <DropdownItem>*/}
            {/*                <button onClick={() => remove(treatment._id)}*/}
            {/*                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white">*/}
            {/*                    Usuń*/}
            {/*                </button>*/}
            {/*            </DropdownItem>*/}
            {/*        </Dropdown>*/}
            {/*    }*/}
            {/*</div>*/}
            <a href="#">
                <div className={'flex justify-between'}>
                    <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                        {treatment.name}
                    </h5>
                    {admin &&
                        <Dropdown inline label="">
                            <DropdownItem>
                                <button onClick={() => remove(treatment._id)} className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white">
                                    Usuń
                                </button>
                            </DropdownItem>
                        </Dropdown>
                    }
                </div>
            </a>
            <div className="flex items-center justify-between">
                <span
                    className="text-3xl font-bold text-gray-900 dark:text-white">{treatment.currency != Currency.PLN ? treatment.currency === Currency.EUR && '€' : ''}{treatment.price}{treatment.currency === Currency.PLN && 'zł'}</span>
                <button
                    className="rounded-lg bg-secondary px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary focus:outline-none focus:ring-4 focus:ring-primary dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
                >
                    <a href={`${PAGE_PATH}/treatments/${treatment._id}`}>Szczegóły</a>
                </button>
            </div>
        </Card>
    );
};

export default TreatmentItem;
