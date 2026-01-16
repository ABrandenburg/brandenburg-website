// History section data for the Our Family History page

export interface HistorySection {
  id: string
  era?: string
  title: string
  content: string
  image: string
  imageAlt: string
  imagePosition: 'left' | 'right'
  imageObjectPosition?: string
}

export const historySections: HistorySection[] = [
  {
    id: 'chicago',
    era: '1910s - 1940s',
    title: 'Getting started in Chicago',
    content: 'Great Grandpa Edward E. Wiesbrook started his plumbing company sometime in the 1910s outside of Chicago. He was very successful and active in his community, even donating land to build a church in his hometown. His name is still engraved on some of the drains within the church he helped build.',
    image: '/images/history/chicago-building.jpeg',
    imageAlt: 'Edward E. Wiesbrook\'s original plumbing company building in Chicago',
    imagePosition: 'left',
    imageObjectPosition: 'top',
  },
  {
    id: 'al-capone',
    title: 'Working for Al Capone',
    content: 'Great-grandpa Edward strove to serve everyone equally, even bartering for chickens and eggs when customers struggled to pay. His most famous client, Al Capone, recognized quality, affordable work when he saw it, hiring Edward multiple times. Apparently, Capone always paid on time and in cash. Due to a change in company policy, Brandenburg Plumbing no longer serves violent gangsters.',
    image: '/images/history/al-capone-era.jpeg',
    imageAlt: 'Historic storefront of Wiesbrook Plumbing during the Al Capone era',
    imagePosition: 'right',
  },
  {
    id: 'wiesbrook-plumbing',
    era: '1950s - 1980s',
    title: 'Wiesbrook Plumbing & Heating',
    content: 'Great-grandpa\'s son Raymond Wiesbrook began his own plumbing company in the early 1950s after his return from WWII. In addition to his Master plumbing license, he held licenses in electrical and air-conditioning repair.',
    image: '/images/grandpa_raymond.jpeg',
    imageAlt: 'Raymond Wiesbrook of Wiesbrook Plumbing & Heating',
    imagePosition: 'left',
  },
  {
    id: 'thrifty-grandpa',
    title: 'Our Thrifty Grandpa',
    content: 'Here is our grandpa again, still hard at work, still wearing the same flannel as he was decades earlier. We are certain he passed those savings onto his customers.',
    image: '/images/history/thrifty-grandpa.jpeg',
    imageAlt: 'Our thrifty grandpa working on a roof',
    imagePosition: 'right',
  },
  {
    id: 'brandenburg-born',
    era: '1997 - Present',
    title: 'Brandenburg Plumbing is Born',
    content: 'Our father, Troy Brandenburg established Brandenburg Plumbing in 1997, running the business with his wife Terry out of our home, and, with considerable more difficulty, raising five sons. Now, two of his sons, Adam and Lucas Brandenburg, strive to uphold the same family values and strong work ethic upheld over our company\'s long history.',
    image: '/images/history/troy-digging.jpeg',
    imageAlt: 'Troy Brandenburg working on a plumbing job',
    imagePosition: 'left',
  },
]

export function getHistorySections(): HistorySection[] {
  return historySections
}
