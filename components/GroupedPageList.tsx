import type { QuartzComponent, QuartzComponentProps } from "../quartz/components/types"
import type { FullSlug, QuartzPluginData, SortFn } from "@quartz-community/types"
import { getDate } from "../quartz/components/Date"
import { isFolderPath, resolveRelative, getAllSegmentPrefixes } from "../quartz/util/path"

type PageEntry = QuartzPluginData & Record<string, unknown>

type GroupedPageListProps = {
  limit?: number
  sort?: SortFn
} & QuartzComponentProps

function byDateAndAlphabeticalFolderFirst(_cfg: unknown): SortFn {
  return (f1, f2) => {
    const f1IsFolder = isFolderPath(f1.slug ?? "")
    const f2IsFolder = isFolderPath(f2.slug ?? "")
    if (f1IsFolder && !f2IsFolder) return -1
    if (!f1IsFolder && f2IsFolder) return 1

    if (f1.dates && f2.dates) {
      return (getDate(f2)?.getTime() ?? 0) - (getDate(f1)?.getTime() ?? 0)
    } else if (f1.dates && !f2.dates) {
      return -1
    } else if (!f1.dates && f2.dates) {
      return 1
    }

    const f1Title = f1.frontmatter?.title?.toLowerCase() ?? ""
    const f2Title = f2.frontmatter?.title?.toLowerCase() ?? ""
    return f1Title.localeCompare(f2Title)
  }
}

function formatListDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date)
}

const GroupedPageList: QuartzComponent = ({
  cfg,
  fileData,
  allFiles,
  limit,
  sort,
}: GroupedPageListProps) => {
  const locale = cfg.locale ?? "en-US"
  const sorter = sort ?? byDateAndAlphabeticalFolderFirst(cfg)
  let list = [...allFiles].sort(sorter) as PageEntry[]
  if (limit) {
    list = list.slice(0, limit)
  }

  const groups = new Map<string, PageEntry[]>()
  for (const page of list) {
    const pageDate = page.dates ? getDate(page) : undefined
    const key = pageDate ? formatListDate(pageDate, locale) : "Ei paivaysta"
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(page)
  }

  const fileSlug = (fileData as { slug?: string } | undefined)?.slug as FullSlug | undefined

  return (
    <div class="grouped-page-list">
      {[...groups.entries()].map(([dateLabel, pages]) => (
        <section class="grouped-page-group">
          <h3 class="grouped-page-date">{dateLabel}</h3>
          <ul class="grouped-page-items">
            {pages.map((page) => {
              const title =
                (page.frontmatter?.title as string | undefined) ?? page.slug ?? "Untitled"
              const tags = ((page.frontmatter?.tags ?? []) as string[]).flatMap(
                getAllSegmentPrefixes,
              )

              return (
                <li class="grouped-page-item">
                  <a
                    href={resolveRelative(fileSlug ?? ("" as FullSlug), page.slug as FullSlug)}
                    class="grouped-page-link internal"
                  >
                    <span class="grouped-page-title">{title}</span>
                  </a>
                  {tags.length > 0 ? (
                    <ul class="tags grouped-page-tags">
                      {tags.map((tag) => (
                        <li>
                          <a
                            class="internal tag-link"
                            href={resolveRelative(
                              fileSlug ?? ("" as FullSlug),
                              `tags/${tag}` as FullSlug,
                            )}
                          >
                            {tag}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

GroupedPageList.css = `
.grouped-page-list {
  display: grid;
  gap: 1.35rem;
  margin-top: 2rem;
}

.grouped-page-group {
  display: grid;
  gap: 0.65rem;
}

.grouped-page-date {
  margin: 0;
  color: var(--gray);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.grouped-page-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}

.grouped-page-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem 1rem;
  align-items: start;
}

.grouped-page-link.internal {
  display: inline;
  width: fit-content;
  max-width: 100%;
  justify-self: start;
  align-self: start;
  background: transparent;
  padding: 0;
  border-radius: 0;
  line-height: inherit;
}

.grouped-page-link.internal:hover {
  background: transparent;
}

.grouped-page-title {
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.15;
}

.grouped-page-tags {
  margin: 0;
  justify-content: flex-end;
}

@media (max-width: 800px) {
  .grouped-page-list {
    gap: 1rem;
  }

  .grouped-page-item {
    grid-template-columns: 1fr;
    gap: 0.45rem;
  }

  .grouped-page-title {
    font-size: 1.15rem;
  }

  .grouped-page-tags {
    justify-content: flex-start;
  }
}
`

export default GroupedPageList
