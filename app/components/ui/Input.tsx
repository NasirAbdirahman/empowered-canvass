import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const baseStyles = "w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2";
    const errorStyles = error
      ? "border-error focus:border-error focus:ring-error"
      : "border-gray-300 focus:border-primary-600 focus:ring-primary-500";
    const disabledStyles = props.disabled
      ? "bg-gray-100 cursor-not-allowed"
      : "bg-white";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        {helperText && !error && (
          <p className="mb-2 text-sm text-gray-500">{helperText}</p>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${baseStyles} ${errorStyles} ${disabledStyles} ${className}`.trim()}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
