export default function Heading({title} : {title: string}) {

  return (
    <h1 className="text-center text-4xl font-extrabold tracking-tight text-gray-900">
        { title }
    </h1>
  );
}