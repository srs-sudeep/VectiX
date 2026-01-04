export const MainFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-4 px-6 border-t border-border/30 bg-card/50">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>© {currentYear} VectiX. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
};
