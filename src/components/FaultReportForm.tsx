import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function FaultReportForm() {
  const [faultType, setFaultType] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!faultType || !phoneNumber || !address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('fault_reports')
        .insert({
          fault_type: faultType as any,
          phone_number: phoneNumber,
          address,
          description,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your fault report has been submitted successfully. Our staff will attend to it shortly.",
      });

      // Reset form
      setFaultType('');
      setPhoneNumber('');
      setAddress('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting fault report:', error);
      toast({
        title: "Error",
        description: "Failed to submit fault report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Report a Fault</CardTitle>
        <CardDescription>
          Report electrical faults to Kaduna Electricity Distribution Company
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fault-type">Fault Type *</Label>
            <Select value={faultType} onValueChange={setFaultType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select fault type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fallen_pole">Fallen Pole</SelectItem>
                <SelectItem value="sparks">Sparks</SelectItem>
                <SelectItem value="outage">Power Outage</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter the fault location address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional details about the fault"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}