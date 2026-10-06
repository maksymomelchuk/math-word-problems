/**
 * Option 1's drawings: the icons of the path and the bird, Кмітка (a
 * placeholder name, a nod to «Ліга крилатих»). Ported from
 * `game-mechanics-mock.html`. Decorative: each user names what it shows.
 */
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 11V8.5a4 4 0 0 1 8 0V11" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="5" y="10.5" width="14" height="10.5" rx="3" fill="currentColor" />
    </Icon>
  )
}

export function StarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.8l-5.3 2.9 1.1-6-4.4-4.2 6-.8z" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </Icon>
  )
}

export function AgainIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M5.5 3v4.5H10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  )
}

export function NotebookIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5.5" y="2.5" width="14" height="19" rx="2.5" fill="currentColor" />
      <path d="M9 8h7M9 11.5h7M9 15h4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3.5 6.5h3.5M3.5 12h3.5M3.5 17.5h3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  )
}

export function BoltIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13.5 2.5L5 13.4h6l-1.2 8.1 8.7-11.3h-6.1z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </Icon>
  )
}

export function TrophyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 3.5h10v4.8a5 5 0 0 1-10 0z" fill="currentColor" />
      <path d="M7 5.5H4.5v1.2A3.3 3.3 0 0 0 7.8 10M17 5.5h2.5v1.2a3.3 3.3 0 0 1-3.3 3.3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.5 13h3v3.5h-3z" fill="currentColor" />
      <rect x="7.5" y="16.5" width="9" height="3.5" rx="1.2" fill="currentColor" />
    </Icon>
  )
}

export function PhoneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="6" y="2.5" width="12" height="19" rx="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M10.5 18h3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </Icon>
  )
}

/** Кмітка, the bird. Always cheerful: it is never sad, whatever happened or however long she was away. */
export function Bird({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="114" rx="28" ry="4.5" fill="#2c2e31" opacity=".1" />
      <path d="M57 22c1-9 8-14 15-13-4 2-6 5-6 10" fill="#1899d6" />
      <path d="M24 58c-11 5-14 22-6 32 9-3 13-14 11-27z" fill="#1899d6" />
      <path d="M96 58c11 5 14 22 6 32-9-3-13-14-11-27z" fill="#1899d6" />
      <ellipse cx="60" cy="65" rx="39" ry="44" fill="#1cb0f6" />
      <ellipse cx="60" cy="82" rx="25" ry="24" fill="#ddf4ff" />
      <circle cx="45" cy="54" r="12" fill="#fff" />
      <circle cx="75" cy="54" r="12" fill="#fff" />
      <circle cx="47" cy="56" r="6.5" fill="#2c2e31" />
      <circle cx="73" cy="56" r="6.5" fill="#2c2e31" />
      <circle cx="49.5" cy="53.3" r="2.2" fill="#fff" />
      <circle cx="75.5" cy="53.3" r="2.2" fill="#fff" />
      <circle cx="35" cy="69" r="5" fill="#ff86a8" opacity=".55" />
      <circle cx="85" cy="69" r="5" fill="#ff86a8" opacity=".55" />
      <path d="M53.5 66h13L60 74.5z" fill="#ff9600" stroke="#ff9600" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M51 107v5M47 112.5h8M69 107v5M65 112.5h8" stroke="#ff9600" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
