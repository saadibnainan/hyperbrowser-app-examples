"use client";

export default function DownloadBtn({ data }: { data: string }) {
  const handleDownload = () => {
    if (!data || data === "{}") return;
    
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reddit-research.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!data || data === "{}"}
      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
    >
      {data && data !== "{}" ? "Download Data" : "No data available"}
    </button>
  );
}