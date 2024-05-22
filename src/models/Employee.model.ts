export interface Employee {
    _id: string;
    name: string;
    surname: string;
    description: string;
    treatmentsIds: string[];
    ig: string| null;
    image: string | null;
    images: string[];
    tag: EmployeeTag;
}

export enum EmployeeTag {
    TOP = "TOP",
    STYLIST = "STYLIST",
    JUNIOR = "JUNIOR",
    MAN = "MAN"
}
