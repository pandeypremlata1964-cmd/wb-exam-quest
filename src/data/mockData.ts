 export interface University {
   id: string;
   name: string;
   shortName: string;
   location: string;
   logo?: string;
   paperCount: number;
 }
 
 export interface QuestionPaper {
   id: string;
   universityId: string;
   university: string;
   course: string;
   subject: string;
   semester: string;
   year: number;
   pdfUrl: string;
   downloads: number;
 }
 
 export interface MockTest {
   id: string;
   title: string;
   subject: string;
   chapter?: string;
   questions: number;
   duration: number; // in minutes
   difficulty: 'Easy' | 'Medium' | 'Hard';
   attempts: number;
 }
 
 export interface Question {
   id: string;
   question: string;
   options: string[];
   correctAnswer: number;
   explanation?: string;
 }
 
 export const universities: University[] = [
   {
     id: 'cu',
     name: 'University of Calcutta',
     shortName: 'CU',
     location: 'Kolkata',
     paperCount: 245,
   },
   {
     id: 'ju',
     name: 'Jadavpur University',
     shortName: 'JU',
     location: 'Kolkata',
     paperCount: 312,
   },
   {
     id: 'ku',
     name: 'University of Kalyani',
     shortName: 'KU',
     location: 'Kalyani',
     paperCount: 187,
   },
   {
     id: 'bu',
     name: 'University of Burdwan',
     shortName: 'BU',
     location: 'Burdwan',
     paperCount: 203,
   },
   {
     id: 'vu',
     name: 'Vidyasagar University',
     shortName: 'VU',
     location: 'Midnapore',
     paperCount: 156,
   },
   {
     id: 'nbu',
     name: 'University of North Bengal',
     shortName: 'NBU',
     location: 'Darjeeling',
     paperCount: 178,
   },
   {
     id: 'pu',
     name: 'Presidency University',
     shortName: 'PU',
     location: 'Kolkata',
     paperCount: 134,
   },
   {
     id: 'wbsu',
     name: 'West Bengal State University',
     shortName: 'WBSU',
     location: 'Barasat',
     paperCount: 98,
   },
 ];
 
 export const courses = [
   'BA', 'BSc', 'BCom', 'BBA', 'BCA',
   'MA', 'MSc', 'MCom', 'MBA', 'MCA',
   'BA Honours', 'BSc Honours', 'BCom Honours',
   'MA Honours', 'MSc Honours'
 ];
 
 export const subjects = [
   'English', 'Bengali', 'Hindi', 'History', 'Political Science',
   'Economics', 'Philosophy', 'Sociology', 'Geography', 'Education',
   'Mathematics', 'Physics', 'Chemistry', 'Botany', 'Zoology',
   'Computer Science', 'Statistics', 'Accounting', 'Business Law',
   'Environmental Science', 'Psychology'
 ];
 
 export const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
 
 export const questionPapers: QuestionPaper[] = [
   {
     id: 'qp1',
     universityId: 'cu',
     university: 'University of Calcutta',
     course: 'BSc Honours',
     subject: 'Mathematics',
     semester: '3rd',
     year: 2023,
     pdfUrl: '#',
     downloads: 1245,
   },
   {
     id: 'qp2',
     universityId: 'ju',
     university: 'Jadavpur University',
     course: 'BSc Honours',
     subject: 'Physics',
     semester: '5th',
     year: 2023,
     pdfUrl: '#',
     downloads: 987,
   },
   {
     id: 'qp3',
     universityId: 'ku',
     university: 'University of Kalyani',
     course: 'BA Honours',
     subject: 'English',
     semester: '4th',
     year: 2023,
     pdfUrl: '#',
     downloads: 756,
   },
   {
     id: 'qp4',
     universityId: 'bu',
     university: 'University of Burdwan',
     course: 'BCom Honours',
     subject: 'Accounting',
     semester: '2nd',
     year: 2024,
     pdfUrl: '#',
     downloads: 543,
   },
   {
     id: 'qp5',
     universityId: 'vu',
     university: 'Vidyasagar University',
     course: 'MSc',
     subject: 'Chemistry',
     semester: '1st',
     year: 2024,
     pdfUrl: '#',
     downloads: 432,
   },
   {
     id: 'qp6',
     universityId: 'nbu',
     university: 'University of North Bengal',
     course: 'MA',
     subject: 'History',
     semester: '3rd',
     year: 2023,
     pdfUrl: '#',
     downloads: 321,
   },
   {
     id: 'qp7',
     universityId: 'cu',
     university: 'University of Calcutta',
     course: 'BSc Honours',
     subject: 'Computer Science',
     semester: '6th',
     year: 2024,
     pdfUrl: '#',
     downloads: 1567,
   },
   {
     id: 'qp8',
     universityId: 'ju',
     university: 'Jadavpur University',
     course: 'BA Honours',
     subject: 'Economics',
     semester: '4th',
     year: 2023,
     pdfUrl: '#',
     downloads: 876,
   },
 ];
 
 export const mockTests: MockTest[] = [
   {
     id: 'mt1',
     title: 'Calculus Fundamentals',
     subject: 'Mathematics',
     chapter: 'Differential Calculus',
     questions: 25,
     duration: 30,
     difficulty: 'Medium',
     attempts: 2340,
   },
   {
     id: 'mt2',
     title: 'Mechanics Basics',
     subject: 'Physics',
     chapter: 'Classical Mechanics',
     questions: 20,
     duration: 25,
     difficulty: 'Easy',
     attempts: 1890,
   },
   {
     id: 'mt3',
     title: 'Organic Chemistry',
     subject: 'Chemistry',
     chapter: 'Hydrocarbons',
     questions: 30,
     duration: 40,
     difficulty: 'Hard',
     attempts: 1456,
   },
   {
     id: 'mt4',
     title: 'English Literature',
     subject: 'English',
     chapter: 'Shakespeare',
     questions: 15,
     duration: 20,
     difficulty: 'Medium',
     attempts: 987,
   },
   {
     id: 'mt5',
     title: 'Indian History',
     subject: 'History',
     chapter: 'Modern India',
     questions: 25,
     duration: 30,
     difficulty: 'Medium',
     attempts: 2156,
   },
   {
     id: 'mt6',
     title: 'Data Structures',
     subject: 'Computer Science',
     chapter: 'Arrays & Linked Lists',
     questions: 20,
     duration: 30,
     difficulty: 'Hard',
     attempts: 1678,
   },
 ];
 
 export const sampleQuestions: Question[] = [
   {
     id: 'q1',
     question: 'What is the derivative of sin(x)?',
     options: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'],
     correctAnswer: 0,
     explanation: 'The derivative of sin(x) is cos(x) by the standard differentiation rule.',
   },
   {
     id: 'q2',
     question: 'Which of the following is Newton\'s First Law of Motion?',
     options: [
       'F = ma',
       'Every action has an equal and opposite reaction',
       'An object at rest stays at rest unless acted upon by a force',
       'Energy cannot be created or destroyed',
     ],
     correctAnswer: 2,
     explanation: 'Newton\'s First Law states that an object will remain at rest or in uniform motion unless acted upon by an external force.',
   },
   {
     id: 'q3',
     question: 'The Battle of Plassey was fought in which year?',
     options: ['1757', '1857', '1947', '1764'],
     correctAnswer: 0,
     explanation: 'The Battle of Plassey was fought on June 23, 1757, between the British East India Company and the Nawab of Bengal.',
   },
   {
     id: 'q4',
     question: 'Which data structure follows LIFO principle?',
     options: ['Queue', 'Stack', 'Array', 'Linked List'],
     correctAnswer: 1,
     explanation: 'Stack follows Last In First Out (LIFO) principle where the last element added is the first to be removed.',
   },
   {
     id: 'q5',
     question: 'Who wrote "Romeo and Juliet"?',
     options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
     correctAnswer: 1,
     explanation: 'Romeo and Juliet was written by William Shakespeare around 1594-1596.',
   },
 ];