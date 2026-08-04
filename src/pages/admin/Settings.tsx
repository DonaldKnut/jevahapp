import MarketingEmailPrefsCard from "../../components/MarketingEmailPrefsCard";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  fetchAdminConfig,
  patchAdminConfig,
  type PlatformConfig,
} from "../../services/adminApi";
import { ApiError } from "../../lib/api";
import {
  Alert,
  Button,
  Field,
  PageHeader,
  PageEnter,
  SkeletonRows,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";
import {
  Cog6ToothIcon,
  CloudArrowUpIcon,
  UserPlusIcon,
  VideoCameraIcon,
  WrenchScrewdriverIcon,
  ShieldExclamationIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

const defaults: PlatformConfig = {
  uploadsEnabled: true,
  registrationEnabled: true,
  liveStreamingEnabled: true,
  maintenanceMode: false,
  maintenanceMessage: "",
  minAppVersion: { ios: "", android: "" },
};

const FLAG_META = [
  {
    key: "uploadsEnabled" as const,
    label: "Audio Uploads",
    desc: "Allow users to upload new audio content to the platform",
    icon: CloudArrowUpIcon,
    safeColor: "emerald",
    dangerColor: "red",
  },
  {
    key: "registrationEnabled" as const,
    label: "User Registration",
    desc: "Allow new users to create accounts on the platform",
    icon: UserPlusIcon,
    safeColor: "emerald",
    dangerColor: "red",
  },
  {
    key: "liveStreamingEnabled" as const,
    label: "Live Streaming",
    desc: "Allow churches and admins to start live streams",
    icon: VideoCameraIcon,
    safeColor: "emerald",
    dangerColor: "red",
  },
  {
    key: "maintenanceMode" as const,
    label: "Maintenance Mode",
    desc: "Take the platform offline and show a maintenance message to users",
    icon: WrenchScrewdriverIcon,
    safeColor: "gray",
    dangerColor: "amber",
  },
] as const;

function ToggleSwitch({
  checked,
  onChange,
  id,
  danger = false,
}: {
  checked: boolean;
  onChange: () => void;
  id: string;
  danger?: boolean;
}) {
  const trackColor = checked
    ? danger
      ? "bg-amber-500"
      : "bg-jevah-accent"
    : "bg-jevah-border";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-jevah-accent ${trackColor}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      >
        {checked && (
          <CheckIcon className="m-auto h-full w-full p-1 text-jevah-accent" />
        )}
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const { toast } = useFeedback();
  const [config, setConfig] = useState<PlatformConfig>(defaults);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminConfig();
      setConfig({
        ...defaults,
        ...data,
        minAppVersion: { ...defaults.minAppVersion, ...data.minAppVersion },
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load platform config (endpoint may not be live yet)."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const saved = await patchAdminConfig(config);
      setConfig({
        ...defaults,
        ...saved,
        minAppVersion: { ...defaults.minAppVersion, ...saved?.minAppVersion },
      });
      toast.success("Settings saved");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Save failed.";
      setError(msg);
      toast.error("Save failed", msg);
    } finally {
      setBusy(false);
    }
  }

  function toggle(key: keyof PlatformConfig) {
    setConfig((c) => ({ ...c, [key]: !c[key] }));
  }

  if (loading) {
    return (
      <PageEnter>
        <PageHeader
          title="Platform Settings"
          subtitle="Feature flags, maintenance mode, and minimum app versions."
        />
        <SkeletonRows rows={4} />
      </PageEnter>
    );
  }

  return (
    <PageEnter>
      <PageHeader
        title="Platform Settings"
        subtitle="Feature flags, maintenance mode, and your personal email preferences."
        badgeText="Settings"
      />

      <div className="mb-5">
        <MarketingEmailPrefsCard />
      </div>

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      <form onSubmit={(e) => void onSave(e)} className="space-y-6">
        {/* Feature Flags Section */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ShieldExclamationIcon className="h-5 w-5 text-jevah-accent" />
            <h2 className="text-sm font-black uppercase tracking-widest text-jevah-text">
              Feature Flags
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {FLAG_META.map(({ key, label, desc, icon: Icon }) => {
              const isOn = Boolean(config[key]);
              const isDangerFlag = key === "maintenanceMode";
              return (
                <label
                  key={key}
                  htmlFor={`toggle-${key}`}
                  className={`group flex cursor-pointer items-start justify-between gap-4 rounded-3xl border p-5 transition hover:shadow-md ${
                    isOn && isDangerFlag
                      ? "border-amber-500/40 bg-amber-500/10"
                      : isOn
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-jevah-border bg-jevah-surface"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        isOn && isDangerFlag
                          ? "bg-amber-500/20 text-amber-600"
                          : isOn
                          ? "bg-emerald-500/20 text-emerald-600"
                          : "bg-jevah-card text-jevah-text-muted"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-jevah-text">{label}</p>
                      <p className="mt-0.5 text-xs text-jevah-text-muted leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={isOn}
                    onChange={() => toggle(key)}
                    id={`toggle-${key}`}
                    danger={isDangerFlag && isOn}
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Maintenance Message */}
        {config.maintenanceMode && (
          <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <WrenchScrewdriverIcon className="h-5 w-5 text-amber-600" />
              <p className="text-sm font-black text-amber-700 dark:text-amber-300">
                Maintenance Mode Active
              </p>
            </div>
            <Field label="Message shown to users during maintenance">
              <textarea
                rows={3}
                value={config.maintenanceMessage || ""}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, maintenanceMessage: e.target.value }))
                }
                className={inputClass}
                placeholder="We're performing scheduled maintenance. We'll be back shortly!"
              />
            </Field>
          </div>
        )}

        {/* Min App Versions */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <DevicePhoneMobileIcon className="h-5 w-5 text-jevah-accent" />
            <h2 className="text-sm font-black uppercase tracking-widest text-jevah-text">
              Minimum App Versions
            </h2>
          </div>
          <div className="grid gap-4 rounded-3xl border border-jevah-border bg-jevah-surface p-5 sm:grid-cols-2">
            <Field label="iOS Minimum Version">
              <input
                value={config.minAppVersion?.ios || ""}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    minAppVersion: { ...c.minAppVersion, ios: e.target.value },
                  }))
                }
                className={inputClass}
                placeholder="e.g. 1.2.0"
              />
            </Field>
            <Field label="Android Minimum Version">
              <input
                value={config.minAppVersion?.android || ""}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    minAppVersion: {
                      ...c.minAppVersion,
                      android: e.target.value,
                    },
                  }))
                }
                className={inputClass}
                placeholder="e.g. 1.2.0"
              />
            </Field>
            <p className="col-span-full text-xs text-jevah-text-muted">
              Users with older app versions will be prompted to update before accessing the platform.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={busy}
            className="w-full sm:w-auto"
          >
            <Cog6ToothIcon className="h-4 w-4" />
            {busy ? "Saving..." : saved ? "Saved ✓" : "Save Settings"}
          </Button>
          {!loading && (
            <p className="text-xs text-jevah-text-muted">
              Changes apply immediately across the platform.
            </p>
          )}
        </div>
      </form>
    </PageEnter>
  );
}
