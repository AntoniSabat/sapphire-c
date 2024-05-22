import {useEffect, useState} from "react";
import {Break, CompTreatment} from "../../models/Comp.model.ts";
import GrapQL from "../../Utils/GrapQL.ts";
import {IoClose} from "react-icons/io5";
import {countEndTime, getEmployeeFullNameAndTreatmentsIds, getTreatmentName} from "../../Utils/helpers.ts";
import {ConfirmAlert, ErrorAlert, SuccessAlert} from "../../Utils/alerts.ts";
import {Button, Checkbox, Datepicker, Kbd, Label, Modal, Spinner, TextInput, Tooltip} from "flowbite-react";
import {customTheme} from "../../Utils/theme.ts";

const EditComp = ({comp, edit, isEditCompOpen, setIsEditCompOpen}) => {
    const [employees, setEmployees] = useState([]);
    const [treatments, setTreatments] = useState([]);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [areAvailableTreatmentsAndEmployeesLoading, setAreAvailableTreatmentsAndEmployeesNamesLoading] = useState(false);

    const [name, setName] = useState(comp.name);
    const [date, setDate] = useState(comp.date);
    const [place, setPlace] = useState(comp.place);
    const [timeStart, setTimeStart] = useState(comp.timeStart);
    const [timeEnd, setTimeEnd] = useState(comp.timeEnd);
    const [breaks, setBreaks] = useState<Break[]>(comp.breaks);
    const [employeesIds, setEmployeesIds] = useState<string[]>(comp.employees);

    const [breakStart, setBreakStart] = useState('');
    const [breakLong, setBreakLong] = useState('');
    const [isAddBreakFormVisible, setIsAddBreakFormVisible] = useState(false);

    const [tempAvailableTreatmentsIds, setTempAvailableTreatmentsIds] = useState([]);
    const [availableTreatments, setAvailableTreatments] = useState([]);
    const [selectedTreatments, setSelectedTreatments] = useState([]);
    const [selectedTreatmentsHelper, setSelectedTreatmentsHelper] = useState([]);
    const [treatmentsEmployees, setTreatmentsEmployees] = useState([]);
    const [removedEmployeesFromComp, setRemovedEmployeesFromComp] = useState<string[]>([]);

    const [employeesChanged, setEmployeesChanges] = useState(false);

    useEffect(() => {
        GrapQL.loadEmployees().then((res: {employees}) => {
            setEmployees(res.employees);
            setIsLoadingEmployees(false);
        })

        const temp = [];
        comp.treatments.map((treatment: CompTreatment) => {
            temp.push(treatment.treatmentId);
        })

        setSelectedTreatmentsHelper([...new Set(temp)]);
    }, []);

    useEffect(() => {
        setAreAvailableTreatmentsAndEmployeesNamesLoading(true);
        Promise.all(
            employeesIds.map((employee: string) => {
                return getEmployeeFullNameAndTreatmentsIds(employee);
            })
        ).then(results => {
            setAreAvailableTreatmentsAndEmployeesNamesLoading(false);
            const duplicatedTreatments = results.map((e: {treatmentsIds: string[]}) => e.treatmentsIds).flat();
            setTempAvailableTreatmentsIds([...new Set(duplicatedTreatments)]);
        });
    }, [employeesIds]);

    useEffect(() => {
        Promise.all(
            tempAvailableTreatmentsIds.map(async (treatmentId) => {
                try {
                    return await getTreatmentName(treatmentId);
                } catch (error) {
                    return null;
                }
            })
        ).then(treatmentNames => {
            setAvailableTreatments(treatmentNames.filter((name) => name !== null));
        });
    }, [tempAvailableTreatmentsIds]);

    useEffect(() => {
        const matchingEmployees = employees.filter(employee => {
            return selectedTreatments.some(treatment => employee.treatmentsIds.includes(treatment));
        });
        const matchingEmployeesIds = matchingEmployees.map(employee => employee._id);
        setTreatmentsEmployees(matchingEmployeesIds);
    }, [selectedTreatments]);

    useEffect(() => {
        GrapQL.loadTreatments().then((res: {treatments}) => {
            setTreatments(res.treatments);
        })
    }, []);

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    const validateStartTime = () => {
        return timeStart <= timeEnd;
    };

    const validateEndTime = () => {
        return timeEnd >= timeStart;
    };

    const validateBreakStart = () => {
        return !(breakStart <= timeStart || breakStart >= timeEnd);
    }

    const validateBreakLong = () => {
        const breakEnd = countEndTime(breakStart, breakLong);

        if (breakLong === '00:00') {
            return false;
        } else return breakEnd <= timeEnd;
    }

    const addEmployee = (id: string) => {
        if (employeesIds.includes(id)) {
            setEmployeesIds(employeesIds.filter(employee => employee !== id));
            setRemovedEmployeesFromComp([...removedEmployeesFromComp, id]);
        } else {
            setEmployeesIds([...employeesIds, id]);
        }

        setEmployeesChanges(true);
    }

    const addTreatment = (id: string) => {
        if (selectedTreatments.includes(id)) {
            setSelectedTreatments(selectedTreatments.filter((treatment) => treatment !==id));
        } else {
            setSelectedTreatments([...selectedTreatments, id]);
        }
    }

    const checkIfTreatmentIsSelected = (id: string) => {
        return selectedTreatmentsHelper.includes(id);
    }

    const handleAddBreak = () => {
        setBreaks([...breaks, {breakStart, breakLong}]);
        setBreakStart('');
        setBreakLong('');
        setIsAddBreakFormVisible(false);
    }

    const handleDeleteBreak = (index: number) => {
        setBreaks(breaks.filter((_, i) => i !== index));
    }

    const getTreatmentInfo = (id: string) => {
        return treatments.find(treatment => treatment._id === id);
    }

    const createCompTreatment = () => {
        let timeStartHelper = timeStart;

        if (!selectedTreatments.length || timeStart === '' || timeEnd === '' || !treatmentsEmployees.length) return;
        interface CompTime {
            from: string;
            to: string;
        }

        const comps: CompTime[] = [];

        for (let treatment of selectedTreatments) {
            const treatmentInfo = getTreatmentInfo(treatment);
            console.log(treatmentInfo.time)
            timeStartHelper = timeStart;

            const breaksSorted: Break[] = [...breaks].sort((a, b) => a.breakStart < b.breakStart ? -1 : 1);

            while(timeStartHelper < timeEnd) {
                if (breaksSorted.length) {
                    if (timeStartHelper < breaksSorted[0].breakStart) {
                        comps.push({from: timeStartHelper, to: countEndTime(timeStartHelper, treatmentInfo.time)});
                        timeStartHelper = comps[comps.length - 1].to;
                    } else {
                        const from = countEndTime(comps[comps.length - 1].to, breaksSorted[0].breakLong);
                        comps.push({from: from, to: countEndTime(from, treatmentInfo.time)});
                        timeStartHelper = comps[comps.length - 1].to;

                        breaksSorted.shift();
                    }
                } else {
                    comps.push({from: timeStartHelper, to: countEndTime(timeStartHelper, treatmentInfo.time)});
                    timeStartHelper = comps[comps.length - 1].to;
                }
            }

            for (const c of comps) {
                GrapQL.createCompTreatment(comp._id, treatment, c.from, c.to).then();
            }
            comps.length = 0;
        }

        setTreatmentsEmployees([]);
    }

    const handleEdit = (e: any) => {
        e.preventDefault();

        ConfirmAlert('Jesteś pewna?', 'Czy na pewno chcesz edytować turniej?', (isConfirmed: boolean) => {
            if (isConfirmed) {
                if (!name || !date || !place || !timeStart || !timeEnd) {
                    ErrorAlert('Oops...', 'Wypełnij wszystkie pola!');
                    return;
                } else {
                    if (selectedTreatments.length) {
                        createCompTreatment()
                    }

                    if (employeesChanged && comp.treatments.length) {
                        removedEmployeesFromComp.map(employeeId => {
                            GrapQL.removeReportsAssignedToEmployee(comp._id, employeeId).then(() => {
                                setRemovedEmployeesFromComp([]);
                            })
                        })
                    }

                    edit(name, date, place, timeStart, timeEnd, breaks, employeesIds);

                    SuccessAlert('Super!', 'Pomyślnie zedytowano turniej!');
                    setIsEditCompOpen(false);
                }
            }
        })
    }

    return (
        <Modal show={isEditCompOpen} size={'md'} onClose={() => setIsEditCompOpen(false)} popup>
            <Modal.Header/>
            <Modal.Body>
                <div className="space-y-6">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Edytuj turniej</h3>
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
                        <Datepicker value={date}
                                    weekStart={1}
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
                    <div>
                        <div className={'mb-2 block'}>
                            <Label htmlFor="timeEnd" value="Przerwy"/>
                        </div>
                        {comp.treatments.length
                            ? <Tooltip content={'Nie mozesz zmienić czasu przerw po stworzeniu harmonogramu wizyt'}>
                                <Button theme={customTheme.button} color={'secondary'} disabled>Dodaj przerwę</Button>
                            </Tooltip>
                            : !breaks.length && !isAddBreakFormVisible && <Button theme={customTheme.button} color={'secondary'} onClick={() => setIsAddBreakFormVisible(true)} disabled={comp.treatments.length}>Dodaj przerwę</Button>
                        }

                        { breaks.map((breakItem, index) => (
                            <div>
                                <div key={index}>
                                    <span className={'flex'}>
                                    <Kbd>
                                        {breakItem.breakStart} - {countEndTime(breakItem.breakStart, breakItem.breakLong)}
                                    </Kbd>
                                        <Button disabled={comp.treatments.length} color={'failure'} onClick={() => handleDeleteBreak(index)}><IoClose color={'white'}/></Button>
                                    </span>
                                </div>
                            </div>
                        ))}

                        {breaks.length > 0 && !isAddBreakFormVisible && !comp.treatments.length &&
                             <Button theme={customTheme.button} color={'secondary'} onClick={() => setIsAddBreakFormVisible(true)} disabled={comp.treatments.length}>Dodaj przerwę</Button>
                        }

                        {isAddBreakFormVisible && <div>
                        <div className="mb-2 block mt-2">
                                <Label htmlFor="breakStart" value="Godzina rozpoczęcia przerwy"/>
                            </div>
                            <input
                                className={`${validateBreakStart() ? 'border-gray-300 text-gray-900 focus:ring-cyan-300 focus:border-blue-500' : 'border-red-700 text-red-700 focus:ring-red-500 focus:border-red-700'} border bg-grey-50 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                                type={'time'}
                                id="breakLong"
                                value={breakStart}
                                onChange={(e) => setBreakStart(e.target.value)}
                                required
                            />
                            <div className="mb-2 block mt-2">
                                <Label htmlFor="breakLong" value="Długość przerwy"/>
                            </div>
                            <input
                                className={`${validateBreakLong() ? 'border-gray-300 text-gray-900 focus:ring-cyan-300 focus:border-blue-500' : 'border-red-700 text-red-700 focus:ring-red-500 focus:border-red-700'} border bg-grey-50 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                                type={'time'}
                                id="breakLong"
                                value={breakLong}
                                onChange={(e) => setBreakLong(e.target.value)}
                                required
                            />
                            <div className={'flex items-center'}>
                                <Button className={'mt-2'} theme={customTheme.button} color={'secondary'} onClick={handleAddBreak}>Dodaj</Button>
                                <Button color={'failure'} onClick={() => setIsAddBreakFormVisible(false)}><IoClose color={'white'}/></Button>
                            </div>
                        </div>}
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="tag" value="Pracownicy"/>
                        </div>
                        {isLoadingEmployees
                            ? <Spinner className={'mx-auto'} size={'sm'}/>
                            : <div className={'flex flex-wrap'}>
                                {employees.map((employee, index) => (
                                    <span key={index}>
                                            <Kbd onClick={() => addEmployee(employee._id)}
                                                 className={employeesIds.includes(employee._id) ? 'bg-green-400 text-white cursor-pointer' : 'cursor-pointer'}>{employee.name} {employee.surname}</Kbd>
                                        </span>
                                ))}
                            </div>
                        }
                    </div>
                    <div>
                        {areAvailableTreatmentsAndEmployeesLoading
                            ? <Spinner className={'mx-auto'} size={'sm'}/>
                            : <div>
                                {!availableTreatments.length &&
                                    <div className="mb-2 block">
                                        <Label htmlFor="treatments" value="Usługi"/>
                                    </div>
                                }
                                {(availableTreatments.map((treatment, index) => {
                                    if (!checkIfTreatmentIsSelected(treatment._id)) {
                                        return (
                                            <div key={index}>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        onChange={() => addTreatment(treatment._id)}
                                                        value={treatment._id}
                                                        checked={selectedTreatments.includes(treatment._id)}
                                                        id="accept"/>
                                                    <Label htmlFor="accept" className="flex">
                                                        {treatment.name}
                                                    </Label>
                                                </div>
                                            </div>
                                        )
                                    }
                                }))}
                            </div>
                        }
                    </div>
                    <div className="w-full">
                        <Button onClick={handleEdit} theme={customTheme.button} color={'secondary'}>Edytuj
                            turniej</Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default EditComp;
