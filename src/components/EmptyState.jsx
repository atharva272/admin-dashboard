const EmptyState = ({ message = "No products found" }) => {
  return (
    <div className="flex items-center justify-center py-10">
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default EmptyState;