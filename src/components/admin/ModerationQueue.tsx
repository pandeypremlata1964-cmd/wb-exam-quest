import { useState, useEffect } from 'react';
import { Check, X, Eye, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PDFViewer } from '@/components/PDFViewer';

interface PendingPaper {
  id: string;
  subject: string;
  course: string;
  semester: string;
  year: number;
  pdf_url: string | null;
  status: string;
  created_at: string;
  universities: { name: string; short_name: string };
  profiles: { full_name: string | null; email: string } | null;
}

export function ModerationQueue() {
  const [papers, setPapers] = useState<PendingPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'rejected' | 'all'>('pending');
  const [pdfViewer, setPdfViewer] = useState({ isOpen: false, url: '', title: '' });

  useEffect(() => {
    fetchPendingPapers();
  }, [filter]);

  const fetchPendingPapers = async () => {
    setIsLoading(true);
    let query = supabase
      .from('question_papers')
      .select('id, subject, course, semester, year, pdf_url, status, created_at, universities(name, short_name), profiles:uploaded_by(full_name, email)')
      .order('created_at', { ascending: false });

    if (filter === 'pending') {
      query = query.eq('status', 'pending');
    } else if (filter === 'rejected') {
      query = query.eq('status', 'rejected');
    } else {
      query = query.in('status', ['pending', 'rejected']);
    }

    const { data } = await query;
    if (data) setPapers(data as unknown as PendingPaper[]);
    setIsLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('question_papers')
      .update({ status: 'approved' })
      .eq('id', id);

    if (!error) {
      toast.success('Paper approved and published');
      fetchPendingPapers();
    } else {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('question_papers')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (!error) {
      toast.success('Paper rejected');
      fetchPendingPapers();
    } else {
      toast.error('Failed to reject');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('question_papers').delete().eq('id', id);
    if (!error) {
      toast.success('Paper deleted');
      fetchPendingPapers();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {(['pending', 'rejected', 'all'] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className={filter === f ? 'gradient-primary border-0' : ''}
          >
            {f === 'pending' && <Clock className="h-3 w-3 mr-1" />}
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
        <span className="text-sm text-muted-foreground ml-auto">
          {papers.length} items
        </span>
      </div>

      {papers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No {filter} papers in the queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {papers.map((paper) => (
            <div key={paper.id} className="glass rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{paper.subject}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded font-medium ${
                      paper.status === 'pending'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {paper.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {paper.universities?.short_name} • {paper.course} • {paper.semester} Sem • {paper.year}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted by: {(paper.profiles as any)?.full_name || (paper.profiles as any)?.email || 'Unknown'} • {new Date(paper.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {paper.pdf_url && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setPdfViewer({
                        isOpen: true,
                        url: paper.pdf_url!,
                        title: `${paper.subject} - ${paper.universities?.short_name} ${paper.year}`,
                      })}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {paper.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="gradient-primary border-0"
                        onClick={() => handleApprove(paper.id)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => handleReject(paper.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {paper.status === 'rejected' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(paper.id)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(paper.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PDFViewer
        isOpen={pdfViewer.isOpen}
        onClose={() => setPdfViewer({ ...pdfViewer, isOpen: false })}
        pdfUrl={pdfViewer.url}
        title={pdfViewer.title}
      />
    </div>
  );
}
