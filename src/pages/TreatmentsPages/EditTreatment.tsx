import {useState} from "react";
import {Currency, TreatmentTag} from "../../models/Treatment.model.ts";
import {handleFileUpload} from "../../Utils/helpers.ts";
import {ConfirmAlert, ErrorAlert, SuccessAlert} from "../../Utils/alerts.ts";
import {Avatar, Button, FileInput, Label, Modal, Select, TextInput} from "flowbite-react";
import {customTheme} from "../../Utils/theme.ts";

const EditTreatment = ({treatment, edit, isEditTreatmentOpen, setIsEditTreatmentOpen}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const [name, setName] = useState(treatment.name);
    const [description, setDescription] = useState(treatment.description);
    const [currency, setCurrency] = useState<Currency>(treatment.currency);
    const [price, setPrice] = useState(treatment.price);
    const [time, setTime] = useState(treatment.time);
    const [image, setImage] = useState(treatment.image);
    const [tag, setTag] = useState<TreatmentTag>(treatment.tag);

    const handleFileChange = (event) => {
        if (event.target.files?.length) {
            setSelectedFile(event.target.files[0]);
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

    const handleEdit = (e: any) => {
        e.preventDefault();

        ConfirmAlert('Jesteś pewna?', 'Czy na pewno chcesz edytować usługę?', (isConfirmed: boolean) => {
            if (isConfirmed) {
                try {
                    edit(name, description, currency, price, time, image, tag);
                    SuccessAlert('Super!', 'Pomyślnie zedytowano usługę!');
                    setIsEditTreatmentOpen(false);
                }
                catch {
                    ErrorAlert('Oops...', 'Coś poszło nie tak!');
                }
            }
        });
    }

    return (
        <Modal show={isEditTreatmentOpen} size={'md'} onClose={() => setIsEditTreatmentOpen(false)} popup>
            <Modal.Header/>
            <Modal.Body>
                <div className="space-y-6">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Edytuj usługę</h3>
                    <div>
                        <Avatar img={image} size={'lg'}/>
                        <div className="mb-2 block mt-2">
                            <Label htmlFor="profile" value="Dodaj lub zmień zdjęcie profilowe"/>
                        </div>
                        <FileInput
                            onChange={handleFileChange}
                            id="profile"
                        />
                        <Button theme={customTheme.button} color={'secondary'}
                                onClick={() => handleSingeFileUpload(selectedFile)} disabled={isUploading}>
                            {isUploading ? 'Przesyłanie...' : `Prześlij ${selectedFile ? '1 plik' : '0 plików'}`}
                        </Button>
                    </div>
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
                            <option value={TreatmentTag.MAN}>JUNIOR</option>
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
                        <Button isProcessing={isUploading} onClick={handleEdit} theme={customTheme.button} color={'secondary'}>Edytuj
                            usługę</Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default EditTreatment;
