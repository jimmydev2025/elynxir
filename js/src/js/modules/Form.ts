// @ts-nocheck
import validate from 'validate.js/validate';
export default class Form {
    setGroupFilled(input: HTMLInputElement, value: any) {
    	let formGroup = input.closest('[data-elements ~= "formGroup"]');

        if(formGroup){
        	if(value){
    			formGroup.classList.add('is-filled');
        	} else {
        		formGroup.classList.remove('is-filled');
        	}
        }
	}

    togglePassVisibility(field: HTMLElement, input: HTMLInputElement){
        if(!field.classList.contains('is-pass-visible')){
            field.classList.add('is-pass-visible');
            input.setAttribute('type', 'text');
        } else {
            field.classList.remove('is-pass-visible');
            input.setAttribute('type', 'password');
        }
    }

    validateInput(input: HTMLInputElement, form: HTMLElement, constraints: any){
        if (!constraints) {
            console.error('Constraints not found');
            return false;
        }

        let errors = validate(form, constraints, {fullMessages: false}) || {};
            this.showErrorsForInput(input, errors[input.name]);
    }

    handleFormSubmit(form: HTMLElement, constraints: any, url: any | null, options?: any) {
        let errors = validate(form, constraints, {fullMessages: false});

        this.showErrors(form, errors || {});

        if (!errors) {
            // this.showSuccess(form);
            this.formSend(form, url, options);
        }
    }

    showErrors(form: HTMLElement, errors: any | null) {
        let inputs = Array.from(form.querySelectorAll<HTMLInputElement>('[data-elements ~= "formValidate"]'));

        inputs.forEach((el: HTMLInputElement) => {
            this.showErrorsForInput(el, errors && errors[el.name]);
        });
    }

    showErrorsForInput(input: HTMLInputElement, errors: any | null) {
        let
            formGroup = input.closest<HTMLElement>('[data-elements="formGroup"]'),
            formMessages: HTMLElement | null;

        if(formGroup && formGroup.querySelector('[data-elements="formMessage"]')){
            formMessages = formGroup.querySelector('[data-elements="formMessage"]');
        }

        this.resetFormGroup(formGroup);

        if (errors) {
            formGroup.classList.add("is-error");

            if(formMessages) {
                errors.forEach((el) => {
                    this.addError(formMessages, el);
                });
            }
        } else {
            formGroup.classList.add("is-success");
        }
    }

    resetFormGroup(formGroup?: HTMLElement) {
        if (!formGroup) {
            return;
        }

        formGroup.classList.remove("is-error");
        formGroup.classList.remove("is-success");
        formGroup.querySelectorAll(".help-block.error").forEach((el) => {
            el.parentNode.removeChild(el);
        });
    }

    addError(messages: any | null, error: any | null) {
        let block = document.createElement("p");

        block.classList.add("help-block");
        block.classList.add("error");
        block.innerText = error;
        messages.appendChild(block);
    }

    toJSONString(form: HTMLElement, additional: any) {
        let obj = {},
            elements = form.querySelectorAll("input, select, textarea");

        for (let i = 0; i < elements.length; ++i ) {
            let element = elements[i],
                name = element.name,
                value = element.value.toLowerCase();

            if (name) {
                if(element.nodeName == 'INPUT' && (element.type == 'radio' || element.type == 'checkbox')){
                    if (element.checked) {
                        obj[name] = value;
                    }
                } else {
                    obj[name] = value;
                }
            }
        }

        return JSON.stringify(Object.assign(obj, additional));
    }

    formSend(form: HTMLElement, url: any | null, options: any = {}) {
        const data = this.toJSONString(form, {origin: options.origin ? options.origin : 'ELYNXIR'});

        fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authentification': '1ac1e97c41f329b873cca3b012c3246aebc7'
            },
            method: options.method ? options.method : 'POST',
            body: data
        })
        .then((r) => {
            let data = r.json();

            if (r.status === 409) {
                data.status = r.status;
            }

            return data;
        })
        .then((r) => {
            if (r.success) {
                document.querySelectorAll('.form__input').forEach((item, i, arr) => {
                    item.value = '';
                });

                this.showSuccess(form, r.message);

                if (options.onSuccess) {
                    options.onSuccess(form, r, data);
                }
            } else {
                if (options.onError) {
                    options.onError(form, r.message);
                } else {
                    this.showErrorMessage(form, r.message)
                }
            }
        })
    }

    formReset(form: HTMLElement){
        let formGroup = form.querySelectorAll('[data-elements="formGroup"]');

        form.reset();

        formGroup.forEach((el) => {
            el.classList.remove('is-filled');
            el.classList.remove('is-success');
            el.classList.remove('is-error');
        })
    }

    showSuccess(form: HTMLElement, message?: any) {
        form.classList.add('is-success');
        form.querySelector('[data-elements="formMessage"').innerHTML = message;

        if (form.id == 'form-partnership-application-online' || form.id == 'form-partnership-application-upload'){
            document.querySelector('[data-elements="popup"][data-popup="popup-success"]').classList.add('is-open');
            overflow.on();
        }
    }

    showErrorMessage(form: HTMLElement, error: any | null, reset: any | null) {
        form.classList.add('is-error');
        form.querySelector('[data-elements="formMessage"').innerHTML = error;

        if (reset) {
            this.formReset(form);

            setTimeout((e) =>{
                form.classList.remove('is-error');
            }, 5000);
        }
    }
}