import { FiMusic } from 'react-icons/fi';

export const TurnPreviewAudio = ({ audioUrl, header }) => {
  return (
    <div className="flex flex-col items-center pt-4">
      <div className="flex items-center justify-center w-12 h-12 mb-4 bg-gray-300 rounded-full">
        <FiMusic className="w-6 h-6 text-gray-600" />
      </div>
      <div className="text-center max-w-full break-all">{header}</div>
    </div>
  );
};

export default TurnPreviewAudio;
