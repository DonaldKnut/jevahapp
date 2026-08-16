import type { ComponentType, SVGProps } from "react";
import {
  ChartBarIcon,
  UsersIcon,
  MusicalNoteIcon,
  EnvelopeIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  RectangleStackIcon,
  UserCircleIcon,
  CheckBadgeIcon,
  HomeIcon,
  FlagIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export type TourStep = {
  title: string;
  body: string;
  points?: string[];
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const ADMIN_TOUR: TourStep[] = [
  {
    icon: HomeIcon,
    title: "Welcome to the Control Center",
    body: "This is the admin home. The left rail is the map — every platform tool lives there. Collapse it when you want more canvas; hover an icon to see its name.",
    points: [
      "Your profile card sits at the top of the sidebar",
      "Dashboard in the public header jumps back here anytime",
    ],
  },
  {
    icon: ChartBarIcon,
    title: "Start on Overview",
    body: "Overview is the pulse: pending reports, moderation queue, who is online, and creator applications waiting on you.",
    points: [
      "Yellow and red counts mean something needs a decision",
      "Jump straight into a queue from the cards — don’t hunt the menu",
    ],
  },
  {
    icon: UsersIcon,
    title: "People & presence",
    body: "Users is the directory. Search, filter by role, warn or restrict an account, and see who is active right now.",
    points: [
      "Artist role + verified creator is what unlocks Studio uploads",
      "Use presence when you need to know who is on the platform",
    ],
  },
  {
    icon: FlagIcon,
    title: "Keep the house safe",
    body: "Reports is community flags. Moderation is uploaded media — listen, inspect AI scores, then approve or take down.",
    points: [
      "Clear reports first if the queue is hot",
      "Moderation decisions land in Activity so the trail is auditable",
    ],
  },
  {
    icon: CheckBadgeIcon,
    title: "Approve gospel artists",
    body: "Artists is where applications become real creators. Activate someone and they can upload. Then send the welcome email so they know Studio is open.",
    points: [
      "Pending applications also surface on Overview",
      "Compose → Welcome artists is the onboard email",
    ],
  },
  {
    icon: EnvelopeIcon,
    title: "Speak to the platform",
    body: "Announcements broadcast in-app. Compose Email reaches users or churches. Notifications are the alerts this desk already generated for you.",
    points: [
      "Marketing mail only goes to people who opted in",
      "Every marketing send includes Unsubscribe",
    ],
  },
  {
    icon: Cog6ToothIcon,
    title: "Settings & health",
    body: "Settings holds feature flags and maintenance. System Health watches services. If something feels off, start there before guessing.",
    points: [
      "Replay this tour anytime with Help in the sidebar",
      "Sign out from the bottom of the rail when you are done",
    ],
  },
];

export const CREATOR_TOUR: TourStep[] = [
  {
    icon: SparklesIcon,
    title: "Welcome to Creator Studio",
    body: "This desk is yours: music, cover art, albums, streams, and the public page listeners share. The rail on the left is Overview, Tracks, Discography, Analytics, and Brand.",
    points: [
      "Upload Track in the top bar is the fastest path to publish",
      "Your name and status live on the Overview hero",
    ],
  },
  {
    icon: CheckBadgeIcon,
    title: "Apply, then get verified",
    body: "New artists apply once. While you wait, Studio shows a review card — you cannot publish yet. After approval, upload unlocks and your tracks can reach the Artists shelf.",
    points: [
      "Approval is reviewed by Jevah admins, usually within 1–2 days",
      "You will get email when the desk is fully open",
    ],
  },
  {
    icon: ArrowUpTrayIcon,
    title: "Upload like a release",
    body: "Drop one song or a batch. Give each track a title, genre, and cover. Publish when it is ready, or save as draft until the artwork and credits are right.",
    points: [
      "Cover art travels with the track in the player",
      "You can replace the cover later from Catalog → Edit",
    ],
  },
  {
    icon: MusicalNoteIcon,
    title: "Catalog is the source of truth",
    body: "Tracks holds everything you have uploaded. Edit title, artist name, genre, and visibility. Archive what should leave the shelf without deleting the file.",
    points: [
      "Published tracks can stream on Music → Artists / Gospel",
      "Keep titles clean — that is what search and shares show",
    ],
  },
  {
    icon: RectangleStackIcon,
    title: "Pack albums & EPs",
    body: "Discography groups tracks into a release with its own cover. Use it when a project should travel together, not as loose singles.",
    points: [
      "Upload can attach songs to a release",
      "A strong cover on the release is what people remember",
    ],
  },
  {
    icon: ChartBarIcon,
    title: "Read your audience",
    body: "Analytics shows listens, unique listeners, and how far people play. Use a 7 / 28 / 90 day range. Double down on what people finish.",
    points: [
      "Plays on Overview are a snapshot; Insights is the full picture",
      "A spike after a Sunday service is normal — watch the week after",
    ],
  },
  {
    icon: UserCircleIcon,
    title: "Brand the public page",
    body: "Brand Profile is the page people open when they tap your name: photo, banner, bio. Keep it ministry-true. Share that URL everywhere you already post music.",
    points: [
      "Avatar and banner upload here, not in the apply form",
      "Replay this tour anytime with Help in the top bar",
    ],
  },
];
