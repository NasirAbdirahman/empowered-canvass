import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    const baseStyles = "w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 resize-y";
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
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        {helperText && !error && (
          <p className="mb-2 text-sm text-gray-500">{helperText}</p>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
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

Textarea.displayName = "Textarea";
