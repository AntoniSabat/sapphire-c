import {useEffect, useState} from "react";
import GraphQL from "../../Utils/GrapQL";
import {PAGE_PATH} from "../../Utils/env.ts";
import {ConfirmAlert, ErrorAlert, SuccessAlert} from "../../Utils/alerts.ts";
import Menu from "../../components/utils/Menu.tsx";
import {Button, Datepicker, Label, Modal, Spinner, Table, TextInput} from "flowbite-react";
import {customTheme} from "../../Utils/theme.ts";
import {Comp} from "../../models/Comp.model.ts";
import Footer1 from "../../components/utils/Footer1.tsx";

const CompsPage = () => {
    const [admin, setAdmin] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [comps, setComps] = useState([])

    const [isCreateCompOpen, setIsCreateCompOpen] = useState(false);
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [place, setPlace] = useState('');
    const [timeStart, setTimeStart] = useState('');
    const [timeEnd, setTimeEnd] = useState('');

    useEffect(() => {
        setAdmin(localStorage.getItem('admin') === 'true');
    }, []);

    useEffect(() => {
        GraphQL.loadComps().then((res: {comps}) => {
            setIsLoading(false);
            setComps(res.comps.sort((a: Comp, b: Comp) => convertToDate(a.date).getTime() - convertToDate(b.date).getTime()));
        })
    }, []);

    const handleRemoveComp = (id: string) => {
        ConfirmAlert('Jesteś pewna?', 'Usunięcie turnieju jest nieodwracalne!', (isConfirmed: boolean) => {
            if (isConfirmed) {
                GraphQL.removeComp(id).then((res: {removeComp}) => {
                    setComps(comps.filter(comp => comp._id !== res.removeComp._id));
                    SuccessAlert('Brawo!', 'Pomyślnie usunięto turniej!');
                })
            }
        })
    }

    const convertToDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-');
        return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const validateStartTime = () => {
        return timeStart <= timeEnd;
    };

    const validateEndTime = () => {
        return timeEnd >= timeStart;
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    const handleCreate = (e: any) => {
        e.preventDefault();

        if (!name || !date || !place || !timeStart || !timeEnd) {
            ErrorAlert('Oops...', 'Wypełnij wszystkie pola!');
            return;
        } else {
            GraphQL.createComp(name, date, place, timeStart, timeEnd).then((res: {createComp}) => {
                setComps([...comps, res.createComp]);
                SuccessAlert('Brawo!', 'Pomyślnie dodano turniej!', () => setIsCreateCompOpen(false));
            })
        }
    }

    return (
        <div className={'relative pb-[100px] min-h-[100vh]'}>
            <Menu/>
            {isLoading
                ? <div className={'w-full h-[100vh]'}>
                    <Spinner className={'absolute top-1/2 left-1/2'} size={"xl"}/>
                </div>
                : <div>
                    <div className={'flex gap-3 justify-center items-center'}>
                        <div>
                            <h1 className="text-center text-3xl font-bold mt-10">Turnieje</h1>
                            <p className="text-center text-md mt-2">Sprawdź najbliższe wydarzenia!</p>
                        </div>

                        {admin && <Button theme={customTheme.button} color={'secondary'} className={''}
                                          onClick={() => setIsCreateCompOpen(true)}>Dodaj turniej</Button>}
                    </div>

                    <div className={'container mx-auto mt-10 overflow-x-scroll'}>
                        <Table hoverable>
                            <Table.Head>
                                <Table.HeadCell>Nazwa</Table.HeadCell>
                                <Table.HeadCell>Miejsce</Table.HeadCell>
                                <Table.HeadCell>Data</Table.HeadCell>
                                <Table.HeadCell>Godziny</Table.HeadCell>
                                <Table.HeadCell>Wizyty</Table.HeadCell>
                                {admin && <Table.HeadCell>Usuń</Table.HeadCell>}
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
                                                <a href={`${PAGE_PATH}/comps/${comp._id}`}>Usługi</a>
                                            </Button>
                                        </Table.Cell>
                                        {admin &&
                                            <Table.Cell>
                                                <Button onClick={() => handleRemoveComp(comp._id)}
                                                        theme={customTheme.button} color={'failure'} className={''}>
                                                    Usuń
                                                </Button>
                                            </Table.Cell>
                                        }
                                    </Table.Row>
                                )))}
                            </Table.Body>
                        </Table>
                    </div>
                </div>
            }

            <Modal show={isCreateCompOpen} size="md" onClose={() => setIsCreateCompOpen(false)} popup>
                <Modal.Header />
                <Modal.Body>
                    <div className="space-y-6">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">Stwórz nowy turniej</h3>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="name" value="Nazwa"/>
                            </div>
                            <TextInput
                                id="name"
                                placeholder="Nazwa turnieu"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="date" value="Data"/>
                            </div>
                            <Datepicker weekStart={1}
                                        minDate={new Date()}
                                        onSelectedDateChanged={(date) => setDate(formatDate(date))}
                                        className={'self-center'}/>
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="place" value="Miejsce"/>
                            </div>
                            <TextInput
                                id="place"
                                placeholder="Miejsce"
                                value={place}
                                onChange={(e) => setPlace(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="timeStart" value="Godzina rozpoczęcia"/>
                            </div>
                            <input
                                className={`${validateStartTime() ? 'border-gray-300 text-gray-900 focus:ring-cyan-300 focus:border-blue-500' : 'border-red-700 text-red-700 focus:ring-red-500 focus:border-red-700'} border bg-grey-50 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                                type={'time'}
                                id="timeStart"
                                value={timeStart}
                                onChange={(e) => setTimeStart(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="timeEnd" value="Godzina zakończenia"/>
                            </div>
                            <input
                                className={`${validateEndTime() ? 'border-gray-300 text-gray-900 focus:ring-cyan-300 focus:border-blue-500' : 'border-red-700 text-red-700 focus:ring-red-500 focus:border-red-700'} border bg-grey-50 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                                type={'time'}
                                id="timeEnd"
                                value={timeEnd}
                                onChange={(e) => setTimeEnd(e.target.value)}
                                required
                            />
                        </div>
                        <div className="w-full">
                            <Button onClick={handleCreate} theme={customTheme.button} color={'secondary'}>Stwórz
                                turniej</Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
            <Footer1/>
        </div>
    );
};

export default CompsPage;
