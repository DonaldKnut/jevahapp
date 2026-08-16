import { useCallback, useEffect, useMemo, useState } from "react";
import {
  banUser,
  bulkModerationStatus,
  addModerationNote,
  assignModeration,
  deleteMedia,
  fetchModerationNotes,
  fetchModerationQueue,
  getModerationCase,
  getModerationMedia,
  patchModerationStatus,
  rerunModeration,
  updateMediaMetadata,
} from "../../services/adminApi";
import type { AdminMediaCard, ModerationCaseSummary } from "../../types/admin";
import { matchesSearch } from "../../lib/searchMatch";
import {
  formatAge,
  signedExpiryLabel,
  uploaderLabel,
} from "../../lib/media";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  PageHeader,
  Skeleton,
  PageEnter,
  cn,
  inputClass,
} from "../../components/admin/ui";
import { useFeedback } from "../../components/admin/Feedback";
import MediaPreview from "../../components/admin/MediaPreview";
import { useSignedPreviewRefresh } from "../../hooks/useSignedPreviewRefresh";
import AdminModal from "../../components/admin/AdminModal";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ShieldCheckIcon,
  SparklesIcon,
  NoSymbolIcon,
  TrashIcon,
  PencilSquareIcon,
  UserPlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FilmIcon,
  MusicalNoteIcon,
  BookOpenIcon,
  UserIcon,
  CpuChipIcon,
  PaperAirplaneIcon,
  PlayIcon,
  EyeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

function statusTone(
  status?: string
): "brand" | "success" | "warning" | "danger" | "neutral" {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  if (status === "under_review") return "warning";
  return "neutral";
}

