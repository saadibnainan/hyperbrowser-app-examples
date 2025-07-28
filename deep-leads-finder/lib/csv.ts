interface Lead {
  source: string;
  title: string;
  url: string;
  location: string;
  price: string;
}

export function leadsToCSV(leads: Lead[]): string {
  if (leads.length === 0) return "";
  
  const headers = "Source,Title,URL,Location,Phone\n";
  const rows = leads.map(lead => 
    `"${lead.source}","${lead.title.replace(/"/g, '""')}","${lead.url}","${lead.location}","${lead.price}"`
  ).join("\n");
  
  return headers + rows;
} 