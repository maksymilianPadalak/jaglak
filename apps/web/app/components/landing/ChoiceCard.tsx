import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface ChoiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export default function ChoiceCard({ icon: Icon, title, description, href }: ChoiceCardProps) {
  return (
    <Link href={href} className="group">
      <div className="border-2 border-black p-6 bg-white hover:bg-black hover:text-white transition-colors h-full flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <Icon className="w-8 h-8" />
          <h3 className="text-2xl font-black uppercase">{title}</h3>
        </div>
        <p className="text-sm font-bold mb-4 flex-grow">
          {description}
        </p>
        <div className="flex items-center gap-2 text-sm font-black uppercase">
          <span>Start Building</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
