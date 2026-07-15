import { useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const [params] = useSearchParams();
  const error = params.get('error');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <img src="/logo.svg" alt="AI COO" className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">AI COO</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enterprise Operations Manager
          </p>

          <Separator className="my-8 w-full" />

          {error ? (
            <Alert variant="destructive" className="mb-6 w-full text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sign-in failed</AlertTitle>
              <AlertDescription>Please try again with Google.</AlertDescription>
            </Alert>
          ) : null}

          <Button type="button" size="lg" className="w-full" onClick={loginWithGoogle}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <Separator className="my-8 w-full" />

          <p className="text-xs leading-relaxed text-muted-foreground">
            Connect Gmail, Calendar, Slack, and Asana. Get executive morning and
            evening briefs delivered to your dashboard, email, and Slack.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
