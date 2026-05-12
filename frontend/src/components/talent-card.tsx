import Link from "next/link";
import { Icon } from "@/components/icon";

export type WrestlerCardData = {
  id: number;
  ring_name: string;
  state: string | null;
  wrestling_style: string | null;
  average_rating: string | number | null;
  review_count: number | null;
  ratings_opt_in?: boolean;
  media_links?: Array<{ id: number; url: string; media_type: string }>;
};

/** Deterministic gradient per wrestler id for cards without a photo */
function cardGradient(id: number) {
  const gradients = [
    "from-surface-container-high to-surface-container-lowest",
    "from-secondary-container/30 to-surface-container-lowest",
    "from-primary-container/15 to-surface-container-lowest",
    "from-surface-bright/20 to-surface-container-lowest",
  ];
  return gradients[id % gradients.length];
}

function findPhoto(wrestler: WrestlerCardData): string | undefined {
  const links = wrestler.media_links ?? [];
  return links.find((m) => m.media_type === "photo")?.url ?? links[0]?.url;
}

/** Large bento card — spans 8 of 12 columns on desktop */
export function WrestlerBentoCardLarge({ wrestler }: { wrestler: WrestlerCardData }) {
  const photo = findPhoto(wrestler);

  return (
    <Link
      href={`/wrestlers/${wrestler.id}`}
      className="group relative col-span-12 md:col-span-8 block overflow-hidden rounded-xl border border-white/10 h-[480px] md:h-[560px] hover:scale-[1.01] transition-transform duration-500 cursor-pointer"
    >
      {photo ? (
        <img
          src={photo}
          alt={wrestler.ring_name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className={`h-full w-full bg-gradient-to-br ${cardGradient(wrestler.id)}`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent" />

      {/* Top-right badges */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-3">
        <span className="flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1.5 font-body text-[11px] font-semibold uppercase tracking-wider text-on-secondary-container">
          <Icon name="verified" filled size={14} />
          Elite Talent
        </span>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-8 left-8">
        <h3 className="font-headline text-headline-md md:text-headline-xl text-on-surface mb-2 leading-none">
          {wrestler.ring_name}
        </h3>
        <div className="flex flex-wrap items-center gap-3 font-body text-label-bold uppercase tracking-wider text-on-surface-variant">
          {wrestler.wrestling_style && <span>{wrestler.wrestling_style}</span>}
          {wrestler.wrestling_style && wrestler.state && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
          )}
          {wrestler.state && <span>{wrestler.state}</span>}
          {wrestler.ratings_opt_in && (wrestler.review_count ?? 0) > 0 && (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
              <span>{wrestler.review_count} Reviews</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Small bento card — spans 4 of 12 columns on desktop */
export function WrestlerBentoCardSmall({ wrestler }: { wrestler: WrestlerCardData }) {
  const photo = findPhoto(wrestler);
  const avg =
    wrestler.ratings_opt_in &&
    wrestler.average_rating != null &&
    Number(wrestler.average_rating) > 0
      ? Number(wrestler.average_rating).toFixed(1)
      : null;

  return (
    <Link
      href={`/wrestlers/${wrestler.id}`}
      className="group relative col-span-12 md:col-span-4 block overflow-hidden rounded-xl border border-white/10 h-[480px] md:h-[560px] hover:scale-[1.01] transition-transform duration-500 cursor-pointer"
    >
      {photo ? (
        <img
          src={photo}
          alt={wrestler.ring_name}
          className="h-full w-full object-cover brightness-75 grayscale transition-all duration-500 group-hover:brightness-90 group-hover:grayscale-0"
        />
      ) : (
        <div className={`h-full w-full bg-gradient-to-br ${cardGradient(wrestler.id + 1)}`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />

      {/* Top-left tag */}
      <div className="absolute top-6 left-6">
        <span className="label-tag-primary text-[11px]">Rising Star</span>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-8 left-6">
        {avg && (
          <div className="mb-1 font-headline text-headline-md-mobile font-bold text-secondary">
            {avg}
            <span className="ml-1 text-sm font-body font-normal text-on-surface-variant">/ 5 avg</span>
          </div>
        )}
        <h3 className="font-headline text-headline-md-mobile text-on-surface mb-4 leading-none">
          {wrestler.ring_name}
        </h3>
        <button className="rounded-lg border border-secondary px-5 py-2 font-body text-label-bold uppercase tracking-wider text-secondary hover:bg-secondary hover:text-on-secondary transition-all">
          View Profile
        </button>
      </div>
    </Link>
  );
}

/** Compact list card — used on the /discover page */
export function WrestlerListCard({ wrestler }: { wrestler: WrestlerCardData }) {
  const photo = findPhoto(wrestler);
  const profileHref = `/wrestlers/${wrestler.id}`;

  return (
    <div className="group relative overflow-hidden rounded-2xl glass-card crimson-glow border border-white/5 hover:border-primary/20 transition-all duration-300 hover:scale-[1.02]">
      <Link href={profileHref} className="block aspect-[3/4] relative" aria-label={`View ${wrestler.ring_name}`}>
        {photo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photo}
            alt={wrestler.ring_name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${cardGradient(wrestler.id)}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-90" />

        {/* Verified badge */}
        <div className="absolute top-4 left-4">
          <span className="flex items-center gap-1 rounded-full border border-white/20 bg-secondary-container/80 px-3 py-1.5 backdrop-blur-md">
            <Icon name="verified" filled size={14} className="text-white" />
            <span className="font-body text-[10px] font-bold uppercase tracking-wider text-white">
              Verified
            </span>
          </span>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 p-5 w-full">
          <h3 className="font-headline text-headline-md-mobile leading-none text-on-surface mb-1">
            {wrestler.ring_name}
          </h3>
          <div className="flex items-center gap-2 text-on-surface-variant/80 font-body text-label-bold uppercase">
            {wrestler.wrestling_style && <span>{wrestler.wrestling_style}</span>}
            {wrestler.wrestling_style && wrestler.state && (
              <span className="h-1 w-1 rounded-full bg-primary" />
            )}
            {wrestler.state && (
              <span className="flex items-center gap-1">
                <Icon name="location_on" size={13} />
                {wrestler.state}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action bar */}
      <div className="flex gap-2 p-3">
        <Link
          href={profileHref}
          className="flex-1 text-center rounded-lg bg-primary-container py-3 font-body text-label-bold uppercase tracking-wider text-on-primary-container transition active:scale-95 hover:brightness-110"
        >
          View Profile
        </Link>
        <Link
          href="/messages"
          aria-label={`Message ${wrestler.ring_name}`}
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-secondary text-secondary transition active:scale-95 hover:bg-secondary/10"
        >
          <Icon name="mail" size={18} />
        </Link>
      </div>
    </div>
  );
}
