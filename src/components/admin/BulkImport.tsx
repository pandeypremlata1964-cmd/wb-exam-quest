import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface University {
  id: string;
  name: string;
  short_name: string;
}

interface BulkImportProps {
  universities: University[];
  onComplete: () => void;
}

const courses = ['BA', 'BSc', 'BCom', 'BBA', 'BCA', 'MA', 'MSc', 'MCom', 'MBA', 'MCA', 'BA Honours', 'BSc Honours', 'BCom Honours'];
const subjects = ['English', 'Bengali', 'Hindi', 'History', 'Political Science', 'Economics', 'Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Accounting'];
const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th'];

export function BulkPaperUpload({ universities, onComplete }: BulkImportProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    university_id: '',
    course: '',
    subject: '',
    semester: '',
    year: new Date().getFullYear(),
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf'
    );
    setFiles((prev) => [...prev, ...dropped]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(
        (f) => f.type === 'application/pdf'
      );
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!form.university_id || !form.course || !form.subject || files.length === 0) {
      toast.error('Please fill all fields and add at least one PDF');
      return;
    }

    setUploading(true);
    let success = 0;
    let failed = 0;

    for (const file of files) {
      const filePath = `${form.university_id}/${form.course}/${form.subject}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('question-papers')
        .upload(filePath, file);

      if (uploadError) {
        failed++;
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('question-papers')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('question_papers').insert({
        university_id: form.university_id,
        course: form.course,
        subject: form.subject,
        semester: form.semester,
        year: form.year,
        pdf_url: urlData.publicUrl,
        pdf_storage_path: filePath,
        is_external_link: false,
        uploaded_by: user?.id,
      });

      if (insertError) {
        failed++;
      } else {
        success++;
      }
    }

    setUploading(false);
    setFiles([]);
    toast.success(`${success} papers uploaded${failed > 0 ? `, ${failed} failed` : ''}`);
    onComplete();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Bulk Paper Upload</h3>
      
      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">University *</Label>
          <Select value={form.university_id} onValueChange={(v) => setForm({ ...form, university_id: v })}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {universities.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.short_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Course *</Label>
          <Select value={form.course} onValueChange={(v) => setForm({ ...form, course: v })}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {courses.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Subject *</Label>
          <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Semester</Label>
          <Select value={form.semester} onValueChange={(v) => setForm({ ...form, semester: v })}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="w-32">
        <Label className="text-xs">Year</Label>
        <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} className="mt-1" />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">Drop PDF files here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">Only PDF files accepted</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-3 glass rounded-lg p-3">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
              <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button onClick={handleUpload} disabled={uploading} className="w-full gradient-primary border-0">
            {uploading ? 'Uploading...' : `Upload ${files.length} Paper${files.length > 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  );
}

// CSV/JSON Question Bulk Import
interface QuestionImportProps {
  testId: string;
  onComplete: () => void;
}

export function QuestionBulkImport({ testId, onComplete }: QuestionImportProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleJson = `[
  {
    "question_text": "What is 2+2?",
    "options": ["3", "4", "5", "6"],
    "correct_answer": 1,
    "explanation": "2+2 = 4"
  }
]`;

  const handleImport = async () => {
    try {
      let questions: any[];
      try {
        questions = JSON.parse(jsonInput);
      } catch {
        toast.error('Invalid JSON format');
        return;
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        toast.error('Please provide an array of questions');
        return;
      }

      setImporting(true);

      const records = questions.map((q, i) => ({
        mock_test_id: testId,
        question_text: q.question_text || q.question,
        options: q.options,
        correct_answer: q.correct_answer ?? 0,
        explanation: q.explanation || null,
        order_index: i,
      }));

      const { error } = await supabase.from('questions').insert(records);

      if (error) {
        toast.error('Failed to import: ' + error.message);
      } else {
        toast.success(`${records.length} questions imported!`);
        setJsonInput('');
        onComplete();
      }
    } finally {
      setImporting(false);
    }
  };

  const handleCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      if (lines.length < 2) {
        toast.error('CSV must have a header row and at least one question');
        return;
      }
      
      // Parse CSV: question_text, option_a, option_b, option_c, option_d, correct_answer, explanation
      const questions = lines.slice(1).map((line) => {
        const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
        return {
          question_text: cols[0],
          options: [cols[1], cols[2], cols[3], cols[4]].filter(Boolean),
          correct_answer: parseInt(cols[5]) || 0,
          explanation: cols[6] || '',
        };
      });

      setJsonInput(JSON.stringify(questions, null, 2));
      toast.success(`Parsed ${questions.length} questions from CSV`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Bulk Import Questions</h3>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-3 w-3 mr-1" />
          Import CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => setJsonInput(sampleJson)}>
          Load Sample
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleCSVFile}
        />
      </div>

      <div>
        <Label className="text-xs">JSON Questions Array</Label>
        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={sampleJson}
          className="mt-1 font-mono text-xs min-h-[200px]"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        CSV format: question_text, option_a, option_b, option_c, option_d, correct_answer (0-3), explanation
      </p>

      <Button onClick={handleImport} disabled={importing || !jsonInput.trim()} className="w-full gradient-primary border-0">
        {importing ? 'Importing...' : 'Import Questions'}
      </Button>
    </div>
  );
}
