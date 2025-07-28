import { motion } from "framer-motion";

export function DownloadBtn({ csv }: { csv: string }) {
  if (!csv) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12 }}
      className="mt-4 flex justify-center"
    >
      <a
        className="flex items-center justify-center w-full max-w-xs bg-accent text-black h-12"
        href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
        download="leads.csv"
      >
        <svg className="icon mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span className="font-semibold">Export CSV</span>
      </a>
    </motion.div>
  );
} 