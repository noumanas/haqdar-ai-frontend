import { LogoMark } from "@/components/shared/brand";
import { Container } from "@/components/shared/section";
import { footer, siteConfig } from "@/content/site";

const columnTitle = "text-xs font-semibold text-stone-light";

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-ink pt-14 pb-10 text-white">
      <Container className="flex flex-col gap-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2.5">
              <LogoMark className="size-8 rounded-[10px]" />
              <span className="text-xl font-extrabold">haqdar</span>
            </span>
            <p className="text-sm leading-normal text-stone-light">{footer.blurb}</p>
          </div>

          {footer.columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-2.5 text-sm">
              <span className={columnTitle}>{column.title}</span>
              {column.links.map((link) => (
                <a key={link.label} href={link.href} className="hover:text-lime">
                  {link.label}
                </a>
              ))}
            </nav>
          ))}

          <div className="flex flex-col gap-2.5 text-sm">
            <span className={columnTitle}>Official help</span>
            <a href={`tel:${siteConfig.mohre.phone}`} className="font-semibold text-lime hover:underline">
              MOHRE · {siteConfig.mohre.phone}
            </a>
            <a href={siteConfig.mohre.url} target="_blank" rel="noreferrer" className="hover:text-lime">
              {siteConfig.mohre.label}
            </a>
            <span className="text-stone-light">Contact: {siteConfig.partnersEmail}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-ink-soft pt-5 text-xs text-stone-light">
          <p className="max-w-3xl leading-normal">{footer.legal}</p>
          <span>{footer.copyright}</span>
        </div>
      </Container>
    </footer>
  );
}
