import { PropsWithChildren } from 'react'

/* eslint-disable */
// Disabling "no empty interface" rule
interface HeadingProps { }
/* eslint-enable */

export default function Heading(props: PropsWithChildren<HeadingProps>) {      

  return (
    <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-900">
        { props.children }
    </h1>
  );
}