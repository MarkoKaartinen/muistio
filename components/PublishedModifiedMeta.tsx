import type { QuartzComponent, QuartzComponentProps } from "../quartz/components/types"

function formatDisplayDate(date: Date, locale: string) {
  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date)
  const timeParts = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date)
  const hour = timeParts.find((part) => part.type === "hour")?.value ?? "00"
  const minute = timeParts.find((part) => part.type === "minute")?.value ?? "00"

  return `${formattedDate} klo ${hour}:${minute}`
}

function isSameCalendarDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const PublishedModifiedMeta: QuartzComponent = ({
  fileData,
  cfg,
  displayClass,
}: QuartzComponentProps) => {
  const dates = fileData.dates as
    | {
        created?: Date
        modified?: Date
      }
    | undefined

  if (!dates?.created && !dates?.modified) {
    return null
  }

  const locale = cfg.locale ?? "en-US"
  const showModified = Boolean(
    dates.modified && (!dates.created || !isSameCalendarDate(dates.created, dates.modified)),
  )

  return (
    <div class={[displayClass, "content-meta", "content-meta-block"].filter(Boolean).join(" ")}>
      {dates.created ? (
        <div class="content-meta-item">
          <span class="content-meta-label">Julkaistu</span>
          <time class="content-meta-value" datetime={dates.created.toISOString()}>
            {formatDisplayDate(dates.created, locale)}
          </time>
        </div>
      ) : null}
      {showModified && dates.modified ? (
        <div class="content-meta-item">
          <span class="content-meta-label">Muokattu</span>
          <time class="content-meta-value" datetime={dates.modified.toISOString()}>
            {formatDisplayDate(dates.modified, locale)}
          </time>
        </div>
      ) : null}
    </div>
  )
}

PublishedModifiedMeta.css = `
.content-meta-block {
  margin: 1.35rem 0 0;
  padding: 0;
  border: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, max-content));
  gap: 0.45rem 2rem;
  align-items: start;
}

.content-meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  min-width: 0;
}

.content-meta-label {
  color: var(--gray);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.content-meta-value {
  color: var(--light1);
  font-size: 0.86rem;
  line-height: 1.35;
}

@media (max-width: 800px) {
  .content-meta-block {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
`

export default PublishedModifiedMeta
