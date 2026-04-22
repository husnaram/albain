import { NumberInput } from "@mantine/core";

interface RupiahInputProps {
  label?: string;
  value: number | string;
  onChange: (value: number | string) => void;
  required?: boolean;
  error?: React.ReactNode;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}

export function RupiahInput({
  label,
  value,
  onChange,
  required,
  error,
  placeholder,
  description,
  disabled,
}: RupiahInputProps) {
  return (
    <NumberInput
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      error={error}
      placeholder={placeholder ?? "0"}
      description={description}
      disabled={disabled}
      prefix="Rp "
      thousandSeparator="."
      decimalSeparator=","
      min={0}
      allowNegative={false}
      hideControls
      styles={{
        input: {
          fontVariantNumeric: "tabular-nums",
        },
      }}
    />
  );
}
