// TypeScript interfaces for Analyser AI
// These define the shape of data that the backend will eventually provide.

export interface RepositoryData {
  name: string;
  owner: string;
  description: string | null;
  primaryLanguage: string | null;
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  defaultBranch: string | null;
  createdDate: string | null;
  lastUpdated: string | null;
  url: string;
  license: string | null;
  topics: string[];
  sizeKb: number | null;
  contributorsCount: number | null;
}

export interface LanguageDistribution {
  [language: string]: number; // percentage or bytes
}

export interface AIAnalysisReport {
  problemSolving: string | null;
  architecture: string | null;
  codeQuality: string | null;
  documentation: string | null;
  security: string | null;
  testing: string | null;
  maintainability: string | null;
  scalability: string | null;
  overallSummary: string | null;
}

export interface RecommendedRole {
  roleName: string;
  confidence: number | null;
}

export interface FullReport {
  repository: RepositoryData | null;
  languages: LanguageDistribution | null;
  analysis: AIAnalysisReport | null;
  roles: RecommendedRole[] | null;
  recommendations: string[] | null;
}
