import {useEffect, useState} from "react";
import {CDN_API} from "../../Utils/env.ts";
import GrapQL from "../../Utils/GrapQL.ts";
import {Gallery} from "../../models/Gallery.model.ts";
import {IoClose} from "react-icons/io5";
import {ConfirmAlert, ErrorAlert, SuccessAlert} from "../../Utils/alerts.ts";
import Menu from "../../components/utils/Menu.tsx";
import Footer1 from "../../components/utils/Footer1.tsx";
import "../../index.scss";
import "./GalleryPage.scss";
import {Button, FileInput, FloatingLabel, Label, Spinner} from "flowbite-react";
import {customTheme} from "../../Utils/theme.ts";

const GalleryPage = () => {
    const [admin, setAdmin] = useState(false);

    const [galleries, setGalleries] = useState([]);
    const [loadingGalleries, setLoadingGalleries] = useState(true);

    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [images, setImages] = useState([]);
    const [name, setName] = useState('');
    const [newName, setNewName] = useState('');
    const [selectedGallery, setSelectedGallery] = useState<string | null>(null);

    useEffect(() => {
        setAdmin(localStorage.getItem('admin') === 'true');
    }, []);

    useEffect(() => {
        GrapQL.loadGalleries().then((res: {galleries}) => {
            setGalleries(res.galleries);
            setLoadingGalleries(false);
        })
    }, [loadingGalleries]);

    const handleCreate = () => {
        if (!name) {
            ErrorAlert('Błąd', 'Nazwa nie może być pusta!');
            return;
        }

        setLoadingGalleries(true)
        GrapQL.createGallery(name, images).then(() => {
            setLoadingGalleries(false);
            setSelectedGallery(null);
            SuccessAlert('Brawo!', 'Pomyślnie dodano usługę!');
        })
    }

    const handleEdit = () => {
        ConfirmAlert('Jesteś pewna?', 'Czy na pewno chcesz edytować tą sekcje?', (isConfirmed: boolean) => {
            if (isConfirmed) {
                try {
                    if (!newName) {
                        ErrorAlert('Błąd', 'Nazwa nie może być pusta!');
                        return;
                    }

                    setLoadingGalleries(true)
                    GrapQL.editGallery(selectedGallery, newName, images).then(() => {
                        setLoadingGalleries(false);
                        setSelectedGallery(null);
                        setNewName('');
                        setImages([]);
                        SuccessAlert('Brawo!', 'Pomyślnie edytowano sekcje!');
                    })
                }
                catch {
                    ErrorAlert('Błąd', 'Nie udało się edytować sekcji');
                }
            }
        })
    }

    const handleMultipleFilesChange = (event) => {
        event.preventDefault()
        if (event.target.files) {
            const filesArray = Array.from(event.target.files);
            setSelectedFiles(filesArray);
        }
    };

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
                    throw new Error('Nie udało się przesłać pliku');
                }
            });

            Promise.all(uploadPromises)
                .then((uploadedImages) => {
                    SuccessAlert('Super!', 'Pomyślnie przesłano pliki!');
                    setImages([...images, ...uploadedImages]);
                    setIsUploading(false);
                })
                .catch(() => {
                    ErrorAlert('Błąd', 'Nie udało się przesłać plików');
                    setIsUploading(false);
                });

        }
    };

    const removeGallery = (id: string) => {
        ConfirmAlert('Jesteś pewna?', 'Usunięcie sekcji jest nieodwracalne?', (isConfirmed: boolean) => {
            if (isConfirmed) {
                setLoadingGalleries(true);
                GrapQL.removeGallery(id).then(() => {
                    setLoadingGalleries(false);
                }).then(() => {
                    SuccessAlert('Super!', 'Pomyślnie usunięto sekcje!');
                })
            }
        })
    }

    const handleSelectGallery = (gallery: Gallery) => {
        setSelectedGallery(gallery._id);
        setNewName(gallery.name);
        setImages(gallery.images);
    }

    return (
        <div className={'relative h-min pb-5'}>
            <Menu/>
            {loadingGalleries
                ? <div className={'h-[100vh] w-full'}>
                    <Spinner className={'absolute top-1/2 left-1/2'} size={'xl'}/>
                </div>
                : <div>
                        { admin &&
                            <div className={'mt-10'}>
                                <div className={'container mx-auto'}>
                                    <p className="text-center text-md mt-2 text-gray-500 mb-1">Tutaj mozesz dodać nową sekcję</p>

                                    <FloatingLabel variant={"filled"} label={"Nazwa sekcji..."} value={name}
                                                   onChange={(e) => setName(e.target.value)} type="text"/>

                                    <Label
                                        htmlFor="dropzone-file"
                                        className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                                    >
                                        <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                            <svg
                                                className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 20 16"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                                />
                                            </svg>
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="font-semibold">Wybierz pliki</span>
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF
                                                (MAX. 800x400px)</p>
                                        </div>
                                        <FileInput onChange={handleMultipleFilesChange} multiple id="dropzone-file"
                                                   className="hidden"/>
                                    </Label>

                                    <Button theme={customTheme.button} color={'secondary'}
                                            onClick={handleMultipleFilesUpload} isProcessing={isUploading}>
                                        {isUploading ? 'Przesyłanie...' : `Prześlij ${selectedFiles.length} pliki`}
                                    </Button>
                                </div>

                                <Button theme={customTheme.button} color={'secondary'} className={'mx-auto'} disabled={isUploading} onClick={handleCreate}>Dodaj sekcję</Button>
                            </div>
                        }

                        <h1 className="text-center text-3xl font-bold mt-10">Sprawdź naszą galerię</h1>
                        <p className="text-center text-md mt-2">Wrzucamy tutaj efekty naszej pracy</p>

                        <br/><br/>
                        <div className={'relative mb-32'}>
                            {galleries.map((gallery: Gallery, index: number) => {
                                if (selectedGallery === gallery._id) {
                                    return (
                                        <div key={index}>
                                            <div className={'container mx-auto'}>
                                                <Button onClick={() => setSelectedGallery('')} theme={customTheme.button} color={'secondary'} className={'mb-5'}>Zamknij</Button>
                                                <FloatingLabel variant={"filled"} label={"Nazwa sekcji..."} value={newName} onChange={(e) => setNewName(e.target.value)} type="text"/>
                                            </div>

                                            <div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto w-[80%]">
                                                    {images.map((image: string, index: number) => (
                                                        <div key={index} className={'relative galerySpan'}>
                                                            <img loading={"lazy"} src={image} alt={image}
                                                                 className={'galleryImage w-[100%]'}/>
                                                            <button onClick={() => setImages(images.filter(i => i !== image))}>
                                                                <IoClose className={'absolute top-0 right-0'} size={30} color={'crimson'}/>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                <p className="text-center text-md mt-5 text-gray-500 mb-1">Tutaj mozesz dodać nowe prace</p>

                                                <div className="container mx-auto">
                                                    <FileInput onChange={handleMultipleFilesChange} multiple/>

                                                    <Button theme={customTheme.button} color={'secondary'} onClick={handleMultipleFilesUpload} disabled={isUploading}>
                                                        {isUploading ? 'Przesyłanie...' : `Prześlij ${selectedFiles.length} pliki`}
                                                    </Button>
                                                </div>
                                            </div>
                                            <br/>
                                            <Button theme={customTheme.button} color={'secondary'} className={'mx-auto'} disabled={isUploading} onClick={handleEdit}>Zapisz zmiany</Button>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div key={gallery._id} className={'mt-[-20px]'}>

                                            <div className={'flex items-center justify-center gap-5 mt-12 pb-2 gallerySection'}>
                                                <h2 className="text-center text-lg">{gallery.name}</h2>
                                                {admin &&
                                                    <div className={'flex gap-1'}>
                                                        <Button theme={customTheme.button} color={'secondary'} onClick={() => handleSelectGallery(gallery)}>Edytuj tą sekcję</Button>
                                                        <Button theme={customTheme.button} color={'failure'} onClick={() => removeGallery(gallery._id)}>Usuń tą sekcję</Button>
                                                    </div>
                                                }
                                            </div>

                                            <div
                                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mx-auto w-[80%]">
                                                {gallery.images.map((image: string, index: number) => (
                                                    <span className={'galerySpan'} key={index}>
                                                        <img loading={"lazy"} key={index} src={image} alt={image} className={'galleryImage w-[100%]'}/>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                }
                            })}
                        </div>
                </div>
            }

            <Footer1/>
        </div>
    );
};

export default GalleryPage;
