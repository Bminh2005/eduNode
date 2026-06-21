import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <p
          className="text-5xl font-bold"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "#6D28D9" }}
        >
          404
        </p>
        <p className="text-muted-foreground text-sm">Page not found.</p>
        <Link
          to="/"
          className="inline-block text-sm px-4 py-2 rounded-lg text-white transition-all"
          style={{ background: "#6D28D9" }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
