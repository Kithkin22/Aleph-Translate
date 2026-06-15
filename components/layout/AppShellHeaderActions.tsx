interface AppShellHeaderActionsProps {
  trailing?: React.ReactNode;
}

export function AppShellHeaderActions({ trailing }: AppShellHeaderActionsProps) {
  return (
    <nav className="flex shrink-0 items-center gap-1">
      {trailing}
    </nav>
  );
}
