import { ChangeEvent, ComponentType } from "react";
import { LucideProps } from "lucide-react";

type InputAction = {
  label: string;
  icon: ComponentType<LucideProps>;
  onClick: () => void;
};

type FormInputProps = {
  id: string;
  label: string;
  icon: ComponentType<LucideProps>;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  action?: InputAction;
};

export function FormInput({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  autoComplete,
  action
}: FormInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  const ActionIcon = action?.icon;

  return (
    <div className="input-group">
      <label htmlFor={id}>
        <Icon size={20} strokeWidth={2.1} aria-hidden="true" />
        <span>{label}</span>
      </label>
      <div className="input-shell">
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          autoComplete={autoComplete}
        />
        {action && ActionIcon ? (
          <button
            className="input-icon-button"
            type="button"
            aria-label={action.label}
            title={action.label}
            onClick={action.onClick}
            onMouseDown={(e) => e.preventDefault()} // ป้องกัน input เสีย focus เวลาคลิกปุ่ม action
          >
            <ActionIcon size={20} strokeWidth={2.1} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}