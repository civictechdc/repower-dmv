import { SocialIcon } from 'react-social-icons'

const socialLinks = [
  "https://web-cdn.bsky.app/profile/electrifydc.bsky.social",
  "https://facebook.com/pages/Electrifydc/115042054945476",
  "https://www.instagram.com/electrifyallhomes/",
  "https://www.linkedin.com/company/94257951",
  "https://x.com/ElectrifyDC",
  "https://www.youtube.com/@ElectrifyDC"
]

export default function Footer() {
  return (
    <footer className="md:flex justify-between text-center text-white bg-repower-dark-blue p-6">
        <div className="flex items-center justify-center md:justify-normal">
          {socialLinks.map((socialLink) => (
            <SocialIcon target="_blank" url={socialLink} style={{ height: 40, width: 40 }} bgColor='#253551'/>
          ))}
        </div>
        <a href="https://civictechdc.org" target="_blank" rel="norefferer noreferrer">
            <span className="align-middle mr-4">Made in partnership with Civic Tech DC</span>
            <img src="img/civic-tech-dc-logo.svg" alt="Civic Tech DC" className="inline-block w-10 h-10" />
        </a>
    </footer>
  );
}
  
  