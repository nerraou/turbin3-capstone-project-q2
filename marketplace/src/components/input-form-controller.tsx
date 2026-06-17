import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input, type InputProps } from "./ui/input";

interface InputFormControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> extends Omit<
  ControllerProps<TFieldValues, TName, TTransformedValues>,
  "render"
> {
  label: string;
  inputProps?: InputProps;
}

export default function InputFormController<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(props: InputFormControllerProps<TFieldValues, TName, TTransformedValues>) {
  const { label, inputProps, ...controllerProps } = props;

  return (
    <FieldGroup>
      <Controller
        {...controllerProps}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={inputProps?.id}>{label}</FieldLabel>
            <Input
              aria-invalid={fieldState.invalid}
              {...field}
              value={field.value ?? ""}
              {...inputProps}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
