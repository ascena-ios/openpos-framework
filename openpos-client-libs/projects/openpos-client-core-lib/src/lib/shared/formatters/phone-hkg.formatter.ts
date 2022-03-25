import { IFormatter } from './formatter.interface';

export class PhoneHKGFormatter implements IFormatter {
    private newValueFilter = /^[0-9]{1,11}$/;
    constructor() {
    }

    formatValue(value: string): string {
        if (!value) {
            return '';
        }

        if (value.length <= 3) {
            return `${value.slice(0)}`;
        }

        if (value.length <= 6) {
            return `${value.slice(0, 3)}-${value.slice(3, 7)}`;
        }

        return `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 15)}`;
    }

    unFormatValue(value: string): string {
        const n = value.replace(/\D/g, '');
        return n;
    }

    allowKey(key: string, newValue: string) {
        return this.newValueFilter.test(newValue);
    }
}
