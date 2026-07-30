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
  Panel,
  SkeletonRows,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";

const defaults: PlatformConfig = {
  uploadsEnabled: true,
  registrationEnabled: true,
  liveStreamingEnabled: true,
  maintenanceMode: false,
  maintenanceMessage: "",
  minAppVersion: { ios: "", android: "" },
};

export default function SettingsPage() {
  const { toast } = useFeedback();
  const [config, setConfig] = useState<PlatformConfig>(defaults);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminConfig();
      setConfig({ ...defaults, ...data, minAppVersion: { ...defaults.minAppVersion, ...data.minAppVersion } });
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
      setConfig({ ...defaults, ...saved, minAppVersion: { ...defaults.minAppVersion, ...saved?.minAppVersion } });
      toast.success("Settings saved");
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
      <div className="space-y-5">
        <PageHeader title="Settings" subtitle="Platform kill switches and maintenance." />
        <SkeletonRows rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        subtitle="Feature flags, maintenance mode, and minimum app versions."
      />

      {error && (
        <Alert tone="error" onRetry={() => void load()}>
          {error}
        </Alert>
      )}

      <form onSubmit={(e) => void onSave(e)} className="space-y-4">
        <Panel>
          <p className="mb-4 text-sm font-semibold text-[#0B1A1F]">Feature flags</p>
          <div className="space-y-3">
            {(
              [
                ["uploadsEnabled", "Uploads enabled"],
                ["registrationEnabled", "Registration enabled"],
                ["liveStreamingEnabled", "Live streaming enabled"],
                ["maintenanceMode", "Maintenance mode"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
              >
                <span className="text-sm text-slate-700">{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(config[key])}
                  onChange={() => toggle(key)}
                  className="h-4 w-4 rounded border-slate-300 text-[#256E63] focus:ring-[#256E63]"
                />
              </label>
            ))}
          </div>
        </Panel>

        <Panel>
          <Field label="Maintenance message">
            <textarea
              rows={3}
              value={config.maintenanceMessage || ""}
              onChange={(e) =>
                setConfig((c) => ({ ...c, maintenanceMessage: e.target.value }))
              }
              className={inputClass}
              placeholder="Shown when maintenance mode is on"
            />
          </Field>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Min iOS version">
              <input
                value={config.minAppVersion?.ios || ""}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    minAppVersion: { ...c.minAppVersion, ios: e.target.value },
                  }))
                }
                className={inputClass}
                placeholder="1.2.0"
              />
            </Field>
            <Field label="Min Android version">
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
                placeholder="1.2.0"
              />
            </Field>
          </div>
        </Panel>

        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {busy ? "Saving…" : "Save settings"}
        </Button>
      </form>
    </div>
  );
}
