import {useEffect, useState} from "react";
import GraphQL from "../../Utils/GrapQL.ts";
import {Comp, CompTreatment, IReport} from "../../models/Comp.model.ts";
import {Employee} from "../../models/Employee.model.ts";
import {IoClose, IoPencil} from "react-icons/io5";
import EditCompTreatment from "./EditCompTreatment.tsx";
import {Link} from "react-router-dom";
import {PAGE_PATH} from "../../Utils/env.ts";
import {ConfirmAlert, ErrorAlert, SuccessAlert} from "../../Utils/alerts.ts";
import {Button, Checkbox, Kbd, Label, Modal, Select, Spinner, TextInput} from "flowbite-react";

import {Swiper, SwiperSlide} from "swiper/react";
import 'swiper/css';
import {customTheme} from "../../Utils/theme.ts";


const ChooseCompTreatmentTime = ({compId, selectedTreatments, chooseCompTreatmentOpen, setChooseCompTreatmentOpen}) => {
    const [user, setUser] = useState<{ given_name: string, family_name: string, email: string, picture: string } | null>(null);
    const [admin, setAdmin] = useState(false);

    const [comp, setComp] = useState<Comp>(null);

    const [wantToGivePhone, setWantToGivePhone] = useState(true);
    const [treatments, setTreatments] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [availableEmployees, setAvailableEmployees] = useState([]);

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [selectedTreatment, setSelectedTreatment] = useState<string>('');
    const [selectedCompTreatmentId, setSelectedCompTreatmentId] = useState<string>('');

    const [isLoading, setIsLoading] = useState(true);
    const [treatmentsLoading, setTreatmentsLoading] = useState(true);
    const [_, setEmployeesLoading] = useState(true);
    const [loadingAvailableEmployees, setLoadingAvailableEmployees] = useState(true);
    const [loadingCompTreatments, setLoadingCompTreatments] = useState(true);
    // const [loadingAvailableTimes, setLoadingAvailableTimes] = useState(true);

    const [isEditCompTreatmentOpen, setIsEditCompTreatmentOpen] = useState(false);
    const [selectedCompTreatmentToEdit, setSelectedCompTreatmentToEdit] = useState<CompTreatment>(null);

    const [clientName, setClientName] = useState('');
    const [clientSurname, setClientSurname] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhoneNumber, setClientPhoneNumber] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');

    useEffect(() => {
        setSelectedTreatment(selectedTreatments[0]);
    }, []);

    useEffect(() => {
        const isAdmin = localStorage.getItem('admin') === 'true'

        if (localStorage.getItem('user')) {
            const savedUser = JSON.parse(localStorage.getItem('user'))
            setUser(savedUser);

            if (isAdmin) {
                setAdmin(true);
            } else {
                setClientName(savedUser.given_name);
                setClientSurname(savedUser.family_name);
                setClientEmail(savedUser.email);
            }
        }
    }, []);

    useEffect(() => {
        GraphQL.loadCompDetails(compId).then((res: { getCompDetails }) => {
            setIsLoading(false);
            setComp(res.getCompDetails)
        })
    }, []);

    useEffect(() => {
        GraphQL.loadTreatments().then((res: {treatments}) => {
            setTreatmentsLoading(false);
            setTreatments(res.treatments);
        })
    }, []);

    useEffect(() => {
        GraphQL.loadEmployees().then((res: {employees}) => {
            setEmployeesLoading(false);
            setEmployees(res.employees);
        })
    }, []);

    useEffect(() => {
        if (comp) {
            setLoadingCompTreatments(true);
            if (employees) {
                setLoadingAvailableEmployees(true);
                const uniqueEmployees = new Set();
                const promises = comp.employees.map((employee: string) => {
                    return GraphQL.loadEmployeeDetails(employee).then((res: { getEmployeeDetails }) => {
                        if (res.getEmployeeDetails.treatmentsIds.includes(selectedTreatment)) {
                            uniqueEmployees.add(res.getEmployeeDetails);
                        }
                    });
                });

                Promise.all(promises).then(() => {
                    const result: any[] = Array.from(uniqueEmployees).sort((a: Employee, b: Employee) => a.name < b.name ? -1 : 1);
                    setAvailableEmployees(result);
                    setLoadingAvailableEmployees(false);
                    if (!selectedEmployeeId || !result.find((employee: Employee) => employee._id === selectedEmployeeId)) {
                        setSelectedEmployeeId(result[0]._id);
                    }
                });
            }

            if (treatments) {
                const tempCompTreatments = [];
                comp.treatments.forEach((treatment: CompTreatment) => {
                    if (treatment.treatmentId === selectedTreatment) {
                        tempCompTreatments.push(treatment);
                    }
                });

                const result = tempCompTreatments.map((compTreatment: CompTreatment) => {
                    return {
                        ...compTreatment,
                        checkEmployee: checkIfEmployeeReportedInDifferentCompTreatment(compTreatment),
                        booked: checkIfCompTreatmentIsBooked(compTreatment._id)
                    }
                }).sort((a: CompTreatment, b: CompTreatment) => a.timeStart < b.timeStart ? -1 : 1);
                setAvailableTimes(result);
                setLoadingCompTreatments(false);
            }
        }
    }, [comp, treatments, employees, selectedTreatment, selectedEmployeeId]);

    const handlePhoneNumberChange = (e: any) => {
        const phoneNumber = e.target.value;
        setClientPhoneNumber(phoneNumber);

        const phonePattern = /^[0-9]{3}-[0-9]{3}-[0-9]{3}$/;

        if (!phonePattern.test(phoneNumber)) {
            setPhoneNumberError('Format xxx-xxx-xxx');
        } else {
            setPhoneNumberError('');
        }
    };

    const validatePhoneNumber = () => {
        const phonePattern = /^[0-9]{3}-[0-9]{3}-[0-9]{3}$/;
        return phonePattern.test(clientPhoneNumber);
    }

    const checkIfEmployeeReportedInDifferentCompTreatment = (compTreatment: CompTreatment) => {
        let check = false;

        const reports = comp.reports.filter(r => r.employeeId === selectedEmployeeId);

        const ctStartTime = compTreatment.timeStart;
        const ctEndTime = compTreatment.timeEnd;

        reports.forEach(r => {
            const reportCompTreatment = getCompTreatmentInfo(r.compTreatmentId);
            const reportStartTime = reportCompTreatment?.timeStart;
            const reportEndTime = reportCompTreatment?.timeEnd;

            if ((ctStartTime >= reportStartTime && ctStartTime < reportEndTime) || (ctEndTime > reportStartTime && ctEndTime <= reportEndTime) || (ctStartTime <= reportStartTime && ctEndTime >= reportEndTime))
                check = true;
        });

        return check;
    }

    const checkIfCompTreatmentIsBooked = (compTreatmentId: string) => {
        let check = false;

        comp.reports.map((r: IReport) => {
            if (r.compTreatmentId === compTreatmentId) {
                check = true;
                return;
            }
        })

        return check;
    }

    const getTreatmentName = (id: string) => {
        const name = treatments.find((treatment: { _id: string }) => treatment._id === id).name;
        if (name)
            return name
        else
            return "no name";
    }

    const getCompTreatmentInfo = (id: string): CompTreatment => {
        return comp.treatments.find((treatment: { _id: string }) => treatment._id === id);
    }

    const selectEmployee = (id: string) => {
        setSelectedEmployeeId(id);
    }

    const selectTreatment = (e: any) => {
        setSelectedTreatment(e.target.value);
    }

    const selectCompTreatment = (id: string) => {
        setSelectedCompTreatmentId(id);
    }

    const openEditCompTreatmentModal = (compTreatmentId: string) => {
        setSelectedCompTreatmentToEdit(getCompTreatmentInfo(compTreatmentId));
        setIsEditCompTreatmentOpen(true);
    }

    const handleEditCompTreatment = (treatmentId: string, timeStart: string, timeEnd: string) => {
        GraphQL.editCompTreatment(comp._id, treatmentId, timeStart, timeEnd).then((res: { editCompTreatment }) => {
            setComp(res.editCompTreatment);
        })
    }

    const handleRemoveCompTreatment = (compTreatmentId: string) => {
        ConfirmAlert('Jesteś pewna?', 'Czy na pewno usunąć tą wizytę?', (isConfirmed: boolean) => {
            if (isConfirmed) {
                GraphQL.removeCompTreatment(comp._id, compTreatmentId).then((res: { removeCompTreatment }) => {
                    setComp(res.removeCompTreatment);
                    SuccessAlert('Super!', 'Pomyślnie usunięto wizytę!')
                })
            }
        })
    }

    const book = () => {
        if (!user) {
            ErrorAlert('Oops...', 'Musisz być zalogowany/-a, aby zarezerwować wizytę!');
            return;
        }

        ConfirmAlert('Jesteś pewna?', 'Czy na pewno chcesz zabookować tą wizytę?', (isConfirmed: boolean) => {
            if (isConfirmed) {
                if (selectedEmployeeId && selectedCompTreatmentId) {
                    if (phoneNumberError) {
                        ErrorAlert('Oops...', 'Proszę wprowadzić poprawny numer telefonu!');
                        return;
                    }

                    setIsLoading(true);
                    const client = {
                        name: clientName,
                        surname: clientSurname,
                        email: clientEmail,
                        phoneNumber: wantToGivePhone ? clientPhoneNumber : 'null'
                    }

                    if (admin) {
                        if (!clientName || !clientSurname || !clientEmail) {
                            ErrorAlert('Oops...', 'Proszę wypełnić wszystkie pola!');
                            setIsLoading(false);
                            return;
                        }
                    }

                    GraphQL.createReport(compId, selectedCompTreatmentId, client, selectedTreatment, selectedEmployeeId).then((res: {
                        createReport
                    }) => {
                        setIsLoading(false);
                        setComp(res.createReport);
                        SuccessAlert('Super!', 'Pomyślnie zabookowano wizytę!')
                    })
                } else {
                    ErrorAlert('Oops...', 'Proszę wypełnić wszystkie pola!');
                }
            }
        })
    }

    return (
        <Modal show={chooseCompTreatmentOpen} size={'md'} onClose={() => setChooseCompTreatmentOpen(false)} popup>
            <Modal.Header/>
            <Modal.Body>
                <div className="space-y-6">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Zarezerwuj wizytę</h3>
                    {isLoading
                        ? <div className={'h-[100vh] w-full'}>
                            <Spinner className={'absolute top-1/2 left-1/2'} size={'xl'}/>
                        </div>
                        : <div>
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="treatment" value="Usługa"/>
                                </div>
                                {treatmentsLoading
                                    ? <Spinner size={'sm'}/>
                                    :
                                        <Select id={'treatment'} required value={selectedTreatment}
                                                onChange={(e) => selectTreatment(e)}>
                                            {selectedTreatments.map((treatment: string, index: number) => {
                                                return (
                                                    <option key={index} value={treatment}>{getTreatmentName(treatment)}</option>
                                                )
                                            })}
                                        </Select>
                                }
                            </div>
                            <div>
                                <div className="mb-2 block mt-5">
                                    <Label htmlFor="employee" value="Pracownik"/>
                                </div>
                                {loadingAvailableEmployees
                                    ? <Spinner size={'sm'}/>
                                    :
                                    <Select id={'employee'} required value={selectedEmployeeId}
                                            onChange={(e) => selectEmployee(e.target.value)}>
                                        {availableEmployees.map((employee: any, index) => {
                                            return (
                                                <option key={index} value={employee._id}>{employee.name} {employee.surname}</option>
                                            )
                                        })}
                                    </Select>
                                }
                            </div>
                            <div>
                                <div className="mb-2 block mt-5">
                                    <Label htmlFor="compTreatment" value="Godzina"/>
                                </div>
                                {admin &&
                                    <div>
                                        <Label className={'text-purple-500 font-bold'}
                                               value={'*dokładnie ta wizyta jest zabookowana'}/>
                                    </div>
                                }
                                <div>
                                    <Label className={'text-red-500 font-bold'}
                                           value={'*pracownik nie jest dostępny w tych godzinach'}/>
                                </div>
                                {loadingCompTreatments || loadingAvailableEmployees
                                    ? <Spinner size={'sm'}/>
                                    : <div>
                                        <Swiper
                                            className={'mt-2'}
                                            spaceBetween={1}
                                            slidesPerView={3.5}
                                        >
                                            {availableTimes.map((compTreatment: any, index) => {
                                                if (!compTreatment.checkEmployee) {
                                                    return (
                                                        <SwiperSlide key={index}>
                                                            <div className={'flex items-center'}>
                                                                <Kbd
                                                                    className={selectedCompTreatmentId === compTreatment._id ? 'bg-primary text-white cursor-pointer' : 'cursor-pointer'}
                                                                    onClick={() => selectCompTreatment(compTreatment._id)}>{compTreatment.timeStart} - {compTreatment.timeEnd}</Kbd>
                                                                {admin &&
                                                                    <div>
                                                                        <button
                                                                            onClick={() => openEditCompTreatmentModal(compTreatment._id)}>
                                                                            <IoPencil size={'20'} color={'royalblue'}/>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRemoveCompTreatment(compTreatment._id)}>
                                                                            <IoClose size={'20'} color={'crimson'}/>
                                                                        </button>
                                                                    </div>
                                                                }
                                                            </div>
                                                        </SwiperSlide>
                                                    )
                                                } else {
                                                    return (
                                                        <SwiperSlide key={index}>
                                                            <div className={'flex items-center'}>
                                                                <Kbd
                                                                    className={(compTreatment.booked && admin) ? 'bg-purple-500 text-white cursor-pointer' : 'text-white bg-red-500 cursor-pointer'}>
                                                                    {compTreatment.timeStart} - {compTreatment.timeEnd}
                                                                </Kbd>
                                                                {admin && compTreatment.booked &&
                                                                    <div className={'flex'}>
                                                                        <Link
                                                                            to={`${PAGE_PATH}/comps/${compId}/reports/${comp.reports.find(r => r.compTreatmentId === compTreatment._id)._id}`}>
                                                                            <IoPencil size={'20'} color={'royalblue'}/>
                                                                        </Link>
                                                                        <button
                                                                            onClick={() => handleRemoveCompTreatment(compTreatment._id)}>
                                                                            <IoClose size={'20'} color={'crimson'}/>
                                                                        </button>
                                                                    </div>
                                                                }
                                                            </div>
                                                        </SwiperSlide>
                                                    )
                                                }
                                            })
                                            }


                                        </Swiper>
                                    </div>
                                }
                            </div>
                            {isEditCompTreatmentOpen &&
                                <EditCompTreatment
                                    comp={comp} compTreatment={selectedCompTreatmentToEdit}
                                    edit={handleEditCompTreatment}
                                    setIsEditCompTreatmentOpen={setIsEditCompTreatmentOpen}/>
                            }
                            <div>
                                {admin &&
                                    <div className={'mt-5'}>
                                        <div>
                                            <div className="mb-2 block">
                                                <Label htmlFor="clientName" value="Imię klienta"/>
                                            </div>
                                            <TextInput
                                                id="clientName"
                                                placeholder="Jan"
                                                value={clientName}
                                                onChange={(e) => setClientName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <div className="mb-2 block mt-3">
                                                <Label htmlFor="clientSurname" value="Nazwisko klienta"/>
                                            </div>
                                            <TextInput
                                                id="clientSurname"
                                                placeholder="Kowalski"
                                                value={clientSurname}
                                                onChange={(e) => setClientSurname(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <div className="mb-2 block mt-3">
                                                <Label htmlFor="clientEmail" value="Email klienta"/>
                                            </div>
                                            <Label htmlFor="clientSurname"
                                                   value="*Wizyta pojawi się się na koncie klienta*"/>
                                            <TextInput
                                                className={'mt-1'}
                                                type={'email'}
                                                id="clientEmail"
                                                placeholder="jan.kowalski@gmail.com"
                                                value={clientEmail}
                                                onChange={(e) => setClientEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                }
                                <div className={'mt-5'}>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            onChange={() => setWantToGivePhone(!wantToGivePhone)}
                                            checked={!wantToGivePhone}
                                            id="accept"/>
                                        <Label htmlFor="accept" className="flex">
                                            Nie chce podawać numeru telefonu
                                        </Label>
                                    </div>
                                </div>
                                <div>
                                    {wantToGivePhone &&
                                        <div>
                                            <div className="mb-2 block mt-3">
                                                <Label htmlFor="phoneNumber" value="Numer telefonu"/>
                                            </div>
                                                <TextInput
                                                    type="tel"
                                                    pattern="[0-9]{3}-[0-9]{3}-[0-9]{3}"
                                                    required
                                                    placeholder="123-123-123"
                                                    onChange={handlePhoneNumberChange}
                                                    value={clientPhoneNumber}
                                                    className={`${validatePhoneNumber() ? 'text-gray-900 focus:ring-cyan-300 focus:border-blue-500' : 'text-red-700 focus:ring-red-500 focus:border-red-700'} border bg-grey-50 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                                                />
                                        </div>
                                    }
                                    {wantToGivePhone && phoneNumberError &&
                                        <Label className={'text-red-500'} htmlFor="clientSurname"
                                               value={`*${phoneNumberError}*`}/>
                                    }
                                </div>
                                <div className="w-full mt-5 mb-5">
                                    <Button onClick={book} theme={customTheme.button} color={'secondary'}>Zabookuj wizytę</Button>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ChooseCompTreatmentTime;
