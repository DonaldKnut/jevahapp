import { useEffect, useRef } from "react";
import { useFeedback } from "./admin/Feedback";

/** Fires a toast when `error` becomes non-null (app-wide error surfacing). */
export function ErrorToaster({
  error,
  title = "Something went wrong",
}: {
  error: string | null;
  title?: string;
}) {
  const { toast } = useFeedback();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (error && error !== last.current) {
      toast.error(title, error);
    }
    last.current = error;
  }, [error, title, toast]);

  return null;
}
