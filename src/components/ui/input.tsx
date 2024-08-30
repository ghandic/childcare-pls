import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export type CurrencyInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onNumberChange: (value: number) => void;
};

const moneyFormatter = Intl.NumberFormat("en-AU", {
  currency: "AUD",
  style: "currency",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, onNumberChange, ...props }, ref) => {
    const initialValue = props.value
      ? moneyFormatter.format(props.value as unknown as number)
      : "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [value, setValue] = React.useReducer((_: any, next: string) => {
      const digits = next.replace(/\D/g, "");
      return moneyFormatter.format(Number(digits) / 100);
    }, initialValue);

    // alert(value);

    function handleChange(formattedValue: string) {
      setValue(formattedValue);
      const digits = formattedValue.replace(/\D/g, "");
      const realValue = Number(digits) / 100;
      onNumberChange(realValue);
    }
    console.log(value);

    return (
      <Input
        {...props}
        type="text"
        className={className}
        onChange={(e) => {
          handleChange(e.target.value);
        }}
        value={value}
        ref={ref}
      />
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";

export type NumberInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<
      string | number | readonly string[] | undefined
    >(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (/^[0-9]*\.?[0-9]*$/.test(newValue)) {
        setInternalValue(newValue);
        if (onChange) {
          onChange(e);
        }
      }
    };

    const handleBlur = () => {
      if (typeof internalValue === "string" && internalValue) {
        setInternalValue(parseFloat(internalValue).toString());
      }
    };

    return (
      <Input
        type="text"
        className={cn("number-input", className)}
        onChange={handleChange}
        onBlur={handleBlur}
        ref={ref}
        value={internalValue}
        {...props}
      />
    );
  }
);
NumberInput.displayName = "NumberInput";

export { Input, CurrencyInput, NumberInput };
