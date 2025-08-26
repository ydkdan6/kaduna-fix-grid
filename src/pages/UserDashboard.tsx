import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FaultReportRow {
  id: string;
  fault_type: string;
  phone_number: string;
  address: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface StaffFeedbackRow {
  id: string;
  fault_report_id: string;
  staff_id: string;
  feedback: string;
  created_at: string;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<FaultReportRow[]>([]);
  const [feedbacksByReport, setFeedbacksByReport] = useState<Record<string, StaffFeedbackRow[]>>({});

  useEffect(() => {
    document.title = 'My Reports | Feedback';
  }, []);

  const fetchReports = async () => {
    if (!phone.trim()) {
      toast({ title: 'Enter phone number', description: 'Provide the phone number used when submitting the report' });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fault_reports')
        .select('*')
        .eq('phone_number', phone.trim())
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReports(data || []);

      const ids = (data || []).map((r) => r.id);
      if (ids.length > 0) {
        const { data: fbData, error: fbErr } = await supabase
          .from('staff_feedback')
          .select('*')
          .in('fault_report_id', ids)
          .order('created_at', { ascending: false });
        if (fbErr) throw fbErr;
        const grouped = (fbData || []).reduce((acc, fb) => {
          acc[fb.fault_report_id] = acc[fb.fault_report_id] || [];
          acc[fb.fault_report_id].push(fb);
          return acc;
        }, {} as Record<string, StaffFeedbackRow[]>);
        setFeedbacksByReport(grouped);
      } else {
        setFeedbacksByReport({});
      }
    } catch (e) {
      console.error('Error loading reports:', e);
      toast({ title: 'Error', description: 'Failed to load your reports', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const makeReport = () => {
    navigate('/report');
  };

  const formatFaultType = (type: string) => type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="min-h-screen bg-background">
      <header className="flex w-100 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Reports</h1>
        </div>

        <Button disabled={loading} className="m-4">
                <Link to='/report'>{loading ? 'Reporting...' : 'Make a Report'}</Link>
              </Button>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Find Your Reports</CardTitle>
            <CardDescription>Enter the phone number you used when submitting the report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0803..." />
              </div>
              <Button onClick={fetchReports} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-4">
          {reports.length === 0 ? (
            <p className="text-muted-foreground">No reports found for this phone number.</p>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{formatFaultType(report.fault_type)}</h3>
                        <Badge variant="secondary">{report.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1"><strong>Address:</strong> {report.address}</p>
                      {report.description && (
                        <p className="text-sm text-muted-foreground mb-1"><strong>Description:</strong> {report.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Reported: {new Date(report.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {feedbacksByReport[report.id]?.length ? (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Staff Feedback</h4>
                      <div className="space-y-2">
                        {feedbacksByReport[report.id].map((fb) => (
                          <div key={fb.id} className="bg-muted p-3 rounded">
                            <p className="text-sm">{fb.feedback}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(fb.created_at).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
