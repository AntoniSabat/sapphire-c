import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import GraphQL from "../../Utils/GrapQL.ts";
import {Break, Comp} from "../../models/Comp.model.ts";
import EditComp from "./EditComp.tsx";
import ChooseCompTreatmentTime from "./ChooseCompTreatmentTime.tsx";
import {ConfirmAlert, SuccessAlert} from "../../Utils/alerts.ts";
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
import {Employee} from "../../models/Employee.model.ts";
import Menu from "../../components/utils/Menu.tsx";
import {Alert, Breadcrumb, Button, Spinner, Table} from "flowbite-react";
import {PAGE_PATH} from "../../Utils/env.ts";
import {HiHome, HiInformationCircle} from "react-icons/hi";
import {customTheme} from "../../Utils/theme.ts";
import {Currency} from "../../models/Treatment.model.ts";

const CompDetails = () => {
    const {id} = useParams();

    const {isAuthenticated, getPermission} = useKindeAuth();
    const [admin, setAdmin] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [treatmentsLoading, setTreatmentsLoading] = useState(true);
    const [employeesLoading, setEmployeesLoading] = useState(true);
    const [comp, setComp] = useState<Comp>(null);
    const [isEditCompOpen, setIsEditCompOpen] = useState(false);
    const [treatments, setTreatments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [availableTreatments, setAvailableTreatments] = useState([]);
    const [availableTreatmentsLoading, setAvailavleTreatmentsLoading] = useState(true);

    const [selectedTreatments, setSelectedTreatments] = useState([]);
    const [chooseCompTreatmentOpen, setChooseCompTreatmentOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            const admin = getPermission('admin').isGranted;
            if (admin) {
                setAdmin(true);
            }
        }
    }, [isAuthenticated]);

    useEffect(() => {
        GraphQL.loadCompDetails(id).then((res: { getCompDetails }) => {
            setIsLoading(false);
            setComp(res.getCompDetails);
        });
    }, []);

    useEffect(() => {
        GraphQL.loadTreatments().then((res: {treatments}) => {
            setTreatmentsLoading(false);
            setTreatments(res.treatments);
        })
    }, []);

    useEffect(() => {
        GraphQL.loadEmployees().then((res: {employees}) => {
            setEmployees(res.employees);
            setEmployeesLoading(false);
        })
    }, []);

    useEffect(() => {
        if (!isLoading && !employeesLoading && employees) {
            const temp = [];

            const promises = comp.treatments.map(treatment => {
                return Promise.all(
                    comp.employees.map(e => {
                        const employeeDetails = employees.find((employee: Employee) => employee._id === e);
                        if (employeeDetails.treatmentsIds.includes(treatment.treatmentId)) {
                            temp.push(treatment.treatmentId);
                        }
                    })
                );
            });

            Promise.all(promises.flat()).then(() => {
                const uniqueTreatments = [...new Set(temp)];
                setAvailableTreatments(uniqueTreatments);
                setAvailavleTreatmentsLoading(false);
            });
        }
    }, [isLoading, employeesLoading, comp]);

    const getTreatmentInfo = (id: string) => {
        return treatments.find((treatment: {_id: string}) => treatment._id === id);
    }

    const selectTreatment = (id: string) => {
        if (selectedTreatments.includes(id)) {
            setSelectedTreatments(selectedTreatments.filter(treatment => treatment !== id));
        } else {
            setSelectedTreatments([...selectedTreatments, id]);
        }
    }

    const removeTreatmentFromComp = (id: string) => {
        ConfirmAlert('Jesteś pewna?', 'Usunięcie usługi z turnieju jest nieodwracalne!', (isConfirmed: boolean) => {
            if (isConfirmed) {
                if (comp && comp.treatments) {
                    setIsLoading(true);
                    GraphQL.removeTreatmentFromComp(comp._id, id).then((res: { removeTreatmentFromComp: Comp }) => {
                        setComp(res.removeTreatmentFromComp);
                        setIsLoading(false);
                        SuccessAlert('Brawo!', 'Pomyślnie usunięto usługę z turnieju!');
                    });
                } else {
                    console.error("Comp or treatments are undefined.");
                }
            }
        });
    }

    const handleEditComp = (name: string, date: string, place: string, timeStart: string, timeEnd: string, breaks: Break[], employees: string[]) => {
        setIsLoading(true);
        GraphQL.editComp(id, name, date, place, timeStart, timeEnd, breaks, employees).then((res: { editComp: Comp }) => {
            setComp(res.editComp);
            setIsLoading(false);
        })
    }

    return (
        <div className={'box relative min-h-[100vh] h-fit flex flex-col'}>
            <Menu/>
            {isLoading
                ? <div className={'h-[100vh] w-full'}>
                    <Spinner className={'absolute top-1/2 left-1/2'} size={'xl'}/>
                </div>
                : <div className={'relative'}>
                    {selectedTreatments.length > 0 && <Button onClick={() => setChooseCompTreatmentOpen(true)} className={'absolute top-10 right-5'} theme={customTheme.button} color={'secondary'}>Przejdź dalej</Button>}

                    <div className="compInfo relative">
                        <Breadcrumb className={'mt-5 ml-5'}>
                            <Breadcrumb.Item href={`${PAGE_PATH}`} icon={HiHome}>Główna</Breadcrumb.Item>
                            <Breadcrumb.Item href={`${PAGE_PATH}/comps`}>Turnieje</Breadcrumb.Item>
                            <Breadcrumb.Item>{comp.name}</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>

                    <div className={'flex gap-3 justify-center items-center'}>
                        <div>
                            <h1 className="text-center text-3xl font-bold mt-10">{comp.name}</h1>
                            <p className="text-center text-md mt-2">Wybierz usługi, które chcesz zabookować!</p>
                        </div>

                        {admin && <Button theme={customTheme.button} color={'secondary'} className={''}
                                          onClick={() => setIsEditCompOpen(true)}>Edytuj turniej</Button>}
                    </div>

                    {isEditCompOpen &&
                        <EditComp comp={comp} edit={handleEditComp} isEditCompOpen={isEditCompOpen}
                                  setIsEditCompOpen={setIsEditCompOpen}/>
                    }

                    <div className={'container mx-auto mt-10 overflow-x-scroll'}>
                        {selectedTreatments.length > 0 &&
                            <div className={'ml-5'}>
                                <h1 className="text-xl font-bold mt-10">Wybrano [{selectedTreatments.length}]</h1>
                                <p className="text-secondary font-bold text-md mb-5">
                                    {selectedTreatments.map((treatment, index) => (
                                        <span key={index}>{getTreatmentInfo(treatment).name}{index !== selectedTreatments.length - 1 && ', '}</span>
                                    ))}
                                </p>
                            </div>
                        }

                        <Table hoverable>
                            <Table.Head>
                                <Table.HeadCell>Usługa</Table.HeadCell>
                                <Table.HeadCell>Cena</Table.HeadCell>
                                <Table.HeadCell>Czas trwania</Table.HeadCell>
                                <Table.HeadCell>Dostępne godziny</Table.HeadCell>
                                {admin && <Table.HeadCell>Usuń</Table.HeadCell>}
                            </Table.Head>
                            <Table.Body className="divide-y">
                                {treatmentsLoading || availableTreatmentsLoading
                                    ? <div className={'w-full h-[100vh]'}>
                                        <Spinner className={'absolute top-1/2 left-1/2'} size={"xl"}/>
                                    </div>
                                    : availableTreatments.length > 0
                                        && availableTreatments.map((treatment: string, index) => (
                                            <Table.Row key={index}
                                                       className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                                <Table.Cell
                                                    className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                    {getTreatmentInfo(treatment).name}
                                                </Table.Cell>
                                                <Table.Cell>{getTreatmentInfo(treatment).price}{getTreatmentInfo(treatment).currency === Currency.PLN ? 'zł' : '€'}</Table.Cell>
                                                <Table.Cell>{getTreatmentInfo(treatment).time}h</Table.Cell>
                                                <Table.Cell>
                                                    <Button onClick={() => selectTreatment(treatment)}
                                                            theme={customTheme.button} color={'secondary'}
                                                            className={''}>
                                                        {selectedTreatments.includes(treatment) ? 'Odznacz' : 'Wybierz'}
                                                    </Button>
                                                </Table.Cell>
                                                {admin &&
                                                    <Table.Cell>
                                                        <Button
                                                            onClick={() => removeTreatmentFromComp(treatment)}
                                                            theme={customTheme.button} color={'failure'} className={''}>
                                                            Usuń
                                                        </Button>
                                                    </Table.Cell>
                                                }
                                            </Table.Row>
                                        ))
                                }
                            </Table.Body>
                        </Table>
                        {!comp.treatments.length &&
                            <Alert color="failure" icon={HiInformationCircle}>
                                <span className="font-medium">Niestety</span> nie dodano jeszcze usług do
                                tego turnieju
                            </Alert>
                        }
                    </div>

                    {chooseCompTreatmentOpen &&
                        <ChooseCompTreatmentTime compId={comp._id} selectedTreatments={selectedTreatments}
                                                 chooseCompTreatmentOpen={chooseCompTreatmentOpen}
                                                 setChooseCompTreatmentOpen={setChooseCompTreatmentOpen}/>}
                </div>
            }
            {/*<Footer1/>*/}
        </div>
    );
};

export default CompDetails;
