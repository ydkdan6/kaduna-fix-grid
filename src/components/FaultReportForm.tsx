import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Phone, MapPin, FileText, Zap, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
export default function FaultReportForm() {
  const [faultType, setFaultType] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const handleSubmit = async () => {
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
          fault_type: faultType,
          phone_number: phoneNumber,
          address,
          description: description || null,
        } as any);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Report Electrical Fault
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Quick and easy fault reporting for Kaduna Electricity Distribution Company
          </p>
        </div>

        {/* Form Card */}
        <Card className="backdrop-blur-sm bg-white/80 shadow-2xl border-0 rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1">
            <div className="bg-white rounded-t-3xl">
              <CardHeader className="pb-6 pt-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Fault Report</CardTitle>
                    <CardDescription className="text-gray-600 mt-1">
                      Help us resolve electrical issues quickly
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </div>
          </div>

          <CardContent className="p-8 pt-6">
            <div className="space-y-6">
              {/* Fault Type */}
              <div className="space-y-3">
                <Label htmlFor="fault-type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600" />
                  Fault Type *
                </Label>
                <Select value={faultType} onValueChange={setFaultType} required>
                  <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors">
                    <SelectValue placeholder="Select the type of fault" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="fallen_pole" className="rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span>Fallen Pole</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sparks" className="rounded-lg">
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span>Electrical Sparks</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="outage" className="rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span>Power Outage</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="other" className="rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span>Other Issue</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  Phone Number *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-3">
                <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  Fault Location *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter the exact location of the fault"
                    className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Additional Details
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any additional information that might help our technicians..."
                  className="min-h-[100px] rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors resize-none"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="button" 
                  onClick={handleSubmit}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Report...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Send className="w-5 h-5" />
                      <span>Submit Fault Report</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                <span className="font-semibold">Emergency?</span> For immediate assistance with dangerous faults, call our emergency hotline directly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Kaduna Electricity Distribution Company • Reliable Power Solutions
          </p>
        </div>
      </div>
    </div>
  );
}