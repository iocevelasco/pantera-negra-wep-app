import { AppProvider } from './providers/app-provider';
import { AppRoutes } from './routes';
import { Toaster } from './components/ui/sonner';
import { UpdateNotification } from './components/update-notification';

function App() {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <AppRoutes />
        </main>
      </div>
      <Toaster />
      <UpdateNotification />
    </AppProvider>
  );
}

export default App;
