export const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div className="p-4" role="alert">
      <h1>Something went wrong</h1>
      <p className="">Sorry, something went wrong. Please try again later.</p>
      <br />
      <pre className="text-xs text-red-600">{error.message}</pre>
    </div>
  );
};
