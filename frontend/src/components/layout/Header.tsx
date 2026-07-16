import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar, PAGE_TITLES } from '@/components/layout/Sidebar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { useAuth } from '@/contexts/AuthContext';

function resolveTitle(pathname: string): string {
  if (pathname.startsWith('/reports/')) return 'Report Detail';
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.keys(PAGE_TITLES).find((key) => pathname.startsWith(key));
  return match ? PAGE_TITLES[match] : 'AI COO';
}

export function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const title = useMemo(() => resolveTitle(location.pathname), [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <h1 className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight md:text-base">
          {title}
        </h1>

        <div className="hidden items-center md:flex">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="relative flex h-9 w-56 items-center rounded-lg border border-input bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted lg:w-64"
          >
            <Search className="mr-2 h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="pointer-events-none hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
              ⌘K
            </kbd>
          </button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setCommandOpen(true)}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="hidden h-6 md:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
              <Avatar className="h-8 w-8">
                {user?.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                <AvatarFallback>{user?.name?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                void logout().then(() => navigate('/login'));
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
