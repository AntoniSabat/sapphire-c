import {useEffect, useState} from 'react';
import GrapQL from "../../Utils/GrapQL.ts";
import {PAGE_PATH} from "../../Utils/env.ts";
import Menu from "../../components/utils/Menu.tsx";
import {Button, Spinner, Table} from "flowbite-react";
import {customTheme} from "../../Utils/theme.ts";
import Footer1 from "../../components/utils/Footer1.tsx";

const ChooseCompReports = () => {
    const [comps, setComps] = useState([]);
    const [compsLoading, setCompsLoading] = useState(true);

    useEffect(() => {
        GrapQL.loadComps().then((res: {comps}) => {
            setComps(res.comps);
            setCompsLoading(false);
        })
    }, []);
    return (
        <div className={'relative pb-[100px] min-h-[100vh]'}>
            <Menu/>
            {compsLoading
                ? <div className={'w-full h-[100vh]'}>
                    <Spinner className={'absolute top-1/2 left-1/2'} size={"xl"}/>
                </div>
                : <div>
                    <div>
                        <h1 className="text-center text-3xl font-bold mt-10">Zgłoszenia</h1>
                        <p className="text-center text-md mt-2">Wybierz turniej aby kontynuować!</p>
                    </div>

                    <div className={'container mx-auto mt-10 overflow-x-scroll'}>
                        <Table hoverable>
                            <Table.Head>
                                <Table.HeadCell>Nazwa</Table.HeadCell>
                                <Table.HeadCell>Miejsce</Table.HeadCell>
                                <Table.HeadCell>Data</Table.HeadCell>
                                <Table.HeadCell>Godziny</Table.HeadCell>
                                <Table.HeadCell>Zgłoszenia</Table.HeadCell>
                            </Table.Head>
                            <Table.Body className="divide-y">
                                {comps.map(((comp, index) => (
                                    <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                        <Table.Cell
                                            className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            {comp.name}
                                        </Table.Cell>
                                        <Table.Cell>{comp.place}</Table.Cell>
                                        <Table.Cell>{comp.date}</Table.Cell>
                                        <Table.Cell>{comp.timeStart} - {comp.timeEnd}</Table.Cell>
                                        <Table.Cell>
                                            <Button theme={customTheme.button} color={'secondary'} className={''}>
                                                <a href={`${PAGE_PATH}/comps/${comp._id}/reports`}>Dalej</a>
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                )))}
                            </Table.Body>
                        </Table>
                    </div>
                </div>
            }
        </div>
    );
};

export default ChooseCompReports;
