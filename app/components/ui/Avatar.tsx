type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  // Extract initials from name (first and last name)
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center bg-primary-600 text-white font-semibold rounded-full ${className}`}
      aria-label={`Avatar for ${name}`}
    >
      {getInitials(name)}
    </div>
  );
}
