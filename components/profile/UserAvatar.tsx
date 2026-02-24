interface UserAvatarProps {
  readonly username: string;
  readonly size?: "sm" | "md" | "lg";
}

/** Deterministic hue derived from username characters. */
function usernameToHue(username: string): number {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.codePointAt(i)!) >>> 0;
  }
  return hash % 360;
}

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
};

export function UserAvatar({ username, size = "md" }: UserAvatarProps) {
  const hue = usernameToHue(username);
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold select-none shrink-0 ${SIZE_CLASSES[size]}`}
      style={{
        backgroundColor: `hsl(${hue} 60% 85%)`,
        color: `hsl(${hue} 60% 25%)`,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
