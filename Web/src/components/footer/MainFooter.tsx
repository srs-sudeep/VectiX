import { Heart } from 'lucide-react';

export const MainFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-4 px-6 border-t border-border/30">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-1.5">
          © {currentYear} <span className="font-semibold text-foreground">VectiX</span>. 
          Made with <Heart className="h-3.5 w-3.5 text-destructive fill-destructive" /> by the team.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-foreground transition-colors font-medium">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors font-medium">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors font-medium">Support</a>
        </div>
      </div>
    </footer>
  );
};
