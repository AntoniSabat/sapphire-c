import {Link, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import GrapQL from "../../Utils/GrapQL.ts";
import {CompTreatment, Treatments} from "../../models/Comp.model.ts";
import "./ReportsPage.scss";
import {PAGE_PATH} from "../../Utils/env.ts";
import {Employee} from "../../models/Employee.model.ts";
import Menu from "../../components/utils/Menu.tsx";
import {Alert, Breadcrumb, Label, Select, Spinner} from "flowbite-react";
import {HiHome, HiInformationCircle} from "react-icons/hi";

const ReportsPage = () => {
    let canChooseEmployee = false;

    const {compId} = useParams();
    const [availableTimes, setAvailableTimes] = useState([]);

    const [user, setUser] = useState<{ given_name: string, family_name: string, email: string, picture: string } | null>(null);
    const [admin, setAdmin] = useState(false);

    const [comp, setComp] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [loadingTreatments, setLoadingTreatments] = useState(true);
    const [isLoadingComp, setIsLoadingComp] = useState(true);
    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [loadingAvailableEmployees, setLoadingAvailableEmployees] = useState(true);

    const [treatments, setTreatments] = useState([]);

    let treatmentsCopy: Treatments[] = [];
    const [calendarTreatments, setCalendarTreatments] = useState<Treatments[]>([]);
    const [availableTreatments, setAvailableTreatments] = useState<Treatments[]>([]);
    const [_, setLoadingAvailableTreatments] = useState(true);
    const [loadingCalendarTreatments, setLoadingCalendarTreatments] = useState(true);

    const [treatmentsHeight, setTreatmentsHeight] = useState({});
    const [calendarHeight, setCalendarHeight] = useState(0);

    useEffect(() => {
        setAdmin(localStorage.getItem('admin') === 'true');
        if (localStorage.getItem('user')) {
            const user = JSON.parse(localStorage.getItem('user'))
            setUser(user);
        }
    }, []);

    useEffect(() => {
        GrapQL.loadTreatments().then((res: {treatments}) => {
            setTreatments(res.treatments);
            setLoadingTreatments(false);
        })
    }, []);

    useEffect(() => {
        GrapQL.loadCompDetails(compId).then((res: {getCompDetails}) => {
            setComp(res.getCompDetails);
            setIsLoadingComp(false);
            const compDetails = res.getCompDetails;

            GrapQL.loadEmployees().then((res: {employees}) => {
                if (compDetails.employees.length) {
                    setSelectedEmployee('select');
                    loadAvailableEmployees();
                }

                setEmployees(res.employees);
                setLoadingEmployees(false);
            })
        })
    }, []);

    useEffect(() => {
        if (!isLoadingComp && !loadingTreatments && !loadingEmployees) {
            GrapQL.getCalendar(compId, changeDateFormat(comp.date)).then((res: {getCalendar}) => {
                const data = res.getCalendar;
                treatmentsCopy = data;

                const lessons: Treatments[] = [];
                const uniqueTreatments = new Set();
                comp.treatments.map((treatment: CompTreatment) => {
                    uniqueTreatments.add(treatment.treatmentId);
                })

                data.forEach(obj => {
                    console.log(obj)
                    const startY = calculateYPositionResult(obj.start, comp.timeStart, comp.timeEnd, 2000);

                    Array.from(uniqueTreatments).map((treatmentId: string) => {
                        const treatmentDuration = treatments.find(treatment => treatment._id === treatmentId)?.time;
                        const numberOfTreatments = calculateNumberOfTreatments(comp.timeStart, comp.timeEnd, treatmentDuration) + 1;

                        const eventHeight = 2000 / numberOfTreatments;

                        setTreatmentsHeight(prevState => ({
                            ...prevState,
                            [treatmentId]: eventHeight
                        }))
                    })

                    lessons.push({
                        compId: obj.compId,
                        id: obj.id,
                        start: startY,
                        end: obj.start,
                        confirmed: obj.confirmed,
                        employeeId: obj.employeeId,
                        clientEmail: obj.clientEmail,
                        clientName: obj.clientName,
                        clientSurname: obj.clientSurname,

                        cols: 1,
                        pos: 1,

                        hours: `${obj.start} - ${obj.end}`,

                        colliders: [],
                        nextColliders: []
                    })
                })

                lessons.sort((a, b) => {
                    const getStartTimeInMinutes = (lesson) => {
                        const [start, ] = lesson.hours.split(' - ');
                        const [hours, minutes] = start.split(':').map(Number);
                        return hours * 60 + minutes;
                    };

                    return getStartTimeInMinutes(a) - getStartTimeInMinutes(b);
                });

                setCalendarTreatments(lessons);
                setLoadingCalendarTreatments(false);
            })
        }
    }, [isLoadingComp, loadingTreatments, loadingEmployees]);

    useEffect(() => {
        if (loadingCalendarTreatments) return;

        treatmentsCopy = calendarTreatments;
        if (selectedEmployee) {
            const treatments = treatmentsCopy.filter(treatment => treatment.employeeId === selectedEmployee);
            setAvailableTreatments(treatments);
            setLoadingAvailableTreatments(false);
            loadAvailableEmployees();
            setAvailableTimes(treatments);
        }
    }, [loadingCalendarTreatments]);

    useEffect(() => {
        if (availableTreatments.length && availableEmployees.length) {
            const first = availableTreatments[0];
            const last = availableTreatments[availableTreatments.length - 1];

            const calendarHeight = last.start - first.start;

            const treatments = availableTreatments.map(treatment => {
                return {
                    ...treatment,
                    start: calculateYPositionResult(treatment.end, first.hours.split(' - ')[0], last.hours.split(' - ')[1], calendarHeight)
                }
            })

            setCalendarHeight(calendarHeight);
            setAvailableTimes(treatments);
        } else if (availableTreatments.length === 0) {
            setCalendarHeight(0);
        }
    }, [loadingAvailableEmployees, availableTreatments]);

    useEffect(() => {
    }, [selectedEmployee]);

    const loadAvailableEmployees = () => {
        const uniqueEmployees = new Set();
        if (comp) {
            const promises = comp.employees.map((employeeId: string) => {
                return GrapQL.loadEmployeeDetails(employeeId).then((res: { getEmployeeDetails }) => {
                    uniqueEmployees.add(res.getEmployeeDetails);
                })
            })

            Promise.all(promises).then(() => {
                const result: any[] = Array.from(uniqueEmployees).sort((a: Employee, b: Employee) => a.name < b.name ? -1 : 1);
                setAvailableEmployees(result.map(employee => employee._id));
                if (result[0]._id && canChooseEmployee)
                    setSelectedEmployee(result[0]._id);
                setLoadingAvailableEmployees(false);
            })
        }
    }

    const calculateNumberOfTreatments = (startTime: string, endTime: string, treatmentDuration: string) => {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        const totalStartMinutes = startHours * 60 + startMinutes;
        const totalEndMinutes = endHours * 60 + endMinutes;

        const [treatmentHours, treatmentMinutes] = treatmentDuration.split(':').map(Number);
        const totalTreatmentMinutes = treatmentHours * 60 + treatmentMinutes;

        const timeDifference = totalEndMinutes - totalStartMinutes;
        return Math.floor(timeDifference / totalTreatmentMinutes);
    }

    function calculateYPositionResult(time: string, calendarStartTime: string, calendarEndTime: string, calendarHeight: number): number {
        const [hours, minutes] = time.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes;

        const [calendarStartHours, calendarStartMinutes] = calendarStartTime.split(":").map(Number);
        const [calendarEndHours, calendarEndMinutes] = calendarEndTime.split(":").map(Number);
        const calendarStartTotalMinutes = calendarStartHours * 60 + calendarStartMinutes;
        const calendarEndTotalMinutes = calendarEndHours * 60 + calendarEndMinutes;

        const timeRatio = (totalMinutes - calendarStartTotalMinutes) / (calendarEndTotalMinutes - calendarStartTotalMinutes);
        return timeRatio * calendarHeight;
    }

    const changeDateFormat = (dateString: string) => {
        const parts = dateString.split('-');
        return parts[2] + '-' + parts[1] + '-' + parts[0];
    }

    const getEmployeeInfo = (employeeId: string) => {
        return employees.find((employee: {_id: string}) => employee._id === employeeId);
    }

    const getTreatmentName = (id: string) => {
        const name = treatments.find((treatment: { _id: string }) => treatment._id === id).name;
        if (name)
            return name
        else
            return "no name";
    }

    const chooseEmployee = (employeeId: string) => {
        canChooseEmployee = true;
        treatmentsCopy = calendarTreatments;
        setSelectedEmployee(employeeId);

        if (admin) {
            const treatments = treatmentsCopy.filter(treatment => treatment.employeeId === employeeId)
            setAvailableTreatments(treatments);
            setAvailableTimes(treatments)
        } else {
            const treatments = treatmentsCopy.filter(treatment => treatment.employeeId === employeeId && treatment.clientEmail === user?.email)
            setAvailableTreatments(treatments);
            setAvailableTimes(treatments)
        }
    }

    return (
        <div className={'relative pb-[100px] min-h-[100vh]'}>
            <Menu/>
            {isLoadingComp
                ? <div className={'h-[100vh] w-full'}>
                    <Spinner className={'absolute top-1/2 left-1/2'} size={'xl'}/>
                </div>
                : <div className={'relative'}>
                    <div className="relative">
                        <Breadcrumb className={'mt-5 ml-5'}>
                            <Breadcrumb.Item href={`${PAGE_PATH}`} icon={HiHome}>Główna</Breadcrumb.Item>
                            <Breadcrumb.Item href={`${PAGE_PATH}/comps/reports`}>Zgłoszenia</Breadcrumb.Item>
                            <Breadcrumb.Item>{comp.name}</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>

                    <div className={'flex gap-3 justify-center items-center'}>
                        <div>
                            <h1 className="text-center text-3xl font-bold mt-10">Harmonogram</h1>
                            <p className="text-center text-md mt-2">Sprawdź swoje usługi!</p>
                            <div className={'flex justify-center mt-3'}>
                                <Label className={'text-primary font-bold'}
                                       value={'*wizyta jest potwierdzona'}/>
                            </div>
                            <div className={'flex justify-center'}>
                                <Label className={'text-stone-800 font-bold'}
                                       value={'*wizyta nie jest potwierdzona'}/>
                            </div>
                        </div>
                    </div>

                    <div className={'mt-5 relative'}>
                        {loadingAvailableEmployees
                            ? <Spinner className={'absolute left-1/2'} size={'md'}/>
                            : <div className={'flex justify-center'}>
                                <Select id={'employee'} defaultValue={'select'} required value={selectedEmployee}
                                        onChange={(e) => chooseEmployee(e.target.value)}>
                                    <option disabled={true} value={'select'}>Wybierz pracownika</option>
                                    {availableEmployees.map((employeeId: string, index) => {
                                        return (
                                            <option key={index}
                                                    value={getEmployeeInfo(employeeId)._id}>{getEmployeeInfo(employeeId).name} {getEmployeeInfo(employeeId).surname}</option>
                                        )
                                    })}
                                </Select>
                            </div>
                        }
                    </div>

                    <table className="calendar" style={{marginTop: 40, height: calendarHeight, marginBottom: 40}}>
                            {loadingCalendarTreatments && loadingAvailableEmployees
                                ? <></>
                                : !availableTimes.length
                                    ? <div className={'mx-auto container'}>
                                        <Alert color="failure" icon={HiInformationCircle}>
                                            <span className="font-medium">Wybierz innego pracownika</span>
                                        </Alert>
                                    </div>
                                    :
                                        <div style={{position: 'relative'}}>
                                            {availableTimes.map((treatment: Treatments) => (
                                                <Link
                                                    to={`${PAGE_PATH}/comps/${compId}/reports/${comp.reports.find(r => r._id === treatment.id)?._id ?? ''}`}
                                                    key={treatment.id}
                                                    className={`treatment ${treatment.confirmed ? 'confirmed' : 'no-confirmed'}`}
                                                    style={{
                                                        top: treatment.start,
                                                        height: treatmentsHeight[comp.reports.find(r => r._id === treatment.id)?.treatmentId],
                                                        borderStyle: "solid",
                                                        borderWidth: 1,
                                                        borderColor: "white"
                                                    }}
                                                >
                                                    <div className="reported">
                                                        <p className="time">{treatment.hours} | {admin && `${treatment.clientName} ${treatment.clientSurname} | `}{getTreatmentName(comp.reports.find(r => r._id === treatment.id)?.treatmentId)}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                            }
                    </table>
                </div>
            }
        </div>
    )
}

export default ReportsPage;
