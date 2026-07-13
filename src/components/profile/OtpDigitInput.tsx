import { PasscodeOtpInput } from "../AccessPasscodeInput";

const OTP_LENGTH = 6;

type OtpDigitInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  autoFocus?: boolean;
  editable?: boolean;
  accessibilityLabel?: string;
};

export function normalizeOtpDigits(text: string): string {
  return text.replace(/\D/g, "").slice(0, OTP_LENGTH);
}

export function OtpDigitInput({
  value,
  onChangeText,
  error,
  autoFocus = false,
  editable = true,
  accessibilityLabel = "Verification code",
}: OtpDigitInputProps) {
  return (
    <PasscodeOtpInput
      variant="otp"
      value={value}
      onChangeText={onChangeText}
      error={error}
      autoFocus={autoFocus}
      editable={editable}
      length={OTP_LENGTH}
      normalize={normalizeOtpDigits}
      mask="*"
      accessibilityLabel={accessibilityLabel}
    />
  );
}
