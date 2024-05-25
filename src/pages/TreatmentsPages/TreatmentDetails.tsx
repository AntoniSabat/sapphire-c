import {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {Currency, Treatment, TreatmentTag} from "../../models/Treatment.model.ts";
import GrapQL from "../../Utils/GrapQL.ts";
import EditTreatment from "./EditTreatment.tsx";
import Menu from "../../components/utils/Menu.tsx";
import {Avatar, Breadcrumb, Button, Spinner} from "flowbite-react";
import {PAGE_PATH} from "../../Utils/env.ts";
import {HiHome} from "react-icons/hi";
import {customTheme} from "../../Utils/theme.ts";
import "./TreatmentDetails.scss";

const TreatmentDetails = () => {
    const {id} = useParams();
    const [admin, setAdmin] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [treatment, setTreatment] = useState<Treatment>({
        _id: "",
        name: "",
        description: "",
        price: 0,
        currency: Currency.PLN,
        time: "",
        image: "",
        tag: TreatmentTag.HAIRSTYLE
    })
    const [isEditTreatmentOpen, setIsEditTreatmentOpen] = useState(false);

    useEffect(() => {
        document.documentElement.scrollTop = 0;
    }, []);

    useEffect(() => {
        setAdmin(localStorage.getItem('admin') === 'true');
    }, []);

    useEffect(() => {
        GrapQL.loadTreatmentDetails(id).then((res: {getTreatmentDetails}) => {
            setIsLoading(false);
            setTreatment(res.getTreatmentDetails)
        })
    }, []);

    const handleEditTreatment = (name: string, description: string, currency: string, price: number, time: string, image: string, tag: TreatmentTag) => {
        GrapQL.editTreatment(id, name, description, currency, price, time, image, tag).then((res: {editTreatment: Treatment}) => {
            setTreatment(res.editTreatment);
        })
    }

    return (
        <div className={'box relative min-h-[100vh] h-fit flex flex-col'}>
            <Menu/>
            {isLoading
                ? <div className={'h-[100vh] w-full'}>
                    <Spinner className={'absolute top-1/2 left-1/2'} size={'xl'}/>
                </div>
                : <div>
                    <div className="treatmentInfo relative">
                        <Breadcrumb className={'mt-5 ml-5'}>
                            <Breadcrumb.Item href={`${PAGE_PATH}`} icon={HiHome}>Główna</Breadcrumb.Item>
                            <Breadcrumb.Item href={`${PAGE_PATH}/treatments`}>Usługi</Breadcrumb.Item>
                            <Breadcrumb.Item>{treatment.name}</Breadcrumb.Item>
                        </Breadcrumb>

                        {isEditTreatmentOpen && <EditTreatment treatment={treatment} edit={handleEditTreatment}
                                                               isEditTreatmentOpen={isEditTreatmentOpen} setIsEditTreatmentOpen={setIsEditTreatmentOpen}/>}

                        <div
                            className={'flex flex-col gap-5 px-5 justify-between shadow container w-[80%] m-auto bg-transparent h-fit mt-[20vh] relative rounded-md lg:w-1/2 md:w-[60%]'}>
                            {(treatment.image == "null" || treatment.image == null || !treatment.image)
                                ? <Avatar img={''} rounded size={"xl"} className={'avatar'}/>
                                : <Avatar img={treatment.image} rounded={true} size={"xl"} className={'avatar'}/>
                            }

                            <div className={'flex flex-col gap-1.5 mt-[-10%]'}>
                                <p className={'userName text-center text-3xl'}>{treatment.name}</p>
                                <p className={'userEmail text-center text-md'}>{treatment.description}</p>
                                <p className={'userEmail text-center text-md'}>{treatment.time}h - <strong>{treatment.price}{treatment.currency === Currency.EUR ? '€' : 'zł'}</strong></p>
                            </div>

                            {admin
                                ?
                                    <Button
                                        onClick={() => setIsEditTreatmentOpen(true)}
                                        theme={customTheme.button}
                                        color={'secondary'}
                                        className={'self-center w-52 mb-5'}
                                    >
                                            Edytuj
                                    </Button>
                                :
                                    <Button
                                        theme={customTheme.button}
                                        color={'secondary'}
                                        className={'self-center w-52 mb-5'}
                                    >
                                        <a href={`${PAGE_PATH}/gallery`}>Galeria</a>
                                    </Button>
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};

export default TreatmentDetails;
