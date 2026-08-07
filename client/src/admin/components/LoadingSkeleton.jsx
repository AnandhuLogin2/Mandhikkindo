export default function LoadingSkeleton({ height = "100%", width = "100%", borderRadius = "var(--admin-radius-sm)" }) {
  return (
    <div
      className="admin-skeleton"
      style={{
        height,
        width,
        borderRadius,
      }}
    />
  );
}
