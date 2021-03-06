import { EventEmitter, ElementRef } from '@angular/core';
import { getValue, setValue, isNullOrUndefined, isObject } from '@syncfusion/ej2-base';
import { ControlValueAccessor } from '@angular/forms';
/**
 * Angular Form Base Module
 */
export class FormBase<T> implements ControlValueAccessor {
    public value: T;
    public checked: boolean;
    private skipFromEvent: boolean;

    public propagateChange(_: T): void { return; }
    public propagateTouch(): void { return; }
    public enabled: Object;
    public angularValue: T;
    public objCheck: Boolean;
    public duplicateValue: string;
    public duplicateAngularValue: string;

    public element: HTMLElement;
    public inputElement: HTMLInputElement;
    private ngEle: ElementRef;
    public appendTo: (ele: string | HTMLElement) => void;

    public focus: EventEmitter<Object>;
    public blur: EventEmitter<Object>;
    public preventChange: boolean;

    public localChange(e: { value?: T, checked?: T }): void {
        let value: T = (e.checked === undefined ? e.value : e.checked);
        this.objCheck = isObject(value);
        if (this.objCheck === true) {
            this.duplicateValue = JSON.stringify(value);
            this.duplicateAngularValue = JSON.stringify(this.angularValue);
            if (this.duplicateValue !== this.duplicateAngularValue && this.propagateChange !== undefined && value !== undefined) {
                // Update angular from our control
                this.propagateChange(value);
                this.angularValue = value;
            }
        } else {
            if (value !== this.angularValue && this.propagateChange !== undefined && value !== undefined) {
                // Update angular from our control
                this.propagateChange(value);
                this.angularValue = value;
            }
        }
    }

    public properties: Object;
    public saveChanges: Function;


    public registerOnChange(registerFunction: (_: T) => void): void {
        this.propagateChange = registerFunction;
    }

    public registerOnTouched(registerFunction: () => void): void {
        this.propagateTouch = registerFunction;
    }
    public twoWaySetter(newVal: Object, prop: string): void {
        let oldVal: Object = getValue(prop, this.properties);
        let ele: HTMLElement = this.inputElement || this.element;
        if (oldVal === newVal &&
            ((<HTMLInputElement>ele).value === undefined || (<HTMLInputElement>ele).value === '')) {
            return;
        }
        this.saveChanges(prop, newVal, oldVal);
        setValue(prop, (isNullOrUndefined(newVal) ? null : newVal), this.properties);
        getValue(prop + 'Change', this).emit(newVal);
    }
    public ngAfterViewInit(): void {
        // Used setTimeout for template binding
        // Refer Link: https://github.com/angular/angular/issues/6005
        setTimeout(() => {
            /* istanbul ignore else */
            if (typeof window !== 'undefined') {
                this.appendTo(this.element);
                let ele: HTMLElement = this.inputElement || this.element;
                ele.addEventListener('focus', this.ngOnFocus.bind(this));
                ele.addEventListener('blur', this.ngOnBlur.bind(this));
            }
        });
    }
    public setDisabledState(disabled: boolean): void {
        this.enabled = !disabled;
    }

    public writeValue(value: T): void {
        //update control value from angular
        if (this.checked === undefined) {
            this.value = value;
        } else {
            if (typeof value === 'boolean') {
                this.checked = value;
            } else {
                this.checked = value === this.value;
            }
        }
        if (value === null) {
            return;
        }
        this.angularValue = value;
        // When binding Html textbox value to syncfusion textbox, change event triggered dynamically.
        // To prevent change event, trigger change in component side based on `preventChange` value
        this.preventChange = true;
    }

    public ngOnFocus(e: Event): void {
        /* istanbul ignore else */
        if (this.skipFromEvent !== true) {
            this.focus.emit(e);
        }
    }

    public ngOnBlur(e: Event): void {
        this.propagateTouch();
        /* istanbul ignore else */
        if (this.skipFromEvent !== true) {
            this.blur.emit(e);
        }
    }
}