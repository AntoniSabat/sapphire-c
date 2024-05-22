import {Link} from "react-router-dom";
import {PAGE_PATH} from "../Utils/env.ts";
import {useEffect, useState} from "react";
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
import {Avatar, Button, Card, Dropdown, DropdownItem} from "flowbite-react";
import {customTheme} from "../Utils/theme.ts";

const EmployeeItem = ({employee, remove}) => {
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
        <Card className="w-[100%]">
            <div className="flex justify-end px-4 pt-4">
                {admin &&
                    <Dropdown inline label="">
                        <DropdownItem>
                            <button onClick={() => remove(employee._id)} className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white">
                                Usuń
                            </button>
                        </DropdownItem>
                    </Dropdown>
                }
            </div>
            <div className="flex flex-col items-center pb-10">
                {employee.image != 'null' && employee.image != null
                    ? <img
                        alt={""}
                        height="140"
                        src={employee.image}
                        width="140"
                        className="mb-3 rounded-full shadow-lg"
                    />
                    : <Avatar className={'mb-3'} img={employee.picture} rounded={true} size={'xl'}/>
                }

                <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">{employee.name} {employee.surname}</h5>
                <span className="text-sm text-gray-500 dark:text-gray-400">Pracownik {employee.tag}</span>
                <div className="mt-4 flex space-x-3 lg:mt-6">
                    <Link
                        to={`${PAGE_PATH}/employees/${employee._id}`}
                        className="inline-flex items-center rounded-lg bg-secondary px-4 py-2 text-center text-sm font-medium text-white transition duration-200 hover:bg-primary focus:outline-none focus:ring-4 focus:ring-primary dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:focus:ring-cyan-800"
                    >
                        Zobacz jego prace</Link>
                    <Button
                        theme={customTheme.button}
                        gradientDuoTone={'purpleToOrange'}
                        className="inline-flex transition items-center rounded-lg border border-gray-300 text-center text-sm font-medium text-white hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                    >
                        <a target={'_blank'} className={'block w-full h-full'} href={employee.ig}>IG</a>
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default EmployeeItem;
