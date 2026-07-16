import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

function GoogleMark() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const FEATURES = [
  {
    icon: FileText,
    title: 'Morning & evening briefs',
    description: 'AI summaries of what needs your attention today.',
  },
  {
    icon: CalendarDays,
    title: 'Priority emails & meetings',
    description: 'See what matters across Gmail and Calendar.',
  },
  {
    icon: LayoutDashboard,
    title: 'Slack & Asana in one view',
    description: 'Tasks, mentions, and ops signals in a single dashboard.',
  },
  {
    icon: Mail,
    title: 'Daily email & Slack reports',
    description: 'Get morning and evening briefs delivered to your inbox and Slack.',
  },
] as const;

export function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const { resolvedTheme } = useTheme();
  const [params] = useSearchParams();
  const error = params.get('error');
  const isDark = resolvedTheme === 'dark';

  // Light mode: warm peach edges (not near-white) so corners stay soft, not blown out
  const brandGradient = isDark
    ? 'radial-gradient(ellipse 80% 70% at 70% 40%, #FF9736 0%, #FF7A00 45%, #C45A00 85%, #1a0f08 100%)'
    : 'radial-gradient(ellipse 80% 70% at 70% 40%, #FF9736 0%, #FF7A00 50%, #F08A2A 80%, #E07018 100%)';

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left: sign-in */}
      <section className="flex flex-1 flex-col justify-between bg-background px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="" className="h-8 w-auto" />
          <div>
            <p className="text-sm font-semibold tracking-tight">AI COO</p>
            <p className="text-xs text-muted-foreground">
              Enterprise Operations Manager
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md flex-1 py-12 lg:flex lg:flex-col lg:justify-center lg:py-0">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            AI COO turns Gmail, Calendar, Slack, and Asana into a daily executive
            brief—priorities, meetings, and recommended actions.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sign in with Google so we can securely access your workspace identity
            and, after you connect apps, read the operational data needed for your
            morning and evening reports.
          </p>

          {error ? (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sign-in failed</AlertTitle>
              <AlertDescription>Please try again with Google.</AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="button"
            size="lg"
            className="mt-8 h-11 w-full bg-[#FF7A00] text-white hover:bg-[#E56E00] focus-visible:ring-[#FF7A00]"
            onClick={loginWithGoogle}
          >
            <GoogleMark />
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            Secure Google sign-in only. Connect Slack and Asana after you log in.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} AI COO
        </p>
      </section>

      {/* Right: brand panel */}
      <aside
        className="relative flex flex-1 flex-col justify-between overflow-hidden px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-12"
        style={{ background: brandGradient }}
      >
        <div
          className={cn(
            'pointer-events-none absolute inset-0',
            isDark ? 'opacity-30' : 'opacity-15',
          )}
          style={{
            background:
              'radial-gradient(circle at 20% 80%, #FFBC7D 0%, transparent 45%)',
          }}
          aria-hidden
        />

        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Enterprise AI
          </p>
          <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
            Your AI operations command center
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/85">
            One dashboard for the signals that matter, so you know what happened,
            what needs attention, and what to do next.
          </p>
        </div>

        <ul className="relative z-10 mt-10 space-y-5 lg:mt-0">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                <Icon className="h-4 w-4 text-white" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/75">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div
          className={cn(
            'relative z-10 mt-10 flex items-start gap-2 rounded-xl p-4 backdrop-blur-sm lg:mt-0',
            isDark
              ? 'border border-white/20 bg-black/30'
              : 'border border-white/50 bg-white/30',
          )}
        >
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#FFBC7D]" aria-hidden />
          <p className="text-xs leading-relaxed text-white/90">
            <span className="font-medium text-white">
              Google powers secure sign-in and Gmail/Calendar context.
            </span>{' '}
            We only use access you grant. Slack and Asana connect separately after
            login.
          </p>
        </div>
      </aside>
    </div>
  );
}
