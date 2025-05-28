export interface Idea {
  topic: string;
  pain_point: string;
  suggested_idea: string;
}
 
export interface ApiResponse {
  ideas: Idea[];
  implementation_summary?: string;
  error?: string;
} 