import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import FaultReportForm from '@/components/FaultReportForm';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Kaduna Electricity Distribution Company</h1>
          {!loading && !user && (
            <Link to="/auth">
              <Button>Staff Login</Button>
            </Link>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Report Electrical Faults</h2>
            <p className="text-lg text-muted-foreground">
              Help us serve you better by reporting electrical faults in your area
            </p>
          </div>

          <FaultReportForm />
        </div>
      </main>
    </div>
  );
};

export default Index;
