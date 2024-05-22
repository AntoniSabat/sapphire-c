export interface Comp {
    _id: string;
    name: string;
    date: string;
    place: string;
    employees: string[];
    timeStart: string;
    timeEnd: string;
    breaks: Break[];
    reports: IReport[];
    treatments: CompTreatment[];
}

export interface Break {
    breakStart: string;
    breakLong: string;
}

export interface CompTreatment {
    _id: string;
    treatmentId: string;
    timeStart: string;
    timeEnd: string;
}

export interface IReport {
    _id: string;
    clientName: string;
    clientSurname: string;
    clientEmail: string;
    clientPhoneNumber: string;
    treatmentId: string;
    compTreatmentId: string;
    employeeId: string;
    confirmed: boolean;
}

export interface Treatments {
    compId: string;
    id: string;
    start: number;
    end: string;
    confirmed: boolean;
    employeeId: string;
    clientEmail: string;
    clientName: string;
    clientSurname: string;

    cols: number;
    pos: number;

    hours: string;

    colliders: Treatments[];
    nextColliders: Treatments[];
}
