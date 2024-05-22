export interface Treatment {
    _id: string;
    name: string;
    description: string;
    price: number;
    currency: Currency;
    time: string;
    image: string | null;
    tag: TreatmentTag | null;
}

export enum Currency {
    PLN = "PLN",
    EUR = "EUR",
}

export enum TreatmentTag {
    HAIRSTYLE = "HAIRSTYLE",
    MAKEUP = "MAKEUP",
    MAN = "MAN"
}
