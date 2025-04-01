interface HeadingProps {
  children: string;
}

export default function Heading({ children }: HeadingProps) {
  return (
    <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-900">
      {children}
    </h1>
  );
}

