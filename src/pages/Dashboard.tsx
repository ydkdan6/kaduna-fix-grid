import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FaultReport {
  id: string;
  fault_type: string;
  phone_number: string;
  address: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface StaffFeedback {
  id: string;
  fault_report_id: string;
  feedback: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

export default function Dashboard() {
  const [faultReports, setFaultReports] = useState<FaultReport[]>([]);
  const [feedbacks, setFeedbacks] = useState<Record<string, StaffFeedback[]>>({});
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchFaultReports();
    fetchFeedbacks();
  }, [user, navigate]);

  const fetchFaultReports = async () => {
    try {
      const { data, error } = await supabase
        .from('fault_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFaultReports(data || []);
    } catch (error) {
      console.error('Error fetching fault reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fault reports.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_feedback')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const groupedFeedbacks = (data || []).reduce((acc, feedback) => {
        if (!acc[feedback.fault_report_id]) {
          acc[feedback.fault_report_id] = [];
        }
        acc[feedback.fault_report_id].push(feedback as unknown as StaffFeedback);
        return acc;
      }, {} as Record<string, StaffFeedback[]>);

      setFeedbacks(groupedFeedbacks);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    }
  };

  const handleStatusUpdate = async (reportId: string, status: 'pending' | 'in_progress' | 'resolved' | 'closed') => {
    try {
      const { error } = await supabase
        .from('fault_reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Status updated successfully.",
      });

      fetchFaultReports();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !feedback.trim() || !user) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('staff_feedback')
        .insert({
          fault_report_id: selectedReport,
          staff_id: user.id,
          feedback: feedback.trim(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Feedback added successfully.",
      });

      setFeedback('');
      setSelectedReport(null);
      fetchFeedbacks();
    } catch (error) {
      console.error('Error adding feedback:', error);
      toast({
        title: "Error",
        description: "Failed to add feedback.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    } else {
      navigate('/');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const formatFaultType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fault Reports</CardTitle>
              <CardDescription>
                All reported electrical faults
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faultReports.length === 0 ? (
                  <p className="text-muted-foreground">No fault reports found.</p>
                ) : (
                  faultReports.map((report) => (
                    <Card key={report.id}>
                      <CardContent className="pt-6 backdrop-blur-xl bg-white/10">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">
                                {formatFaultType(report.fault_type)}
                              </h3>
                              <Badge variant={getStatusColor(report.status)}>
                                {report.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              <strong>Address:</strong> {report.address}
                            </p>
                            <p className="text-sm text-muted-foreground mb-1">
                              <strong>Phone:</strong> {report.phone_number}
                            </p>
                            {report.description && (
                              <p className="text-sm text-muted-foreground mb-1">
                                <strong>Description:</strong> {report.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Reported: {new Date(report.created_at).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Select
                              value={newStatus}
                              onValueChange={(value: 'pending' | 'in_progress' | 'resolved' | 'closed') => {
                                setNewStatus(value);
                                handleStatusUpdate(report.id, value);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Update status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button
                              onClick={() => setSelectedReport(report.id)}
                              variant="outline"
                              size="sm"
                            >
                              Add Feedback
                            </Button>
                          </div>
                        </div>

                        {feedbacks[report.id] && feedbacks[report.id].length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-medium mb-2">Staff Feedback:</h4>
                            <div className="space-y-2">
                              {feedbacks[report.id].map((fb) => (
                                <div key={fb.id} className="bg-muted p-3 rounded">
                                  <p className="text-sm">{fb.feedback}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {fb.profiles?.full_name || 'Staff'} - {new Date(fb.created_at).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {selectedReport && (
            <Card>
              <CardHeader>
                <CardTitle>Add Feedback</CardTitle>
                <CardDescription>
                  Provide feedback for the selected fault report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddFeedback} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Enter your feedback or update about this fault"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Adding...' : 'Add Feedback'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedReport(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}