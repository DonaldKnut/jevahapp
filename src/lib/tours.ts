import type { ComponentType, SVGProps } from "react";
import {
  ChartBarIcon,
  UsersIcon,
  MusicalNoteIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  RectangleStackIcon,
  UserCircleIcon,
  CheckBadgeIcon,
  HomeIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

export type TourStep = {
  title: string;
  body: string;
  points?: string[];
  tip?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const ADMIN_TOUR: TourStep[] = [
  {
    icon: HomeIcon,
    title: "Welcome to Your Control Center 🎛️",
    body: "Think of this as your platform command center. Everything you need to manage users, review content, and keep Jevah running smoothly lives in the left sidebar.",
    points: [
      "The left menu is your map — click any icon to jump straight to that feature",
      "Collapse the sidebar anytime to give yourself more workspace",
    ],
    tip: "Pro Tip: Tap the floating question mark at the bottom-right anytime to replay this guide.",
  },
  {
    icon: ChartBarIcon,
    title: "Your Daily Snapshot (Overview) ⚡",
    body: "This is your starting point every day. Overview instantly highlights anything that needs your attention — such as new creator applications or reported posts.",
    points: [
      "Numbered badges show items waiting for your review",
      "Click directly on any action card to jump straight into work without hunting",
    ],
    tip: "Rule of thumb: Clean up yellow & red alert badges first to keep the platform running smoothly.",
  },
  {
    icon: UsersIcon,
    title: "People & Community 👥",
    body: "Manage all listeners, creators, and leaders in one place. Search for anyone, check active accounts, and grant creator access with a simple click.",
    points: [
      "Search any user by name or email in seconds",
      "See who is currently active on the platform in real time",
    ],
    tip: "Creator access: Giving someone 'Verified Artist' status unlocks their Studio desk so they can publish songs.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Keeping the Platform Safe 🛡️",
    body: "Review community reports and uploaded media. Listen to audio clips, check automated safety scores, and decide whether to approve or take down content.",
    points: [
      "Clear urgent community flags first to keep discussion spaces uplifting",
      "All moderation choices are saved automatically to an audit trail for your peace of mind",
    ],
    tip: "Peace of mind: Moderation logs ensure your team always knows who approved or flagged a track.",
  },
  {
    icon: CheckBadgeIcon,
    title: "Approving New Gospel Artists 🎤",
    body: "When artists apply for a creator account, their requests land here. Review their application, approve them, and send a welcoming invitation to their new Studio.",
    points: [
      "Pending creator applications also surface right on your Overview screen",
      "Use 'Compose → Welcome Artists' to send a friendly email when approving",
    ],
    tip: "Quick turnaround: Fast approvals keep gospel creators excited to upload their newest releases!",
  },
  {
    icon: MegaphoneIcon,
    title: "Speak to Your Audience 📢",
    body: "Share news easily! Send in-app announcements for instant pop-ups, compose emails to registered users, or check your automatic system notifications.",
    points: [
      "Announcements appear right inside the app for active users",
      "Marketing emails are only sent to people who opted in, with easy unsubscribe links",
    ],
    tip: "Best practice: Use in-app banners for quick platform updates, and emails for major announcements.",
  },
  {
    icon: Cog6ToothIcon,
    title: "Settings & System Health ⚙️",
    body: "Adjust platform feature toggles, manage maintenance settings, and check service status. If anything ever seems slow, check System Health first.",
    points: [
      "Live monitors show service uptime and performance in real time",
      "Safely turn experimental features on or off as needed",
    ],
    tip: "Need a refresher? Tap the floating question mark at the bottom-right to replay this tour.",
  },
];

export const CREATOR_TOUR: TourStep[] = [
  {
    icon: SparklesIcon,
    title: "Welcome to Creator Studio! 🎵",
    body: "This is your personal music headquarters! Everything you need to share songs, manage your albums, track listeners, and grow your gospel ministry is right here.",
    points: [
      "The left menu opens your Tracks, Discography, Analytics, and Profile settings",
      "Click 'Upload Track' at the top anytime to publish new songs",
    ],
    tip: "Quick start: Replay this guide anytime by tapping the floating question mark at the bottom-right.",
  },
  {
    icon: CheckBadgeIcon,
    title: "Simple Account Verification 🛡️",
    body: "When you join as a new artist, our team does a quick, one-time verification check. This ensures a high-quality, trusted environment for all listeners.",
    points: [
      "While waiting for approval, explore your desk and prepare your music",
      "You'll receive an email notification as soon as your studio is fully unlocked",
    ],
    tip: "Why we verify: It keeps Jevah authentic and ensures listeners know they are listening to real creators.",
  },
  {
    icon: ArrowUpTrayIcon,
    title: "Upload Songs in Seconds 🚀",
    body: "Releasing music is easy. Drag and drop your audio file, type in the song title, choose a category (like Worship or Praise), and pick a cover picture.",
    points: [
      "Save as a draft if you are still working on artwork or lyrics",
      "Publish immediately when your track is ready for the world to hear",
    ],
    tip: "Layman tip: Standard MP3 or WAV files work perfectly. Eye-catching cover art helps songs get noticed!",
  },
  {
    icon: MusicalNoteIcon,
    title: "Your Complete Song Library 🎶",
    body: "This is your songbook. Every song you've uploaded lives here in one organized catalog. Easily update song titles, refresh artwork, or adjust visibility.",
    points: [
      "Published tracks stream instantly on Music & Gospel pages",
      "Keep titles clean and clear so listeners can find your songs easily in search",
    ],
    tip: "Quick edit: Spot a typo in a song title? Just click 'Edit' in your catalog to fix it in seconds.",
  },
  {
    icon: RectangleStackIcon,
    title: "Group Songs into Albums & EPs 💿",
    body: "Releasing a multi-track project? Group your individual songs together under one main title and cover image so listeners can play the full album in order.",
    points: [
      "Attach existing songs to an album with a few simple clicks",
      "A strong album cover gives your release a professional touch",
    ],
    tip: "Perfect for: Sunday live worship recordings, seasonal projects, or full studio albums.",
  },
  {
    icon: ChartBarIcon,
    title: "See Who Is Listening 📊",
    body: "Discover how your music is touching lives! Analytics shows your total song plays, unique listeners, and which tracks are getting the most love.",
    points: [
      "Switch between 7-day, 28-day, or 90-day timeframes to see your growth",
      "See how long people listen before moving to the next song",
    ],
    tip: "Listener insight: A spike in plays on Sunday evenings means people are listening after service!",
  },
  {
    icon: UserCircleIcon,
    title: "Customize Your Public Profile 🎨",
    body: "Your profile is your digital storefront! Upload a profile picture, add a custom banner, and write a short bio so listeners learn about your ministry.",
    points: [
      "Add a welcoming photo and bio to connect with your audience",
      "Copy your unique profile link and share it on social media or WhatsApp",
    ],
    tip: "Share everywhere: Your profile link works everywhere — share it with your church and followers!",
  },
];

