export type ActionType = 
  | 'SEND_SMS'
  | 'OPEN_APP'
  | 'INSTALL_APP'
  | 'PLAY_SONG'
  | 'GENERATE_HTML'
  | 'DOWNLOAD_PDF'
  | 'CREATE_COURSE'
  | 'CREATE_PROMPT'
  | 'GENERAL_CHAT'
  | 'SYSTEM_TELEMETRY';

export interface JarvisCommand {
  action: ActionType;
  query: string;
  parameters: {
    phoneNumber?: string;
    message?: string;
    appName?: string;
    songTitle?: string;
    htmlTopic?: string;
    pdfTitle?: string;
    pdfContent?: string;
    courseTopic?: string;
    courseLevel?: string;
    promptSubject?: string;
    promptCategory?: string;
  };
  explanationUrdu?: string;
  explanationEnglish?: string;
}

export interface TaskLog {
  id: string;
  timestamp: string;
  command: string;
  action: ActionType;
  status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED';
  details: string;
}

export interface CourseModule {
  moduleNumber: number;
  title: string;
  summary: string;
  keyPoints: string[];
  practicalExercise: string;
}

export interface CourseData {
  title: string;
  targetAudience: string;
  duration: string;
  prerequisites: string;
  modules: CourseModule[];
  conclusion: string;
}

export interface GeneratedHtmlApp {
  title: string;
  description: string;
  code: string;
  timestamp: string;
}
