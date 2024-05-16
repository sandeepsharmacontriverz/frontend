import React from "react";

interface DeleteConfirmationProps {
  message: string;
  onDelete: () => void;
  onCancel: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  message,
  onDelete,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <p className="text-lg mb-4">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onDelete}
            className="px-4 py-2 mr-2 bg-red-500 text-white rounded-md text-sm"
          >
            OK
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
