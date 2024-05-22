import {CDN_API} from "./env";
import GrapQL from "./GrapQL";

export const handleFileUpload = async(file: File, setImage: (url: string) => void) => {
    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        fetch(CDN_API, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.data.url) {
                    setImage(data.data.url);
                }
            })
    }
}

export const getEmployeeFullNameAndTreatmentsIds = (id: string) => {
    return new Promise((resolve, reject) => {
        GrapQL.loadEmployeeDetails(id).then((res: { getEmployeeDetails }) => {
            resolve(res.getEmployeeDetails);
        }).catch((error: any) => {
            reject(error);
        });
    });
}

export const getTreatmentName = (id: string) => {
    return new Promise((resolve, reject) => {
        GrapQL.loadTreatmentDetails(id).then((res: { getTreatmentDetails}) => {
            resolve({_id: res.getTreatmentDetails._id, name: res.getTreatmentDetails.name});
        }).catch((error: any) => {
            reject(error);
        })
    })
}

export const countEndTime = (timeStart: string, duration: string) => {
    let [hour, minutes] = timeStart.split(':').map(Number);
    let [longHour, longMinutes] = duration.split(':').map(Number);
    let date = new Date();
    date.setHours(hour);
    date.setMinutes(minutes);
    date.setHours(date.getHours() + longHour);
    date.setMinutes(date.getMinutes() + longMinutes);
    let newHour = date.getHours().toString().padStart(2, '0');
    let newMinutes = date.getMinutes().toString().padStart(2, '0');
    return `${newHour}:${newMinutes}`;
}


