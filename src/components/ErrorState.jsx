const ErrorState = ({ message = "Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <p className="mb-4 text-gray-600">{message}</p>

      <button
        onClick={onRetry}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );
};

export default ErrorState;