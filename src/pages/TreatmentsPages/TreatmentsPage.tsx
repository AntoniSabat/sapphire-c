import {useEffect, useState} from "react";
import GraphQL from "../../Utils/GrapQL";
import TreatmentItem from "../../components/treatmentItem.tsx";
import {ConfirmAlert, ErrorAlert, SuccessAlert} from "../../Utils/alerts.ts";
import Menu from "../../components/utils/Menu.tsx";
import {Alert, Button, Label, Modal, Select, Spinner, TextInput} from "flowbite-react";
import {customTheme} from "../../Utils/theme.ts";
import makeup from "../../assets/images/makijaż.png";
import hair from "../../assets/images/fryzura.png";
import man from "../../assets/images/man.png";
import {Currency, Treatment, TreatmentTag} from "../../models/Treatment.model.ts";
import {HiInformationCircle} from "react-icons/hi";
import Footer1 from "../../components/utils/Footer1.tsx";

const TreatmentsPage = () => {
    const [admin, setAdmin] = useState(false);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [treatments, setTreatments] = useState([]);

    const [isCreateTreatmentOpen, setIsCreateTreatmentOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<TreatmentTag>(TreatmentTag.MAKEUP);
    const [availableTreatments, setAvailableTreatments] = useState([]);

    //create treatment
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [currency, setCurrency] = useState(Currency.PLN);
    const [price, setPrice] = useState(-1);
    const [time, setTime] = useState('');
    const [tag, setTag] = useState(TreatmentTag.HAIRSTYLE);

    useEffect(() => {
        setAdmin(localStorage.getItem('admin') === 'true');
    }, []);

    useEffect(() => {
        GraphQL.loadTreatments().then((res: {treatments}) => {
            setIsLoading(false);
            findAvailableTreatments(TreatmentTag.MAKEUP)
            setTreatments(res.treatments);
        })
    }, []);

    useEffect(() => {
        findAvailableTreatments(selectedCategory);
    }, [treatments]);

    const selectCategory = (tag: TreatmentTag) => {
        setSelectedCategory(tag);
        findAvailableTreatments(tag);
    }

    const findAvailableTreatments = (tag: TreatmentTag) => {
        const availableTreatments = treatments.filter((treatment: Treatment) => treatment.tag === tag);
        setAvailableTreatments(availableTreatments)
    }

    const handleCreate = (e: any) => {
        e.preventDefault();

        if (!name || !description || !currency || price < 0 || !time || !tag) {
            ErrorAlert('Oops...', 'Wypełnij wszystkie pola!');
            return;
        } else {
            GraphQL.createTreatment(name, description, currency, price, time, tag).then((res: {createTreatment}) => {
                setTreatments([...treatments, res.createTreatment]);
            });
            SuccessAlert('Brawo!', 'Pomyślnie dodano usługę!', () => {
                setIsCreateTreatmentOpen(false);
            });
        }
    }

    const handleRemoveTreatment = (id: string) => {
        ConfirmAlert('Jesteś pewna?', 'Usunięcie usługi jest nieodwracalne!', (isConfirmed: boolean) => {
            if (isConfirmed) {
                GraphQL.removeTreatment(id).then((res: {removeTreatment}) => {
                    setTreatments(treatments.filter(treatment => treatment._id !== res.removeTreatment._id));
                    SuccessAlert('Super!', 'Pomyślnie usunięto usługę!');
                })
            }
        })
    }

    return (
        <div className={'relative pb-[100px] min-h-[100vh]'}>
            <Menu/>
            {isLoading
                ? <div className={'w-full relative h-[100vh]'}>
                    <Spinner className={'absolute top-1/2 left-1/2'} size={'xl'}/>
                </div>
                : <div>
                    <div className={'flex gap-3 justify-center items-center'}>
                        <div>
                            <h1 className="text-center text-3xl font-bold mt-10">Sprawdź nasze usługi!</h1>
                            <p className="text-center text-md mt-2">Usługi dopasowane są do trzech kategorii</p>
                        </div>

                        {admin && <Button theme={customTheme.button} color={'secondary'} className={''}
                                          onClick={() => setIsCreateTreatmentOpen(true)}>Dodaj usługę</Button>}
                    </div>

                    <div className="w-full flex gap-5 p-5 mt-5 justify-center">
                        <button onClick={() => (selectCategory(TreatmentTag.MAKEUP))}
                                className={selectedCategory === TreatmentTag.MAKEUP ? 'transition duration-500 category border-primary border-8' : 'category'}>
                            <img src={makeup} alt={''}/>
                            <p className="font-bold text-[10px] md:text-xs lg:text-md xl:text-lg">MAKIJAŻ</p>
                        </button>
                        <button onClick={() => selectCategory(TreatmentTag.HAIRSTYLE)}
                                className={selectedCategory === TreatmentTag.HAIRSTYLE ? 'transition duration-500 category border-primary border-8' : 'category'}>
                            <img src={hair} alt={''}/>
                            <p className="font-bold text-[10px] md:text-xs lg:text-md xl:text-lg">FRYZURA</p>
                        </button>
                        <button onClick={() => selectCategory(TreatmentTag.MAN)}
                                className={selectedCategory === TreatmentTag.MAN ? 'transition duration-500 category border-primary border-8' : 'category'}>
                            <img src={man} alt={''}/>
                            <p className="font-bold text-[10px] md:text-xs lg:text-md xl:text-lg">MAN</p>
                        </button>
                    </div>

                    {!availableTreatments.length
                        ?
                        <div className={'container mx-auto mt-3'}>
                            <Alert color="failure" icon={HiInformationCircle}>
                                <span className="font-medium">Niestety</span> nie znaleziono usług w tej kategorii
                            </Alert>
                        </div>
                        :
                        <div className={'container mx-auto mt-5 p-3'}>
                            <h1 className="text-xl font-bold mt-10">Usługi - {selectedCategory}</h1>
                            <p className="text-secondary font-bold text-md">Znaleziono {availableTreatments.length} pasujące usługi</p>

                            <div className={'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-center gap-12 justify-items-center mt-10'}>
                                {availableTreatments.map((treatment, index) => (
                                    <TreatmentItem remove={handleRemoveTreatment} key={index} treatment={treatment}/>
                                ))}
                            </div>
                        </div>
                    }
                </div>
            }

            <Modal show={isCreateTreatmentOpen} size={'md'} onClose={() => setIsCreateTreatmentOpen(false)} popup>
                <Modal.Header/>
                <Modal.Body>
                    <div className="space-y-6">
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">Stwórz nową usługe</h3>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="name" value="Nazwa"/>
                            </div>
                            <TextInput
                                id="name"
                                placeholder="Usługa 1"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="description" value="Opis"/>
                            </div>
                            <TextInput
                                id="description"
                                placeholder="Opis usługi 1..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="price" value="Cena"/>
                            </div>
                            <input
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-300 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                type={'number'}
                                id="price"
                                placeholder="100"
                                value={price}
                                onChange={(e) => setPrice(+e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="time" value="Czas usługi"/>
                            </div>
                            <input
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-cyan-300 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                type={'time'}
                                id="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="tag" value="Kategoria"/>
                            </div>
                            <Select id={'tag'} required value={tag}
                                    onChange={(e) => setTag(TreatmentTag[e.target.value])}>
                                <option value={TreatmentTag.MAKEUP}>MAKEUP</option>
                                <option value={TreatmentTag.HAIRSTYLE}>HAIRSTYLE</option>
                                <option value={TreatmentTag.MAN}>MAN</option>
                            </Select>
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="currency" value="Waluta"/>
                            </div>
                            <Select id={'currency'} required value={currency}
                                    onChange={(e) => setCurrency(Currency[e.target.value])}>
                                <option value={Currency.PLN}>PLN</option>
                                <option value={Currency.EUR}>EURO</option>
                            </Select>
                        </div>
                        <div className="w-full">
                            <Button onClick={handleCreate} theme={customTheme.button} color={'secondary'}>Stwórz usługę</Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default TreatmentsPage;
