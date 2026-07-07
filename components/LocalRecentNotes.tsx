import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../quartz/components/types"
import { i18n } from "../quartz/i18n"
import { resolveRelative } from "../quartz/util/path"
import type { FullSlug } from "@quartz-community/types"

type PageEntry = {
  slug?: string
  unlisted?: boolean
  frontmatter?: {
    title?: string
    tags?: string[]
  }
  dates?: {
    created?: Date
    modified?: Date
    published?: Date
  }
  defaultDateType?: "created" | "modified" | "published"
}

function isTagPageSlug(slug: string | undefined): boolean {
  if (!slug) return false
  return slug === "tags" || slug === "tags/index" || slug.startsWith("tags/")
}

function isFolderPageSlug(slug: string | undefined): boolean {
  return Boolean(slug?.endsWith("/index"))
}

function getEntryDate(page: PageEntry): Date | undefined {
  const preferred = page.defaultDateType
  if (preferred && page.dates?.[preferred]) {
    return page.dates[preferred]
  }

  return page.dates?.created ?? page.dates?.modified ?? page.dates?.published
}

function formatCompactDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date)
}

type LocalRecentNotesOptions = {
  limit?: number
}

export default ((opts?: LocalRecentNotesOptions) => {
  const LocalRecentNotes: QuartzComponent = ({ allFiles, fileData, cfg }: QuartzComponentProps) => {
    const locale = cfg.locale ?? "en-US"
    const currentSlug = (fileData.slug ?? "index") as FullSlug

    const pages = (allFiles as PageEntry[])
      .filter((page) => page.unlisted !== true)
      .filter((page) => page.slug !== "index" && page.slug !== "404" && page.slug !== fileData.slug)
      .filter((page) => !isTagPageSlug(page.slug))
      .filter((page) => !isFolderPageSlug(page.slug))
      .sort((a, b) => {
        const aDate = getEntryDate(a)?.getTime() ?? 0
        const bDate = getEntryDate(b)?.getTime() ?? 0
        if (aDate !== bDate) return bDate - aDate

        const aTitle = a.frontmatter?.title ?? a.slug ?? ""
        const bTitle = b.frontmatter?.title ?? b.slug ?? ""
        return aTitle.localeCompare(bTitle, locale)
      })
      .slice(0, opts?.limit ?? 5)

    return (
      <div class="recent-notes recent-notes-local">
        <h3>{i18n(locale).components.recentNotes.title}</h3>
        <ul class="recent-ul">
          {pages.map((page) => {
            const title = page.frontmatter?.title ?? "Untitled"
            const date = getEntryDate(page)

            return (
              <li class="recent-li">
                <div class="section">
                  <div class="desc">
                    <h3>
                      <a
                        href={resolveRelative(currentSlug, (page.slug ?? "index") as FullSlug)}
                        class="internal"
                      >
                        {title}
                      </a>
                    </h3>
                  </div>
                  {date ? (
                    <p class="meta">
                      <time datetime={date.toISOString()}>{formatCompactDate(date, locale)}</time>
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  LocalRecentNotes.css = `
.recent-notes-local > h3 {
  margin: 0;
  max-width: 10ch;
  font-weight: 600 !important;
}

.recent-notes-local > ul.recent-ul {
  list-style: none;
  padding: 0;
}

.recent-notes-local .section {
  display: grid;
  gap: 0.14rem;
}

.recent-notes-local .section > .desc > h3 {
  margin: 0 !important;
  font-weight: 600;
}

.recent-notes-local .section > .desc > h3 > a.internal {
  background: transparent;
  padding: 0;
  border-radius: 0;
  line-height: inherit;
  color: var(--tertiary);
}

.recent-notes-local .section > .desc > h3 > a.internal:hover {
  color: var(--dark);
}

.recent-notes-local .section > .meta {
  margin: 0;
  margin-top: -0.05rem;
}
`

  return LocalRecentNotes
}) satisfies QuartzComponentConstructor<LocalRecentNotesOptions>
