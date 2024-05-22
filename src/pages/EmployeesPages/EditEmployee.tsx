import {useEffect, useState} from "react";
import {EmployeeTag} from "../../models/Employee.model.ts";
import GraphQL from "../../Utils/GrapQL.ts";
import {handleFileUpload} from "../../Utils/helpers.ts";
import {CDN_API} from "../../Utils/env.ts";
import {ConfirmAlert, ErrorAlert, SuccessAlert} from "../../Utils/alerts.ts";
import {Avatar, Button, FileInput, Kbd, Label, Modal, Select, Spinner, TextInput} from "flowbite-react";
import {customTheme} from "../../Utils/theme.ts";

const EditEmployee = ({employee, edit, isEditEmployeeOpen, setIsEditEmployeeOpen}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [treatments, setTreatments] = useState([]);
    const [isLoadingTreatments, setIsLoadingTreatments] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [name, setName] = useState(employee.name);
    const [surname, setSurname] = useState(employee.surname);
    const [description, setDescription] = useState(employee.description);
    const [treatmentsIds, setTreatmentsIds] = useState(employee.treatmentsIds);
    const [ig, setIg] = useState(employee.ig);
    const [tag, setTag] = useState<EmployeeTag>(employee.tag);
    const [image, setImage] = useState(employee.image);
    const [images, setImages] = useState(employee.images);

    useEffect(() => {
        GraphQL.loadTreatments().then((res: {treatments}) => {
            setIsLoadingTreatments(false);
            setTreatments(res.treatments);
        })
    }, []);

    const onCloseModal = () => {
        setIsEditEmployeeOpen(false);
    }

    const handleFileChange = (event) => {
        if (event.target.files?.length) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleMultipleFilesChange = (event) => {
        event.preventDefault();
        if (event.target.files) {
            const filesArray = Array.from(event.target.files);
            setSelectedFiles(filesArray);
        }
    };

    const handleSingeFileUpload = (file: File) => {
        if (file) {
            setIsUploading(true);
            handleFileUpload(file, setImage).then(() => {
                setIsUploading(false);
            });
        }
    }

    const handleMultipleFilesUpload = async () => {
        if (selectedFiles && selectedFiles.length > 0) {
            setIsUploading(true);
            const uploadPromises = selectedFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('image', file);

                const res = await fetch(CDN_API, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.data.url) {
                    return data.data.url;
                } else {
                    ErrorAlert('Błąd', 'Nie udało się przesłać plików');
                }
            });

            Promise.all(uploadPromises)
                .then((uploadedImages) => {
                    console.log('przesłano pliki')
                    setImages([...images, ...uploadedImages]);
                    setIsUploading(false);
                })
                .catch(error => {
                    console.error('Błąd podczas przesyłania plików:', error);
                    setIsUploading(false);
                });

        }
    };

    const addTreatment = (id: string) => {
        if (treatmentsIds.includes(id)) {
            setTreatmentsIds(treatmentsIds.filter(treatmentId => treatmentId !== id));
        } else {
            setTreatmentsIds([...treatmentsIds, id]);
        }
    }

    const handleEdit = () => {
        ConfirmAlert('Jesteś pewna?', 'Czy na pewno chcesz edytować pracownika?', (isConfirmed: boolean) => {
            if (isConfirmed) {
                try {
                    edit(name, surname, description, treatmentsIds, ig, tag, image, images);
                    SuccessAlert('Super!', 'Pomyślnie zedytowano pracownika!');
                    setIsEditEmployeeOpen(false);
                }
                catch {
                    ErrorAlert('Oops...', 'Coś poszło nie tak!');
                }
            }
        })
    }

    return (
        <Modal show={isEditEmployeeOpen} size={'md'} onClose={onCloseModal} popup>
            <Modal.Header/>
            <Modal.Body>
                <div className="space-y-6">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Edytuj pracownika</h3>
                    <div>
                        <Avatar img={image} size={'lg'}/>
                        <div className="mb-2 block mt-2">
                            <Label htmlFor="profile" value="Dodaj lub zmień zdjęcie profilowe"/>
                        </div>
                        <FileInput
                            onChange={handleFileChange}
                            id="profile"
                        />
                        <Button theme={customTheme.button} color={'secondary'} onClick={() => handleSingeFileUpload(selectedFile)} isProcessing={isUploading}>
                            {isUploading ? 'Przesyłanie...' : `Prześlij ${selectedFile ? '1 plik' : '0 plików'}`}
                        </Button>
                    </div>
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
                            placeholder="Link do IG..."
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
                                            <Kbd onClick={() => addTreatment(treatment._id)}
                                                 className={treatmentsIds.includes(treatment._id) ? 'bg-green-400 text-white cursor-pointer' : 'cursor-pointer'}>{treatment.name}</Kbd>
                                        </span>
                                ))}
                            </div>
                        }
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="images" value="Dodaj lub usuń prace"/>
                        </div>
                        <FileInput onChange={handleMultipleFilesChange} multiple/>
                        <Button theme={customTheme.button} color={'secondary'}
                                onClick={handleMultipleFilesUpload} isProcessing={isUploading}>
                            {isUploading ? 'Przesyłanie...' : `Prześlij ${selectedFiles.length} pliki`}
                        </Button>
                    </div>

                    <div className="w-full">
                        <Button isProcessing={isUploading} onClick={handleEdit} theme={customTheme.button} color={'secondary'}>Edytuj
                            pracownika</Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default EditEmployee;
