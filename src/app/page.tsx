import MissingPersonForm from '@/components/missing-person-form';
import { SearchIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 w-full border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <SearchIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">
              SafeLink
            </h1>
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">
            Admin Reporting Portal
          </p>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <MissingPersonForm />
      </main>
      <footer className="container mx-auto px-4 py-6 md:px-6">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SafeLink. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
