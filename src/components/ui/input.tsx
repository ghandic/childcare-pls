import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
import CurrencyInputOG, {
  CurrencyInputProps as CurrencyInputPropsOG,
} from "react-currency-input-field";

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

export type CurrencyInputProps = CurrencyInputPropsOG;

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, type, value, onValueChange }, ref) => {
    const [internalValue, setInternalValue] = React.useState<
      string | number | readonly string[] | undefined
    >(value);

    const handleChange = (value: string | undefined) => {
      if (/^[0-9]*\.?[0-9]*$/.test(value ?? "")) {
        setInternalValue(value);
        if (onValueChange) {
          onValueChange(value);
        }
      }
    };

    const handleBlur = () => {
      if (typeof internalValue === "string" && internalValue) {
        setInternalValue(parseFloat(internalValue).toString());
      }
    };

    return (
      <CurrencyInputOG
        type={type}
        prefix="$"
        decimalsLimit={2}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onValueChange={handleChange}
        value={internalValue}
        onBlur={handleBlur}
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
