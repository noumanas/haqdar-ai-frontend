import { Container, Eyebrow } from "@/components/shared/section";
import { languages } from "@/content/site";

const chip = "flex min-h-12 items-center gap-2.5 rounded-full px-5 text-[15px] font-semibold";

export function Languages() {
  return (
    <section className="py-16">
      <Container className="grid items-center gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Eyebrow>{languages.eyebrow}</Eyebrow>
          <h2 className="text-4xl leading-[1.1] font-extrabold tracking-[-0.03em]">{languages.title}</h2>
          <p className="text-base leading-[1.55] text-muted-foreground">{languages.body}</p>
        </div>

        <ul className="flex flex-wrap gap-2.5" aria-label="Supported languages">
          <li className={`${chip} bg-ink text-white`}>
            <span lang="ur" className="font-urdu">
              {languages.live.native}
            </span>
            {languages.live.label}
          </li>
          {languages.upcoming.map((language) => (
            <li key={language} className={`${chip} bg-white`}>
              {language}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
