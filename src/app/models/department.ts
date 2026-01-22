export class Department {
    id?: number;        // REQUIRED for edit/delete (don’t pretend otherwise)
    name!: string;
    code!: string
    isActive!: boolean;
    description!: string;

}

