import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import GrapQL from "../../Utils/GrapQL.ts";
import {Employee, EmployeeTag} from "../../models/Employee.model.ts";
import {Alert, Avatar, Breadcrumb, Button, Kbd, Spinner} from "flowbite-react";
import "./EmployeeDetails.scss";
import Menu from "../../components/utils/Menu.tsx";
import {HiHome, HiInformationCircle} from "react-icons/hi";
import {PAGE_PATH} from "../../Utils/env.ts";
import {customTheme} from "../../Utils/theme.ts";
import {Code} from "react-content-loader";
import { FaArrowAltCircleDown } from "react-icons/fa";
import EditEmployee from "./EditEmployee.tsx";


const EmployeeDetails = () => {
    const { id } = useParams();

    const [admin, setAdmin] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [imagesLoaded, setImagesLoaded] = useState(true);

    const [treatments, setTreatments] = useState([]);
    const [treatmentsLoading, setTreatmentsLoading] = useState(true);

    const [employee, setEmployee] = useState<Employee>({
        tag: EmployeeTag.STYLIST,
        _id: "",
        description: "",
        ig: "",
        image: "",
        images: [],
        name: "",
        surname: "",
        treatmentsIds: []
    });
    const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);

    useEffect(() => {
        document.documentElement.scrollTop = 0;
    }, []);

    useEffect(() => {
        setAdmin(localStorage.getItem('admin') === 'true');
    }, []);

    useEffect(() => {
        GrapQL.loadTreatments().then((res: {treatments}) => {
            setTreatments(res.treatments);
            setTreatmentsLoading(false);
        })
    }, []);

    useEffect(() => {
        GrapQL.loadEmployeeDetails(id).then((res: { getEmployeeDetails: Employee }) => {
            setIsLoading(false);
            setEmployee(res.getEmployeeDetails);
        });
    }, [id]);

    const getTreatmentName = (id: string) => {
        const name = treatments.find((treatment: { _id: string }) => treatment._id === id).name;
        if (name)
            return name
        else
            return "no name";
    }

    const handleEditEmployee = (name: string, surname: string, description: string, treatmentsIds: string[], ig: string, tag: EmployeeTag, image: string, images: string[]) => {
        GrapQL.editEmployee(id, name, surname, description, treatmentsIds, ig, image, images, tag).then((res: { editEmployee: Employee }) => {
            setEmployee(res.editEmployee);
        })
    }

    return (
        <div className={'relative pb-20 min-h-[100vh]'}>
            <Menu/>
            {isLoading
                ? <div className={'h-[100vh] w-full'}>
                    <Spinner className={'absolute top-1/2 left-1/2'} size={'xl'}/>
                </div>
                : <div>
                    <div className={'employeeInfo relative'}>
                        <Breadcrumb className={'mt-5 ml-5'}>
                            <Breadcrumb.Item href={`${PAGE_PATH}`} icon={HiHome}>Główna</Breadcrumb.Item>
                            <Breadcrumb.Item href={`${PAGE_PATH}/employees`}>Pracownicy</Breadcrumb.Item>
                            <Breadcrumb.Item>{employee.name} {employee.surname}</Breadcrumb.Item>
                        </Breadcrumb>

                        {isEditEmployeeOpen && <EditEmployee employee={employee} edit={handleEditEmployee} isEditEmployeeOpen={isEditEmployeeOpen}
                                                             setIsEditEmployeeOpen={setIsEditEmployeeOpen}/>}

                        <div className={'flex flex-col gap-5 justify-between shadow container w-[80%] m-auto bg-transparent h-fit mt-[20vh] relative rounded-md lg:w-1/2 md:w-[60%]'}>
                            {(employee.image == "null" || employee.image == null)
                                ? <Avatar img={''} rounded size={"xl"} className={'avatar'}/>
                                : <Avatar img={employee.image} rounded={true} size={"xl"} className={'avatar'}/>
                            }

                            <div className={'flex flex-col gap-1.5 mt-[-10%]'}>
                                <p className={'userName text-center text-3xl'}>{employee.name} {employee.surname}</p>
                                <p className={'userEmail text-center text-md'}>{employee.description}</p>
                                {admin &&
                                    <Button theme={customTheme.button} color={'secondary'} onClick={() => setIsEditEmployeeOpen(true)} className="block w-fit mx-auto px-4 py-2 text-sm hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white">
                                        Edytuj
                                    </Button>
                                }

                                {treatmentsLoading
                                    ? <Code className={'codeLoader'} width={200} height={100}/>
                                    : treatments && treatments.length > 0
                                        ? <div className={'mt-7 mx-auto treatments w-full flex justify-center flex-wrap'}>
                                            {employee.treatmentsIds.map((treatmentId, index) => (
                                                <Kbd className={'cursor-pointer'} key={index}>{getTreatmentName(treatmentId)}</Kbd>
                                            ))}
                                        </div>
                                        : <Alert color="failure" icon={HiInformationCircle}>
                                            <span className="font-medium">Niestety</span> nie znaleziono pracowników z tą rangą
                                        </Alert>
                                }
                            </div>

                            <Button
                                theme={customTheme.button}
                                gradientDuoTone={'purpleToOrange'}
                                className={'self-center w-52 mb-5'}
                            >
                                <a target={'_blank'} className={'block w-full h-full'} href={employee.ig}>Konto
                                    IG</a>
                            </Button>
                        </div>

                        {employee.images.length
                            ? <a href={'#gallery'} className={'cursor-pointer mt-10 flex justify-center items-center gap-1'}><FaArrowAltCircleDown/> Zobacz galerię</a>
                            : <Alert className={'container mx-auto w-1/2 mt-10'} color="failure" icon={HiInformationCircle}>
                                <span className="font-medium">Niestety</span> ten pracownik nie ma dodanych żadnych prac
                            </Alert>
                        }
                    </div>

                    <div id={'gallery'} className={'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-center justify-items-center mx-auto w-[80%] mt-[50px]'}>
                        {!imagesLoaded && <Spinner size={'xl mx-auto'}/>}
                        {employee.images.map((image: string, index) => (
                            <img onLoad={() => setImagesLoaded(true)} loading={"lazy"} key={index} width={200}
                                 height={200} src={image} alt=""/>
                        ))}
                    </div>
                </div>
            }
        </div>
    );
};

export default EmployeeDetails;

