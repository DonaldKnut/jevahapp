import type { CreatorApplyInput } from "./schemas/creatorApply";

export const CREATOR_ROLE_ART: Record<
  CreatorApplyInput["creatorTypes"][number],
  string
> = {
  artist:
    "https://res.cloudinary.com/bt01nio6/image/upload/v1790355600/Man_singing_on_stage_2K_20260925175816.jpg",
  minister:
    "https://res.cloudinary.com/bt01nio6/image/upload/v1790355598/Pastor_preaching_from_wooden_pulpit_2K_20260925175857.jpg",
  podcaster:
    "https://res.cloudinary.com/bt01nio6/image/upload/v1790355598/Podcaster_speaking_into_microphone_2K_20260925175837.jpg",
};
