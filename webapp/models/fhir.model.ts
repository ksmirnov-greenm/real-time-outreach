export class PatientsFhirBundle{
    resourceType: string;
    total: number;
    entry: FhirModel[];
}

export class FhirModel {
    resourceType: string;
    id: string;
    name: NameModel[]
    telecom: TelecomModel[];
    gender: string;
    birthDate: string;
}

export class TelecomModel {
    system: string;
    value: string;
    use: string;
}

export class NameModel {
    use: string;
    family: string;
    given: string[];
}