import {useEffect, useState} from 'react';
import GrapQL from "../../Utils/GrapQL.ts";
import GraphQL from "../../Utils/GrapQL.ts";
import EmployeeItem from "../../components/employeeItem.tsx";
import {Employee, EmployeeTag} from "../../models/Employee.model.ts";
import {ConfirmAlert, ErrorAlert, SuccessAlert} from "../../Utils/alerts.ts";
import Menu from "../../components/utils/Menu.tsx";
import {Alert, Button, Kbd, Label, Modal, Select, Spinner, TextInput, Tooltip} from "flowbite-react";
import "./EmployeesPage.scss";
import topEmployee from "../../assets/images/topEmployee.jpeg";
import stylistEmployee from "../../assets/images/stylistEmployee.png";
import juniorEmployee from "../../assets/images/juniorEmployee.png";
import manEmployee from "../../assets/images/manEmployee.jpeg";
import {HiInformationCircle} from "react-icons/hi";
import {customTheme} from "../../Utils/theme.ts";

const EmployeesPage = () => {
    const [admin, setAdmin] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState([]);

    const [selectedCategory, setSelectedCategory] = useState<EmployeeTag>(EmployeeTag.TOP);
    const [availableEmployees, setAvailableEmployees] = useState([]);

    const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false);
    const [treatments, setTreatments] = useState([]);
    const [isLoadingTreatments, setIsLoadingTreatments] = useState(true);

    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [description, setDescription] = useState('');
    const [treatmentsIds, setTreatmentsIds] = useState([]);
    const [ig, setIg] = useState('');
    const [tag, setTag] = useState<EmployeeTag>(EmployeeTag.JUNIOR);

    useEffect(() => {
        setAdmin(localStorage.getItem('admin') === 'true');
    }, []);

    useEffect(() => {
        GrapQL.loadEmployees().then((res: {employees}) => {
            const employees = res.employees;
            setEmployees(employees);
            findAvailableEmployees(EmployeeTag.TOP);
            setIsLoading(false);
        })
    }, []);

    useEffect(() => {
        GraphQL.loadTreatments().then((res: {treatments}) => {
            setIsLoadingTreatments(false);
            setTreatments(res.treatments);
        })
    }, []);

    useEffect(() => {
        findAvailableEmployees(selectedCategory);
    }, [employees]);

    const onCloseModal = () => {
        setIsCreateEmployeeOpen(false);
    }

    const selectCategory = (tag: EmployeeTag) => {
        setSelectedCategory(tag);
        findAvailableEmployees(tag);
    }

    const findAvailableEmployees = (tag: EmployeeTag) => {
        const availableEmployees = employees.filter((employee: Employee) => employee.tag === tag);
        setAvailableEmployees(availableEmployees)
    }

    const addTreatment = (id: string) => {
        if (treatmentsIds.includes(id)) {
            setTreatmentsIds(treatmentsIds.filter(treatmentId => treatmentId !== id));
        } else {
            setTreatmentsIds([...treatmentsIds, id]);
        }
    }

    const handleCreate = (e: any) => {
        e.preventDefault()
        if (!name || !surname || !description || !ig || !tag) {
            ErrorAlert('Oops...', 'Wypełnij wszystkie pola!');
            return;
        }
        else {
            GrapQL.createEmployee(name, surname, description, treatmentsIds, ig, tag.toString()).then((res: {createEmployee}) => {
                setEmployees([...employees, res.createEmployee]);
                SuccessAlert('Brawo!', 'Pomyślnie dodano pracownika!', () => setIsCreateEmployeeOpen(false));
            })
        }
    }

    const handleRemoveEmployee = (id: string) => {
        ConfirmAlert("Jesteś pewna?", "Usunięcie pracownika jest nieodwracalne!", (isConfirmed: boolean) => {
            if (isConfirmed) {
                GrapQL.removeEmployee(id).then((res: { removeEmployee }) => {
                    setEmployees(employees.filter(employee => employee._id !== res.removeEmployee._id));
                    SuccessAlert('Brawo!', 'Pomyślnie usunięto pracownika!')
                })
            }
        });
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
                            <h1 className="text-center text-3xl font-bold mt-10">Poznaj nasz team!</h1>
                            <p className="text-center text-md mt-2">Każdy pracownik ma swoją rangę</p>
                        </div>

                        {admin && <Button theme={customTheme.button} color={'secondary'} className={''} onClick={() => setIsCreateEmployeeOpen(true)}>Dodaj pracownika</Button>}
                    </div>

                    <div className="w-full flex gap-5 p-5 mt-5 justify-center">
                        <button onClick={() => selectCategory(EmployeeTag.TOP)} className={selectedCategory === EmployeeTag.TOP ? 'transition duration-500 category border-primary border-8' : 'category'}>
                            <Tooltip content={'Nasi najlepsi pracownicy'}>
                                <img src={topEmployee} alt={''}/>
                            </Tooltip>
                        </button>
                        <button onClick={() => selectCategory(EmployeeTag.STYLIST)} className={selectedCategory === EmployeeTag.STYLIST ? 'transition duration-500 category border-primary border-8' : 'category'}>
                            <Tooltip content={'Pracownicy z dużym doświadczeniem'}>
                                <img src={stylistEmployee} alt={''}/>
                            </Tooltip>
                        </button>
                        <button onClick={() => selectCategory(EmployeeTag.JUNIOR)} className={selectedCategory === EmployeeTag.JUNIOR ? 'transition duration-500 category border-primary border-8' : 'category'}>
                            <Tooltip content={'Nasi najmłodsi pracownicy'}>
                                <img src={juniorEmployee} alt={''}/>
                            </Tooltip>
                        </button>
                        <button onClick={() => selectCategory(EmployeeTag.MAN)} className={selectedCategory === EmployeeTag.MAN ? 'transition duration-500 category border-primary border-8' : 'category'}>
                            <Tooltip content={'Pracownicy dla mężczyzn'}>
                                <img src={manEmployee} alt={''}/>
                            </Tooltip>
                        </button>
                    </div>

                    {!availableEmployees.length
                        ?
                            <div className={'container mx-auto mt-3'}>
                                <Alert color="failure" icon={HiInformationCircle}>
                                    <span className="font-medium">Niestety</span> nie znaleziono pracowników z tą rangą
                                </Alert>
                            </div>
                        :
                        <div className={'container mx-auto mt-5 p-3'}>
                            <h1 className="text-xl font-bold mt-10">Pracownicy {selectedCategory}</h1>
                            <p className="text-secondary font-bold text-md">Znaleziono {availableEmployees.length} pasujących pracowników</p>

                            <div className={'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-center gap-12 justify-items-center mt-10'}>
                                {availableEmployees.map((employee, index) => (
                                    <EmployeeItem remove={handleRemoveEmployee} key={index} employee={employee}/>
                                ))}
                            </div>
                        </div>
                    }
                </div>
            }

            <Modal show={isCreateEmployeeOpen} size="md" onClose={onCloseModal} popup>
                <Modal.Header />
                <Modal.Body>
                    <div className="space-y-6">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">Stwórz nowego pracownika</h3>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="name" value="Imię"/>
                            </div>
                            <TextInput
                                id="name"
                                placeholder="Jan"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="surname" value="Nazwisko"/>
                            </div>
                            <TextInput
                                id="surname"
                                placeholder="Kowalski"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="description" value="Opis"/>
                            </div>
                            <TextInput
                                id="description"
                                placeholder="Przykładowy opis..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="ig" value="IG"/>
                            </div>
                            <TextInput
                                id="ig"
                                placeholder="Link do instagrama"
                                value={ig}
                                onChange={(e) => setIg(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tag" value="Ranga"/>
                            </div>
                            <Select id={'tag'} required value={tag}
                                    onChange={(e) => setTag(EmployeeTag[e.target.value])}>
                                <option value={EmployeeTag.TOP}>TOP</option>
                                <option value={EmployeeTag.STYLIST}>STYLIST</option>
                                <option value={EmployeeTag.JUNIOR}>JUNIOR</option>
                                <option value={EmployeeTag.MAN}>MAN</option>
                            </Select>
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tag" value="Usługi"/>
                            </div>
                            {isLoadingTreatments
                                ? <Spinner className={'mx-auto'} size={'sm'}/>
                                : <div className={'flex flex-wrap'}>
                                    {treatments.map((treatment, index) => (
                                        <span key={index}>
                                            <Kbd onClick={() => addTreatment(treatment._id)} className={treatmentsIds.includes(treatment._id) ? 'bg-green-400 text-white cursor-pointer' : 'cursor-pointer'}>{treatment.name}</Kbd>
                                        </span>
                                    ))}
                                </div>
                            }
                        </div>

                        <div className="w-full">
                            <Button onClick={handleCreate} theme={customTheme.button} color={'secondary'}>Stwórz
                                pracownika</Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default EmployeesPage;
