export default function ApplicationConfirmation() {
  return (
    <main className="min-h screen relative m-auto">
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <div className="flex w-full md:w-1/2 flex-col md:items-center justify-center">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="#01A601"
              className="size-24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <div className="py-3 text-3xl font-bold">Thank you for applying!</div>
          <div className="py-5 text-lg">
            We will review your application and reach out if we need any more
            information.
          </div>
          <div>
            <button
              type="submit"
              className="rounded bg-repower-dark-blue px-10 py-3 font-semibold text-white hover:bg-blue-900"
            >
              <a href="/">Go Home</a>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
