"use client";
import { useState } from "react";

interface QueryFormProps {
  onSubmit: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function QueryForm({ onSubmit, placeholder = "Enter your query", disabled }: QueryFormProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSubmit(query.trim());
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-600 focus:bg-gray-800 transition-colors disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!query.trim() || disabled}
        className="w-full px-4 py-3 bg-white text-black rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {disabled ? "Researching..." : "Start Research"}
      </button>
    </form>
  );
}