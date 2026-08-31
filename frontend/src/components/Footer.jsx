const footerGroups = [
  {
    title: 'Marketplace',
    links: ['Browse', 'Post Item', 'Categories'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Contact'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Safety', 'Terms'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-surface-container-high">
      <div className="mx-auto flex max-w-container-max flex-col items-start justify-between gap-10 px-4 py-10 sm:px-6 md:flex-row">
        <div className="max-w-sm">
          <span className="block text-lg font-bold text-primary">BazaarSathi</span>
          <p className="mt-4 text-sm font-medium leading-6 text-on-surface-variant">
            Your trusted local marketplace for buying and selling everyday items.
          </p>
          <p className="mt-6 text-sm font-medium text-on-surface-variant">
            © {new Date().getFullYear()} BazaarSathi. All rights reserved.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-8 sm:grid-cols-3 md:w-auto md:gap-14">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-4 text-sm font-bold text-on-surface">{group.title}</h2>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      className="focus-ring rounded-sm text-sm font-medium text-on-surface-variant/80 transition hover:text-primary hover:underline"
                      href={'#' + link.toLowerCase().replaceAll(' ', '-')}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
