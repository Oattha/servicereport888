import { Cog } from "lucide-react";

export function BrandLogo() {
  return (
    <div className="brand-logo" aria-label="TEST TRUE Safety Future Service">
      <div className="brand-mark">
        <Cog size={116} strokeWidth={1.65} aria-hidden="true" />
      </div>
      <div className="brand-copy">
        <strong>TEST TRUE</strong>
        <span>SAFETY FUTURE SERVICE</span>
      </div>
    </div>
  );
}
