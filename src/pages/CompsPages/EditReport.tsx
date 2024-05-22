import {useEffect, useState} from "react";
import GrapQL from "../../Utils/GrapQL.ts";
import {Comp, CompTreatment, IReport} from "../../models/Comp.model.ts";
import GraphQL from "../../Utils/GrapQL.ts";
import {Employee} from "../../models/Employee.model.ts";
import {useNavigate, useParams} from "react-router-dom";
import {API_PATH, PAGE_PATH} from "../../Utils/env.ts";
import {ConfirmAlert, ErrorAlert, SuccessAlert} from "../../Utils/alerts.ts";
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
import Menu from "../../components/utils/Menu.tsx";
import {
    Breadcrumb,
    Button,
    Checkbox,
    Kbd,
    Label,
    Select,
    Spinner,
    TextInput,
    ToggleSwitch,
    Tooltip
} from "flowbite-react";
import {HiHome} from "react-icons/hi";
import {customTheme} from "../../Utils/theme.ts";
import {Swiper, SwiperSlide} from "swiper/react";
import EditCompTreatment from "./EditCompTreatment.tsx";
import Footer1 from "../../components/utils/Footer1.tsx";

const EditReport = () => {
    const {compId, reportId} = useParams();
    const navigate = useNavigate();

    const {isAuthenticated, getPermission} = useKindeAuth();
    const [admin, setAdmin] = useState(false);

    const [report, setReport] = useState<null | IReport>(null);
    const [comp, setComp] = useState<Comp | null>(null);
    const [compLoading, setCompLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [employeesLoading, setEmployeesLoading] = useState(true);
    const [treatments, setTreatments] = useState([]);
    const [treatmentsLoading, setTreatmentsLoading] = useState(true);
    const [loadingReport, setLoadingReport] = useState(true);

    const [selectedTreatment, setSelectedTreatment] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [selectedCompTreatmentId, setSelectedCompTreatmentId] = useState(null);
    const [confirmed, setConfirmed] = useState<boolean | null>(null);

    const [availableTimes, setavailableTimes] = useState([]);
    const [availableTreatments, setAvailableTreatments] = useState([]);
    let [availableEmployees, setAvailableEmployees] = useState([]);
    const [availableTreatmentsLoading, setAvailavleTreatmentsLoading] = useState(true);
    const [dataChanged, setDataChanged] = useState(false);
    const [confirmChanged, setConfirmChanged] = useState(false);
    const [wantToAddCustomHours, setWantToAddCustomHours] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            const admin = getPermission('admin').isGranted;
            if (admin) {
                setAdmin(true);
            }
        }
    }, [isAuthenticated]);

    useEffect(() => {
        GrapQL.loadEmployees().then((res: {employees}) => {
            setEmployees(res.employees);
            setEmployeesLoading(false);
        })
    }, []);

    useEffect(() => {
        GrapQL.loadCompDetails(compId).then((res: {getCompDetails}) => {
            const comp = res.getCompDetails;

            const report = comp.reports.find((r: IReport) => r._id === reportId);
            setReport(report)
            setLoadingReport(false);

            if (report) {
                setSelectedTreatment(report.treatmentId);
                setSelectedEmployeeId(report.employeeId);
                setSelectedCompTreatmentId(report.compTreatmentId);
                setConfirmed(report.confirmed);
            }

            setComp(comp);
            setCompLoading(false);
        })
    }, []);

    useEffect(() => {
        GrapQL.loadTreatments().then((res: {treatments}) => {
            const treatmens = res.treatments;
            setTreatments(treatmens);
            setTreatmentsLoading(false);
        })
    }, []);

    useEffect(() => {
        if (comp) {
            if (employees) {
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
                setavailableTimes(result);
            }
        }
    }, [comp, treatments, employees, selectedEmployeeId, selectedTreatment]);

    useEffect(() => {
        if (!compLoading && !employeesLoading) {
            const temp = [];
            const promises = comp.treatments.map(treatment => {
                return Promise.all(
                    comp.employees.map(e => {
                        const employeeDetails = employees.find((employee: { _id: string }) => employee._id === e);
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
    }, [compLoading, employeesLoading]);

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


    const selectEmployee = (id: string) => {
        setSelectedEmployeeId(id);
        setDataChanged(true);
        console.log('select employee', id)
    }

    const selectTreatment = (e: any) => {
        setSelectedTreatment(e.target.value);
        setDataChanged(true);
    }

    const selectCompTreatment = (id: string) => {
        setSelectedCompTreatmentId(id);
        setDataChanged(true);
        console.log('select comp treatment', id);
    }

    const getEmployeeInfo = (id: string) => {
        return employees.find((employee: { _id: string }) => employee._id === id);
    }

    const getTreatment = (id: string) => {
        return treatments.find((treatment: { _id: string }) => treatment._id === id);
    }

    const getCompTreatmentInfo = (id: string): CompTreatment => {
        return comp.treatments.find((treatment: { _id: string }) => treatment._id === id);
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

    const getTreatmentName = (id: string) => {
        const name = treatments.find((treatment: { _id: string }) => treatment._id === id).name;
        if (name)
            return name
        else
            return "no name";
    }

    const handleConfirmChanged = (confirm: boolean) => {
        setConfirmed(confirm);
        setConfirmChanged(true);
    }

    const removeReport = (reportId: string) => {
        ConfirmAlert('Jesteś pewna?', 'Czy na pewno chcesz usunąć zgłoszenie?', (isConfirmed: boolean) => {
            if (isConfirmed) {
                setCompLoading(true);
                GraphQL.removeReport(compId, reportId).then((res: {removeReport}) => {
                    setComp(res.removeReport);
                    navigate(-1);
                });
                SuccessAlert('Gratulacje!', 'Pomyślnie usunięto zgłoszenie!')

                const body = {
                    recipients: [{
                        name: report.clientName + ' ' + report.clientSurname,
                        address: report.clientEmail
                    }]
                }

                fetch(`${API_PATH}/send-remove-report-mail`, {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then()
            }
        })
    }

    const handleEditCompTreatment = (treatmentId: string, timeStart: string, timeEnd: string) => {
        GraphQL.editCompTreatment(comp._id, treatmentId, timeStart, timeEnd).then((res: { editCompTreatment }) => {
            setComp(res.editCompTreatment);
        })
    }

    const handleEdit = (e: any) => {
        e.preventDefault();

        ConfirmAlert('Jesteś pewna?', 'Czy na pewno chcesz edytować zgłoszenie?', (isConfirmed: boolean) => {
            if (isConfirmed) {
                if (!selectedTreatment || !selectedEmployeeId || !selectedCompTreatmentId || confirmed === null) {
                    ErrorAlert('Oops...', 'Wszystkie pola są wymagane!')
                    return;
                } else {
                    GrapQL.editReport(compId, reportId, selectedTreatment, selectedCompTreatmentId, selectedEmployeeId, confirmed).then((res: {editReport}) => {
                        setComp(res.editReport);
                        navigate(-1);
                    });
                    SuccessAlert('Super', 'Pomyślnie edytowano zgłoszenie!')

                    const body = {
                        body: {
                            employee: getEmployeeInfo(selectedEmployeeId).name + ' ' + getEmployeeInfo(selectedEmployeeId).surname,
                            time: getCompTreatmentInfo(selectedCompTreatmentId).timeStart + '-' + getCompTreatmentInfo(selectedCompTreatmentId).timeEnd,
                            treatment: getTreatment(selectedTreatment).name,
                        },
                        recipients: [{
                            name: report.clientName + ' ' + report.clientSurname,
                            address: report.clientEmail
                        }]
                    }

                    if (confirmed && confirmChanged) {
                        fetch(`${API_PATH}/send-confirm-report-mail`, {
                            method: "POST",
                            body: JSON.stringify(body),
                            headers: {
                                "Content-Type": "application/json"
                            },
                        }).then()
                    }

                    if (dataChanged) {
                        fetch(`${API_PATH}/send-edit-report-mail`, {
                            method: 'POST',
                            body: JSON.stringify(body),
                            headers: {
                                "Content-Type": "application/json"
                            }
                        }).then()
                    }

                    setDataChanged(false);
                    setConfirmChanged(false)
                }
            }
        });
    }

    return (
        <div className={'relative pb-[100px] min-h-[100vh]'}>
            <Menu/>
            {compLoading
                ? <div className={'w-full h-[100vh]'}>
                    <Spinner className={'absolute top-1/2 left-1/2'} size={"xl"}/>
                </div>
                : <div className={'relative'}>
                    <div className="reportInfo relative">
                        <Breadcrumb className={'mt-5 ml-5'}>
                            <Breadcrumb.Item href={`${PAGE_PATH}`} icon={HiHome}>Główna</Breadcrumb.Item>
                            <Breadcrumb.Item href={`${PAGE_PATH}/comps/reports`}>Zgłoszenia</Breadcrumb.Item>
                            <Breadcrumb.Item href={`${PAGE_PATH}/comps/${comp._id}`}>{comp.name}</Breadcrumb.Item>
                            <Breadcrumb.Item href={`${PAGE_PATH}/comps/${comp._id}/reports`}>Harmonogram</Breadcrumb.Item>
                            <Breadcrumb.Item>Szczegóły zgłoszenia</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>

                    <div className={'flex gap-3 justify-center items-center'}>
                        <div>
                            <h1 className="text-center text-3xl font-bold mt-10">Zgłoszenie</h1>
                            <p className="text-center text-md mt-2">{admin ? 'Możesz edytować zabookowaną wizytę!' : 'Tutaj możesz zobaczyć szczegóły'}</p>
                        </div>
                    </div>

                    {loadingReport
                        ? <Spinner size={'sm'}/>
                        : <div className={'flex flex-col items-center mt-5'}>
                            <div className={'w-1/2'}>
                                <div>
                                    <div className="mb-2 block">
                                        <Label htmlFor="treatment" value="Usługa"/>
                                    </div>
                                    <TextInput
                                        disabled={true}
                                        id="treatment"
                                        placeholder="Usługa"
                                        value={getTreatment(report.treatmentId).name}
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 block mt-3">
                                        <Label htmlFor="time" value="Godziny"/>
                                    </div>
                                    <TextInput
                                        disabled={true}
                                        id="time"
                                        placeholder="10:00-10:45"
                                        value={getCompTreatmentInfo(report.compTreatmentId).timeStart + ' - ' + getCompTreatmentInfo(report.compTreatmentId).timeEnd}
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 block mt-3">
                                        <Label htmlFor="employee" value="Pracownik"/>
                                    </div>
                                    <TextInput
                                        disabled={true}
                                        id="employee"
                                        placeholder="Jan Kowalski"
                                        value={getEmployeeInfo(report.employeeId).name + ' ' + getEmployeeInfo(report.employeeId).surname}
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 block mt-3">
                                        <Label htmlFor="clientName" value="Imię klienta"/>
                                    </div>
                                    <TextInput
                                        disabled={true}
                                        id="clientName"
                                        placeholder="Jan"
                                        value={report.clientName}
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 block mt-3">
                                        <Label htmlFor="clientSurname" value="Nazwisko klienta"/>
                                    </div>
                                    <TextInput
                                        disabled={true}
                                        id="clientSurname"
                                        placeholder="Kowalski"
                                        value={report.clientSurname}
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 block mt-3">
                                        <Label htmlFor="clientEmail" value="Email klienta"/>
                                    </div>
                                    <TextInput
                                        disabled={true}
                                        className={'mt-1'}
                                        type={'email'}
                                        id="clientEmail"
                                        placeholder="jan.kowalski@gmail.com"
                                        value={report.clientEmail}
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 block mt-3">
                                        <Label htmlFor="phoneNumber" value="Numer telefonu"/>
                                    </div>
                                    <TextInput
                                        disabled={true}
                                        type="tel"
                                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{3}"
                                        required
                                        placeholder="123-123-123"
                                        value={report.clientPhoneNumber === 'null' ? 'Nie podano' : report.clientPhoneNumber}
                                    />
                                </div>

                                { admin &&
                                    <div>
                                        <h1 className="text-center text-2xl font-bold mt-10">Dla admina</h1>

                                        {report.confirmed
                                            ? <Tooltip content={"Możesz usunąć wizytę"}>
                                                <ToggleSwitch className={'mt-5'} checked={true} label="Potwierdź wizytę"
                                                              onChange={() => setConfirmed(true)}/>
                                            </Tooltip>
                                            : <ToggleSwitch className={'mt-5'} checked={confirmed}
                                                            label="Potwierdź wizytę"
                                                            onChange={() => handleConfirmChanged(!confirmed)}/>
                                        }

                                        <div className={'mt-3'}>
                                            <div className="mb-2 block">
                                                <Label htmlFor="treatment" value="Usługa"/>
                                            </div>
                                            {treatmentsLoading
                                                ? <Spinner size={'sm'}/>
                                                :
                                                <Select id={'treatment'} required value={selectedTreatment}
                                                        onChange={(e) => selectTreatment(e)}>
                                                    {availableTreatments.map((treatment: string, index: number) => {
                                                        return (
                                                            <option key={index}
                                                                    value={treatment}>{getTreatmentName(treatment)}</option>
                                                        )
                                                    })}
                                                </Select>
                                            }
                                        </div>
                                        <div>
                                            <div className="mb-2 block mt-5">
                                                <Label htmlFor="employee" value="Pracownik"/>
                                            </div>
                                            {employeesLoading
                                                ? <Spinner size={'sm'}/>
                                                :
                                                <Select id={'employee'} required value={selectedEmployeeId}
                                                        onChange={(e) => selectEmployee(e.target.value)}>
                                                    {availableEmployees.map((employee: any, index) => {
                                                        return (
                                                            <option key={index}
                                                                    value={employee._id}>{employee.name} {employee.surname}</option>
                                                        )
                                                    })}
                                                </Select>
                                            }
                                        </div>
                                        <div>
                                            {!wantToAddCustomHours &&
                                                <div>
                                                    <div className="mb-2 block mt-5">
                                                        <Label htmlFor="compTreatment" value="Godzina"/>
                                                    </div>
                                                    {(treatmentsLoading || employeesLoading || availableTreatmentsLoading)
                                                        ? <Spinner size={'sm'}/>
                                                        : <div>
                                                            <Swiper
                                                                className={'mt-2'}
                                                                spaceBetween={1}
                                                                slidesPerView={5.5}
                                                            >
                                                                {availableTimes.map((compTreatment: any, index: number) => {
                                                                    if (!compTreatment.checkEmployee) {
                                                                        return (
                                                                            <SwiperSlide key={index}>
                                                                                <div className="flex items-center">
                                                                                    <Kbd
                                                                                        className={selectedCompTreatmentId === compTreatment._id ? 'bg-primary text-white cursor-pointer' : 'cursor-pointer'}
                                                                                        onClick={() => selectCompTreatment(compTreatment._id)}>
                                                                                        {compTreatment.timeStart} - {compTreatment.timeEnd}
                                                                                    </Kbd>
                                                                                </div>
                                                                            </SwiperSlide>
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <SwiperSlide key={index}>
                                                                                <Kbd
                                                                                    className={(compTreatment.booked && admin) ? 'bg-purple-500 text-white cursor-pointer' : 'text-white bg-red-500 cursor-pointer'}>
                                                                                    {compTreatment.timeStart} - {compTreatment.timeEnd}
                                                                                </Kbd>
                                                                            </SwiperSlide>
                                                                        )
                                                                    }
                                                                })}
                                                            </Swiper>
                                                        </div>
                                                    }
                                                    <div>
                                                        <Label className={'text-purple-500 font-bold'}
                                                               value={'*dokładnie ta wizyta jest zabookowana'}/>
                                                    </div>
                                                    <div>
                                                        <Label className={'text-red-500 font-bold'}
                                                               value={'*pracownik nie jest dostępny w tych godzinach'}/>
                                                    </div>
                                                </div>

                                            }
                                            <div className={'flex items-center gap-2 mt-5'}>
                                                <Checkbox checked={wantToAddCustomHours}
                                                          onChange={() => setWantToAddCustomHours(!wantToAddCustomHours)}/>
                                                <Label value={'Chcę dodać własne godziny'}/>
                                            </div>
                                            { wantToAddCustomHours &&
                                                <div>
                                                    <EditCompTreatment
                                                            comp={comp._id}
                                                            compTreatment={getCompTreatmentInfo(selectedCompTreatmentId)}
                                                            edit={handleEditCompTreatment}
                                                            setIsEditCompTreatmentOpen={setWantToAddCustomHours}
                                                    />
                                                </div>
                                            }

                                        </div>
                                        <div className="w-full mt-7 mb-5">
                                            <Button className={'mx-auto'} onClick={handleEdit}
                                                    theme={customTheme.button} color={'secondary'}>Edytuj
                                                zgłoszenie</Button>
                                        </div>
                                        <div className="w-full mt-7 mb-5">
                                            <Button className={'mx-auto'} onClick={() => removeReport(report._id)} color={'failure'}>Usuń zgłoszenie</Button>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    }
                </div>
            }
            <Footer1/>
        </div>
    );
};

export default EditReport;