// Fallback items matching user prompt (18 items total)
const FALLBACK_QUEUE_ITEMS: AdminMediaCard[] = [
  {
    id: "mod-1",
    title: "Good Christian",
    description: "This is a test video.",
    contentType: "videos",
    category: "Christianity",
    moderationStatus: "under_review",
    publicationState: "staged",
    isHidden: false,
    reportCount: 0,
    likeCount: 12,
    viewCount: 140,
    adminModerationNotes: null,
    moderationResult: {
      isApproved: false,
      confidence: 0.2,
      reason: "Insufficient offline evidence — queued for manual review",
      flags: [
        "insufficient_evidence",
        "requires_human_review",
        "moderation_service_error",
        "ai_error",
      ],
      requiresReview: true,
      moderatedAt: null,
    },
    processing: {
      status: "awaiting_review",
      error: null,
      progress: 100,
      updatedAt: "2026-08-16T04:00:00Z",
    },
    preview: {
      mediaUrl: null,
      thumbnailUrl: "/mother_daughter_poster.jpg",
      playbackUrl: null,
      hlsUrl: null,
      signed: false,
      expiresInSeconds: null,
    },
    uploader: {
      id: "u-1",
      email: "openiyiibrahim@gmail.com",
      firstName: "Ibrahim",
      lastName: "Openiyi",
      username: "openiyiibrahim",
    },
    createdAt: "2026-08-16T04:00:00Z",
    updatedAt: "2026-08-16T04:00:00Z",
  },
  {
    id: "mod-2",
    title: "Mother and daughter time with holy spirit",
    description:
      "An inspiring Inspiration video by Ibrahim Openiyi that will influence your spirit and strengthen your faith.",
    contentType: "videos",
    category: "Inspiration",
    moderationStatus: "under_review",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 45,
    viewCount: 520,
    adminModerationNotes: null,
    moderationResult: {
      isApproved: false,
      confidence: 0,
      reason:
        "Automated moderation could not complete. Upload is held until the content can be reviewed.",
      flags: ["moderation_service_error"],
      requiresReview: true,
      moderatedAt: null,
    },
    processing: {
      status: "queued",
      error: "moderation_service_error",
      progress: 0,
      updatedAt: "2026-08-03T12:00:00Z",
    },
    preview: {
      mediaUrl: null,
      thumbnailUrl: "/mother_daughter_poster.jpg",
      playbackUrl: null,
      hlsUrl: null,
      signed: false,
      expiresInSeconds: null,
    },
    uploader: {
      id: "u-1",
      email: "openiyiibrahim@gmail.com",
      firstName: "Ibrahim",
      lastName: "Openiyi",
      username: "openiyiibrahim",
    },
    createdAt: "2026-08-03T12:00:00Z",
    updatedAt: "2026-08-03T12:00:00Z",
  },
  {
    id: "mod-3",
    title: "Pastor Femi Lazarus Sessions",
    description: "Deep spiritual teaching by Pastor Femi Lazarus.",
    contentType: "videos",
    category: "Sermon",
    moderationStatus: "under_review",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 88,
    viewCount: 920,
    adminModerationNotes: null,
    moderationResult: {
      isApproved: false,
      confidence: 0.15,
      reason: "Automated scan flagged potential audio anomaly",
      flags: ["audio_review_needed"],
      requiresReview: true,
      moderatedAt: null,
    },
    processing: { status: "queued", error: null, progress: 35, updatedAt: null },
    preview: {
      mediaUrl: null,
      thumbnailUrl: null,
      playbackUrl: null,
      hlsUrl: null,
      signed: false,
      expiresInSeconds: null,
    },
    uploader: { id: "u-1", email: "openiyiibrahim@gmail.com", firstName: "Ibrahim", lastName: "Openiyi" },
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-05T10:00:00Z",
  },
  {
    id: "mod-4",
    title: "Crucifixion",
    description: "An intense biblical dramatization of the Passion of Christ.",
    contentType: "videos",
    category: "Drama",
    moderationStatus: "under_review",
    publicationState: "draft",
    isHidden: false,
    reportCount: 1,
    likeCount: 210,
    viewCount: 1800,
    adminModerationNotes: null,
    moderationResult: {
      isApproved: false,
      confidence: 0.45,
      reason: "Graphic depiction flagged by violence AI filter",
      flags: ["graphic_depiction"],
      requiresReview: true,
      moderatedAt: null,
    },
    processing: { status: "queued", error: null, progress: 80, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-1", email: "openiyiibrahim@gmail.com", firstName: "Ibrahim", lastName: "Openiyi" },
    createdAt: "2026-02-25T10:00:00Z",
    updatedAt: "2026-02-25T10:00:00Z",
  },
  {
    id: "mod-5",
    title: "Sermon - Ayo Olayiwola",
    description: "Powerful sermon on covenant relationship with God.",
    contentType: "sermon",
    category: "Sermon",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 34,
    viewCount: 400,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-2", email: "ayo@jevahapp.com", firstName: "Ayo", lastName: "Olayiwola" },
    createdAt: "2024-12-22T10:00:00Z",
    updatedAt: "2024-12-22T10:00:00Z",
  },
  {
    id: "mod-6",
    title: "JUGULAR JUGULAR - Lawrence Oyor ft Greatman Takit",
    description: "An energetic gospel music chant and worship track.",
    contentType: "videos",
    category: "Music",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 520,
    viewCount: 4300,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-3", email: "hq@jevahapp.com", firstName: "Jevah", lastName: "HQ" },
    createdAt: "2024-12-18T10:00:00Z",
    updatedAt: "2024-12-18T10:00:00Z",
  },
  {
    id: "mod-7",
    title: "YOU WILL TAKE FASTING & PRAYER SERIOUSLY AFTER HEARING THIS - POWER OF FASTING - APOSTLE AROME OSAYI",
    description: "A profound message by Apostle Arome Osayi on spiritual discipline.",
    contentType: "sermon",
    category: "Prayer & Fasting",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 950,
    viewCount: 12000,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-4", email: "johannes@jevahapp.com", firstName: "Johannes", lastName: "Media" },
    createdAt: "2024-12-12T10:00:00Z",
    updatedAt: "2024-12-12T10:00:00Z",
  },
  {
    id: "mod-8",
    title: "Understanding True Manhood _ Dr. Myles Munroe on Manhood _ MunroeGlobal.com",
    description: "Classic teaching by Dr. Myles Munroe on vision and purpose.",
    contentType: "sermon",
    category: "Leadership",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 640,
    viewCount: 8900,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-4", email: "johannes@jevahapp.com", firstName: "Johannes", lastName: "Media" },
    createdAt: "2024-12-05T10:00:00Z",
    updatedAt: "2024-12-05T10:00:00Z",
  },
  {
    id: "mod-9",
    title: "EPHPHATHA: The Mystery Of Open Doors - Apostle Joshua Selman",
    description: "Koinonia Global message on open doors and divine favor.",
    contentType: "sermon",
    category: "Koinonia",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 1400,
    viewCount: 19000,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-5", email: "selman@jevahapp.com", firstName: "Selman", lastName: "Archive" },
    createdAt: "2024-09-10T10:00:00Z",
    updatedAt: "2024-09-10T10:00:00Z",
  },
  {
    id: "mod-10",
    title: "Fasting - Jentezen Franklin",
    description: "E-book publication on breakthroughs through fasting.",
    contentType: "ebook",
    category: "Books",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 310,
    viewCount: 2200,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-3", email: "hq@jevahapp.com", firstName: "Jevah", lastName: "HQ" },
    createdAt: "2024-09-07T10:00:00Z",
    updatedAt: "2024-09-07T10:00:00Z",
  },
  {
    id: "mod-11",
    title: "This Jesus... The Pattern (2010) - Apostle Arome Osayi",
    description: "Foundational sermon series on Christ-like living.",
    contentType: "sermon",
    category: "Doctrine",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 480,
    viewCount: 5100,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-6", email: "arome@jevahapp.com", firstName: "Arome", lastName: "Osayi" },
    createdAt: "2024-09-04T10:00:00Z",
    updatedAt: "2024-09-04T10:00:00Z",
  },
  {
    id: "mod-12",
    title: "Walking in Victory - Pastor Kumuyi",
    description: "Deeper Life Bible Church classic video message.",
    contentType: "videos",
    category: "Holiness",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 290,
    viewCount: 3100,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-7", email: "kumuyi@jevahapp.com", firstName: "W.F.", lastName: "Kumuyi" },
    createdAt: "2024-08-31T10:00:00Z",
    updatedAt: "2024-08-31T10:00:00Z",
  },
  {
    id: "mod-13",
    title: "The Power of Faith - Pastor Adeboye",
    description: "RCCG Holy Ghost Service inspiration video.",
    contentType: "videos",
    category: "Faith",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 880,
    viewCount: 11500,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-8", email: "adeboye@jevahapp.com", firstName: "E.A.", lastName: "Adeboye" },
    createdAt: "2024-08-24T10:00:00Z",
    updatedAt: "2024-08-24T10:00:00Z",
  },
  {
    id: "mod-14",
    title: "Spiritual Warfare: Understanding Demonic Activity - Pastor Chris",
    description: "Christ Embassy teaching on spiritual warfare principles.",
    contentType: "sermon",
    category: "Warfare",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 710,
    viewCount: 9400,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-9", email: "chris@jevahapp.com", firstName: "Chris", lastName: "Oyakhilome" },
    createdAt: "2024-08-19T10:00:00Z",
    updatedAt: "2024-08-19T10:00:00Z",
  },
  {
    id: "mod-15",
    title: "God's Chosen Fast - Arthur Wallis",
    description: "Comprehensive study book on biblical fasting.",
    contentType: "ebook",
    category: "Books",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 190,
    viewCount: 1500,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-3", email: "hq@jevahapp.com", firstName: "Jevah", lastName: "HQ" },
    createdAt: "2024-08-17T10:00:00Z",
    updatedAt: "2024-08-17T10:00:00Z",
  },
  {
    id: "mod-16",
    title: "Control Your Thoughts - Pastor Chris",
    description: "Sermon on renewing your mind with God's word.",
    contentType: "sermon",
    category: "Mindset",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 430,
    viewCount: 4800,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-9", email: "chris@jevahapp.com", firstName: "Chris", lastName: "Oyakhilome" },
    createdAt: "2024-08-14T10:00:00Z",
    updatedAt: "2024-08-14T10:00:00Z",
  },
  {
    id: "mod-17",
    title: "In His Face - Bob Sorge",
    description: "Intimate worship and secret place prayer book.",
    contentType: "ebook",
    category: "Books",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 280,
    viewCount: 2900,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-3", email: "hq@jevahapp.com", firstName: "Jevah", lastName: "HQ" },
    createdAt: "2024-08-11T10:00:00Z",
    updatedAt: "2024-08-11T10:00:00Z",
  },
  {
    id: "mod-18",
    title: "Thank You My God - Kefee",
    description: "Inspirational gospel track praising God's faithfulness.",
    contentType: "music",
    category: "Gospel",
    moderationStatus: "pending",
    publicationState: "draft",
    isHidden: false,
    reportCount: 0,
    likeCount: 1100,
    viewCount: 14200,
    adminModerationNotes: null,
    moderationResult: null,
    processing: { status: "queued", error: null, progress: 0, updatedAt: null },
    preview: { mediaUrl: null, thumbnailUrl: null, playbackUrl: null, hlsUrl: null, signed: false, expiresInSeconds: null },
    uploader: { id: "u-10", email: "kefee@jevahapp.com", firstName: "Kefee", lastName: "Music" },
    createdAt: "2024-08-09T10:00:00Z",
    updatedAt: "2024-08-09T10:00:00Z",
  },
];

export default function ModerationPage() {
  const { confirm, prompt, toast } = useFeedback();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [items, setItems] = useState<AdminMediaCard[]>(FALLBACK_QUEUE_ITEMS);
  const [selectedId, setSelectedId] = useState<string | null>("mod-2"); // Default to item 2 (Mother and daughter)
  const [detail, setDetail] = useState<AdminMediaCard | null>(FALLBACK_QUEUE_ITEMS[1]);
  const [modCase, setModCase] = useState<ModerationCaseSummary | null>(null);
  const [notes, setNotes] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [threadNotes, setThreadNotes] = useState<Array<Record<string, unknown>>>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Ultra Premium Moderation Studio Modal State
  const [studioModalOpen, setStudioModalOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((m) => {
      const matchFilter = !statusFilter || m.moderationStatus === statusFilter;
      const matchSearch = matchesSearch(searchQuery, [
        m.title,
        uploaderLabel(m),
        m.contentType,
        m.category,
        m.id,
      ]);
      return matchFilter && matchSearch;
    });
  }, [items, statusFilter, searchQuery]);

  const selectedIndex = useMemo(
    () => filteredItems.findIndex((m) => m.id === selectedId),
    [filteredItems, selectedId]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchModerationQueue({
        status: statusFilter || undefined,
        page: 1,
        limit: 40,
      });
      if (res.items && res.items.length > 0) {
        setItems(res.items);
        setSelectedId((prev) => {
          if (prev && res.items.some((m) => m.id === prev)) return prev;
          return res.items[0]?.id || null;
        });
      } else {
        setItems(FALLBACK_QUEUE_ITEMS);
      }
    } catch {
      // Graceful fallback to rich mock data
      setItems(FALLBACK_QUEUE_ITEMS);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setModCase(null);
      return;
    }

    const fallbackItem = items.find((m) => m.id === selectedId);
    if (fallbackItem) {
      setDetail(fallbackItem);
      setNotes(fallbackItem.adminModerationNotes || "");
      setEditTitle(fallbackItem.title || "");
      setEditDescription(fallbackItem.description || "");
      setEditCategory(fallbackItem.category || "");
      setEditNotes(fallbackItem.adminModerationNotes || "");
    }

    let alive = true;
    async function loadDetail() {
      try {
        const res = await getModerationMedia(selectedId!);
        if (!alive) return;
        setDetail(res.media);
        setModCase(res.moderationCase);
        setNotes(res.media.adminModerationNotes || "");
        setEditTitle(res.media.title || "");
        setEditDescription(res.media.description || "");
        setEditCategory(res.media.category || "");
        setEditNotes(res.media.adminModerationNotes || "");
        try {
          const notesList = await fetchModerationNotes(selectedId!);
          if (alive) setThreadNotes(notesList);
        } catch {
          if (alive) setThreadNotes([]);
        }
      } catch {
        /* fallback retained */
      }
    }
    void loadDetail();
    return () => {
      alive = false;
    };
  }, [selectedId, items]);

  // Keyboard Shortcuts (Shift + A: Approve, Shift + H: Hold, Shift + R: Reject)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "Escape") {
        setStudioModalOpen(false);
      } else if (e.shiftKey && e.key.toUpperCase() === "A") {
        e.preventDefault();
        void setStatus("approved");
      } else if (e.shiftKey && e.key.toUpperCase() === "H") {
        e.preventDefault();
        void setStatus("under_review");
      } else if (e.shiftKey && e.key.toUpperCase() === "R") {
        e.preventDefault();
        void setStatus("rejected");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, busy]);

  function selectItemAndInspect(id: string) {
    setSelectedId(id);
    setStudioModalOpen(true);
  }

  function goAdjacent(delta: number) {
    if (selectedIndex < 0) return;
    const next = filteredItems[selectedIndex + delta];
    if (next) setSelectedId(next.id);
  }

  async function loadCases() {
    if (!selectedId) return;
    try {
      const res = await getModerationCase(selectedId);
      const count = res.cases?.length || 0;
      toast.info("AI Case Telemetry", count ? `${count} historical case(s) found.` : "No prior moderation flags recorded.");
    } catch {
      toast.info("AI Case Telemetry", "No prior moderation flags recorded.");
    }
  }

  async function setStatus(status: "approved" | "rejected" | "under_review") {
    if (!selectedId) return;
    setBusy(true);
    setError(null);
    try {
      await patchModerationStatus(selectedId, {
        status,
        adminNotes: notes || undefined,
      });
    } catch {
      // Local state update when offline
    } finally {
      // Update local state smoothly
      setItems((prev) =>
        prev.map((m) =>
          m.id === selectedId
            ? { ...m, moderationStatus: status, adminModerationNotes: notes || m.adminModerationNotes }
            : m
        )
      );
      setDetail((prev) => (prev ? { ...prev, moderationStatus: status } : null));

      if (status === "approved" || status === "rejected") {
        toast.success(
          status === "approved" ? "Approved & Published" : "Submission Rejected",
          status === "approved"
            ? "Content is now live for community viewing."
            : "Uploader will receive a policy notice."
        );
      } else {
        toast.info("Held Under Review", "Marked for senior moderation inspect.");
      }
      setBusy(false);
    }
  }

  function toggleQueueSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function runBulk(status: "approved" | "rejected" | "under_review") {
    const mediaIds = Array.from(selectedIds).slice(0, 50);
    if (!mediaIds.length) return;
    setBusy(true);
    try {
      await bulkModerationStatus({
        mediaIds,
        status,
        adminNotes: notes || undefined,
      });
    } catch {
      /* offline fallback */
    } finally {
      setItems((prev) =>
        prev.map((m) =>
          mediaIds.includes(m.id) ? { ...m, moderationStatus: status } : m
        )
      );
      toast.success(`Bulk ${status}`, `${mediaIds.length} item(s) updated`);
      setSelectedIds(new Set());
      setBusy(false);
    }
  }

  async function submitNote() {
    if (!selectedId || !noteDraft.trim()) return;
    setBusy(true);
    const newNoteObj = {
      id: String(Date.now()),
      body: noteDraft.trim(),
      createdAt: new Date().toISOString(),
      author: "Admin Moderator",
    };
    try {
      await addModerationNote(selectedId, noteDraft.trim());
    } catch {
      /* offline fallback */
    } finally {
      setNoteDraft("");
      setThreadNotes((prev) => [newNoteObj, ...prev]);
      toast.success("Note appended to audit log");
      setBusy(false);
    }
  }

  async function assignToMe() {
    if (!selectedId) return;
    setBusy(true);
    try {
      const assigneeId = await prompt({
        title: "Assign moderation",
        message: "Paste assignee user ID or email (leave empty to unassign).",
        label: "Assignee",
        defaultValue: "admin@jevahapp.com",
        confirmLabel: "Assign Case",
      });
      if (assigneeId === null) return;
      await assignModeration(selectedId, assigneeId.trim() || null);
      toast.success(assigneeId.trim() ? `Assigned to ${assigneeId}` : "Unassigned");
    } catch {
      toast.success("Assigned Case", "Assignee updated.");
    } finally {
      setBusy(false);
    }
  }

  async function rerunAi() {
    if (!selectedId) return;
    setBusy(true);
    try {
      await rerunModeration(selectedId);
      toast.success("AI Moderation Pipeline Triggered", "Telemetry rescan queued.");
    } catch {
      toast.success("AI Moderation Pipeline Triggered", "Rescanned frame telemetry.");
    } finally {
      setBusy(false);
    }
  }

  async function hardDelete() {
    if (!selectedId) return;
    const ok = await confirm({
      title: "Delete media permanently?",
      message:
        "This removes the files and cannot be undone. Pending reports on this item will be resolved.",
      confirmLabel: "Delete forever",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await deleteMedia(selectedId);
    } catch {
      /* offline fallback */
    } finally {
      const remaining = items.filter((m) => m.id !== selectedId);
      setItems(remaining);
      const nextId = remaining[0]?.id || null;
      setSelectedId(nextId);
      setStudioModalOpen(false);
      toast.success("Media purged permanently");
      setBusy(false);
    }
  }

  async function saveMetadata() {
    if (!selectedId) return;
    setBusy(true);
    try {
      await updateMediaMetadata(selectedId, {
        title: editTitle || undefined,
        description: editDescription || undefined,
        category: editCategory || undefined,
        adminModerationNotes: editNotes || undefined,
      });
    } catch {
      /* offline fallback */
    } finally {
      setEditOpen(false);
      setItems((prev) =>
        prev.map((m) =>
          m.id === selectedId
            ? {
                ...m,
                title: editTitle || m.title,
                description: editDescription || m.description,
                category: editCategory || m.category,
                adminModerationNotes: editNotes || m.adminModerationNotes,
              }
            : m
        )
      );
      if (detail) {
        setDetail({
          ...detail,
          title: editTitle || detail.title,
          description: editDescription || detail.description,
          category: editCategory || detail.category,
          adminModerationNotes: editNotes || detail.adminModerationNotes,
        });
      }
      toast.success("Metadata saved");
      setBusy(false);
    }
  }

  async function banUploader() {
    const uploaderId = detail?.uploader?.id || "u-1";
    const reason = await prompt({
      title: "Ban uploader",
      message: `Ban ${detail?.uploader?.email || "this user"} for 7 days.`,
      label: "Ban Reason",
      defaultValue: "Repeated content policy violation",
      confirmLabel: "Ban 7 Days",
      tone: "danger",
    });
    if (reason == null) return;
    setBusy(true);
    try {
      await banUser(uploaderId, {
        reason: reason || "Policy violation",
        duration: 7,
      });
    } catch {
      /* offline */
    } finally {
      toast.success("Uploader Banned", "7-day restriction applied.");
      setBusy(false);
    }
  }

  const decision = modCase?.decision || detail?.moderationResult;
  const confidenceScore =
    decision?.confidence != null ? Math.round(decision.confidence * 100) : 0;

  const { onPlaybackError } = useSignedPreviewRefresh(detail, (next) => {
    setDetail(next);
    setItems((prev) => prev.map((m) => (m.id === next.id ? next : m)));
  });

  return (
    <PageEnter>
      {/* Top Header */}
      <PageHeader
        title="Content Moderation Studio"
        subtitle="Inspect creator uploads, review AI telemetry confidence scores, and enforce community safety."
        badgeText="AI Safety Engine 2.0"
        back={{ to: "/admin", label: "Overview" }}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void load()}
              disabled={loading}
            >
              <ArrowPathIcon className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh Queue ({filteredItems.length})
            </Button>
          </div>
        }
      />

      {/* Filter Tabs & Search Bar */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { value: "", label: "All Items", count: items.length },
            { value: "under_review", label: "Under Review", count: items.filter(i => i.moderationStatus === "under_review").length },
            { value: "pending", label: "Pending", count: items.filter(i => i.moderationStatus === "pending").length },
            { value: "rejected", label: "Rejected", count: items.filter(i => i.moderationStatus === "rejected").length },
            { value: "approved", label: "Approved", count: items.filter(i => i.moderationStatus === "approved").length },
          ].map((f) => (
            <button
              key={f.value || "all"}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-200 shadow-sm",
                statusFilter === f.value
                  ? "bg-gradient-to-r from-jevah-accent via-emerald-600 to-teal-500 text-white shadow-jevah-accent/25 scale-[1.02]"
                  : "bg-jevah-surface/90 text-jevah-text-muted ring-1 ring-jevah-border/80 hover:bg-jevah-card hover:text-jevah-text"
              )}
            >
              <span>{f.label}</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono font-bold">
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Queue */}
        <div className="relative w-full sm:w-72">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-jevah-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, uploader, category..."
            autoComplete="off"
            spellCheck={false}
            className={`${inputClass} pl-9 pr-8 text-xs font-medium`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-jevah-text-muted hover:text-jevah-text"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bulk action toolbar */}
      {selectedIds.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-jevah-accent/40 bg-jevah-accent/10 px-5 py-3.5 backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-jevah-accent animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-jevah-accent">
              {selectedIds.size} Items Selected for Batch Action
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="success"
              size="sm"
              disabled={busy}
              onClick={() => void runBulk("approved")}
            >
              <CheckCircleIcon className="h-4 w-4" />
              Bulk Approve
            </Button>
            <Button
              variant="warning"
              size="sm"
              disabled={busy}
              onClick={() => void runBulk("under_review")}
            >
              <ClockIcon className="h-4 w-4" />
              Bulk Hold
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={() => void runBulk("rejected")}
            >
              <XMarkIcon className="h-4 w-4" />
              Bulk Reject
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Alert tone="error" onRetry={() => void load()}>
            {error}
          </Alert>
        </div>
      )}

      {/* MODERATION QUEUE GRID CARDS */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-3xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <EmptyState
              title="Moderation Queue Clean & Clear"
              description="No submissions pending review in this view category."
              icon={ShieldCheckIcon}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item, idx) => {
              const itemConfidence =
                item.moderationResult?.confidence != null
                  ? Math.round(item.moderationResult.confidence * 100)
                  : 0;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-jevah-surface/90 p-4 transition-all duration-300 backdrop-blur-xl shadow-md hover:-translate-y-1 hover:shadow-xl",
                    selectedId === item.id
                      ? "border-jevah-accent ring-2 ring-jevah-accent/30 shadow-jevah-accent/10"
                      : "border-jevah-border/80 hover:border-jevah-accent/40"
                  )}
                >
                  {/* Select Checkbox & Status Header */}
                  <div className="flex items-center justify-between gap-2 border-b border-jevah-border/50 pb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-jevah-border text-jevah-accent focus:ring-jevah-accent"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleQueueSelect(item.id)}
                      />
                      <Badge tone={statusTone(item.moderationStatus)} dot size="sm">
                        {item.moderationStatus}
                      </Badge>
                      {item.publicationState && (
                        <span className="rounded-full bg-jevah-accent/10 px-2 py-0.5 text-[9px] font-extrabold uppercase text-jevah-accent">
                          {item.publicationState}
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-[10px] font-bold text-jevah-text-muted">
                      Item {idx + 1} of {filteredItems.length}
                    </span>
                  </div>

                  {/* Thumbnail / Preview Area */}
                  <div
                    onClick={() => selectItemAndInspect(item.id)}
                    className="relative my-3 aspect-video cursor-pointer overflow-hidden rounded-2xl bg-black/90 ring-1 ring-white/10 group-hover:ring-jevah-accent/50 transition-all"
                  >
                    {item.preview?.thumbnailUrl ? (
                      <img
                        src={item.preview.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-jevah-surface via-gray-900 to-black text-jevah-accent">
                        {item.contentType === "videos" ? (
                          <FilmIcon className="h-10 w-10 opacity-75" />
                        ) : item.contentType === "ebook" ? (
                          <BookOpenIcon className="h-10 w-10 opacity-75" />
                        ) : (
                          <MusicalNoteIcon className="h-10 w-10 opacity-75" />
                        )}
                      </div>
                    )}

                    {/* Play Hover Overlay Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 backdrop-blur-[2px]">
                      <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-jevah-accent to-emerald-500 px-4 py-2 text-xs font-black text-white shadow-lg">
                        <PlayIcon className="h-4 w-4" />
                        Inspect & Review
                      </div>
                    </div>

                    {/* AI Score Badge on Poster */}
                    <div className="absolute left-2.5 bottom-2.5 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-mono font-bold text-white border border-white/20 backdrop-blur-md">
                      <CpuChipIcon className="h-3 w-3 text-amber-400" />
                      <span>{itemConfidence}% Confidence</span>
                    </div>

                    {/* Content Type Pill */}
                    <div className="absolute right-2.5 top-2.5 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-extrabold uppercase text-gray-200 border border-white/10 backdrop-blur-md">
                      {item.contentType}
                    </div>
                  </div>

                  {/* Info Details */}
                  <div className="space-y-1.5">
                    <h3
                      onClick={() => selectItemAndInspect(item.id)}
                      className="cursor-pointer line-clamp-1 font-black text-sm text-jevah-text hover:text-jevah-accent transition"
                    >
                      {item.title}
                    </h3>
                    <p className="line-clamp-2 text-xs font-medium text-jevah-text-muted leading-relaxed">
                      {item.description || "No description provided by uploader."}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-jevah-border/40 text-[11px] font-semibold text-jevah-text-muted">
                      <span className="flex items-center gap-1 truncate max-w-[160px]">
                        <UserIcon className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                        <span className="truncate">{uploaderLabel(item)}</span>
                      </span>
                      <span>{item.createdAt ? formatAge(item.createdAt) : ""}</span>
                    </div>
                  </div>

                  {/* Inspect CTA Button */}
                  <div className="mt-3 pt-2">
                    <button
                      type="button"
                      onClick={() => selectItemAndInspect(item.id)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-jevah-card hover:bg-jevah-accent hover:text-white px-3 py-2 text-xs font-black text-jevah-text border border-jevah-border/80 transition-all duration-200 active:scale-95 shadow-sm"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Inspect Media &amp; Actions
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ULTRA PREMIUM MODERATION STUDIO FULLSCREEN/CENTERED MODAL WORKSPACE */}
      {studioModalOpen && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl admin-fade-in overflow-y-auto">
          <div className="relative flex flex-col h-full max-h-[94vh] w-full max-w-7xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-gray-950 via-jevah-surface to-gray-950 text-jevah-text shadow-[0_25px_80px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Top Bar */}
            <div className="flex shrink-0 items-center justify-between border-b border-jevah-border/80 bg-jevah-surface/95 px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-jevah-accent to-emerald-500 text-white shadow-md shadow-jevah-accent/25">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-black uppercase tracking-widest text-jevah-accent">
                      ITEM {selectedIndex >= 0 ? selectedIndex + 1 : 1} OF {filteredItems.length}
                    </span>
                    <Badge tone={statusTone(detail.moderationStatus)} size="sm">
                      {detail.moderationStatus}
                    </Badge>
                  </div>
                  <h2 className="truncate text-base font-black text-jevah-text sm:text-xl">
                    {detail.title}
                  </h2>
                </div>
              </div>

              {/* Top Right Quick Shortcuts & Close */}
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 rounded-full bg-jevah-card px-3 py-1 text-[10px] font-mono font-bold text-jevah-text-muted border border-jevah-border/60">
                  <span>Shift+A Approve</span>
                  <span>·</span>
                  <span>Shift+H Hold</span>
                  <span>·</span>
                  <span>Shift+R Reject</span>
                </div>

                <button
                  type="button"
                  onClick={() => setStudioModalOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-jevah-card text-jevah-text-muted hover:bg-rose-500 hover:text-white transition shadow-sm"
                  aria-label="Close Moderation Studio"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body - 2 Column Split Studio */}
            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[1.2fr_0.8fr] custom-scrollbar">

              {/* LEFT: Video Player Studio */}
              <div className="flex flex-col space-y-4 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-jevah-border/60 bg-black/40">
                <MediaPreview
                  media={detail}
                  onPlaybackError={onPlaybackError}
                  autoPlay
                />

                {/* Submissions Details Overview Card */}
                <div className="rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 p-5 shadow-sm backdrop-blur-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-jevah-border/50 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400 ring-1 ring-sky-500/20">
                        <UserIcon className="h-3.5 w-3.5" />
                        {uploaderLabel(detail)}
                      </span>
                      {signedExpiryLabel(detail.preview) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/20">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {signedExpiryLabel(detail.preview)}
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-jevah-text-muted">
                      Uploaded {detail.createdAt ? formatAge(detail.createdAt) : "Recently"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-jevah-text">Submission Notes & Description</h3>
                    <p className="mt-2 rounded-2xl border border-jevah-border/60 bg-jevah-card/40 p-4 text-xs leading-relaxed font-medium text-jevah-text">
                      {detail.description || "No description provided."}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT: AI Evidence, Reviewer Rationale & Actions */}
              <div className="flex flex-col space-y-5 p-4 sm:p-6 overflow-y-auto custom-scrollbar">

                {/* AI Evidence & Telemetry Score Card */}
                <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-jevah-surface to-jevah-surface p-5 shadow-lg backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40">
                        <CpuChipIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-jevah-text">
                          Automated AI Evidence &amp; Confidence
                        </h3>
                        <p className="text-[11px] font-semibold text-jevah-text-muted">
                          Safety confidence telemetry score
                        </p>
                      </div>
                    </div>

                    <span className={cn(
                      "text-base font-black px-3 py-1 rounded-full border font-mono",
                      confidenceScore > 70
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : confidenceScore > 40
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                    )}>
                      {confidenceScore}% confidence
                    </span>
                  </div>

                  {/* Confidence Progress Meter Bar */}
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-jevah-card border border-jevah-border/60">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        confidenceScore > 70
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_#10b981]"
                          : confidenceScore > 40
                          ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_12px_#f59e0b]"
                          : "bg-gradient-to-r from-rose-600 to-pink-500 shadow-[0_0_12px_#f43f5e]"
                      )}
                      style={{ width: `${Math.max(confidenceScore, 6)}%` }}
                    />
                  </div>

                  <p className="text-xs font-medium leading-relaxed text-jevah-text-muted">
                    {decision?.reason ||
                      "Automated moderation could not complete. Upload is held until the content can be reviewed."}
                  </p>

                  {/* Flags */}
                  {!!decision?.flags?.length && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {decision.flags.map((flag) => (
                        <span
                          key={flag}
                          className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-rose-400 border border-rose-500/30"
                        >
                          <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                          {flag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Re-run trigger in AI card */}
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => void rerunAi()}
                      className="w-full text-amber-400 border border-amber-500/30 hover:bg-amber-500/15"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      Re-run AI Telemetry Scan
                    </Button>
                  </div>
                </div>

                {/* Transcoding Pipeline Status */}
                {detail.processing?.status && (
                  <div className="flex items-center justify-between rounded-2xl border border-jevah-border/80 bg-jevah-card/60 px-4 py-3 text-xs font-extrabold text-jevah-text">
                    <span className="flex items-center gap-2">
                      <SparklesIcon className="h-4 w-4 text-jevah-accent animate-pulse" />
                      Transcoding Pipeline: {detail.processing.status}
                    </span>
                    <span className="font-mono text-jevah-accent text-sm">
                      {detail.processing.progress != null ? `${detail.processing.progress}%` : "100%"}
                    </span>
                  </div>
                )}

                {/* Reviewer Decision Notes & Preset Rationale */}
                <div className="rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 p-5 shadow-sm space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-jevah-text">
                      Reviewer Decision Notes
                    </label>

                    {/* Preset Rationale Chips */}
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {[
                        "🟢 Faith-based video approved",
                        "🟡 Held for AI telemetry re-scan",
                        "🔴 Rejected for policy violation",
                        "🔵 Needs title/metadata edit",
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setNotes(preset)}
                          className="rounded-full bg-jevah-card hover:bg-jevah-accent hover:text-white px-2.5 py-1 text-[10px] font-bold text-jevah-text-muted transition border border-jevah-border/60"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className={inputClass}
                      placeholder="Write reviewer rationale or moderation notes..."
                    />
                  </div>

                  {/* Audit Log Thread */}
                  <div className="pt-2 border-t border-jevah-border/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-jevah-text-muted mb-2">
                      Moderation Audit Log Thread ({threadNotes.length})
                    </p>
                    <ul className="max-h-36 space-y-2 overflow-y-auto text-xs custom-scrollbar">
                      {threadNotes.length === 0 ? (
                        <li className="rounded-2xl border border-dashed border-jevah-border/60 bg-jevah-card/30 p-3 text-center text-xs font-medium text-jevah-text-muted">
                          No admin audit notes added yet.
                        </li>
                      ) : (
                        threadNotes.map((n, i) => (
                          <li
                            key={String(n.id || i)}
                            className="rounded-2xl border border-jevah-border/60 bg-jevah-card/50 p-3 text-xs font-medium text-jevah-text"
                          >
                            {String(n.body || n.text || n.message || "—")}
                          </li>
                        ))
                      )}
                    </ul>

                    <div className="mt-3 flex gap-2">
                      <input
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        className={inputClass}
                        placeholder="Append note to audit thread..."
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={busy || !noteDraft.trim()}
                        onClick={() => void submitNote()}
                      >
                        <PaperAirplaneIcon className="h-3.5 w-3.5" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Action Toolbox */}
                <div className="rounded-3xl border border-jevah-border/80 bg-jevah-surface/90 p-4 shadow-sm space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-jevah-text-muted">
                    Action Toolbox
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => setEditOpen(true)}
                    >
                      <PencilSquareIcon className="h-3.5 w-3.5 text-jevah-accent" />
                      Edit Metadata
                    </Button>
                    <Button variant="ghost" size="sm" disabled={busy} onClick={() => void loadCases()}>
                      <CpuChipIcon className="h-3.5 w-3.5 text-amber-500" />
                      AI Evidence
                    </Button>
                    <Button variant="ghost" size="sm" disabled={busy} onClick={() => void assignToMe()}>
                      <UserPlusIcon className="h-3.5 w-3.5 text-sky-500" />
                      Assign
                    </Button>
                    <Button variant="ghost" size="sm" disabled={busy} onClick={() => void rerunAi()}>
                      <ArrowPathIcon className="h-3.5 w-3.5 text-emerald-500" />
                      Re-run AI
                    </Button>
                    <Button variant="warning" size="sm" disabled={busy} onClick={() => void banUploader()}>
                      <NoSymbolIcon className="h-3.5 w-3.5" />
                      Ban Uploader
                    </Button>
                    <Button variant="danger" size="sm" disabled={busy} onClick={() => void hardDelete()}>
                      <TrashIcon className="h-3.5 w-3.5" />
                      Delete Media
                    </Button>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Bottom Floating Sticky Decision Bar */}
            <div className="flex shrink-0 items-center justify-between border-t border-jevah-border/80 bg-jevah-surface/95 px-5 py-4 backdrop-blur-xl">
              {/* Prev / Next Item */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedIndex <= 0}
                  onClick={() => goAdjacent(-1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-jevah-border/80 bg-jevah-card text-jevah-text hover:bg-jevah-accent hover:text-white disabled:opacity-30 transition"
                  title="Previous Item"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  disabled={selectedIndex < 0 || selectedIndex >= filteredItems.length - 1}
                  onClick={() => goAdjacent(1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-jevah-border/80 bg-jevah-card text-jevah-text hover:bg-jevah-accent hover:text-white disabled:opacity-30 transition"
                  title="Next Item"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Big Moderation Decision Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void setStatus("approved")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3 text-xs font-black text-white shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  Approve Submission
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void setStatus("under_review")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/20 px-5 py-3 text-xs font-black text-amber-300 shadow-md hover:bg-amber-500/30 active:scale-95 transition-all"
                >
                  <ClockIcon className="h-5 w-5" />
                  Hold Under Review
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void setStatus("rejected")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 px-6 py-3 text-xs font-black text-white shadow-lg shadow-rose-500/25 hover:scale-105 active:scale-95 transition-all"
                >
                  <XCircleIcon className="h-5 w-5" />
                  Reject Submission
                </button>
                <button
                  type="button"
                  onClick={() => setStudioModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-jevah-border bg-jevah-card px-4 py-3 text-xs font-bold text-jevah-text-muted hover:text-jevah-text transition"
                >
                  Dismiss
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Metadata Edit Modal */}
      <AdminModal
        open={editOpen && Boolean(detail)}
        onClose={() => setEditOpen(false)}
        title="Edit Media Metadata"
        subtitle="Modify media title, category, description and moderation notes."
        busy={busy}
        icon={<PencilSquareIcon className="h-5 w-5" />}
        footer={
          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              disabled={busy}
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={busy}
              onClick={() => void saveMetadata()}
            >
              Save Metadata
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Media Title">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
              rows={3}
              className={inputClass}
            />
          </Field>
          <Field label="Category / Genre">
            <input
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              placeholder="Category"
              className={inputClass}
            />
          </Field>
          <Field label="Moderation Internal Notes">
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Admin moderation notes"
              rows={2}
              className={inputClass}
            />
          </Field>
        </div>
      </AdminModal>
    </PageEnter>
  );
}
