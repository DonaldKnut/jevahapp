import { passwordStrength } from "../../../lib/passwordPolicy";

const COLORS = ["", "bg-red-400", "bg-amber-400", "bg-emerald-500"];

export default function PasswordStrength({ password }: { password: string }) {
  const { score, label } = passwordStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-1 flex-1 rounded-full ${
              score >= n ? COLORS[score] : "bg-jevah-border"
            }`}
          />
        ))}
      </div>
      {label ? (
        <p
          className={`mt-1.5 text-[11px] font-semibold ${
            score === 1
              ? "text-red-500"
              : score === 3
                ? "text-emerald-600"
                : "text-jevah-text-muted"
          }`}
        >
          {label}
        </p>
      ) : null}
    </div>
  );
}
