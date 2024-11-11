import { useState } from "react";
import { IoClose } from "react-icons/io5";
import {CompTreatment} from "../../models/Comp.model.ts";
import GrapQL from "../../Utils/GrapQL.ts";
import {ConfirmAlert, ErrorAlert, SuccessAlert} from "../../Utils/alerts.ts";
import {Button, Label} from "flowbite-react";
import {customTheme} from "../../Utils/theme.ts";

const EditCompTreatment = ({ comp, compTreatment, edit, setIsEditCompTreatmentOpen }) => {
    const [timeStart, setTimeStart] = useState(compTreatment.timeStart);
    const [timeEnd, setTimeEnd] = useState(compTreatment.timeEnd);
    const [timeError, setTimeError] = useState('');
    const [timeChanged, setTimeChanged] = useState(false);

    const oldEndTime = compTreatment.timeEnd;

    const handleTimeStartChange = (e: any) => {
        const startTime = e.target.value;
        setTimeStart(startTime);
        setTimeChanged(true);
        if (startTime > timeEnd) {
            setTimeError('Godzina rozpoczęcia nie może być późniejsza niż godzina zakończenia');
        } else {
            setTimeError('');
        }
    };

    const validateStartTime = () => {
        return timeStart <= timeEnd;
    }

    const handleTimeEndChange = (e: any) => {
        const endTime = e.target.value;
        setTimeEnd(endTime);
        setTimeChanged(true);
        if (endTime < timeStart) {
            setTimeError('Godzina zakończenia nie może być wcześniejsza niż godzina rozpoczęcia');
        } else {
            setTimeError('');
        }
    };

    const validateEndTime = () => {
        return timeEnd >= timeStart
    }

    const timeDifference = (oldTime: string, newTime: string) => {
        const [oldHour, oldMinute] = oldTime.split(':').map(Number);
        const [newHour, newMinute] = newTime.split(':').map(Number);

        let minutesdifference = (newHour * 60 + newMinute) - (oldHour * 60 + oldMinute);
        minutesdifference = (minutesdifference + 24 * 60) % (24 * 60);

        const hoursDifference = Math.floor(minutesdifference / 60);
        const minutesDifferenceRest = minutesdifference % 60;

        return `${String(hoursDifference).padStart(2, '0')}:${String(minutesDifferenceRest).padStart(2, '0')}`;
    }

    const handleEdit = (e: any) => {
        e.preventDefault();

        ConfirmAlert('Jesteś pewna?', 'Czy na pewno chcesz edytować wizytę?', (isConfirmed: boolean) => {
            if (isConfirmed) {
                if (!timeStart || !timeEnd) {
                    ErrorAlert('Oops...', 'Wypełnij wszystkie pola!');
                    return
                } else {
                    if (timeError) {
                        ErrorAlert('Oops...', 'Nieprawidłowe godziny!');
                        return
                    }

                    if (timeChanged) {
                        const difference = timeDifference(oldEndTime, timeEnd);

                        setTimeChanged(false);

                        ConfirmAlert('Jesteś pewna?', 'Czy chcesz edytować wszystkie kolejne wizyty?', (isConfirmed: boolean) => {
                          if (isConfirmed) {
                              let treatments = comp.treatments.map((ct: CompTreatment) => {
                                  if (ct.timeStart >= oldEndTime) {
                                      return ct._id;
                                  }
                              })
                              treatments = treatments.filter(ct => ct !== undefined && ct !== null);

                              GrapQL.editCompTreatments(comp._id, treatments, difference).then(() => {
                                  edit(compTreatment._id, timeStart, timeEnd);
                                  setIsEditCompTreatmentOpen(false);
                                  SuccessAlert('Super!', 'Pomyślnie edytowano wizytę!');
                              })
                          } else {
                              edit(compTreatment._id, timeStart, timeEnd);
                              setIsEditCompTreatmentOpen(false);
                              SuccessAlert('Super!', 'Pomyślnie edytowano wizytę!');
                          }
                        })
                    }
                }
            }
        })

        return;
    };

    return (
        <div>
            <div>
                <div>
                    <div className="mb-2 block mt-2">
                        <Label htmlFor="timeStart" value="Godzina rozpoczęcia wizyty"/>
                    </div>
                    <input
                        className={`${validateStartTime() ? 'border-gray-300 text-gray-900 focus:ring-cyan-300 focus:border-blue-500' : 'border-red-700 text-red-700 focus:ring-red-500 focus:border-red-700'} border bg-grey-50 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        type={'time'}
                        id="timeStart"
                        value={timeStart}
                        onChange={handleTimeStartChange}
                        required
                    />
                </div>
                <div>
                    <div className="mb-2 block mt-2">
                        <Label htmlFor="timeEnd" value="Godzina zakończenia usługi"/>
                    </div>
                    <input
                        className={`${validateEndTime() ? 'border-gray-300 text-gray-900 focus:ring-cyan-300 focus:border-blue-500' : 'border-red-700 text-red-700 focus:ring-red-500 focus:border-red-700'} border bg-grey-50 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        type={'time'}
                        id="timeEnd"
                        value={timeEnd}
                        onChange={handleTimeEndChange}
                        required
                    />
                </div>

                {timeError &&
                    <Label className={'text-red-500'} htmlFor="clientSurname"
                           value={`*${timeError}*`}/>
                }

                <div className={'flex items-center'}>
                    <Button onClick={handleEdit} className={'mt-2'} theme={customTheme.button} color={'secondary'} >Edytuj</Button>
                    <Button color={'failure'} onClick={() => setIsEditCompTreatmentOpen(false)}>
                        <IoClose color={'white'}/>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditCompTreatment;
