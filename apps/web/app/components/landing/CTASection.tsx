import Link from 'next/link';

export default function CTASection() {
  return (
    <div className="border-2 border-black p-8 bg-black text-white text-center">
      <h2 className="text-3xl font-black uppercase mb-4">
        Ready to Create?
      </h2>
      <p className="text-base font-bold mb-6 max-w-2xl mx-auto">
        Join the future of audio plugin development. Start building your first
        AI-generated plugin today.
      </p>
      <Link
        href="/chat"
        className="inline-block border-2 border-white px-8 py-4 font-black text-sm uppercase transition-colors hover:bg-white hover:text-black"
      >
        Get Started Now
      </Link>
    </div>
  );
}
