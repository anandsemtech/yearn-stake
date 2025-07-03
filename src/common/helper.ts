export const getColorClasses = (color: string) => {
  const colorMap = {
    blue: "from-blue-500 to-cyan-600",
    purple: "from-purple-500 to-violet-600",
    green: "from-green-500 to-emerald-600",
    orange: "from-orange-500 to-amber-600",
  };
  return (
    colorMap[color as keyof typeof colorMap] || "from-gray-500 to-gray-600"
  );
};

export const getTagColor = (tag: string | null) => {
  if (!tag) return "";
  const tagColors = {
    Popular: "bg-purple-500 text-white",
    Recommended: "bg-green-500 text-white",
    Premium: "bg-orange-500 text-white",
  };
  return tagColors[tag as keyof typeof tagColors] || "bg-gray-500 text-white";
};
