import type { QuartzComponent } from "../quartz/components/types"

const links = {
  GitHub: "https://github.com/MarkoKaartinen/muistio",
  Blogi: "https://markokaartinen.net",
  Mastodon: "https://kaartinen.social/@marko",
}

const LinksOnlyFooter: QuartzComponent = ({ displayClass }) => {
  return (
    <footer class={displayClass ?? ""}>
      <ul>
        {Object.entries(links).map(([text, link]) => (
          <li>
            <a href={link}>{text}</a>
          </li>
        ))}
      </ul>
    </footer>
  )
}

LinksOnlyFooter.css = `
footer {
  text-align: left;
  margin-bottom: 4rem;
  opacity: 0.7;
}

footer ul {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0;
  padding: 0;
}

footer li {
  margin: 0;
  padding: 0;
}

footer a {
  color: var(--dark);
  font-weight: 600;
  text-decoration: none;
}

footer a:hover {
  color: var(--tertiary);
}
`

export default LinksOnlyFooter
