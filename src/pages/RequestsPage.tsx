import { useReconnectRequests } from "@/hooks/useReconnectRequests";
import { ReconnectRequestList } from "@/components/ReconnectRequestList";
import BottomNav from "@/components/BottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ErrorAlert } from "@/components/FeedbackUtils";

const RequestsPage = () => {
  const { requests, loading, error, refreshRequests } = useReconnectRequests();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 pt-6 pb-24">
          <h1 className="text-2xl font-bold mb-2">Reconnect Requests</h1>
          <p className="text-sm text-gray-500 mb-6">
            People who want to reconnect with you
          </p>

          {error && (
            <div className="mb-4">
              <ErrorAlert message={error} />
            </div>
          )}

          <ReconnectRequestList 
            requests={requests} 
            onAccept={refreshRequests}
            isLoading={loading}
          />
        </div>
        <BottomNav />
      </div>
    </ErrorBoundary>
  );
};

export default RequestsPage; 