import { infusionSvg, type TechnologyId } from "@/lib/technology-signature";

export function TechnologyInfusion({ selected }: { selected: TechnologyId[] }) {
  return <div aria-hidden="true" className="technology-infusion pointer-events-none absolute inset-0" dangerouslySetInnerHTML={{ __html: infusionSvg(selected) }} />;
}