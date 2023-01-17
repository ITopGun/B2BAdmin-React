import * as React from 'react';
import { fireEvent, screen, render, waitFor } from '@testing-library/react';
import { useFormState, useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import assert from 'assert';

import { CoreAdminContext } from '../core';
import { Form } from './Form';
import { useNotificationContext } from '../notification';
import { useInput } from './useInput';
import { required } from './validate';
import { SanitizeEmptyValues } from './Form.stories';
import { NullValue } from './Form.stories';

describe('Form', () => {
    const Input = props => {
        const { field, fieldState } = useInput(props);
        return (
            <>
                <input
                    aria-label="name"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    {...field}
                />
                <p>{fieldState.error?.message}</p>
            </>
        );
    };

    const IsDirty = () => {
        const state = useFormState();

        return <p>isDirty: {state.isDirty.toString()}</p>;
    };

    it('Does not make the form dirty when reinitialized from a record', () => {
        const { rerender } = render(
            <CoreAdminContext>
                <Form onSubmit={jest.fn()}>
                    <Input source="name" defaultValue="Bar" />
                    <IsDirty />
                </Form>
            </CoreAdminContext>
        );

        expect(screen.getByDisplayValue('Bar')).not.toBeNull();
        expect(screen.getByText('isDirty: false')).not.toBeNull();

        rerender(
            <CoreAdminContext>
                <Form onSubmit={jest.fn()} record={{ id: 1, name: 'Foo' }}>
                    <Input source="name" defaultValue="Bar" />
                    <IsDirty />
                </Form>
            </CoreAdminContext>
        );

        expect(screen.getByDisplayValue('Foo')).not.toBeNull();
        expect(screen.getByText('isDirty: false')).not.toBeNull();
    });

    it('Does not make the form dirty when initialized from a record with a missing field and this field has an defaultValue', () => {
        render(
            <CoreAdminContext>
                <Form onSubmit={jest.fn()} record={{ id: 1 }}>
                    <Input source="name" defaultValue="Bar" />
                    <IsDirty />
                </Form>
            </CoreAdminContext>
        );

        expect(screen.getByDisplayValue('Bar')).not.toBeNull();
        expect(screen.getByText('isDirty: false')).not.toBeNull();
    });

    it('Does not make the form dirty when reinitialized from a different record', () => {
        const { rerender } = render(
            <CoreAdminContext>
                <Form onSubmit={jest.fn()} record={{ id: 1, name: 'Foo' }}>
                    <Input source="name" defaultValue="Bar" />
                    <IsDirty />
                </Form>
            </CoreAdminContext>
        );

        expect(screen.getByDisplayValue('Foo')).not.toBeNull();
        expect(screen.getByText('isDirty: false')).not.toBeNull();

        rerender(
            <CoreAdminContext>
                <Form
                    onSubmit={jest.fn()}
                    record={{
                        id: 1,
                        name: 'Foo',
                        anotherServerAddedProp: 'Bar',
                    }}
                >
                    <Input source="name" defaultValue="Bar" />
                    <IsDirty />
                </Form>
            </CoreAdminContext>
        );

        expect(screen.getByDisplayValue('Foo')).not.toBeNull();
        expect(screen.getByText('isDirty: false')).not.toBeNull();
    });

    it('should update Form state on submit', async () => {
        let globalFormState;

        const CustomInput = props => {
            globalFormState = useFormContext();

            return <Input {...props} />;
        };
        render(
            <CoreAdminContext>
                <Form onSubmit={jest.fn()}>
                    <CustomInput source="name" validate={required()} />
                    <button type="submit">Submit</button>
                </Form>
            </CoreAdminContext>
        );

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            assert.equal(globalFormState.formState.isSubmitting, true);
        });
    });

    it('Displays a notification on submit when invalid', async () => {
        const Notification = () => {
            const { notifications } = useNotificationContext();
            return notifications.length > 0 ? (
                <div>{notifications[0].message}</div>
            ) : null;
        };

        render(
            <CoreAdminContext>
                <>
                    <Form onSubmit={jest.fn()}>
                        <Input source="name" validate={required()} />
                        <button type="submit">Submit</button>
                    </Form>
                    <Notification />
                </>
            </CoreAdminContext>
        );

        fireEvent.click(screen.getByText('Submit'));
        await waitFor(() => {
            screen.getByText('ra.message.invalid_form');
        });
    });

    it('Displays submission errors', async () => {
        const Notification = () => {
            const { notifications } = useNotificationContext();
            return notifications.length > 0 ? (
                <div>{notifications[0].message}</div>
            ) : null;
        };

        const onSubmit = jest.fn(() =>
            Promise.resolve({
                name: 'This name is already taken',
            })
        );

        render(
            <CoreAdminContext>
                <>
                    <Form onSubmit={onSubmit}>
                        <Input source="name" />
                        <button type="submit">Submit</button>
                    </Form>
                    <Notification />
                </>
            </CoreAdminContext>
        );

        fireEvent.click(screen.getByText('Submit'));
        await waitFor(() => {
            screen.getByText('This name is already taken');
        });
    });

    it('should set null or undefined values to null', async () => {
        const onSubmit = jest.fn();
        render(
            <CoreAdminContext>
                <Form onSubmit={onSubmit}>
                    <Input
                        source="foo"
                        parse={() => null}
                        format={() => '23'}
                    />
                    <button type="submit">Submit</button>
                </Form>
            </CoreAdminContext>
        );

        fireEvent.change(screen.getByLabelText('name'), {
            target: { value: '' },
        });
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                { foo: null },
                expect.anything()
            );
        });
    });

    it('should set null or undefined deep values to null', async () => {
        const onSubmit = jest.fn();
        render(
            <CoreAdminContext>
                <Form onSubmit={onSubmit}>
                    <Input
                        source="foo.bar"
                        parse={() => null}
                        format={() => '23'}
                    />
                    <button type="submit">Submit</button>
                </Form>
            </CoreAdminContext>
        );

        fireEvent.change(screen.getByLabelText('name'), {
            target: { value: '' },
        });
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                { foo: { bar: null } },
                expect.anything()
            );
        });
    });

    it('should accept string values', async () => {
        const str = 'hello';
        const onSubmit = jest.fn();
        render(
            <CoreAdminContext>
                <Form onSubmit={onSubmit}>
                    <Input source="foo" parse={() => str} format={() => str} />
                    <button type="submit">Submit</button>
                </Form>
            </CoreAdminContext>
        );

        fireEvent.change(screen.getByLabelText('name'), {
            target: { value: '' },
        });
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                { foo: str },
                expect.anything()
            );
        });
    });
    it('should accept date values', async () => {
        const date = new Date();

        const onSubmit = jest.fn();
        render(
            <CoreAdminContext>
                <Form onSubmit={onSubmit}>
                    <Input
                        source="foo"
                        parse={() => date}
                        format={() => 'date'}
                    />
                    <button type="submit">Submit</button>
                </Form>
            </CoreAdminContext>
        );

        fireEvent.change(screen.getByLabelText('name'), {
            target: { value: '' },
        });
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                { foo: date },
                expect.anything()
            );
        });
    });

    it('should accept array values', async () => {
        const arr = [1, 2, 3];

        const onSubmit = jest.fn();
        render(
            <CoreAdminContext>
                <Form onSubmit={onSubmit}>
                    <Input
                        source="foo"
                        parse={() => arr}
                        format={() => 'arr'}
                    />
                    <button type="submit">Submit</button>
                </Form>
            </CoreAdminContext>
        );

        fireEvent.change(screen.getByLabelText('name'), {
            target: { value: '' },
        });
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                { foo: arr },
                expect.anything()
            );
        });
    });

    it('should accept object values', async () => {
        const obj = { foo: 1 };

        const onSubmit = jest.fn();
        render(
            <CoreAdminContext>
                <Form onSubmit={onSubmit}>
                    <Input
                        source="foo"
                        parse={() => obj}
                        format={() => 'obj'}
                    />
                    <button type="submit">Submit</button>
                </Form>
            </CoreAdminContext>
        );

        fireEvent.change(screen.getByLabelText('name'), {
            target: { value: '' },
        });
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                { foo: obj },
                expect.anything()
            );
        });
    });
    it('should accept deep object values', async () => {
        const obj = { foo: { bar: 1 } };

        const onSubmit = jest.fn();
        render(
            <CoreAdminContext>
                <Form onSubmit={onSubmit}>
                    <Input
                        source="foo"
                        parse={() => obj}
                        format={() => 'obj'}
                    />
                    <button type="submit">Submit</button>
                </Form>
            </CoreAdminContext>
        );

        fireEvent.change(screen.getByLabelText('name'), {
            target: { value: '' },
        });
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                { foo: obj },
                expect.anything()
            );
        });
    });
    it('should accept object values in arrays', async () => {
        const obj = [{ foo: 1 }, { foo: 2 }];

        const onSubmit = jest.fn();
        render(
            <CoreAdminContext>
                <Form onSubmit={onSubmit}>
                    <Input
                        source="foo"
                        parse={() => obj}
                        format={() => 'obj'}
                    />
                    <button type="submit">Submit</button>
                </Form>
            </CoreAdminContext>
        );

        fireEvent.change(screen.getByLabelText('name'), {
            target: { value: '' },
        });
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                { foo: obj },
                expect.anything()
            );
        });
    });
    it('should accept adding objects in arrays', async () => {
        const obj = [{ foo: 1, foo2: 2 }, { foo: 3 }, { foo: 4 }];

        const onSubmit = jest.fn();
        render(
            <CoreAdminContext>
                <Form
                    defaultValues={{ foo: [{ foo: 1 }, { foo: 4 }] }}
                    onSubmit={onSubmit}
                >
                    <Input
                        source="foo"
                        parse={() => obj}
                        format={() => 'obj'}
                    />
                    <button type="submit">Submit</button>
                </Form>
            </CoreAdminContext>
        );

        fireEvent.change(screen.getByLabelText('name'), {
            target: { value: '' },
        });
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                { foo: obj },
                expect.anything()
            );
        });
    });
    it('should accept removing objects in array of objects', async () => {
        const obj = [{ foo: 1 }, { foo: 4 }];

        const onSubmit = jest.fn();
        render(
            <CoreAdminContext>
                <Form
                    defaultValues={{
                        foo: [{ foo: 1, foo2: 2 }, { foo: 3 }, { foo: 4 }],
                    }}
                    onSubmit={onSubmit}
                >
                    <Input
                        source="foo"
                        parse={() => obj}
                        format={() => 'obj'}
                    />
                    <button type="submit">Submit</button>
                </Form>
            </CoreAdminContext>
        );

        fireEvent.change(screen.getByLabelText('name'), {
            target: { value: '' },
        });
        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                { foo: obj },
                expect.anything()
            );
        });
    });
    describe('defaultValues', () => {
        it('should use defaultValues when the record has no value for the field', () => {
            render(
                <CoreAdminContext>
                    <Form defaultValues={{ foo: 'bar' }} record={{ id: 1 }}>
                        <Input source="foo" />
                    </Form>
                </CoreAdminContext>
            );
            expect(
                (screen.getByLabelText('name') as HTMLInputElement).value
            ).toBe('bar');
        });
        it('should not use defaultValues when the record has a value for the field', () => {
            render(
                <CoreAdminContext>
                    <Form
                        defaultValues={{ foo: 'bar' }}
                        record={{ id: 1, foo: 'hello' }}
                    >
                        <Input source="foo" />
                    </Form>
                </CoreAdminContext>
            );
            expect(
                (screen.getByLabelText('name') as HTMLInputElement).value
            ).toBe('hello');
        });
        it('should accept a function as defaultValues', () => {
            render(
                <CoreAdminContext>
                    <Form
                        defaultValues={() => ({ foo: 'bar' })}
                        record={{ id: 1 }}
                    >
                        <Input source="foo" />
                    </Form>
                </CoreAdminContext>
            );
            expect(
                (screen.getByLabelText('name') as HTMLInputElement).value
            ).toBe('bar');
        });
        it("should not ignore defaultValues when it's not of the same type", async () => {
            const defaultValues = { foo: 'foobar' };
            const values = { foo: { hello: 'world' } };

            const onSubmit = jest.fn();
            render(
                <CoreAdminContext>
                    <Form defaultValues={defaultValues} onSubmit={onSubmit}>
                        <Input
                            source="foo"
                            parse={() => values.foo}
                            format={() => 'obj'}
                        />
                        <button type="submit">Submit</button>
                    </Form>
                </CoreAdminContext>
            );

            fireEvent.change(screen.getByLabelText('name'), {
                target: { value: '' },
            });
            fireEvent.click(screen.getByText('Submit'));

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    values,
                    expect.anything()
                );
            });
        });
    });

    describe('sanitizeEmtpyValues', () => {
        it('should remove empty values from the record', async () => {
            render(<SanitizeEmptyValues />);
            fireEvent.change(screen.getByLabelText('field1'), {
                target: { value: '' },
            });
            fireEvent.change(screen.getByLabelText('field2'), {
                target: { value: '' },
            });
            fireEvent.change(screen.getByLabelText('field4'), {
                target: { value: 'hello' },
            });
            fireEvent.change(screen.getByLabelText('field4'), {
                target: { value: '' },
            });
            fireEvent.change(screen.getByLabelText('field11'), {
                target: { value: '' },
            });
            fireEvent.change(screen.getByLabelText('field12'), {
                target: { value: '' },
            });
            fireEvent.change(screen.getByLabelText('field14'), {
                target: { value: 'hello' },
            });
            fireEvent.change(screen.getByLabelText('field14'), {
                target: { value: '' },
            });
            fireEvent.click(screen.getByText('Submit'));
            await waitFor(() =>
                expect(screen.getByTestId('result')?.textContent).toEqual(
                    '{\n  "id": 1,\n  "field1": null,\n  "field6": null,\n  "field11": null,\n  "field16": null\n}'
                )
            );
        });
    });

    it('should accept react-hook-form resolvers', async () => {
        const onSubmit = jest.fn();
        const schema = yup
            .object({
                title: yup.string().required(),
                number: yup.number().positive().integer().required(),
            })
            .required();

        render(
            <CoreAdminContext>
                <Form onSubmit={onSubmit} resolver={yupResolver(schema)}>
                    <Input source="title" />
                    <Input
                        source="number"
                        aria-label="Number"
                        defaultValue={-10}
                    />
                    <button type="submit">Submit</button>
                </Form>
            </CoreAdminContext>
        );

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            screen.getByText('title is a required field');
        });
        screen.getByText('number must be a positive number');
    });

    it('should convert null values to empty strings', () => {
        jest.spyOn(console, 'error').mockImplementation(message => {
            // not very robust but there are other React warnings due to act()
            // so we must check the exact message
            if (
                message ===
                'Warning: `value` prop on `%s` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.%s'
            ) {
                fail(message);
            }
        });
        render(<NullValue />);
        // no assertion needed: if there is a console error, the test fails
    });
});
